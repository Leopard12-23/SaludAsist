<!-- ResultadoDiagnostico.vue — tarjeta de resultado, con color según gravedad
     (verde=leve, naranja=moderado, rojo=grave). Reutiliza las clases de
     color que ya existían en el diseño original (diagnosis-card, severity-*). -->
<script setup lang="ts">
import type { ResultadoDiagnostico } from '../tipos/tipos';

const props = defineProps<{
  resultado: ResultadoDiagnostico;
  sintomas: string[];
  edad: number | null;
}>();

// El tipo usa "grave" pero las clases CSS existentes usan "severo": se traduce aquí.
function claseGravedad(): string {
  const mapa: Record<string, string> = { leve: 'leve', moderado: 'moderado', grave: 'severo' };
  return mapa[props.resultado.gravedad] ?? 'leve';
}

// Ícono según qué tan grave es el resultado (🚨 grave, ⚠️ moderado, ✅ leve).
function iconoGravedad(): string {
  if (props.resultado.gravedad === 'grave') return '🚨';
  if (props.resultado.gravedad === 'moderado') return '⚠️';
  return '✅';
}

// Convierte "dolor-cabeza" en "dolor cabeza" para mostrarlo más natural.
function textoLegible(sintoma: string): string {
  return sintoma.replace(/-/g, ' ');
}
</script>

<template>
  <div class="diagnosis-card" :class="`diagnosis-${claseGravedad()}`" id="tarjeta-resultado">
    <div class="diagnosis-header">
      <h3 class="diagnosis-title">📋 {{ resultado.enfermedad }}</h3>
      <span v-if="edad !== null" class="diagnosis-meta">Paciente: {{ edad }} años</span>
    </div>

    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px;">
      <span class="diagnosis-badge" :class="`severity-${claseGravedad()}`">
        {{ iconoGravedad() }} {{ resultado.gravedad.toUpperCase() }}
      </span>
      <span class="diagnosis-badge" style="background:rgba(var(--primary-rgb), 0.12); color: var(--primary-dark);">
        {{ resultado.probabilidad }}% coincidencia
      </span>
    </div>

    <p class="diagnosis-description">{{ resultado.descripcion }}</p>

    <div class="diagnosis-probability">
      <p class="probability-label">Probabilidad estimada: <strong>{{ resultado.probabilidad }}%</strong></p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: resultado.probabilidad + '%', background: 'var(--primary)' }"></div>
      </div>
    </div>

    <!-- Síntomas que la persona marcó, como "chips" -->
    <div style="margin-bottom:16px;">
      <strong style="font-size:0.88rem; color:var(--primary-dark);">Síntomas seleccionados:</strong>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
        <span v-for="s in sintomas" :key="s" class="sintoma-chip">{{ textoLegible(s) }}</span>
      </div>
    </div>

    <div class="derivacion-box">
      📍 Te recomendamos acudir a: <strong>{{ resultado.derivacion }}</strong>
    </div>

    <div>
      <strong style="font-size:0.9rem; color:var(--primary-dark);">💡 Recomendaciones:</strong>
      <ul class="recommendations-list" style="margin-top:10px;">
        <li v-for="(r, i) in resultado.recomendaciones" :key="i">{{ r }}</li>
      </ul>
    </div>

    <div class="disclaimer-resultado">
      ⚠️ Este resultado es <strong>orientativo</strong> y no reemplaza una consulta médica profesional.
      En emergencia llama al <strong>911</strong>.
    </div>
  </div>
</template>

<style scoped>
.sintoma-chip {
  background: rgba(var(--primary-rgb), 0.12);
  color: var(--primary-dark);
  border: 1px solid rgba(var(--primary-rgb), 0.25);
  border-radius: 16px;
  padding: 3px 12px;
  font-size: 0.82rem;
}
.derivacion-box {
  background: rgba(var(--primary-rgb), 0.08);
  padding: 16px;
  border-radius: 10px;
  border: 1px dashed rgba(var(--primary-rgb), 0.4);
  margin-bottom: 16px;
  color: var(--primary-dark);
}
.disclaimer-resultado {
  margin-top: 18px;
  padding: 10px 14px;
  background: #fef3c7;
  border-radius: 8px;
  font-size: 0.82rem;
  color: #92400e;
}
</style>
