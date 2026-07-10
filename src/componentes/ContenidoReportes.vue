<!-- ContenidoReportes.vue — estadísticas generales del sistema (solo admin) -->
<script setup lang="ts">
import { listarUsuarios } from '../almacenamiento/cuentas-usuarios';
import { calcularEstadisticasGlobales } from '../logica/historial-evaluaciones';

const usuarios = listarUsuarios();
const totalPacientes = usuarios.filter(u => u.rol === 'usuario').length;
const totalDoctores = usuarios.filter(u => u.rol === 'doctor').length;
const stats = calcularEstadisticasGlobales();
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
