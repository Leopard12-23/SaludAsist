<!-- ModalConfirmacion.vue — el reemplazo de confirm(). Se monta UNA vez
     en App.vue; cualquier componente lo dispara con pedirConfirmacion(). -->
<script setup lang="ts">
import { usarConfirmacion } from '../logica/usar-confirmacion';
const { visible, mensaje, responder } = usarConfirmacion();
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click.self="responder(false)">
    <div class="modal-content" style="max-width:400px; text-align:center;">
      <p style="font-size:1.05rem; margin-bottom:20px;">{{ mensaje }}</p>
      <div style="display:flex; gap:10px;">
        <button type="button" class="btn btn-secondary" style="flex:1" @click="responder(false)">Cancelar</button>
        <button type="button" class="btn btn-danger" style="flex:1" @click="responder(true)">Sí, continuar</button>
      </div>
    </div>
  </div>
</template>
