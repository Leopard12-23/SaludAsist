<!-- ToastContenedor.vue — pinta los avisos flotantes (éxito/error/info).
     Se monta UNA sola vez en App.vue; cualquier componente puede disparar
     un aviso llamando a notificar() desde usar-notificaciones.ts. -->
<script setup lang="ts">
import { usarNotificaciones } from '../logica/usar-notificaciones';
const { toasts } = usarNotificaciones();
</script>

<template>
  <div class="toast-contenedor" aria-live="polite">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast--${t.tipo}`">
      {{ t.mensaje }}
    </div>
  </div>
</template>

<style scoped>
.toast-contenedor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000;
  max-width: 320px;
}
.toast {
  padding: 14px 18px;
  border-radius: var(--radius);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: var(--shadow-lg);
  animation: entrarToast 0.25s ease;
}
.toast--exito { background: #16a34a; }
.toast--error { background: #dc2626; }
.toast--info  { background: var(--primary); }

@keyframes entrarToast {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
