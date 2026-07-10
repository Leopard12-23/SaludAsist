// disponibilidad.ts — guarda si un doctor está "disponible" o no,
// por correo, para que se recuerde entre sesiones.
const CLAVE = 'saludasist-disponibilidad';

function leerMapa(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(CLAVE) ?? '{}'); } catch { return {}; }
}

// Devuelve true/false según el último estado guardado (por defecto: disponible).
export function estaDisponible(correoDoctor: string): boolean {
  const mapa = leerMapa();
  return mapa[correoDoctor] ?? true;
}

// Cambia el estado de disponibilidad de un doctor y lo guarda.
export function alternarDisponibilidad(correoDoctor: string): boolean {
  const mapa = leerMapa();
  const nuevoEstado = !estaDisponible(correoDoctor);
  mapa[correoDoctor] = nuevoEstado;
  localStorage.setItem(CLAVE, JSON.stringify(mapa));
  return nuevoEstado;
}
