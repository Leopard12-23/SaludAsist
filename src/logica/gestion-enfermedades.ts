// gestion-enfermedades.ts — el catálogo de enfermedades (reglas de
// diagnóstico), leído y editado contra la tabla compartida de Supabase
// `reglas_diagnostico` (ver supabase/schema.sql). Antes vivía en localStorage.
import { supabase } from '../almacenamiento/supabaseClient';
import type { ReglaDiagnostico } from '../tipos/tipos';

interface FilaSupabase {
  id: string;
  requeridos: string[];
  opcionales: string[];
  enfermedad: string;
  probabilidad_base: number;
  gravedad: ReglaDiagnostico['gravedad'];
  derivacion: string;
  descripcion: string;
  recomendaciones: string[];
}

function aReglaDiagnostico(fila: FilaSupabase): ReglaDiagnostico {
  return {
    id: fila.id,
    requeridos: fila.requeridos,
    opcionales: fila.opcionales,
    enfermedad: fila.enfermedad,
    probabilidadBase: fila.probabilidad_base,
    gravedad: fila.gravedad,
    derivacion: fila.derivacion,
    descripcion: fila.descripcion,
    recomendaciones: fila.recomendaciones,
  };
}

// Trae el catálogo completo de enfermedades (incluye lo agregado/editado por el admin).
export async function obtenerCatalogo(): Promise<ReglaDiagnostico[]> {
  const { data } = await supabase.from('reglas_diagnostico').select('*');
  return (data ?? []).map(aReglaDiagnostico);
}

// Agrega una enfermedad nueva al catálogo.
export async function agregarEnfermedad(datos: Omit<ReglaDiagnostico, 'id'>): Promise<void> {
  await supabase.from('reglas_diagnostico').insert({
    requeridos: datos.requeridos,
    opcionales: datos.opcionales,
    enfermedad: datos.enfermedad,
    probabilidad_base: datos.probabilidadBase,
    gravedad: datos.gravedad,
    derivacion: datos.derivacion,
    descripcion: datos.descripcion,
    recomendaciones: datos.recomendaciones,
  });
}

// Reemplaza los datos de una enfermedad existente (se mantiene el mismo id).
export async function editarEnfermedad(id: string, datos: Omit<ReglaDiagnostico, 'id'>): Promise<void> {
  await supabase.from('reglas_diagnostico').update({
    requeridos: datos.requeridos,
    opcionales: datos.opcionales,
    enfermedad: datos.enfermedad,
    probabilidad_base: datos.probabilidadBase,
    gravedad: datos.gravedad,
    derivacion: datos.derivacion,
    descripcion: datos.descripcion,
    recomendaciones: datos.recomendaciones,
  }).eq('id', id);
}

// Borra una enfermedad del catálogo por su id.
export async function eliminarEnfermedad(id: string): Promise<void> {
  await supabase.from('reglas_diagnostico').delete().eq('id', id);
}
