<!-- ContenidoConfiguracion.vue — ajustes del sistema (solo admin):
     respaldo de datos y borrado total. Usa modal/toast propios, no
     confirm()/alert() del navegador. -->
<script setup lang="ts">
import { borrarTodosLosDatos } from '../almacenamiento/cuentas-usuarios';
import { exportarRespaldo, importarRespaldo } from '../logica/respaldo';
import { usarConfirmacion } from '../logica/usar-confirmacion';
import { usarNotificaciones } from '../logica/usar-notificaciones';

const emit = defineEmits<{ datosBorrados: [] }>();
const { pedirConfirmacion } = usarConfirmacion();
const { notificar } = usarNotificaciones();

// Pide confirmación (es irreversible) antes de borrar todo lo guardado en este dispositivo.
async function confirmarBorrado(): Promise<void> {
  const confirma = await pedirConfirmacion(
    '¿Seguro que quieres borrar TODOS los datos (usuarios, historial, sesión)? Esta acción no se puede deshacer.'
  );
  if (!confirma) return;
  borrarTodosLosDatos();
  emit('datosBorrados');
}

// Lee el archivo de respaldo elegido y recarga la app con esos datos restaurados.
async function alImportar(evento: Event): Promise<void> {
  const archivo = (evento.target as HTMLInputElement).files?.[0];
  if (!archivo) return;
  try {
    await importarRespaldo(archivo);
    notificar('Respaldo restaurado correctamente.', 'exito');
    setTimeout(() => window.location.reload(), 1200); // da tiempo a ver el aviso antes de recargar
  } catch (error) {
    notificar((error as Error).message, 'error');
  }
}
</script>

<template>
  <p>SaludAsist guarda toda la información únicamente en este dispositivo (no hay servidor).</p>

  <h3 style="margin-top:20px;">📦 Respaldo</h3>
  <p class="section-lead">Si se borra el navegador, se pierde todo. Descarga una copia por seguridad.</p>
  <button type="button" class="btn btn-secondary" style="width:100%; margin-bottom:8px;" @click="exportarRespaldo">
    ⬇️ Descargar respaldo (.json)
  </button>
  <label class="btn btn-secondary" style="width:100%; display:block; text-align:center; cursor:pointer;">
    ⬆️ Restaurar desde un respaldo
    <input type="file" accept=".json" style="display:none" @change="alImportar">
  </label>

  <h3 style="margin-top:24px; color:#dc2626;">⚠️ Zona de riesgo</h3>
  <button type="button" class="btn btn-danger" style="width:100%" @click="confirmarBorrado">
    🗑️ Borrar todos los datos de este dispositivo
  </button>
</template>
