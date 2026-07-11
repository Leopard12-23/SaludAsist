// historial-evaluaciones.ts — historial de evaluaciones contra la tabla
// compartida `evaluaciones` de Supabase (antes vivía en localStorage).
// Esta es la tabla clave para demostrar "lo que escribe un módulo se puede
// leer desde otro": el paciente (Vue) escribe acá, y el doctor (Angular)
// lee estas mismas filas gracias a la política RLS de `evaluaciones_select`.
import { supabase } from '../almacenamiento/supabaseClient';
import type { ResultadoDiagnostico } from '../tipos/tipos';
import { notificar } from './usar-notificaciones';

export interface EvaluacionGuardada {
  id: string;
  correoUsuario: string;
  sintomas: string[];
  resultado: ResultadoDiagnostico | null;
  fecha: string;
  notaDoctor?: string;
}

async function idDePerfil(correo: string): Promise<string | null> {
  const { data } = await supabase.from('perfiles').select('id').eq('correo', correo).single();
  return data?.id ?? null;
}

// Guarda una evaluación nueva, ligada al correo de quien la hizo.
export async function guardarEvaluacion(correoUsuario: string, sintomas: string[], resultado: ResultadoDiagnostico | null): Promise<void> {
  const usuarioId = await idDePerfil(correoUsuario);
  if (!usuarioId) return;
  await supabase.from('evaluaciones').insert({ usuario_id: usuarioId, sintomas, resultado });
}

// Carga el historial de UN paciente en particular, más reciente primero.
export async function cargarHistorial(correoUsuario: string): Promise<EvaluacionGuardada[]> {
  const usuarioId = await idDePerfil(correoUsuario);
  if (!usuarioId) return [];
  const { data } = await supabase.from('evaluaciones')
    .select('id,sintomas,resultado,fecha,nota_doctor')
    .eq('usuario_id', usuarioId)
    .order('fecha', { ascending: false })
    .limit(20);
  return (data ?? []).map(ev => ({
    id: ev.id, correoUsuario, sintomas: ev.sintomas, resultado: ev.resultado, fecha: ev.fecha, notaDoctor: ev.nota_doctor ?? undefined,
  }));
}

// Borra una sola evaluación por su id.
export async function eliminarEvaluacion(id: string): Promise<void> {
  await supabase.from('evaluaciones').delete().eq('id', id);
}

// Borra todo el historial de UN paciente (no el de los demás).
export async function limpiarHistorial(correoUsuario: string): Promise<void> {
  const usuarioId = await idDePerfil(correoUsuario);
  if (!usuarioId) return;
  await supabase.from('evaluaciones').delete().eq('usuario_id', usuarioId);
}

// El doctor usa esto para dejar (o borrar) una nota clínica en una evaluación puntual.
export async function guardarNotaDoctor(idEvaluacion: string, nota: string): Promise<void> {
  await supabase.from('evaluaciones').update({ nota_doctor: nota }).eq('id', idEvaluacion);
}

// Calcula estadísticas rápidas sobre un historial ya cargado (función pura).
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
export async function calcularEstadisticasGlobales() {
  const { data } = await supabase.from('evaluaciones').select('sintomas,fecha').order('fecha', { ascending: false });
  const historial = (data ?? []).map(ev => ({ id: '', correoUsuario: '', sintomas: ev.sintomas, resultado: null, fecha: ev.fecha }));
  return calcularEstadisticas(historial);
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
