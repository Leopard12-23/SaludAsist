<!-- GestionEnfermedades.vue — el admin puede agregar, editar o borrar
     enfermedades del catálogo de diagnóstico (antes esto solo se podía
     cambiar tocando código). Los cambios quedan guardados y el motor de
     diagnóstico los usa de inmediato. -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  obtenerCatalogo, agregarEnfermedad, editarEnfermedad, eliminarEnfermedad, restaurarCatalogoOriginal,
} from '../logica/gestion-enfermedades';
import { obtenerCategorias } from '../logica/gestion-categorias';
import { notificar } from '../logica/usar-notificaciones';
import { usarConfirmacion } from '../logica/usar-confirmacion';
import type { ReglaDiagnostico, Gravedad, Categoria } from '../tipos/tipos';

const { pedirConfirmacion } = usarConfirmacion();

// Incluye las categorías/síntomas que haya agregado el admin, no solo los originales.
const CATEGORIAS: Categoria[] = obtenerCategorias();

const catalogo = ref(obtenerCatalogo());
const busqueda = ref('');
const mostrarFormulario = ref(false);
const idEnEdicion = ref<string | null>(null);

// Campos del formulario (se resetean con limpiarFormulario()).
const nombre = ref('');
const gravedad = ref<Gravedad>('leve');
const derivacion = ref('');
const descripcion = ref('');
const probabilidadBase = ref(60);
const requeridos = ref<string[]>([]);
const opcionales = ref<string[]>([]);
const recomendacionesTexto = ref(''); // una recomendación por línea

// Filtra el catálogo por nombre de enfermedad, según lo que se escriba en el buscador.
const catalogoFiltrado = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  if (!texto) return catalogo.value;
  return catalogo.value.filter(r => r.enfermedad.toLowerCase().includes(texto));
});

function colorGravedad(g: Gravedad): string {
  if (g === 'grave') return '#dc2626';
  if (g === 'moderado') return '#d97706';
  return '#16a34a';
}

// Deja el formulario listo para cargar una enfermedad nueva desde cero.
function limpiarFormulario(): void {
  idEnEdicion.value = null;
  nombre.value = '';
  gravedad.value = 'leve';
  derivacion.value = '';
  descripcion.value = '';
  probabilidadBase.value = 60;
  requeridos.value = [];
  opcionales.value = [];
  recomendacionesTexto.value = '';
}

function abrirFormularioNuevo(): void {
  limpiarFormulario();
  mostrarFormulario.value = true;
}

// Carga los datos de una enfermedad existente en el formulario para editarla.
function abrirFormularioEditar(regla: ReglaDiagnostico): void {
  idEnEdicion.value = regla.id;
  nombre.value = regla.enfermedad;
  gravedad.value = regla.gravedad;
  derivacion.value = regla.derivacion;
  descripcion.value = regla.descripcion;
  probabilidadBase.value = regla.probabilidadBase;
  requeridos.value = [...regla.requeridos];
  opcionales.value = [...regla.opcionales];
  recomendacionesTexto.value = regla.recomendaciones.join('\n');
  mostrarFormulario.value = true;
}

// Valida y guarda (agrega o edita, según si idEnEdicion tiene valor).
function guardar(): void {
  if (!nombre.value.trim()) { notificar('Ponle un nombre a la enfermedad.', 'error'); return; }
  if (requeridos.value.length === 0) { notificar('Marca al menos un síntoma requerido.', 'error'); return; }

  const datos: Omit<ReglaDiagnostico, 'id'> = {
    enfermedad: nombre.value.trim(),
    gravedad: gravedad.value,
    derivacion: derivacion.value.trim() || 'Médico General',
    descripcion: descripcion.value.trim(),
    probabilidadBase: probabilidadBase.value,
    requeridos: requeridos.value,
    opcionales: opcionales.value,
    recomendaciones: recomendacionesTexto.value.split('\n').map(l => l.trim()).filter(Boolean),
  };

  if (idEnEdicion.value) {
    editarEnfermedad(idEnEdicion.value, datos);
    notificar('Enfermedad actualizada.', 'exito');
  } else {
    agregarEnfermedad(datos);
    notificar('Enfermedad agregada al catálogo.', 'exito');
  }

  catalogo.value = obtenerCatalogo();
  mostrarFormulario.value = false;
}

// Borra una enfermedad, pidiendo confirmación antes (es irreversible).
async function borrar(regla: ReglaDiagnostico): Promise<void> {
  const confirma = await pedirConfirmacion(`¿Borrar "${regla.enfermedad}" del catálogo?`);
  if (!confirma) return;
  eliminarEnfermedad(regla.id);
  catalogo.value = obtenerCatalogo();
  notificar('Enfermedad eliminada.', 'info');
}

// Descarta todos los cambios (agregados/editados/borrados) y vuelve a
// las 29 enfermedades originales del sistema.
async function restaurar(): Promise<void> {
  const confirma = await pedirConfirmacion('¿Descartar todos los cambios y volver al catálogo original de 29 enfermedades?');
  if (!confirma) return;
  restaurarCatalogoOriginal();
  catalogo.value = obtenerCatalogo();
  notificar('Catálogo restaurado a los valores originales.', 'info');
}
</script>

<template>
  <div v-if="!mostrarFormulario">
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
      <input v-model="busqueda" type="text" placeholder="🔍 Buscar enfermedad..." class="buscador-input" style="flex:1; min-width:200px;">
      <button type="button" class="btn btn-primary" @click="abrirFormularioNuevo">➕ Nueva enfermedad</button>
    </div>

    <p class="section-lead">{{ catalogo.length }} enfermedades en el catálogo.</p>

    <div v-for="regla in catalogoFiltrado" :key="regla.id" class="history-item">
      <div class="history-item-header">
        <strong>{{ regla.enfermedad }}</strong>
        <span class="badge" :style="{ background: colorGravedad(regla.gravedad) }">{{ regla.gravedad }}</span>
      </div>
      <p class="history-symptoms"><strong>Requiere:</strong> {{ regla.requeridos.join(', ').replace(/-/g, ' ') }}</p>
      <p class="history-symptoms"><strong>Derivación:</strong> {{ regla.derivacion }}</p>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button type="button" class="btn btn-secondary btn-sm" @click="abrirFormularioEditar(regla)">✏️ Editar</button>
        <button type="button" class="btn btn-danger btn-sm" @click="borrar(regla)">🗑️ Borrar</button>
      </div>
    </div>

    <button type="button" class="btn btn-secondary" style="margin-top:20px;" @click="restaurar">
      ↩️ Restaurar catálogo original (29 enfermedades)
    </button>
  </div>

  <!-- Formulario de alta/edición -->
  <form v-else class="auth-form" @submit.prevent="guardar">
    <h3>{{ idEnEdicion ? '✏️ Editar enfermedad' : '➕ Nueva enfermedad' }}</h3>

    <div class="form-group">
      <label>Nombre de la enfermedad</label>
      <input v-model="nombre" type="text" required placeholder="Ej: Migraña con Aura">
    </div>

    <div class="form-group">
      <label>Gravedad</label>
      <select v-model="gravedad" class="form-select">
        <option value="leve">Leve</option>
        <option value="moderado">Moderado</option>
        <option value="grave">Grave (emergencia)</option>
      </select>
    </div>

    <div class="form-group">
      <label>Derivación sugerida</label>
      <input v-model="derivacion" type="text" placeholder="Ej: 🧠 Neurólogo">
    </div>

    <div class="form-group">
      <label>Descripción</label>
      <textarea v-model="descripcion" rows="2" placeholder="Explicación breve para quien recibe el resultado"></textarea>
    </div>

    <div class="form-group">
      <label>Probabilidad base (%)</label>
      <input v-model.number="probabilidadBase" type="number" min="1" max="98">
    </div>

    <div class="form-group">
      <label>Síntomas requeridos (deben estar TODOS marcados)</label>
      <select v-model="requeridos" multiple size="8" class="form-select">
        <optgroup v-for="cat in CATEGORIAS" :key="cat.id" :label="`${cat.icono} ${cat.nombre}`">
          <option v-for="s in cat.sintomas" :key="s.valor" :value="s.valor">{{ s.etiqueta }}</option>
        </optgroup>
      </select>
      <span class="form-hint">Mantén Ctrl (o Cmd) para elegir varios.</span>
    </div>

    <div class="form-group">
      <label>Síntomas opcionales (suman probabilidad si también están marcados)</label>
      <select v-model="opcionales" multiple size="8" class="form-select">
        <optgroup v-for="cat in CATEGORIAS" :key="cat.id" :label="`${cat.icono} ${cat.nombre}`">
          <option v-for="s in cat.sintomas" :key="s.valor" :value="s.valor">{{ s.etiqueta }}</option>
        </optgroup>
      </select>
    </div>

    <div class="form-group">
      <label>Recomendaciones (una por línea)</label>
      <textarea v-model="recomendacionesTexto" rows="4" placeholder="Descansa en un lugar tranquilo.&#10;Consulta si el dolor persiste."></textarea>
    </div>

    <div style="display:flex; gap:10px;">
      <button type="submit" class="btn btn-primary" style="flex:1;">💾 Guardar</button>
      <button type="button" class="btn btn-secondary" @click="mostrarFormulario = false">Cancelar</button>
    </div>
  </form>
</template>
