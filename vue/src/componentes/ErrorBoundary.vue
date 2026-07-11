<!-- ErrorBoundary.vue — envuelve el <router-view>. Si cualquier pantalla
     hija falla de forma inesperada, en vez de romperse en blanco, muestra
     una pantalla amigable con la opción de recargar. -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const huboError = ref(false);
const mensajeError = ref('');

// onErrorCaptured atrapa errores de renderizado, watchers o métodos de
// CUALQUIER componente hijo (sin importar cuán anidado esté).
onErrorCaptured((error) => {
  huboError.value = true;
  mensajeError.value = error instanceof Error ? error.message : 'Error desconocido';
  console.error('Error atrapado por ErrorBoundary:', error);
  return false; // evita que el error siga subiendo y rompa el resto de la app
});

function reintentar(): void {
  window.location.reload();
}
</script>

<template>
  <div v-if="huboError" class="container" style="padding:60px 20px; text-align:center; max-width:500px; margin:0 auto;">
    <span style="font-size:3rem;">😕</span>
    <h2>Algo salió mal</h2>
    <p class="section-lead">Ocurrió un error inesperado. Podés intentar recargar la página; tus datos guardados no se pierden.</p>
    <p style="color:var(--text-light); font-size:0.8rem; word-break:break-word;">{{ mensajeError }}</p>
    <button type="button" class="btn btn-primary" style="margin-top:16px" @click="reintentar">🔄 Recargar</button>
  </div>
  <slot v-else />
</template>
