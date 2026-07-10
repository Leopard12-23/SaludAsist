<!-- GestionCategorias.vue — el admin puede agregar una categoría nueva
     al menú de síntomas, o agregar/quitar síntomas de una ya existente
     (antes el menú de 10 categorías y 51 síntomas era fijo). -->
<script setup lang="ts">
import { ref } from 'vue';
import {
  obtenerCategorias, agregarCategoria, eliminarCategoria,
  agregarSintoma, eliminarSintoma, restaurarCategoriasOriginales,
} from '../logica/gestion-categorias';
import { obtenerCatalogo } from '../logica/gestion-enfermedades';
import { notificar } from '../logica/usar-notificaciones';
import { usarConfirmacion } from '../logica/usar-confirmacion';

const { pedirConfirmacion } = usarConfirmacion();

const categorias = ref(obtenerCategorias());

// Campos para agregar una categoría nueva.
const nombreCategoria = ref('');
const iconoCategoria = ref('🩺');

// Campos para agregar un síntoma nuevo (por categoría, guardado por id).
const textoNuevoSintoma = ref<Record<string, string>>({});

function refrescar(): void {
  categorias.value = obtenerCategorias();
}

function alAgregarCategoria(): void {
  if (!nombreCategoria.value.trim()) { notificar('Ponle un nombre a la categoría.', 'error'); return; }
  agregarCategoria(nombreCategoria.value.trim(), iconoCategoria.value.trim() || '🩺');
  nombreCategoria.value = '';
  iconoCategoria.value = '🩺';
  refrescar();
  notificar('Categoría agregada.', 'exito');
}

// Devuelve los nombres de las enfermedades que dejarían de poder
// detectarse si se borra este síntoma (porque lo necesitan como
// requerido). Sin esto, un borrado "silencioso" podía volver
// inalcanzable una enfermedad sin que nadie se diera cuenta.
function enfermedadesQueUsan(valorSintoma: string): string[] {
  return obtenerCatalogo()
    .filter(r => r.requeridos.includes(valorSintoma))
    .map(r => r.enfermedad);
}

async function alBorrarCategoria(idCategoria: string, nombre: string): Promise<void> {
  const categoria = categorias.value.find(c => c.id === idCategoria);
  const afectadas = new Set(categoria?.sintomas.flatMap(s => enfermedadesQueUsan(s.valor)) ?? []);

  const mensaje = afectadas.size > 0
    ? `¿Borrar "${nombre}" y todos sus síntomas? ⚠️ Estas enfermedades dejarían de poder detectarse: ${[...afectadas].join(', ')}.`
    : `¿Borrar la categoría "${nombre}" y todos sus síntomas?`;

  const confirma = await pedirConfirmacion(mensaje);
  if (!confirma) return;
  eliminarCategoria(idCategoria);
  refrescar();
  notificar('Categoría eliminada.', 'info');
}

function alAgregarSintoma(idCategoria: string): void {
  const texto = textoNuevoSintoma.value[idCategoria]?.trim();
  if (!texto) { notificar('Escribe el nombre del síntoma primero.', 'error'); return; }
  agregarSintoma(idCategoria, texto);
  textoNuevoSintoma.value[idCategoria] = '';
  refrescar();
  notificar('Síntoma agregado.', 'exito');
}

async function alBorrarSintoma(idCategoria: string, valorSintoma: string, etiqueta: string): Promise<void> {
  const afectadas = enfermedadesQueUsan(valorSintoma);
  if (afectadas.length > 0) {
    const confirma = await pedirConfirmacion(
      `⚠️ "${etiqueta}" lo usa ${afectadas.join(', ')}. Si lo quitas, esa enfermedad ya no se podrá detectar. ¿Quitarlo igual?`
    );
    if (!confirma) return;
  }
  eliminarSintoma(idCategoria, valorSintoma);
  refrescar();
}

async function alRestaurar(): Promise<void> {
  const confirma = await pedirConfirmacion('¿Descartar todos los cambios y volver a las 10 categorías / 51 síntomas originales?');
  if (!confirma) return;
  restaurarCategoriasOriginales();
  refrescar();
  notificar('Categorías restauradas a los valores originales.', 'info');
}
</script>

<template>
  <div class="form-group" style="background:var(--bg); padding:16px; border-radius:var(--radius); margin-bottom:24px;">
    <label>➕ Nueva categoría</label>
    <div style="display:flex; gap:10px;">
      <input v-model="iconoCategoria" type="text" maxlength="2" style="width:60px; text-align:center;" title="Ícono (emoji)">
      <input v-model="nombreCategoria" type="text" placeholder="Ej: Salud dental" style="flex:1;">
      <button type="button" class="btn btn-primary" @click="alAgregarCategoria">Agregar</button>
    </div>
  </div>

  <div v-for="cat in categorias" :key="cat.id" class="symptom-accordion">
    <div class="accordion-header" style="cursor:default;">
      <span>{{ cat.icono }} {{ cat.nombre }} <span class="accordion-badge">{{ cat.sintomas.length }}</span></span>
      <button type="button" class="btn btn-danger btn-sm" @click="alBorrarCategoria(cat.id, cat.nombre)">🗑️ Borrar categoría</button>
    </div>
    <div class="accordion-content">
      <div v-for="s in cat.sintomas" :key="s.valor" style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid var(--border);">
        <span>{{ s.etiqueta }}</span>
        <button type="button" class="btn btn-secondary btn-sm" @click="alBorrarSintoma(cat.id, s.valor, s.etiqueta)">✕ Quitar</button>
      </div>

      <div style="display:flex; gap:8px; margin-top:10px;">
        <input v-model="textoNuevoSintoma[cat.id]" type="text" placeholder="Nuevo síntoma (ej: Dolor de muela)" style="flex:1;">
        <button type="button" class="btn btn-secondary btn-sm" @click="alAgregarSintoma(cat.id)">➕ Agregar síntoma</button>
      </div>
    </div>
  </div>

  <button type="button" class="btn btn-secondary" style="margin-top:20px;" @click="alRestaurar">
    ↩️ Restaurar categorías originales (10 categorías / 51 síntomas)
  </button>
</template>
