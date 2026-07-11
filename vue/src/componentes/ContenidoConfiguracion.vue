<!-- ContenidoConfiguracion.vue — ajustes del sistema (solo admin).
     Ya no hay "respaldo" ni "borrar todos los datos": los datos viven en
     Supabase, compartidos por todo el equipo, no en este dispositivo. Lo
     único local es la sesión de este navegador. -->
<script setup lang="ts">
import { cerrarSesion } from '../almacenamiento/cuentas-usuarios';
import { usarConfirmacion } from '../logica/usar-confirmacion';

const emit = defineEmits<{ datosBorrados: [] }>();
const { pedirConfirmacion } = usarConfirmacion();

async function confirmarCierreSesion(): Promise<void> {
  const confirma = await pedirConfirmacion('¿Cerrar la sesión de este dispositivo?');
  if (!confirma) return;
  cerrarSesion();
  emit('datosBorrados');
}
</script>

<template>
  <p>SaludAsist guarda toda la información en un backend compartido (Supabase), no en este dispositivo.</p>

  <h3 style="margin-top:24px;">🚪 Sesión</h3>
  <button type="button" class="btn btn-danger" style="width:100%" @click="confirmarCierreSesion">
    🚪 Cerrar sesión de este dispositivo
  </button>
</template>
