<!-- ContenidoUsuarios.vue — lista de cuentas registradas, con buscador y
     controles para que el admin cambie el rol, active/desactive,
     resetee la contraseña o elimine una cuenta permanentemente.
     También permite crear directamente una cuenta de doctor especialista
     nueva (con su especialidad), sin pasar por el registro público. -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  listarUsuarios, cambiarRolUsuario, alternarActivoUsuario, resetearClave, eliminarUsuarioPermanente,
  crearCuentaComoAdmin, actualizarEspecialidad, ESPECIALIDADES, type Rol,
} from '../almacenamiento/cuentas-usuarios';
import { limpiarAsignacionesDe } from '../logica/asignaciones';
import { notificar } from '../logica/usar-notificaciones';
import { usarConfirmacion } from '../logica/usar-confirmacion';

const props = defineProps<{ filtroRol?: Rol; soloLectura?: boolean }>();
const { pedirConfirmacion } = usarConfirmacion();

// Lista reactiva: se vuelve a cargar cada vez que se cambia algo, para
// que los botones reflejen el estado real al instante.
const usuarios = ref(listarUsuarios(props.filtroRol));
function recargar(): void { usuarios.value = listarUsuarios(props.filtroRol); }

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
  recargar();
  notificar(`Doctor creado. Contraseña temporal para ${normalizarMostrar(nuevoCorreo.value)}: ${res.claveTemporal} (avísale, no se vuelve a mostrar)`, 'exito');
}

function normalizarMostrar(correo: string): string { return correo.trim().toLowerCase(); }

// El admin cambia la especialidad de un doctor ya existente.
function alCambiarEspecialidad(correo: string, evento: Event): void {
  actualizarEspecialidad(correo, (evento.target as HTMLSelectElement).value);
  recargar();
  notificar('Especialidad actualizada.', 'exito');
}

function alCambiarRol(correo: string, evento: Event): void {
  const nuevoRol = (evento.target as HTMLSelectElement).value as Rol;
  const res = cambiarRolUsuario(correo, nuevoRol);
  if (!res.ok) { notificar(res.error!, 'error'); recargar(); return; } // recargar revierte el <select> a su valor real
  // Si deja de ser doctor o paciente, cualquier asignación relacionada
  // a su correo anterior ya no tiene sentido (evita datos huérfanos).
  limpiarAsignacionesDe(correo);
  recargar();
  notificar('Rol actualizado.', 'exito');
}

function alAlternarActivo(correo: string): void {
  const res = alternarActivoUsuario(correo);
  if (!res.ok) { notificar(res.error!, 'error'); return; }
  recargar();
}

// Genera una contraseña temporal y se la muestra al admin para que se
// la pase a la persona (es la única vez que se ve en texto plano).
async function alResetearClave(correo: string): Promise<void> {
  const confirma = await pedirConfirmacion(`¿Generar una contraseña temporal nueva para ${correo}?`);
  if (!confirma) return;
  const claveTemporal = await resetearClave(correo);
  notificar(`Nueva contraseña para ${correo}: ${claveTemporal} (avísale, no se vuelve a mostrar)`, 'info');
}

// Borra la cuenta para siempre (distinto de "desactivar", que se puede revertir).
async function alEliminarUsuario(correo: string): Promise<void> {
  const confirma = await pedirConfirmacion(`¿Eliminar la cuenta de ${correo} para siempre? Esta acción no se puede deshacer.`);
  if (!confirma) return;
  const res = eliminarUsuarioPermanente(correo);
  if (!res.ok) { notificar(res.error!, 'error'); return; }
  limpiarAsignacionesDe(correo); // evita que quede una asignación apuntando a una cuenta que ya no existe
  recargar();
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
      <button type="button" class="btn btn-secondary btn-sm" @click="alResetearClave(u.correo)">
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
