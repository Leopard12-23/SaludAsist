// cuentas-usuarios.ts
// Todo lo relacionado a cuentas: registrar, iniciar sesión, cerrar sesión,
// y gestión de usuarios (para el admin). Antes esto vivía en localStorage
// con hash PBKDF2 propio; ahora la autenticación real la hace Supabase Auth
// (backend compartido del equipo) y el rol/especialidad/activo vive en la
// tabla `perfiles` (ver supabase/schema.sql).
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export type Rol = 'administrador' | 'doctor' | 'usuario';

// Especialidades disponibles para cuentas de tipo "doctor". Se reutilizan
// las mismas especialidades a las que ya el motor de diagnóstico deriva
// (ver derivacion en catalogo-enfermedades.ts), para que todo el sistema
// hable de las mismas especialidades.
export const ESPECIALIDADES = [
  'Médico General',
  'Cardiólogo',
  'Neumólogo',
  'Neurólogo',
  'Gastroenterólogo',
  'Dermatólogo',
  'Otorrinolaringólogo',
  'Alergólogo',
  'Reumatólogo',
  'Traumatólogo',
  'Oftalmólogo',
  'Urólogo',
  'Psicólogo',
  'Psiquiatra',
] as const;
export type Especialidad = typeof ESPECIALIDADES[number];

export interface Sesion {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  especialidad?: string;
}

const CLAVE_SESION = 'saludasist-sesion';

export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

export function correoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// ── Fortaleza de contraseña ──────────────────────────────────
export interface FortalezaClave { puntuacion: number; texto: string; valida: boolean }

export function evaluarFortaleza(clave: string): FortalezaClave {
  let puntuacion = 0;
  if (clave.length >= 8) puntuacion++;
  if (clave.length >= 12) puntuacion++;
  if (/[a-z]/.test(clave) && /[A-Z]/.test(clave)) puntuacion++;
  if (/[0-9]/.test(clave) && /[^A-Za-z0-9]/.test(clave)) puntuacion++;

  const textos = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
  return { puntuacion, texto: textos[puntuacion], valida: clave.length >= 8 };
}

// ── Sesión local (caché síncrona para el router y los componentes) ──
// El router guard (router/index.ts) necesita leer la sesión de forma
// SÍNCRONA antes de decidir a qué ruta dejar pasar, pero Supabase Auth es
// asíncrono. Por eso se mantiene una copia en sessionStorage, poblada por
// restaurarSesionDesdeSupabase() al arrancar la app (ver main.ts) y por
// iniciarSesion() al loguearse.
function guardarSesionLocal(sesion: Sesion, token: string): void {
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  // token/usuario en localStorage: para que la contenedora y el módulo
  // Angular (mismo origen, subcarpetas distintas) sepan quién tiene la
  // sesión activa sin tener que volver a consultar Supabase.
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', sesion.correo);
}

function limpiarSesionLocal(): void {
  sessionStorage.removeItem(CLAVE_SESION);
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function obtenerSesion(): Sesion | null {
  try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? 'null'); } catch { return null; }
}

// Cierra la sesión en Supabase y limpia la caché local. El signOut es
// "fire and forget" (no se espera) porque los que llaman a esto
// (App.vue, el temporizador de inactividad) no son funciones async.
export function cerrarSesion(): void {
  limpiarSesionLocal();
  void supabase.auth.signOut();
}

// Se llama UNA vez al arrancar la app (antes de montar el router), para
// que si ya había una sesión de Supabase activa (por ejemplo, porque el
// login lo hizo la contenedora, o porque se recargó la página), la caché
// síncrona quede lista antes de la primera navegación.
export async function restaurarSesionDesdeSupabase(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) { limpiarSesionLocal(); return; }

  const { data: perfil } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single();
  if (!perfil || !perfil.activo) {
    await supabase.auth.signOut();
    limpiarSesionLocal();
    return;
  }

  guardarSesionLocal(
    { id: perfil.id, nombre: perfil.nombre, correo: perfil.correo, rol: perfil.rol, especialidad: perfil.especialidad ?? undefined },
    session.access_token,
  );
}

// Verifica correo/contraseña contra Supabase Auth. Mensaje genérico para
// no revelar si el correo existe (mismo criterio que antes).
export async function iniciarSesion(correo: string, clave: string): Promise<{ ok: boolean; sesion?: Sesion; error?: string }> {
  const correoNorm = normalizarCorreo(correo);
  const ERROR = 'Correo o contraseña incorrectos.';

  const { data, error } = await supabase.auth.signInWithPassword({ email: correoNorm, password: clave });
  if (error || !data.session) return { ok: false, error: ERROR };

  const { data: perfil } = await supabase.from('perfiles').select('*').eq('id', data.user.id).single();
  if (!perfil) { await supabase.auth.signOut(); return { ok: false, error: ERROR }; }
  if (!perfil.activo) { await supabase.auth.signOut(); return { ok: false, error: 'Esta cuenta fue desactivada. Contacta al administrador.' }; }

  const sesion: Sesion = { id: perfil.id, nombre: perfil.nombre, correo: perfil.correo, rol: perfil.rol, especialidad: perfil.especialidad ?? undefined };
  guardarSesionLocal(sesion, data.session.access_token);
  return { ok: true, sesion };
}

// Registra un usuario nuevo. No permite crear administradores desde el
// formulario público. Usa un cliente Supabase APARTE y descartable: si
// usáramos el cliente compartido, signUp() reemplazaría la sesión de quien
// esté logueado ahora mismo (ej. un admin creando cuentas) por la del
// usuario recién creado.
export async function registrar(nombre: string, correo: string, clave: string, rol: Rol, especialidad?: string): Promise<{ ok: boolean; error?: string }> {
  const correoNorm = normalizarCorreo(correo);
  if (!correoValido(correoNorm)) return { ok: false, error: 'Correo inválido.' };
  if (rol === 'administrador') return { ok: false, error: 'No puedes registrarte como administrador.' };
  if (rol === 'doctor' && !especialidad) return { ok: false, error: 'Selecciona tu especialidad.' };
  if (!evaluarFortaleza(clave).valida) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };

  const clienteTemporal = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
  const { error } = await clienteTemporal.auth.signUp({
    email: correoNorm,
    password: clave,
    options: { data: { nombre, rol, especialidad: rol === 'doctor' ? especialidad : undefined } },
  });
  if (error) {
    if (/registered|exists/i.test(error.message)) return { ok: false, error: 'Ese correo ya está registrado.' };
    return { ok: false, error: error.message };
  }
  await clienteTemporal.auth.signOut();
  return { ok: true };
}

// Devuelve la lista de usuarios registrados (perfiles), sin datos sensibles.
export async function listarUsuarios(filtroRol?: Rol): Promise<Array<{ nombre: string; correo: string; rol: Rol; activo: boolean; especialidad?: string }>> {
  let consulta = supabase.from('perfiles').select('nombre,correo,rol,activo,especialidad');
  if (filtroRol) consulta = consulta.eq('rol', filtroRol);
  const { data } = await consulta;
  return data ?? [];
}

// Cuenta cuántos administradores activos quedan (para no dejar el sistema
// sin nadie que pueda volver a entrar al panel de admin).
async function contarAdminsActivos(excluirCorreo?: string): Promise<number> {
  let consulta = supabase.from('perfiles').select('correo', { count: 'exact', head: true }).eq('rol', 'administrador').eq('activo', true);
  if (excluirCorreo) consulta = consulta.neq('correo', excluirCorreo);
  const { count } = await consulta;
  return count ?? 0;
}

// Cambia el rol de un usuario (ej: de paciente a doctor). Solo lo usa el admin.
export async function cambiarRolUsuario(correo: string, nuevoRol: Rol): Promise<{ ok: boolean; error?: string }> {
  const { data: usuario } = await supabase.from('perfiles').select('rol').eq('correo', correo).single();
  if (!usuario) return { ok: false, error: 'La cuenta ya no existe.' };
  if (usuario.rol === 'administrador' && nuevoRol !== 'administrador' && (await contarAdminsActivos(correo)) === 0) {
    return { ok: false, error: 'No puedes quitarle el rol de administrador a la última cuenta admin activa.' };
  }

  const { error } = await supabase.from('perfiles')
    .update({ rol: nuevoRol, especialidad: nuevoRol === 'doctor' ? usuario.rol : null })
    .eq('correo', correo);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// El admin asigna o cambia la especialidad de una cuenta de doctor.
export async function actualizarEspecialidad(correo: string, especialidad: string): Promise<void> {
  await supabase.from('perfiles').update({ especialidad }).eq('correo', correo);
}

// El admin crea una cuenta directamente (ej: un doctor especialista nuevo)
// sin pasar por el formulario público de registro. Genera una contraseña
// temporal y la devuelve UNA sola vez para que el admin se la pase a la
// persona. Usa un cliente Supabase aparte por el mismo motivo que registrar().
export async function crearCuentaComoAdmin(
  nombre: string, correo: string, rol: Rol, especialidad?: string,
): Promise<{ ok: boolean; error?: string; claveTemporal?: string }> {
  const correoNorm = normalizarCorreo(correo);
  if (!nombre.trim()) return { ok: false, error: 'Ingresa el nombre completo.' };
  if (!correoValido(correoNorm)) return { ok: false, error: 'Correo inválido.' };
  if (rol === 'doctor' && !especialidad) return { ok: false, error: 'Selecciona la especialidad del doctor.' };

  const claveTemporal = Math.random().toString(36).slice(2, 8) + 'A1!';
  const clienteTemporal = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
  const { error } = await clienteTemporal.auth.signUp({
    email: correoNorm,
    password: claveTemporal,
    options: { data: { nombre: nombre.trim(), rol, especialidad: rol === 'doctor' ? especialidad : undefined } },
  });
  if (error) {
    if (/registered|exists/i.test(error.message)) return { ok: false, error: 'Ese correo ya está registrado.' };
    return { ok: false, error: error.message };
  }
  await clienteTemporal.auth.signOut();
  return { ok: true, claveTemporal };
}

// Activa o desactiva una cuenta (una cuenta desactivada no puede iniciar
// sesión: iniciarSesion() revisa perfil.activo). No deja desactivar la
// propia cuenta mientras tiene sesión abierta, ni al último admin activo.
export async function alternarActivoUsuario(correo: string): Promise<{ ok: boolean; error?: string }> {
  const { data: usuario } = await supabase.from('perfiles').select('rol,activo').eq('correo', correo).single();
  if (!usuario) return { ok: false, error: 'La cuenta ya no existe.' };

  const vaADesactivarse = usuario.activo;
  const sesion = obtenerSesion();
  if (vaADesactivarse && sesion?.correo === correo) {
    return { ok: false, error: 'No puedes desactivar tu propia cuenta mientras tenés la sesión abierta.' };
  }
  if (vaADesactivarse && usuario.rol === 'administrador' && (await contarAdminsActivos(correo)) === 0) {
    return { ok: false, error: 'No puedes desactivar al último administrador activo del sistema.' };
  }

  const { error } = await supabase.from('perfiles').update({ activo: !usuario.activo }).eq('correo', correo);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Borra el PERFIL de una cuenta para siempre (distinto de "desactivar").
// Limitación aceptada para este demo: borrar la cuenta de auth.users
// requiere la service_role key (API de administración), que no se expone
// en el cliente; el perfil desaparece de todas las listas y ya no puede
// operar en el sistema, aunque la fila de auth.users quede huérfana.
export async function eliminarUsuarioPermanente(correo: string): Promise<{ ok: boolean; error?: string }> {
  const { data: usuario } = await supabase.from('perfiles').select('rol,activo').eq('correo', correo).single();
  if (!usuario) return { ok: false, error: 'La cuenta ya no existe.' };

  const sesion = obtenerSesion();
  if (sesion?.correo === correo) {
    return { ok: false, error: 'No puedes eliminar tu propia cuenta mientras tenés la sesión abierta.' };
  }
  if (usuario.rol === 'administrador' && usuario.activo && (await contarAdminsActivos(correo)) === 0) {
    return { ok: false, error: 'No puedes eliminar al último administrador activo del sistema.' };
  }

  const { error } = await supabase.from('perfiles').delete().eq('correo', correo);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
