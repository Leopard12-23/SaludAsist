// asignaciones.ts — qué paciente está asignado a qué doctor, contra la
// tabla compartida `asignaciones` de Supabase. Antes vivía en localStorage.
import { supabase } from '../almacenamiento/supabaseClient';

// Devuelve el correo del doctor asignado a un paciente, o null si no tiene.
export async function doctorAsignado(correoPaciente: string): Promise<string | null> {
  const { data: paciente } = await supabase.from('perfiles').select('id').eq('correo', correoPaciente).single();
  if (!paciente) return null;
  const { data } = await supabase.from('asignaciones').select('doctor_id').eq('paciente_id', paciente.id).single();
  if (!data?.doctor_id) return null;
  const { data: doctor } = await supabase.from('perfiles').select('correo').eq('id', data.doctor_id).single();
  return doctor?.correo ?? null;
}

// Asigna (o cambia) el doctor de un paciente. Pasa cadena vacía para desasignar.
export async function asignarDoctor(correoPaciente: string, correoDoctor: string): Promise<void> {
  const { data: paciente } = await supabase.from('perfiles').select('id').eq('correo', correoPaciente).single();
  if (!paciente) return;

  if (!correoDoctor) {
    await supabase.from('asignaciones').delete().eq('paciente_id', paciente.id);
    return;
  }
  const { data: doctor } = await supabase.from('perfiles').select('id').eq('correo', correoDoctor).single();
  if (!doctor) return;
  await supabase.from('asignaciones').upsert({ paciente_id: paciente.id, doctor_id: doctor.id });
}

// Devuelve los correos de todos los pacientes asignados a un doctor puntual.
export async function pacientesDeDoctor(correoDoctor: string): Promise<string[]> {
  const { data: doctor } = await supabase.from('perfiles').select('id').eq('correo', correoDoctor).single();
  if (!doctor) return [];
  const { data: asignaciones } = await supabase.from('asignaciones').select('paciente_id').eq('doctor_id', doctor.id);
  if (!asignaciones?.length) return [];
  const { data: pacientes } = await supabase.from('perfiles').select('correo').in('id', asignaciones.map(a => a.paciente_id));
  return (pacientes ?? []).map(p => p.correo);
}

// Limpia cualquier asignación relacionada a este correo: si era un
// paciente, borra su asignación; si era un doctor, desasigna a todos sus
// pacientes. Se usa cuando se elimina una cuenta o se le cambia el rol.
export async function limpiarAsignacionesDe(correo: string): Promise<void> {
  const { data: perfil } = await supabase.from('perfiles').select('id').eq('correo', correo).single();
  if (!perfil) return;
  await supabase.from('asignaciones').delete().eq('paciente_id', perfil.id);
  await supabase.from('asignaciones').update({ doctor_id: null }).eq('doctor_id', perfil.id);
}
