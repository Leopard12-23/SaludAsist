// disponibilidad.ts — si un doctor está "disponible" o no, contra la
// columna `disponible` de la tabla compartida `perfiles` en Supabase.
import { supabase } from '../almacenamiento/supabaseClient';

// Devuelve el estado de disponibilidad guardado (por defecto: disponible).
export async function estaDisponible(correoDoctor: string): Promise<boolean> {
  const { data } = await supabase.from('perfiles').select('disponible').eq('correo', correoDoctor).single();
  return data?.disponible ?? true;
}

// Cambia el estado de disponibilidad de un doctor y lo guarda.
export async function alternarDisponibilidad(correoDoctor: string): Promise<boolean> {
  const actual = await estaDisponible(correoDoctor);
  const nuevoEstado = !actual;
  await supabase.from('perfiles').update({ disponible: nuevoEstado }).eq('correo', correoDoctor);
  return nuevoEstado;
}
