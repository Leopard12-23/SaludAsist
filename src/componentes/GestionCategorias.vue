<!-- GestionCategorias.vue — el admin puede agregar una categoría nueva
     al menú de síntomas, o agregar/quitar síntomas de una ya existente. -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  obtenerCategorias, agregarCategoria, eliminarCategoria,
  agregarSintoma, eliminarSintoma,
} from '../logica/gestion-categorias';
import { obtenerCatalogo } from '../logica/gestion-enfermedades';
import { notificar } from '../logica/usar-notificaciones';
import { usarConfirmacion } from '../logica/usar-confirmacion';
import type { Categoria } from '../tipos/tipos';

const { pedirConfirmacion } = usarConfirmacion();

const categorias = ref<Categoria[]>([]);

// Campos para agregar una categoría nueva.
const nombreCategoria = ref('');
const iconoCategoria = ref('🩺');

// Campos para agregar un síntoma nuevo (por categoría, guardado por id).
const textoNuevoSintoma = ref<Record<string, string>>({});

async function refrescar(): Promise<void> {
  categorias.value = await obtenerCategorias();
}
onMounted(refrescar);

async function alAgregarCategoria(): Promise<void> {
  if (!nombreCategoria.value.trim()) { notificar('Ponle un nombre a la categoría.', 'error'); return; }
  await agregarCategoria(nombreCategoria.value.trim(), iconoCategoria.value.trim() || '🩺');
  nombreCategoria.value = '';
  iconoCategoria.value = '🩺';
  await refrescar();
  notificar('Categoría agregada.', 'exito');
}

// Devuelve los nombres de las enfermedades que dejarían de poder
// detectarse si se borra este síntoma (porque lo necesitan como
// requerido). Sin esto, un borrado "silencioso" podía volver
// inalcanzable una enfermedad sin que nadie se diera cuenta.
async function enfermedadesQueUsan(valorSintoma: string): Promise<string[]> {
  const catalogo = await obtenerCatalogo();
  return catalogo.filter(r => r.requeridos.includes(valorSintoma)).map(r => r.enfermedad);
}

async function alBorrarCategoria(idCategoria: string, nombre: string): Promise<void> {
  const categoria = categorias.value.find(c => c.id === idCategoria);
  const afectadasPorSintoma = await Promise.all((categoria?.sintomas ?? []).map(s => enfermedadesQueUsan(s.valor)));
  const afectadas = new Set(afectadasPorSintoma.flat());

  const mensaje = afectadas.size > 0
    ? `¿Borrar "${nombre}" y todos sus síntomas? ⚠️ Estas enfermedades dejarían de poder detectarse: ${[...afectadas].join(', ')}.`
    : `¿Borrar la categoría "${nombre}" y todos sus síntomas?`;

  const confirma = await pedirConfirmacion(mensaje);
  if (!confirma) return;
  await eliminarCategoria(idCategoria);
  await refrescar();
  notificar('Categoría eliminada.', 'info');
}

async function alAgregarSintoma(idCategoria: string): Promise<void> {
  const texto = textoNuevoSintoma.value[idCategoria]?.trim();
  if (!texto) { notificar('Escribe el nombre del síntoma primero.', 'error'); return; }
  await agregarSintoma(idCategoria, texto);
  textoNuevoSintoma.value[idCategoria] = '';
  await refrescar();
  notificar('Síntoma agregado.', 'exito');
}

async function alBorrarSintoma(idCategoria: string, valorSintoma: string, etiqueta: string): Promise<void> {
  const afectadas = await enfermedadesQueUsan(valorSintoma);
  if (afectadas.length > 0) {
    const confirma = await pedirConfirmacion(
      `⚠️ "${etiqueta}" lo usa ${afectadas.join(', ')}. Si lo quitas, esa enfermedad ya no se podrá detectar. ¿Quitarlo igual?`
    );
    if (!confirma) return;
  }
  await eliminarSintoma(idCategoria, valorSintoma);
  await refrescar();
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
</template>
