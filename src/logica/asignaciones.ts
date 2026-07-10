// asignaciones.ts — qué paciente está asignado a qué doctor.
// Relación simple: cada paciente tiene UN doctor asignado (o ninguno).
// La asigna el administrador desde su panel.
const CLAVE = 'saludasist-asignaciones';

// Mapa guardado: correo del paciente -> correo del doctor asignado.
function leerMapa(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CLAVE) ?? '{}'); } catch { return {}; }
}
function guardarMapa(mapa: Record<string, string>): void {
  localStorage.setItem(CLAVE, JSON.stringify(mapa));
}

// Devuelve el correo del doctor asignado a un paciente, o null si no tiene.
export function doctorAsignado(correoPaciente: string): string | null {
  return leerMapa()[correoPaciente] ?? null;
}

// Asigna (o cambia) el doctor de un paciente. Pasa cadena vacía para desasignar.
export function asignarDoctor(correoPaciente: string, correoDoctor: string): void {
  const mapa = leerMapa();
  if (correoDoctor) mapa[correoPaciente] = correoDoctor;
  else delete mapa[correoPaciente];
  guardarMapa(mapa);
}

// Devuelve los correos de todos los pacientes asignados a un doctor puntual.
// La usa VistaDoctor.vue para mostrar SOLO sus pacientes, no todos los del sistema.
export function pacientesDeDoctor(correoDoctor: string): string[] {
  const mapa = leerMapa();
  return Object.keys(mapa).filter(correoPaciente => mapa[correoPaciente] === correoDoctor);
}

// Limpia cualquier asignación relacionada a este correo: si era un
// paciente, borra su asignación; si era un doctor, desasigna a todos sus
// pacientes. Se usa cuando se elimina una cuenta o se le cambia el rol,
// para no dejar asignaciones "huérfanas" apuntando a alguien que ya no
// es doctor (o que ya no existe).
export function limpiarAsignacionesDe(correo: string): void {
  const mapa = leerMapa();
  delete mapa[correo]; // por si era paciente
  Object.keys(mapa).forEach(correoPaciente => {
    if (mapa[correoPaciente] === correo) delete mapa[correoPaciente]; // por si era doctor
  });
  guardarMapa(mapa);
}
