<!-- ContenidoAsignaciones.vue — el admin elige, para cada paciente,
     qué doctor lo atiende. Antes cualquier doctor veía a todos los
     pacientes; ahora cada uno ve solo a los suyos. -->
<script setup lang="ts">
import { ref } from 'vue';
import { listarUsuarios } from '../almacenamiento/cuentas-usuarios';
import { doctorAsignado, asignarDoctor } from '../logica/asignaciones';
import { usarNotificaciones } from '../logica/usar-notificaciones';

const { notificar } = usarNotificaciones();

const pacientes = ref(listarUsuarios('usuario'));
const doctores = listarUsuarios('doctor');

// Busca el nombre del doctor a partir de su correo, para mostrarlo bonito.
function nombreDoctor(correo: string): string {
  return doctores.find(d => d.correo === correo)?.nombre ?? correo;
}

// Guarda el cambio de doctor asignado para un paciente puntual.
function alCambiarDoctor(correoPaciente: string, evento: Event): void {
  const correoDoctor = (evento.target as HTMLSelectElement).value;
  asignarDoctor(correoPaciente, correoDoctor);
  notificar(correoDoctor ? `Paciente asignado a ${nombreDoctor(correoDoctor)}.` : 'Paciente desasignado.', 'exito');
}
</script>

<template>
  <p class="section-lead">Elige qué doctor atiende a cada paciente. Un doctor solo ve a sus propios pacientes asignados.</p>

  <p v-if="pacientes.length === 0" class="empty-history">No hay pacientes registrados todavía.</p>
  <p v-else-if="doctores.length === 0" class="empty-history">Todavía no hay doctores registrados para asignar.</p>

  <div v-for="p in pacientes" :key="p.correo" class="history-item">
    <strong>{{ p.nombre }}</strong>
    <p class="history-symptoms">{{ p.correo }}</p>
    <select :value="doctorAsignado(p.correo) ?? ''" class="form-select" style="width:auto" @change="alCambiarDoctor(p.correo, $event)">
      <option value="">Sin asignar</option>
      <option v-for="d in doctores" :key="d.correo" :value="d.correo">{{ d.nombre }}</option>
    </select>
  </div>
</template>
