<!-- ModalInfo.vue — modal genérico reutilizable (título + contenido libre).
     Los paneles de Perfil, Usuarios, Reportes, etc. lo usan como "marco". -->
<script setup lang="ts">
defineProps<{ abierto: boolean; titulo: string }>();
defineEmits<{ cerrar: [] }>();
</script>

<template>
  <div v-if="abierto" class="modal-overlay" @click.self="$emit('cerrar')">
    <div class="modal-content">
      <button type="button" class="btn-close" aria-label="Cerrar" @click="$emit('cerrar')">&times;</button>
      <h2>{{ titulo }}</h2>
      <slot />
    </div>
  </div>
</template>
