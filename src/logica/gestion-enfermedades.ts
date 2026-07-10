// gestion-enfermedades.ts — hace que el catálogo de enfermedades sea
// EDITABLE desde la interfaz (antes era un archivo fijo que solo se podía
// cambiar tocando código). El admin puede agregar, editar o borrar
// enfermedades, y los cambios quedan guardados en este dispositivo.
import { CATALOGO_BASE } from './catalogo-enfermedades';
import type { ReglaDiagnostico } from '../tipos/tipos';

const CLAVE = 'saludasist-catalogo-enfermedades';

function idAleatorio(): string {
  return `regla-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Trae el catálogo actual. La primera vez que se usa, lo arma a partir
// del catálogo base (semilla) y lo guarda para poder editarlo después.
export function obtenerCatalogo(): ReglaDiagnostico[] {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return JSON.parse(guardado);
  } catch {
    // Si el JSON quedó corrupto, se regenera desde la semilla abajo.
  }

  const catalogoInicial: ReglaDiagnostico[] = CATALOGO_BASE.map(regla => ({ ...regla, id: idAleatorio() }));
  localStorage.setItem(CLAVE, JSON.stringify(catalogoInicial));
  return catalogoInicial;
}

// Agrega una enfermedad nueva al catálogo.
export function agregarEnfermedad(datos: Omit<ReglaDiagnostico, 'id'>): void {
  const catalogo = obtenerCatalogo();
  catalogo.push({ ...datos, id: idAleatorio() });
  localStorage.setItem(CLAVE, JSON.stringify(catalogo));
}

// Reemplaza los datos de una enfermedad existente (se mantiene el mismo id).
export function editarEnfermedad(id: string, datos: Omit<ReglaDiagnostico, 'id'>): void {
  const catalogo = obtenerCatalogo();
  const indice = catalogo.findIndex(r => r.id === id);
  if (indice !== -1) catalogo[indice] = { ...datos, id };
  localStorage.setItem(CLAVE, JSON.stringify(catalogo));
}

// Borra una enfermedad del catálogo por su id.
export function eliminarEnfermedad(id: string): void {
  const catalogo = obtenerCatalogo().filter(r => r.id !== id);
  localStorage.setItem(CLAVE, JSON.stringify(catalogo));
}

// Descarta todos los cambios y vuelve a las 29 enfermedades originales.
export function restaurarCatalogoOriginal(): void {
  localStorage.removeItem(CLAVE);
}
