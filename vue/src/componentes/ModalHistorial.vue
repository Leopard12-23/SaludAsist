<!-- ModalHistorial.vue — ventana con el historial de evaluaciones DE UN paciente puntual -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  cargarHistorial, eliminarEvaluacion, limpiarHistorial, calcularEstadisticas,
} from '../logica/historial-evaluaciones';

const props = defineProps<{ abierto: boolean; correoUsuario: string }>();
const emit = defineEmits<{ cerrar: [] }>();

const historial = ref<Awaited<ReturnType<typeof cargarHistorial>>>([]);

// Cada vez que se abre el modal, recarga el historial por si cambió.
watch(() => props.abierto, async (abierto) => { if (abierto) historial.value = await cargarHistorial(props.correoUsuario); }, { immediate: true });

const stats = computed(() => calcularEstadisticas(historial.value));

// Borra una sola evaluación y refresca la lista en pantalla.
async function borrarUna(id: string): Promise<void> {
  await eliminarEvaluacion(id);
  historial.value = await cargarHistorial(props.correoUsuario);
}

// Borra todo el historial de esta cuenta (no el de las demás).
async function borrarTodo(): Promise<void> {
  await limpiarHistorial(props.correoUsuario);
  historial.value = [];
}

// Color de la etiqueta según qué tan grave fue el resultado guardado.
function colorGravedad(g?: string): string {
  if (g === 'grave') return '#dc2626';
  if (g === 'moderado') return '#d97706';
  return '#16a34a';
}
</script>

<template>
  <div v-if="abierto" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-content">
      <button type="button" class="btn-close" aria-label="Cerrar" @click="emit('cerrar')">&times;</button>
      <h2>📖 Historial de Evaluaciones</h2>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">{{ stats.total }}</span>
          <span class="stat-label">Evaluaciones</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ stats.ultimaFecha }}</span>
          <span class="stat-label">Última evaluación</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ stats.sintomaFrecuente }}</span>
          <span class="stat-label">Síntoma frecuente</span>
        </div>
      </div>

      <p v-if="historial.length === 0" class="empty-history">No hay evaluaciones guardadas todavía.</p>

      <div v-for="ev in historial" :key="ev.id" class="history-item">
        <div class="history-item-header">
          <span class="history-date">{{ new Date(ev.fecha).toLocaleString('es-EC') }}</span>
          <span class="badge" :style="{ background: colorGravedad(ev.resultado?.gravedad) }">
            {{ ev.resultado?.enfermedad ?? 'Sin coincidencia' }}
          </span>
        </div>
        <p class="history-symptoms"><strong>Síntomas:</strong> {{ ev.sintomas.join(', ') }}</p>
        <p v-if="ev.notaDoctor" class="history-symptoms">📝 <strong>Nota del doctor:</strong> {{ ev.notaDoctor }}</p>
        <button type="button" class="btn btn-sm btn-danger" @click="borrarUna(ev.id)">🗑️ Eliminar</button>
      </div>

      <button v-if="historial.length" type="button" class="btn btn-danger" style="margin-top:15px;width:100%" @click="borrarTodo">
        🗑️ Limpiar historial
      </button>
    </div>
  </div>
</template>
