// gestion-categorias.ts — el menú de síntomas (categorías + síntomas),
// leído y editado contra la tabla compartida de Supabase (`categorias` y
// `sintomas`, ver supabase/schema.sql). Antes vivía en localStorage.
import { supabase } from '../almacenamiento/supabaseClient';
import type { Categoria, Sintoma } from '../tipos/tipos';

function valorDesdeTexto(texto: string): string {
  // Convierte "Dolor de rodilla" en "dolor-de-rodilla", para usarlo como
  // identificador único del síntoma (igual formato que los ya existentes).
  return texto.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // saca tildes
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Trae las categorías actuales con sus síntomas, en el mismo orden en que
// se insertaron.
export async function obtenerCategorias(): Promise<Categoria[]> {
  const [{ data: categorias }, { data: sintomas }] = await Promise.all([
    supabase.from('categorias').select('id,nombre,icono').order('id'),
    supabase.from('sintomas').select('categoria_id,valor,etiqueta').order('id'),
  ]);

  return (categorias ?? []).map((cat): Categoria => ({
    id: cat.id,
    nombre: cat.nombre,
    icono: cat.icono,
    sintomas: (sintomas ?? [])
      .filter(s => s.categoria_id === cat.id)
      .map((s): Sintoma => ({ valor: s.valor, etiqueta: s.etiqueta })),
  }));
}

// Agrega una categoría nueva y vacía (sin síntomas todavía).
export async function agregarCategoria(nombre: string, icono: string): Promise<void> {
  await supabase.from('categorias').insert({ id: valorDesdeTexto(nombre), nombre, icono });
}

// Borra una categoría completa (y todos sus síntomas, por el ON DELETE CASCADE).
export async function eliminarCategoria(idCategoria: string): Promise<void> {
  await supabase.from('categorias').delete().eq('id', idCategoria);
}

// Agrega un síntoma nuevo a una categoría existente. Devuelve el valor
// (identificador) que le tocó, para poder usarlo enseguida en una regla.
export async function agregarSintoma(idCategoria: string, etiqueta: string): Promise<Sintoma | null> {
  const nuevo: Sintoma = { valor: valorDesdeTexto(etiqueta), etiqueta };
  const { error } = await supabase.from('sintomas').insert({ categoria_id: idCategoria, valor: nuevo.valor, etiqueta: nuevo.etiqueta });
  return error ? null : nuevo;
}

// Quita un síntoma de su categoría.
export async function eliminarSintoma(_idCategoria: string, valorSintoma: string): Promise<void> {
  await supabase.from('sintomas').delete().eq('valor', valorSintoma);
}
