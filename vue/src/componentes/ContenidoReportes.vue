<!-- ContenidoReportes.vue — estadísticas generales del sistema (solo admin) -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { listarUsuarios } from '../almacenamiento/cuentas-usuarios';
import { calcularEstadisticasGlobales } from '../logica/historial-evaluaciones';

const totalPacientes = ref(0);
const totalDoctores = ref(0);
const stats = ref({ total: 0, ultimaFecha: '—', sintomaFrecuente: '—' });

onMounted(async () => {
  const usuarios = await listarUsuarios();
  totalPacientes.value = usuarios.filter(u => u.rol === 'usuario').length;
  totalDoctores.value = usuarios.filter(u => u.rol === 'doctor').length;
  stats.value = await calcularEstadisticasGlobales();
});
</script>

<template>
  <div class="stats-grid">
    <div class="stat-item">
      <span class="stat-number">{{ totalPacientes }}</span>
      <span class="stat-label">Pacientes</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">{{ totalDoctores }}</span>
      <span class="stat-label">Doctores</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">{{ stats.total }}</span>
      <span class="stat-label">Evaluaciones</span>
    </div>
  </div>
  <p><strong>Síntoma más reportado:</strong> {{ stats.sintomaFrecuente.replace(/-/g, ' ') }}</p>
  <p><strong>Última evaluación:</strong> {{ stats.ultimaFecha }}</p>
</template>
