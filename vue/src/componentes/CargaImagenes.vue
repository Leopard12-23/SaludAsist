<!-- CargaImagenes.vue — permite adjuntar fotos de síntomas visibles (opcional) -->
<script setup lang="ts">
import { ref } from 'vue';
import { usarNotificaciones } from '../logica/usar-notificaciones';

const { notificar } = usarNotificaciones();

// Guarda las URLs de vista previa de cada imagen ya cargada.
const vistasPrevias = ref<string[]>([]);

// Lee los archivos elegidos, valida cantidad/tamaño y genera su vista previa.
function alSeleccionarArchivos(evento: Event): void {
  const input = evento.target as HTMLInputElement;
  const archivos = Array.from(input.files ?? []);
  vistasPrevias.value = [];

  if (archivos.length > 5) {
    notificar('Máximo 5 imágenes permitidas.', 'error');
    input.value = '';
    return;
  }

  archivos.forEach(archivo => {
    if (archivo.size > 5 * 1024 * 1024) {
      notificar(`"${archivo.name}" supera los 5 MB.`, 'error');
      return;
    }
    // Convierte el archivo a una URL que se puede mostrar en un <img>.
    const lector = new FileReader();
    lector.onload = (e) => vistasPrevias.value.push(e.target?.result as string);
    lector.readAsDataURL(archivo);
  });
}
</script>

<template>
  <div class="image-upload-section">
    <div class="image-upload-box">
      <div class="upload-icon">🖼️</div>
      <h3>Adjunta Imágenes (Opcional)</h3>
      <p>Si tienes fotos de erupciones, lesiones u otros síntomas visibles, puedes cargarlas aquí.</p>

      <label class="upload-label">
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple class="upload-input" @change="alSeleccionarArchivos">
        <span class="upload-text">Selecciona imágenes (JPG, PNG)</span>
      </label>

      <div class="image-preview">
        <img v-for="(url, i) in vistasPrevias" :key="i" :src="url" class="preview-img" alt="Vista previa de imagen cargada">
      </div>
      <p class="upload-hint">Máximo 5 imágenes de 5MB cada una. Solo se procesan localmente en tu dispositivo.</p>
    </div>
  </div>
</template>
