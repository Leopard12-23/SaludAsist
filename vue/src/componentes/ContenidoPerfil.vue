<!-- ContenidoPerfil.vue — datos de la cuenta que inició sesión -->
<script setup lang="ts">
import type { Sesion } from '../almacenamiento/cuentas-usuarios';
import { OPCIONES_POR_ROL } from '../logica/opciones-por-rol';

const props = defineProps<{ sesion: Sesion }>();
const etiquetaRol = OPCIONES_POR_ROL[props.sesion.rol].etiqueta;
</script>

<template>
  <div class="perfil-datos">
    <p><strong>Nombre:</strong> {{ sesion.nombre }}</p>
    <p><strong>Correo:</strong> {{ sesion.correo }}</p>
    <p><strong>Tipo de cuenta:</strong> {{ etiquetaRol }}</p>
    <p v-if="sesion.rol === 'doctor'"><strong>Especialidad:</strong> {{ sesion.especialidad || 'Sin especialidad asignada (pídele al administrador que te la asigne)' }}</p>
  </div>
</template>

<style scoped>
.perfil-datos p {
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
</style>
