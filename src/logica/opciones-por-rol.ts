// opciones-por-rol.ts — qué ve cada tipo de cuenta al iniciar sesión
import type { Rol } from '../almacenamiento/cuentas-usuarios';

export interface ConfigRol {
  etiqueta: string;
  descripcion: string;
  opciones: string[];
}

export const OPCIONES_POR_ROL: Record<Rol, ConfigRol> = {
  administrador: {
    etiqueta: 'Panel de administrador',
    descripcion: 'Acceso completo a la gestión del sistema.',
    opciones: ['👥 Gestionar usuarios', '📊 Ver reportes', '🩺 Supervisar doctores', '⚙️ Configuración'],
  },
  doctor: {
    etiqueta: 'Panel de doctor especialista',
    descripcion: 'Revisa pacientes y pre-diagnósticos.',
    opciones: ['🧑‍⚕️ Pacientes asignados', '📋 Pre-diagnósticos', '🗓️ Disponibilidad', '👤 Mi perfil'],
  },
  usuario: {
    etiqueta: 'Panel de paciente',
    descripcion: 'Consulta tu historial y evalúa tus síntomas.',
    opciones: ['🩹 Nueva evaluación', '📖 Mi historial', '👤 Mi perfil', '📞 Soporte'],
  },
};
