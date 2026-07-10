<!-- ContenidoUsuarios.vue — lista de cuentas registradas, con buscador y
     controles para que el admin cambie el rol, active/desactive,
     resetee la contraseña o elimine una cuenta permanentemente.
     También permite crear directamente una cuenta de doctor especialista
     nueva (con su especialidad), sin pasar por el registro público. -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  listarUsuarios, cambiarRolUsuario, alternarActivoUsuario, eliminarUsuarioPermanente,
  crearCuentaComoAdmin, actualizarEspecialidad, ESPECIALIDADES, type Rol,
} from '../almacenamiento/cuentas-usuarios';
import { limpiarAsignacionesDe } from '../logica/asignaciones';
import { notificar } from '../logica/usar-notificaciones';
import { usarConfirmacion } from '../logica/usar-confirmacion';

const props = defineProps<{ filtroRol?: Rol; soloLectura?: boolean }>();
const { pedirConfirmacion } = usarConfirmacion();

// Lista reactiva: se vuelve a cargar cada vez que se cambia algo, para
// que los botones reflejen el estado real al instante.
const usuarios = ref<Awaited<ReturnType<typeof listarUsuarios>>>([]);
async function recargar(): Promise<void> { usuarios.value = await listarUsuarios(props.filtroRol); }
onMounted(recargar);

// Buscador: filtra por nombre o correo, en vivo.
const busqueda = ref('');
const usuariosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  if (!texto) return usuarios.value;
  return usuarios.value.filter(u => u.nombre.toLowerCase().includes(texto) || u.correo.toLowerCase().includes(texto));
});

function nombreRol(rol: Rol): string {
  const mapa: Record<Rol, string> = { administrador: 'Administrador', doctor: 'Doctor', usuario: 'Paciente' };
  return mapa[rol];
}

// ── Alta directa de un doctor especialista (nueva) ──────────────────
const mostrarFormularioDoctor = ref(false);
const nuevoNombre = ref('');
const nuevoCorreo = ref('');
const nuevaEspecialidad = ref('');
const creandoDoctor = ref(false);

function abrirFormularioDoctor(): void {
  nuevoNombre.value = '';
  nuevoCorreo.value = '';
  nuevaEspecialidad.value = '';
  mostrarFormularioDoctor.value = true;
}

async function alCrearDoctor(): Promise<void> {
  creandoDoctor.value = true;
  const res = await crearCuentaComoAdmin(nuevoNombre.value, nuevoCorreo.value, 'doctor', nuevaEspecialidad.value);
  creandoDoctor.value = false;
  if (!res.ok) { notificar(res.error!, 'error'); return; }
  mostrarFormularioDoctor.value = false;
  await recargar();
  notificar(`Doctor creado. Contraseña temporal para ${normalizarMostrar(nuevoCorreo.value)}: ${res.claveTemporal} (avísale, no se vuelve a mostrar)`, 'exito');
}

function normalizarMostrar(correo: string): string { return correo.trim().toLowerCase(); }

// El admin cambia la especialidad de un doctor ya existente.
async function alCambiarEspecialidad(correo: string, evento: Event): Promise<void> {
  await actualizarEspecialidad(correo, (evento.target as HTMLSelectElement).value);
  await recargar();
  notificar('Especialidad actualizada.', 'exito');
}

async function alCambiarRol(correo: string, evento: Event): Promise<void> {
  const nuevoRol = (evento.target as HTMLSelectElement).value as Rol;
  const res = await cambiarRolUsuario(correo, nuevoRol);
  if (!res.ok) { notificar(res.error!, 'error'); await recargar(); return; } // recargar revierte el <select> a su valor real
  // Si deja de ser doctor o paciente, cualquier asignación relacionada
  // a su correo anterior ya no tiene sentido (evita datos huérfanos).
  await limpiarAsignacionesDe(correo);
  await recargar();
  notificar('Rol actualizado.', 'exito');
}

async function alAlternarActivo(correo: string): Promise<void> {
  const res = await alternarActivoUsuario(correo);
  if (!res.ok) { notificar(res.error!, 'error'); return; }
  await recargar();
}

// Resetear contraseña de OTRA cuenta requiere la API de administración de
// Supabase (service_role key), que a propósito no se expone en el cliente.
// Simplificación aceptada para este demo: no disponible desde el panel.
function alResetearClave(): void {
  notificar('Resetear la contraseña de otra cuenta requiere una función de servidor con permisos de administrador (no disponible en este demo).', 'info');
}

// Borra el PERFIL para siempre (distinto de "desactivar", que se puede revertir).
async function alEliminarUsuario(correo: string): Promise<void> {
  const confirma = await pedirConfirmacion(`¿Eliminar la cuenta de ${correo} para siempre? Esta acción no se puede deshacer.`);
  if (!confirma) return;
  const res = await eliminarUsuarioPermanente(correo);
  if (!res.ok) { notificar(res.error!, 'error'); return; }
  await limpiarAsignacionesDe(correo); // evita que quede una asignación apuntando a una cuenta que ya no existe
  await recargar();
  notificar('Cuenta eliminada.', 'info');
}
</script>

<template>
  <div v-if="!soloLectura" class="admin-doctor-toolbar">
    <button type="button" class="btn btn-primary btn-sm" @click="abrirFormularioDoctor">➕ Agregar doctor especialista</button>
  </div>

  <div v-if="mostrarFormularioDoctor" class="admin-doctor-form">
    <h3 style="margin-bottom:12px;">➕ Nuevo doctor especialista</h3>
    <form class="auth-form" @submit.prevent="alCrearDoctor">
      <div class="form-group">
        <label>Nombre completo</label>
        <input v-model="nuevoNombre" type="text" required placeholder="Ej: Dra. María Pérez">
      </div>
      <div class="form-group">
        <label>Correo</label>
        <input v-model="nuevoCorreo" type="email" required placeholder="doctor@ejemplo.com">
      </div>
      <div class="form-group">
        <label>Especialidad</label>
        <select v-model="nuevaEspecialidad" class="form-select" required>
          <option value="" disabled>Selecciona la especialidad</option>
          <option v-for="e in ESPECIALIDADES" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>
      <p class="form-hint">Se genera una contraseña temporal automáticamente; se muestra una sola vez para que se la compartas al doctor.</p>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="mostrarFormularioDoctor = false">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="creandoDoctor">{{ creandoDoctor ? 'Creando...' : 'Crear cuenta de doctor' }}</button>
      </div>
    </form>
  </div>

  <input v-model="busqueda" type="text" placeholder="🔍 Buscar por nombre o correo..." class="buscador-input">

  <p v-if="usuarios.length === 0" class="empty-history">No hay cuentas registradas todavía.</p>
  <p v-else-if="usuariosFiltrados.length === 0" class="empty-history">No hay cuentas que coincidan con "{{ busqueda }}".</p>

  <div v-for="u in usuariosFiltrados" :key="u.correo" class="history-item">
    <div class="history-item-header">
      <strong>{{ u.nombre }}</strong>
      <span class="badge" :style="{ background: u.activo ? 'var(--primary)' : '#9ca3af' }">
        {{ u.activo ? 'Activa' : 'Desactivada' }}
      </span>
    </div>
    <p class="history-symptoms">{{ u.correo }}</p>
    <p v-if="u.rol === 'doctor'" class="history-symptoms">🩺 {{ u.especialidad || 'Sin especialidad asignada' }}</p>

    <div v-if="!soloLectura" style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
      <select :value="u.rol" @change="alCambiarRol(u.correo, $event)" class="form-select" style="width:auto;">
        <option value="usuario">Paciente</option>
        <option value="doctor">Doctor</option>
        <option value="administrador">Administrador</option>
      </select>
      <select v-if="u.rol === 'doctor'" :value="u.especialidad || ''" @change="alCambiarEspecialidad(u.correo, $event)" class="form-select" style="width:auto;">
        <option value="" disabled>Especialidad</option>
        <option v-for="e in ESPECIALIDADES" :key="e" :value="e">{{ e }}</option>
      </select>
      <button type="button" class="btn btn-secondary btn-sm" @click="alAlternarActivo(u.correo)">
        {{ u.activo ? '🚫 Desactivar' : '✅ Activar' }}
      </button>
      <button type="button" class="btn btn-secondary btn-sm" @click="alResetearClave()">
        🔑 Resetear contraseña
      </button>
      <button type="button" class="btn btn-danger btn-sm" @click="alEliminarUsuario(u.correo)">
        🗑️ Eliminar cuenta
      </button>
    </div>
    <span v-else class="badge" style="background:var(--primary)">{{ nombreRol(u.rol) }}</span>
  </div>
</template>

<style scoped>
.admin-doctor-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}
.admin-doctor-form {
  background: rgba(var(--primary-rgb), 0.06);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 20px;
}
</style>
