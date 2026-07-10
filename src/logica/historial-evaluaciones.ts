// historial-evaluaciones.ts — guarda el historial de evaluaciones en localStorage
// (máximo 20 por persona), calcula estadísticas y arma el PDF exportable.
//
// Cada evaluación ahora queda ligada al correo de quien la hizo. Antes era
// una sola lista global y cualquier cuenta veía el historial de las demás.
import type { ResultadoDiagnostico } from '../tipos/tipos';
import { notificar } from './usar-notificaciones';

export interface EvaluacionGuardada {
  id: string;
  correoUsuario: string; // a qué paciente le pertenece esta evaluación
  sintomas: string[];
  resultado: ResultadoDiagnostico | null;
  fecha: string;
  notaDoctor?: string; // comentario clínico opcional que puede dejar un doctor
}

const CLAVE = 'saludasist-historial';

function leerTodo(): EvaluacionGuardada[] {
  try { return JSON.parse(localStorage.getItem(CLAVE) ?? '[]'); } catch { return []; }
}
function guardarTodo(lista: EvaluacionGuardada[]): void {
  localStorage.setItem(CLAVE, JSON.stringify(lista));
}

// Guarda una evaluación nueva, ligada al correo de quien la hizo.
export function guardarEvaluacion(correoUsuario: string, sintomas: string[], resultado: ResultadoDiagnostico | null): void {
  const todo = leerTodo();
  todo.unshift({ id: `eval-${Date.now()}`, correoUsuario, sintomas, resultado, fecha: new Date().toISOString() });
  guardarTodo(todo.slice(0, 200)); // tope general para no llenar el localStorage
}

// Carga el historial de UN paciente en particular (lo que ve un paciente
// de sí mismo, o un doctor/admin al revisar a alguien puntual).
export function cargarHistorial(correoUsuario: string): EvaluacionGuardada[] {
  return leerTodo().filter(e => e.correoUsuario === correoUsuario).slice(0, 20);
}

// Borra una sola evaluación por su id.
export function eliminarEvaluacion(id: string): void {
  guardarTodo(leerTodo().filter(e => e.id !== id));
}

// Borra todo el historial de UN paciente (no el de los demás).
export function limpiarHistorial(correoUsuario: string): void {
  guardarTodo(leerTodo().filter(e => e.correoUsuario !== correoUsuario));
}

// El doctor usa esto para dejar (o borrar) una nota clínica en una evaluación puntual.
export function guardarNotaDoctor(idEvaluacion: string, nota: string): void {
  const todo = leerTodo();
  const evaluacion = todo.find(e => e.id === idEvaluacion);
  if (evaluacion) { evaluacion.notaDoctor = nota; guardarTodo(todo); }
}

// Calcula estadísticas rápidas sobre un historial ya filtrado.
export function calcularEstadisticas(historial: EvaluacionGuardada[]) {
  if (historial.length === 0) return { total: 0, ultimaFecha: '—', sintomaFrecuente: '—' };

  const conteo: Record<string, number> = {};
  historial.forEach(ev => ev.sintomas.forEach(s => { conteo[s] = (conteo[s] ?? 0) + 1; }));
  const sintomaFrecuente = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const ultimaFecha = new Date(historial[0].fecha).toLocaleDateString('es-EC', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return { total: historial.length, ultimaFecha, sintomaFrecuente };
}

// Estadísticas de TODO el sistema (todas las cuentas), solo para el admin.
export function calcularEstadisticasGlobales() {
  return calcularEstadisticas(leerTodo());
}

// Exporta el resultado actual a PDF usando html2pdf.js (cargado como script externo).
export function exportarPDF(elemento: HTMLElement | null): void {
  if (!elemento) {
    notificar('No hay resultados para exportar. Realiza una evaluación primero.', 'error');
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf = (window as any).html2pdf;
  if (typeof html2pdf !== 'function') {
    notificar('La librería de PDF no está disponible. Verifica tu conexión.', 'error');
    return;
  }
  html2pdf().set({
    margin: [10, 10, 10, 10],
    filename: `SaludAsist-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(elemento).save();
}
