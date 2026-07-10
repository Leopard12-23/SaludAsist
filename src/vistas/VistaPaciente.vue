<!-- VistaPaciente.vue — pantalla del paciente: evaluación de síntomas,
     hasta 3 posibles diagnósticos, su propio historial, PDF, imágenes. -->
<script setup lang="ts">
import { ref } from 'vue';
import { obtenerSesion } from '../almacenamiento/cuentas-usuarios';
import { evaluarSintomas } from '../logica/motor-diagnostico';
import { guardarEvaluacion, exportarPDF } from '../logica/historial-evaluaciones';
import { usarModalHistorial } from '../logica/usar-modal-historial';
import type { ResultadoDiagnostico } from '../tipos/tipos';
import MenuSintomas from '../componentes/MenuSintomas.vue';
import ResultadoDiagnosticoCard from '../componentes/ResultadoDiagnostico.vue';
import CargaImagenes from '../componentes/CargaImagenes.vue';
import SeccionInformacion from '../componentes/SeccionInformacion.vue';
import SeccionContacto from '../componentes/SeccionContacto.vue';
import ModalInfo from '../componentes/ModalInfo.vue';
import ContenidoPerfil from '../componentes/ContenidoPerfil.vue';

// La guarda de navegación del router ya garantiza que solo un paciente
// con sesión llega hasta acá, así que obtenerSesion() nunca es null en la práctica.
const sesion = obtenerSesion()!;
const { abrir: abrirHistorial } = usarModalHistorial();

const menuRef = ref<InstanceType<typeof MenuSintomas> | null>(null);
const resultadoRef = ref<HTMLElement | null>(null); // para poder exportar el resultado a PDF
const sintomas = ref<string[]>([]);
const edad = ref(''); // texto del input, se convierte a número al evaluar
const resultados = ref<ResultadoDiagnostico[]>([]); // hasta 3 posibles diagnósticos
const sinCoincidencia = ref(false);
const verPerfil = ref(false);

// Calcula los posibles diagnósticos (usando también la edad), los guarda
// en el historial de ESTA cuenta (Supabase) y los muestra en pantalla.
async function evaluar(): Promise<void> {
  if (sintomas.value.length === 0) return;
  const edadNum = edad.value ? parseInt(edad.value, 10) : null;
  const encontrados = await evaluarSintomas(sintomas.value, edadNum);
  resultados.value = encontrados;
  sinCoincidencia.value = encontrados.length === 0;
  await guardarEvaluacion(sesion.correo, sintomas.value, encontrados[0] ?? null);
}

// Limpia el resultado y el menú de síntomas para empezar de nuevo.
function nuevaEvaluacion(): void {
  resultados.value = [];
  sinCoincidencia.value = false;
  menuRef.value?.limpiar();
}

// Envuelve window.print() en una función propia (el template no puede llamar a "window" directo).
function imprimir(): void {
  window.print();
}
</script>

<template>
  <header>
    <div class="hero hero-split">
      <div class="hero-grid">
        <div class="hero-content hero-content-left">
          <span class="hero-badge">Sistema con IA · Manta, Ecuador</span>
          <p class="hero-kicker">Bienvenido a</p>
          <h1>SaludAsist</h1>
          <p class="hero-subtitle">Orientación médica preliminar inteligente y accesible para todos</p>
          <p class="hero-description">Nuestro sistema con IA analiza tus síntomas y te brinda una evaluación inicial confiable, rápida y segura.</p>

          <ul class="hero-features">
            <li>
              <span class="hero-feature-icon">🧠</span>
              <span>
                <strong>Diagnóstico inteligente</strong>
                <small>Algoritmos avanzados que analizan tus síntomas y te orientan de forma preliminar.</small>
              </span>
            </li>
            <li>
              <span class="hero-feature-icon">🔒</span>
              <span>
                <strong>Seguro y privado</strong>
                <small>Tus datos están protegidos con los más altos estándares de seguridad y privacidad.</small>
              </span>
            </li>
            <li>
              <span class="hero-feature-icon">⏰</span>
              <span>
                <strong>Disponible 24/7</strong>
                <small>Accede a orientación médica en cualquier momento y desde cualquier lugar.</small>
              </span>
            </li>
          </ul>

          <div class="hero-disclaimer hero-disclaimer-inline" role="note">
            ⚠️ Esta herramienta <strong>no reemplaza</strong> una consulta médica profesional.
          </div>
          <div class="privacy-notice hero-disclaimer-inline" role="complementary" aria-label="Aviso de privacidad">
            🔒 <strong>Tu privacidad es prioritaria:</strong> solo tú y tu doctor asignado pueden ver tu historial (RLS activado).
          </div>

          <a href="#diagnostico" class="hero-cta">💊 Comenzar evaluación →</a>
        </div>
      </div>

      <div class="hero-bottom-cards">
        <div class="hero-mini-card">
          <span class="hero-mini-icon">🩺</span>
          <div>
            <strong>Evaluación de síntomas</strong>
            <small>Responde algunas preguntas sobre tus síntomas y recibe una evaluación preliminar instantánea.</small>
          </div>
        </div>
        <div class="hero-mini-card">
          <span class="hero-mini-icon">📋</span>
          <div>
            <strong>Historial médico</strong>
            <small>Guarda y consulta tus evaluaciones anteriores y da seguimiento a tu estado de salud.</small>
          </div>
        </div>
        <div class="hero-mini-card">
          <span class="hero-mini-icon">💊</span>
          <div>
            <strong>Información de salud</strong>
            <small>Accede a información confiable sobre condiciones, tratamientos y recomendaciones.</small>
          </div>
        </div>
        <div class="hero-mini-card">
          <span class="hero-mini-icon">🔒</span>
          <div>
            <strong>Confidencial y seguro</strong>
            <small>Tu privacidad es nuestra prioridad. Todos tus datos están encriptados y protegidos.</small>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div class="rol-banner">
    <div class="rol-banner-inner">
      <div>
        <p class="rol-banner-eyebrow">Panel de paciente</p>
        <h2>Hola, {{ sesion.nombre.split(' ')[0] }} 👋</h2>
        <p>Consulta tu historial y realiza nuevas evaluaciones.</p>
      </div>
      <div class="rol-banner-opciones">
        <button type="button" class="btn btn-secondary btn-small" @click="abrirHistorial">📖 Mi historial</button>
        <button type="button" class="btn btn-secondary btn-small" @click="verPerfil = true">👤 Mi perfil</button>
      </div>
    </div>
  </div>

  <section id="diagnostico" class="container" style="padding: 30px 0;">
    <h2 id="titulo-diagnostico">Evaluación de Síntomas</h2>
    <p class="section-lead">Selecciona los síntomas que experimentas actualmente. Puedes elegir múltiples síntomas.</p>

    <div class="age-field-wrapper" style="margin-bottom: 20px;">
      <label for="edad" class="form-label">🎂 Tu edad (recomendado para diagnóstico más preciso)</label>
      <div class="age-input-group">
        <input v-model="edad" type="number" id="edad" min="0" max="120" placeholder="Ej: 35" class="age-input">
        <span class="age-hint">Opcional</span>
      </div>
    </div>

    <p class="sintomas-instruccion">
      Marca la <strong>categoría principal</strong> relacionada con tu malestar para desplegar sus síntomas.
    </p>

    <MenuSintomas ref="menuRef" @cambio="s => sintomas = s" />

    <button type="button" class="btn-primary" style="margin-top: 20px; width: 100%; padding: 15px; font-weight: bold; cursor: pointer; background-color: var(--primary); color: white; border: none; border-radius: var(--radius);" @click="evaluar">
      Comenzar Evaluación
    </button>

    <div class="alert alert-warning" role="note" style="margin-top: 20px;">
      <strong>⚠️ Importante:</strong> Este resultado es solo una orientación preliminar generada por reglas automáticas.
      <strong>No reemplaza una consulta médica profesional.</strong> En una urgencia, acude a emergencias.
    </div>

    <!-- Se muestran hasta 3 posibles diagnósticos: el más probable primero. -->
    <div ref="resultadoRef" style="margin-top: 24px;">
      <p v-if="resultados.length > 1" class="sintomas-instruccion">
        Encontramos {{ resultados.length }} posibles coincidencias, de la más a la menos probable:
      </p>
      <ResultadoDiagnosticoCard
        v-for="(r, i) in resultados" :key="i"
        :resultado="r" :sintomas="sintomas" :edad="edad ? parseInt(edad, 10) : null"
        style="margin-bottom: 16px;"
      />
    </div>
    <p v-if="sinCoincidencia" class="auth-alert auth-alert--error" style="margin-top:20px">
      No encontramos una coincidencia clara. Consulta con un médico general para una evaluación completa.
    </p>

    <div v-if="resultados.length || sinCoincidencia" class="results-actions">
      <button type="button" class="btn btn-primary" @click="nuevaEvaluacion">↩ Nueva evaluación</button>
      <button type="button" class="btn btn-secondary" @click="exportarPDF(resultadoRef)">📄 Exportar PDF</button>
      <button type="button" class="btn btn-secondary" @click="imprimir">🖨️ Imprimir resultados</button>
    </div>

    <CargaImagenes />
  </section>

  <SeccionInformacion />
  <SeccionContacto />

  <ModalInfo :abierto="verPerfil" titulo="👤 Mi perfil" @cerrar="verPerfil = false">
    <ContenidoPerfil :sesion="sesion" />
  </ModalInfo>
</template>
