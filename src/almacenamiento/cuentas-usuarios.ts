// cuentas-usuarios.ts
// Todo lo relacionado a cuentas: registrar, iniciar sesión, cerrar sesión,
// límite de intentos fallidos, y gestión de usuarios (para el admin).
// Las contraseñas nunca se guardan en texto plano (se guardan con hash + salt).

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

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  hash: string;
  salt: string;
  activo: boolean; // una cuenta desactivada no puede iniciar sesión
  especialidad?: string; // solo aplica si rol === 'doctor'
}

export interface Sesion {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  especialidad?: string;
}

const CLAVE_USUARIOS = 'saludasist-usuarios';
const CLAVE_SESION = 'saludasist-sesion';
const CLAVE_INTENTOS = 'saludasist-intentos-login';

function aHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function idAleatorio(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return aHex(bytes.buffer);
}

// Deriva un hash seguro de la contraseña usando PBKDF2 (nunca texto plano).
async function derivarHash(clave: string, saltHex: string): Promise<string> {
  const saltBytes = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(clave), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: 150000, hash: 'SHA-256' }, base, 256);
  return aHex(bits);
}

function leerUsuarios(): Usuario[] {
  try { return JSON.parse(localStorage.getItem(CLAVE_USUARIOS) ?? '[]'); } catch { return []; }
}

function guardarUsuarios(usuarios: Usuario[]): void {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

export function correoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// ── Fortaleza de contraseña ──────────────────────────────────
// Se usa en el registro para mostrar una barra de fortaleza y
// bloquear contraseñas demasiado débiles.
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

// Registra un usuario nuevo. No permite crear administradores desde el formulario público.
export async function registrar(nombre: string, correo: string, clave: string, rol: Rol, especialidad?: string): Promise<{ ok: boolean; error?: string }> {
  const correoNorm = normalizarCorreo(correo);
  if (!correoValido(correoNorm)) return { ok: false, error: 'Correo inválido.' };
  if (rol === 'administrador') return { ok: false, error: 'No puedes registrarte como administrador.' };
  if (rol === 'doctor' && !especialidad) return { ok: false, error: 'Selecciona tu especialidad.' };
  const usuarios = leerUsuarios();
  if (usuarios.some(u => u.correo === correoNorm)) return { ok: false, error: 'Ese correo ya está registrado.' };
  if (!evaluarFortaleza(clave).valida) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };

  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = aHex(saltBytes.buffer);
  const hash = await derivarHash(clave, salt);

  usuarios.push({ id: idAleatorio(), nombre, correo: correoNorm, rol, hash, salt, activo: true, especialidad: rol === 'doctor' ? especialidad : undefined });
  guardarUsuarios(usuarios);
  return { ok: true };
}

// ── Límite de intentos de inicio de sesión (protege contra fuerza bruta) ──
const MAX_INTENTOS = 5;
const BLOQUEO_MINUTOS = 5;

interface RegistroIntentos { intentos: number; bloqueadoHasta: number | null }

function leerIntentos(): Record<string, RegistroIntentos> {
  try { return JSON.parse(localStorage.getItem(CLAVE_INTENTOS) ?? '{}'); } catch { return {}; }
}
function guardarIntentos(registro: Record<string, RegistroIntentos>): void {
  localStorage.setItem(CLAVE_INTENTOS, JSON.stringify(registro));
}

// Dice si un correo está bloqueado ahora mismo, y cuántos minutos faltan.
function obtenerBloqueo(correo: string): { bloqueado: boolean; minutos: number } {
  const registro = leerIntentos()[correo];
  if (!registro?.bloqueadoHasta || Date.now() >= registro.bloqueadoHasta) return { bloqueado: false, minutos: 0 };
  return { bloqueado: true, minutos: Math.ceil((registro.bloqueadoHasta - Date.now()) / 60000) };
}

// Suma un intento fallido; si llega al máximo, bloquea el correo por unos minutos.
function registrarIntentoFallido(correo: string): void {
  const registro = leerIntentos();
  const actual = registro[correo] ?? { intentos: 0, bloqueadoHasta: null };
  actual.intentos++;
  if (actual.intentos >= MAX_INTENTOS) {
    actual.bloqueadoHasta = Date.now() + BLOQUEO_MINUTOS * 60_000;
    actual.intentos = 0;
  }
  registro[correo] = actual;
  guardarIntentos(registro);
}

// Limpia el contador tras un login exitoso.
function limpiarIntentos(correo: string): void {
  const registro = leerIntentos();
  delete registro[correo];
  guardarIntentos(registro);
}

// Verifica correo/contraseña. Mensaje genérico para no revelar si el correo existe.
export async function iniciarSesion(correo: string, clave: string): Promise<{ ok: boolean; sesion?: Sesion; error?: string }> {
  const correoNorm = normalizarCorreo(correo);
  const ERROR = 'Correo o contraseña incorrectos.';

  const bloqueo = obtenerBloqueo(correoNorm);
  if (bloqueo.bloqueado) return { ok: false, error: `Demasiados intentos. Espera ${bloqueo.minutos} minuto(s).` };

  const usuario = leerUsuarios().find(u => u.correo === correoNorm);
  if (!usuario) { registrarIntentoFallido(correoNorm); return { ok: false, error: ERROR }; }
  if (!usuario.activo) return { ok: false, error: 'Esta cuenta fue desactivada. Contacta al administrador.' };

  const hashIngresado = await derivarHash(clave, usuario.salt);
  if (hashIngresado !== usuario.hash) { registrarIntentoFallido(correoNorm); return { ok: false, error: ERROR }; }

  limpiarIntentos(correoNorm);
  const sesion: Sesion = { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, especialidad: usuario.especialidad };
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  return { ok: true, sesion };
}

export function obtenerSesion(): Sesion | null {
  try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? 'null'); } catch { return null; }
}

export function cerrarSesion(): void {
  sessionStorage.removeItem(CLAVE_SESION);
}

// Crea 3 cuentas de prueba (admin, doctor, paciente) la primera vez que se abre la app.
export async function sembrarCuentasDemo(): Promise<void> {
  if (leerUsuarios().length > 0) return;
  await registrarComoSemilla('Administrador Demo', 'admin@saludasist.com', 'Admin123!', 'administrador');
  await registrarComoSemilla('Doctora Demo', 'doctor@saludasist.com', 'Doctor123!', 'doctor', 'Médico General');
  await registrarComoSemilla('Paciente Demo', 'paciente@saludasist.com', 'Paciente123!', 'usuario');
}

// Red de seguridad: se llama cada vez que arranca la app (ver App.vue). Si
// por lo que sea NINGÚN administrador quedó activo (por ejemplo, alguien
// se desactivó por error antes de que existieran los candados de arriba),
// reactiva automáticamente al administrador más antiguo para que el
// sistema nunca quede sin nadie que pueda entrar al panel de admin.
export function asegurarAdminActivo(): void {
  const usuarios = leerUsuarios();
  const admins = usuarios.filter(u => u.rol === 'administrador');
  if (admins.length === 0) return; // no hay ningún admin creado todavía, nada que reparar
  if (admins.some(u => u.activo)) return; // ya hay al menos uno activo, todo bien

  admins[0].activo = true;
  guardarUsuarios(usuarios);
}

// Igual que registrar(), pero sí permite crear el admin (solo para la semilla inicial).
async function registrarComoSemilla(nombre: string, correo: string, clave: string, rol: Rol, especialidad?: string): Promise<void> {
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = aHex(saltBytes.buffer);
  const hash = await derivarHash(clave, salt);
  const usuarios = leerUsuarios();
  usuarios.push({ id: idAleatorio(), nombre, correo: normalizarCorreo(correo), rol, hash, salt, activo: true, especialidad });
  guardarUsuarios(usuarios);
}

// Devuelve la lista de usuarios registrados, SIN el hash ni el salt
// (esos datos sensibles nunca deben llegar a la pantalla).
export function listarUsuarios(filtroRol?: Rol): Array<{ nombre: string; correo: string; rol: Rol; activo: boolean; especialidad?: string }> {
  return leerUsuarios()
    .filter(u => !filtroRol || u.rol === filtroRol)
    .map(u => ({ nombre: u.nombre, correo: u.correo, rol: u.rol, activo: u.activo, especialidad: u.especialidad }));
}

// Cuenta cuántos administradores activos quedan (para no dejar el
// sistema sin nadie que pueda volver a entrar al panel de admin).
function contarAdminsActivos(usuarios: Usuario[], excluirCorreo?: string): number {
  return usuarios.filter(u => u.rol === 'administrador' && u.activo && u.correo !== excluirCorreo).length;
}

// Cambia el rol de un usuario (ej: de paciente a doctor). Solo lo usa el admin.
// No permite que el último administrador activo se quite el rol a sí mismo
// (dejaría el sistema sin nadie que pueda administrar cuentas).
export function cambiarRolUsuario(correo: string, nuevoRol: Rol): { ok: boolean; error?: string } {
  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);
  if (!usuario) return { ok: false, error: 'La cuenta ya no existe.' };
  if (usuario.rol === 'administrador' && nuevoRol !== 'administrador' && contarAdminsActivos(usuarios, correo) === 0) {
    return { ok: false, error: 'No puedes quitarle el rol de administrador a la última cuenta admin activa.' };
  }
  usuario.rol = nuevoRol;
  if (nuevoRol !== 'doctor') usuario.especialidad = undefined; // ya no aplica si deja de ser doctor
  guardarUsuarios(usuarios);
  return { ok: true };
}

// El admin asigna o cambia la especialidad de una cuenta de doctor.
export function actualizarEspecialidad(correo: string, especialidad: string): void {
  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);
  if (usuario) { usuario.especialidad = especialidad; guardarUsuarios(usuarios); }
}

// El admin crea una cuenta directamente (ej: un doctor especialista nuevo)
// sin pasar por el formulario público de registro. Genera una contraseña
// temporal (igual que resetearClave) y la devuelve UNA sola vez para que
// el admin se la comparta a la persona.
export async function crearCuentaComoAdmin(
  nombre: string, correo: string, rol: Rol, especialidad?: string,
): Promise<{ ok: boolean; error?: string; claveTemporal?: string }> {
  const correoNorm = normalizarCorreo(correo);
  if (!nombre.trim()) return { ok: false, error: 'Ingresa el nombre completo.' };
  if (!correoValido(correoNorm)) return { ok: false, error: 'Correo inválido.' };
  if (rol === 'doctor' && !especialidad) return { ok: false, error: 'Selecciona la especialidad del doctor.' };
  const usuarios = leerUsuarios();
  if (usuarios.some(u => u.correo === correoNorm)) return { ok: false, error: 'Ese correo ya está registrado.' };

  const claveTemporal = Math.random().toString(36).slice(2, 8) + 'A1!';
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = aHex(saltBytes.buffer);
  const hash = await derivarHash(claveTemporal, salt);

  usuarios.push({
    id: idAleatorio(), nombre: nombre.trim(), correo: correoNorm, rol, hash, salt, activo: true,
    especialidad: rol === 'doctor' ? especialidad : undefined,
  });
  guardarUsuarios(usuarios);
  return { ok: true, claveTemporal };
}

// Activa o desactiva una cuenta (una cuenta desactivada no puede iniciar sesión).
// No te deja desactivar tu propia cuenta (evita quedar afuera del sistema
// vos mismo/a), ni desactivar al último administrador activo que queda.
export function alternarActivoUsuario(correo: string): { ok: boolean; error?: string } {
  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);
  if (!usuario) return { ok: false, error: 'La cuenta ya no existe.' };

  const vaADesactivarse = usuario.activo; // si está activo, esta acción lo va a desactivar
  const sesion = obtenerSesion();
  if (vaADesactivarse && sesion?.correo === correo) {
    return { ok: false, error: 'No puedes desactivar tu propia cuenta mientras tenés la sesión abierta.' };
  }
  if (vaADesactivarse && usuario.rol === 'administrador' && contarAdminsActivos(usuarios, correo) === 0) {
    return { ok: false, error: 'No puedes desactivar al último administrador activo del sistema.' };
  }

  usuario.activo = !usuario.activo;
  guardarUsuarios(usuarios);
  return { ok: true };
}

// El admin genera una contraseña temporal nueva para un usuario (ej: si
// la olvidó y no puede usar la recuperación por correo). Devuelve la
// contraseña en texto plano UNA sola vez, para que el admin se la pase
// a la persona — nunca vuelve a mostrarse ni a guardarse así.
export async function resetearClave(correo: string): Promise<string> {
  const claveTemporal = Math.random().toString(36).slice(2, 8) + 'A1!';
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = aHex(saltBytes.buffer);
  const hash = await derivarHash(claveTemporal, salt);

  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);
  if (usuario) { usuario.salt = salt; usuario.hash = hash; guardarUsuarios(usuarios); }
  return claveTemporal;
}

// Borra una cuenta PARA SIEMPRE (a diferencia de desactivar, esto no se
// puede deshacer). Quien llama a esto debe confirmar con la persona antes.
// Mismos candados que alternarActivoUsuario: ni tu propia cuenta, ni el
// último administrador activo.
export function eliminarUsuarioPermanente(correo: string): { ok: boolean; error?: string } {
  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);
  if (!usuario) return { ok: false, error: 'La cuenta ya no existe.' };

  const sesion = obtenerSesion();
  if (sesion?.correo === correo) {
    return { ok: false, error: 'No puedes eliminar tu propia cuenta mientras tenés la sesión abierta.' };
  }
  if (usuario.rol === 'administrador' && usuario.activo && contarAdminsActivos(usuarios, correo) === 0) {
    return { ok: false, error: 'No puedes eliminar al último administrador activo del sistema.' };
  }

  guardarUsuarios(usuarios.filter(u => u.correo !== correo));
  return { ok: true };
}

// Borra TODO lo guardado por la app en este dispositivo (usuarios, sesión,
// historial, tema). Es irreversible, por eso quien llama a esto debe
// confirmar con la persona antes.
export function borrarTodosLosDatos(): void {
  localStorage.clear();
  sessionStorage.clear();
}

// ── Recuperación de contraseña (código de 6 dígitos, como un OTP) ──
// Como no hay servidor de correo real, el código se "muestra" en la
// pantalla (simulando el correo). Expira en 15 minutos y solo sirve una vez.

const CLAVE_RESET = 'saludasist-reset-tokens';
const DURACION_TOKEN_MS = 15 * 60_000;

interface TokenReset { hash: string; salt: string; expiraEn: number }

function leerTokens(): Record<string, TokenReset> {
  try { return JSON.parse(localStorage.getItem(CLAVE_RESET) ?? '{}'); } catch { return {}; }
}
function guardarTokens(tokens: Record<string, TokenReset>): void {
  localStorage.setItem(CLAVE_RESET, JSON.stringify(tokens));
}

// Genera un código de 6 dígitos para el correo dado. Si el correo no existe,
// igual devuelve null sin avisar (para no revelar qué correos están registrados).
export async function solicitarRecuperacion(correo: string): Promise<string | null> {
  const correoNorm = normalizarCorreo(correo);
  if (!leerUsuarios().some(u => u.correo === correoNorm)) return null;

  const codigo = String(Math.floor(100000 + Math.random() * 900000));
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const salt = aHex(saltBytes.buffer);
  const hash = await derivarHash(codigo, salt);

  const tokens = leerTokens();
  tokens[correoNorm] = { hash, salt, expiraEn: Date.now() + DURACION_TOKEN_MS };
  guardarTokens(tokens);
  return codigo;
}

// Verifica el código ingresado y, si es correcto, cambia la contraseña.
export async function confirmarRecuperacion(correo: string, codigo: string, nuevaClave: string): Promise<{ ok: boolean; error?: string }> {
  const correoNorm = normalizarCorreo(correo);
  const token = leerTokens()[correoNorm];
  if (!token || Date.now() >= token.expiraEn) return { ok: false, error: 'El código expiró o no es válido. Solicita uno nuevo.' };

  const hashIngresado = await derivarHash(codigo.trim(), token.salt);
  if (hashIngresado !== token.hash) return { ok: false, error: 'El código ingresado es incorrecto.' };
  if (!evaluarFortaleza(nuevaClave).valida) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };

  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.correo === correoNorm);
  if (!usuario) return { ok: false, error: 'La cuenta ya no existe.' };

  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  usuario.salt = aHex(saltBytes.buffer);
  usuario.hash = await derivarHash(nuevaClave, usuario.salt);
  guardarUsuarios(usuarios);

  const tokens = leerTokens();
  delete tokens[correoNorm];
  guardarTokens(tokens);
  return { ok: true };
}
