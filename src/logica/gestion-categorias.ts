// gestion-categorias.ts — hace que el menú de síntomas sea EDITABLE
// desde la interfaz (antes era un archivo fijo). El admin puede agregar
// una categoría nueva o agregar/quitar síntomas de una categoría existente.
import { CATEGORIAS_BASE } from './categorias';
import type { Categoria, Sintoma } from '../tipos/tipos';

const CLAVE = 'saludasist-categorias';

function valorDesdeTexto(texto: string): string {
  // Convierte "Dolor de rodilla" en "dolor-de-rodilla", para usarlo como
  // identificador único del síntoma (igual formato que los ya existentes).
  return texto.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // saca tildes
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Trae las categorías actuales. La primera vez, arranca desde la semilla.
export function obtenerCategorias(): Categoria[] {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return JSON.parse(guardado);
  } catch {
    // Si el JSON quedó corrupto, se regenera desde la semilla abajo.
  }
  // OJO: se guarda y se devuelve una COPIA (vía JSON), nunca la constante
  // CATEGORIAS_BASE directamente. Si se devolviera la referencia original,
  // funciones como agregarCategoria() (que hacen .push() sobre lo que
  // reciben) mutarían la semilla original para siempre, incluso después
  // de "restaurar categorías originales".
  const copia: Categoria[] = JSON.parse(JSON.stringify(CATEGORIAS_BASE));
  localStorage.setItem(CLAVE, JSON.stringify(copia));
  return copia;
}

function guardar(categorias: Categoria[]): void {
  localStorage.setItem(CLAVE, JSON.stringify(categorias));
}

// Agrega una categoría nueva y vacía (sin síntomas todavía).
export function agregarCategoria(nombre: string, icono: string): void {
  const categorias = obtenerCategorias();
  categorias.push({ id: valorDesdeTexto(nombre), nombre, icono, sintomas: [] });
  guardar(categorias);
}

// Borra una categoría completa (y todos sus síntomas).
export function eliminarCategoria(idCategoria: string): void {
  guardar(obtenerCategorias().filter(c => c.id !== idCategoria));
}

// Agrega un síntoma nuevo a una categoría existente. Devuelve el valor
// (identificador) que le tocó, para poder usarlo enseguida en una regla.
export function agregarSintoma(idCategoria: string, etiqueta: string): Sintoma | null {
  const categorias = obtenerCategorias();
  const categoria = categorias.find(c => c.id === idCategoria);
  if (!categoria) return null;

  const nuevo: Sintoma = { valor: valorDesdeTexto(etiqueta), etiqueta };
  categoria.sintomas.push(nuevo);
  guardar(categorias);
  return nuevo;
}

// Quita un síntoma de su categoría.
export function eliminarSintoma(idCategoria: string, valorSintoma: string): void {
  const categorias = obtenerCategorias();
  const categoria = categorias.find(c => c.id === idCategoria);
  if (categoria) categoria.sintomas = categoria.sintomas.filter(s => s.valor !== valorSintoma);
  guardar(categorias);
}

// Descarta los cambios y vuelve a las 10 categorías / 51 síntomas originales.
export function restaurarCategoriasOriginales(): void {
  localStorage.removeItem(CLAVE);
}
