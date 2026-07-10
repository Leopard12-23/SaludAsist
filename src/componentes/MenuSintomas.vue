<!-- MenuSintomas.vue
     El "menú dinámico" pedido: cada categoría es una enfermedad/área
     principal. Al hacer clic se abre y muestra sus síntomas relacionados,
     que se pueden marcar con checkbox. Tiene un buscador que filtra los
     síntomas en vivo (útil con 51 síntomas en 10 categorías). Emite la
     lista completa de síntomas marcados hacia el componente padre. -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { obtenerCategorias } from '../logica/gestion-categorias';
import type { Categoria } from '../tipos/tipos';

// Se lee una sola vez al montar el componente: incluye las categorías y
// síntomas que haya agregado el admin, no solo los 10/51 originales.
const CATEGORIAS = ref<Categoria[]>([]);
onMounted(async () => { CATEGORIAS.value = await obtenerCategorias(); });

const emit = defineEmits<{ cambio: [sintomas: string[]] }>();

// Guarda qué síntomas están marcados (valor -> true/false).
const marcados = ref<Record<string, boolean>>({});

// Guarda qué categorías están abiertas (id -> true/false).
const abiertas = ref<Record<string, boolean>>({ respiratorio: true }); // la primera abierta por defecto

// Texto del buscador.
const busqueda = ref('');

// Con texto de búsqueda, solo quedan las categorías que tienen al menos un
// síntoma cuya etiqueta coincide (y solo esos síntomas, no toda la categoría).
const categoriasFiltradas = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  if (!texto) return CATEGORIAS.value;
  return CATEGORIAS.value
    .map(cat => ({ ...cat, sintomas: cat.sintomas.filter(s => s.etiqueta.toLowerCase().includes(texto)) }))
    .filter(cat => cat.sintomas.length > 0);
});

// Mientras se busca, las categorías con resultados se muestran ya abiertas
// (para no obligar a hacer clic); sin búsqueda, respeta lo que el usuario abrió a mano.
function categoriaVisible(idCategoria: string): boolean {
  if (busqueda.value.trim()) return true;
  return !!abiertas.value[idCategoria];
}

// Abre o cierra el acordeón de una categoría (ej: "Respiratorio").
function alternarCategoria(id: string): void {
  abiertas.value[id] = !abiertas.value[id];
}

// Marca o desmarca un síntoma y avisa al componente padre con la lista actualizada.
function alternarSintoma(valor: string): void {
  marcados.value[valor] = !marcados.value[valor];
  emit('cambio', sintomasSeleccionados.value);
}

// Lista simple de valores marcados, para enviar al motor de diagnóstico.
const sintomasSeleccionados = computed(() =>
  Object.keys(marcados.value).filter(valor => marcados.value[valor])
);

// Cuenta cuántos síntomas hay marcados dentro de una categoría (para el badge).
function contarEnCategoria(idCategoria: string): number {
  const categoria = CATEGORIAS.value.find(c => c.id === idCategoria);
  if (!categoria) return 0;
  return categoria.sintomas.filter(s => marcados.value[s.valor]).length;
}

// Desmarca todo. La usa VistaPaciente.vue al presionar "Nueva evaluación".
function limpiar(): void {
  marcados.value = {};
  busqueda.value = '';
  emit('cambio', []);
}

defineExpose({ limpiar, sintomasSeleccionados });
</script>

<template>
  <input v-model="busqueda" type="text" placeholder="🔍 Buscar un síntoma (ej: tos, fiebre, mareo...)" class="buscador-input">

  <div class="contador-sintomas">
    {{ sintomasSeleccionados.length }} síntoma(s) seleccionado(s)
  </div>

  <p v-if="busqueda.trim() && categoriasFiltradas.length === 0" class="empty-history">
    No encontramos ningún síntoma con "{{ busqueda }}".
  </p>

  <div class="sintomas-acordeon">
    <div v-for="categoria in categoriasFiltradas" :key="categoria.id" class="symptom-accordion">

      <!-- Encabezado: la "enfermedad principal". Al marcarla se despliega. -->
      <button
        type="button"
        class="accordion-header"
        :aria-expanded="categoriaVisible(categoria.id)"
        @click="alternarCategoria(categoria.id)"
      >
        <span>
          {{ categoria.icono }} {{ categoria.nombre }}
          <span class="accordion-badge" :class="{ 'tiene-seleccion': contarEnCategoria(categoria.id) > 0 }">
            {{ contarEnCategoria(categoria.id) }}
          </span>
        </span>
        <span class="accordion-icon">▼</span>
      </button>

      <!-- Cuerpo: las "enfermedades derivadas" (síntomas) de esta categoría. -->
      <div v-show="categoriaVisible(categoria.id)" class="accordion-content">
        <div v-for="sintoma in categoria.sintomas" :key="sintoma.valor" class="checkbox-wrapper">
          <input
            type="checkbox"
            :id="`chk-${sintoma.valor}`"
            :checked="!!marcados[sintoma.valor]"
            @change="alternarSintoma(sintoma.valor)"
          >
          <label :for="`chk-${sintoma.valor}`" class="checkbox-label">
            <span class="checkbox-box"></span> {{ sintoma.etiqueta }}
          </label>
        </div>
      </div>

    </div>
  </div>
</template>
