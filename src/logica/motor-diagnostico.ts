// motor-diagnostico.ts — compara los síntomas marcados contra el catálogo
// y devuelve las enfermedades que mejor coinciden (hasta 3), ajustando un
// poco la prioridad según la edad de la persona.
import { obtenerCatalogo } from './gestion-enfermedades';
import type { ResultadoDiagnostico } from '../tipos/tipos';

// Ajuste simple por edad: no es un criterio médico riguroso, solo una
// pista extra. Ciertas condiciones son algo más frecuentes en ciertas
// edades, así que suman unos puntos de probabilidad, no determinan el resultado.
function puntosPorEdad(enfermedad: string, gravedad: string, edad: number | null): number {
  if (edad === null) return 0;
  if (gravedad === 'grave' && edad >= 50) return 6; // más riesgo cardio/neuro en adultos mayores
  if (/viral|resfriado|gripal/i.test(enfermedad) && edad <= 12) return 5; // más común en niños
  if (/artritis|artrosis/i.test(enfermedad) && edad >= 45) return 5;
  return 0;
}

// Evalúa los síntomas y devuelve hasta 3 posibles diagnósticos, ordenados
// del más al menos probable (antes solo devolvía el mejor, uno solo).
export async function evaluarSintomas(sintomasMarcados: string[], edad: number | null = null): Promise<ResultadoDiagnostico[]> {
  const candidatos: Array<{ puntaje: number; resultado: ResultadoDiagnostico }> = [];
  const catalogo = await obtenerCatalogo(); // incluye enfermedades agregadas/editadas por el admin

  for (const regla of catalogo) {
    // Deben estar TODOS los síntomas requeridos para que la regla aplique.
    const cumpleRequeridos = regla.requeridos.every(s => sintomasMarcados.includes(s));
    if (!cumpleRequeridos) continue;

    const opcionalesCoincididos = regla.opcionales.filter(s => sintomasMarcados.includes(s)).length;
    const ajusteEdad = puntosPorEdad(regla.enfermedad, regla.gravedad, edad);
    const puntaje = regla.requeridos.length * 2 + opcionalesCoincididos + ajusteEdad;
    const probabilidad = Math.min(98, regla.probabilidadBase + opcionalesCoincididos * 3 + ajusteEdad);

    candidatos.push({
      puntaje,
      resultado: {
        enfermedad: regla.enfermedad,
        probabilidad,
        gravedad: regla.gravedad,
        derivacion: regla.derivacion,
        descripcion: regla.descripcion,
        recomendaciones: regla.recomendaciones,
      },
    });
  }

  return candidatos
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 3)
    .map(c => c.resultado);
}
