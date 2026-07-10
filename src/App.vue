<!-- App.vue — raíz de la app. El <router-view> decide qué pantalla
     mostrar según la URL (antes era un v-if manual sin URLs reales). -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { obtenerSesion, cerrarSesion, sembrarCuentasDemo, asegurarAdminActivo, type Sesion } from './almacenamiento/cuentas-usuarios';
import { usarTema } from './logica/usar-tema';
import { usarModalHistorial } from './logica/usar-modal-historial';
import { usarInactividad } from './logica/usar-inactividad';
import { usarNotificaciones } from './logica/usar-notificaciones';
import ModalHistorial from './componentes/ModalHistorial.vue';
import ToastContenedor from './componentes/ToastContenedor.vue';
import ModalConfirmacion from './componentes/ModalConfirmacion.vue';
import ErrorBoundary from './componentes/ErrorBoundary.vue';
import PiePagina from './componentes/PiePagina.vue';

const router = useRouter();
const route = useRoute();
const { notificar } = usarNotificaciones();

const sesion = ref<Sesion | null>(null);
const { abierto: historialAbierto, cerrar: cerrarHistorial } = usarModalHistorial();
const { tema, alternarTema } = usarTema(); // maneja el modo claro/oscuro

// Tras 15 minutos sin actividad (mouse, teclado, clic), cierra la sesión
// sola por seguridad y avisa con un toast antes de mandar al login.
usarInactividad(() => {
  cerrarSesion();
  sesion.value = null;
  notificar('Tu sesión se cerró por inactividad.', 'info');
  router.push('/login');
});

// La sección "Diagnóstico/Información/Contacto" del nav y el ícono de
// historial solo tienen sentido en la pantalla del paciente.
const esVistaPaciente = computed(() => route.name === 'paciente');

// Al cargar la app: siembra las 3 cuentas demo (si no existen) y recupera
// la sesión activa. El router (guarda de navegación) ya decidió a qué
// ruta mandar según haya o no sesión; acá solo se refleja en el nav.
onMounted(async () => {
  await sembrarCuentasDemo();
  asegurarAdminActivo();
  sesion.value = obtenerSesion();
});

// Se llama cada vez que cambia de ruta, para mantener el nav actualizado
// (ej: justo después de iniciar sesión, cuando el router ya redirigió).
router.afterEach(() => {
  sesion.value = obtenerSesion();
});

// Cierra la sesión y vuelve al login.
function salir(): void {
  cerrarSesion();
  sesion.value = null;
  router.push('/login');
}
</script>

<template>
  <a href="#main-content" class="skip-link">Ir al contenido principal</a>

  <nav>
    <div class="nav-inner">
      <router-link to="/" class="nav-logo" aria-label="SaludAsist - Inicio">SaludAsist</router-link>
      <ul v-if="esVistaPaciente" class="nav-links" role="list">
        <li><a href="#diagnostico">Diagnóstico</a></li>
        <li><a href="#informacion">Información</a></li>
        <li><a href="#contacto">Contacto</a></li>
      </ul>
      <div class="nav-actions">
        <button type="button" class="btn-theme" :aria-label="tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'" @click="alternarTema">
          <span aria-hidden="true">{{ tema === 'oscuro' ? '☀️' : '🌙' }}</span>
          <span class="btn-nav-texto">{{ tema === 'oscuro' ? 'Claro' : 'Oscuro' }}</span>
        </button>
        <button v-if="esVistaPaciente" type="button" class="btn-history" aria-label="Ver historial" title="Ver evaluaciones anteriores" @click="historialAbierto = true">
          <span aria-hidden="true">📋</span>
          <span class="btn-nav-texto">Historial</span>
        </button>
        <div v-if="sesion" class="nav-usuario">
          <span class="nav-usuario-info">👤 {{ sesion.nombre.split(' ')[0] }}</span>
          <button type="button" class="btn-history btn-salir" aria-label="Cerrar sesión" title="Cerrar sesión" @click="salir">
            <span aria-hidden="true">🚪</span>
            <span class="btn-nav-texto">Salir</span>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Envuelve el login con la columna de bienvenida; las pantallas del
       sistema (paciente/doctor/admin) no necesitan ese envoltorio. -->
  <main v-if="route.name === 'login'" id="main-content" class="auth-main">
    <div class="auth-wrapper">
      <div class="auth-intro">
        <span class="hero-badge">Sistema con IA · Manta, Ecuador</span>
        <h1 class="auth-title">Bienvenido a SaludAsist</h1>
        <p class="auth-subtitle">
          Accede según tu perfil: <strong>paciente</strong>, <strong>doctor especialista</strong>
          o <strong>administrador</strong>. Cada rol tiene su propio panel de opciones.
        </p>
        <ul class="auth-roles-list" role="list">
          <li>🧑‍⚕️ <strong>Pacientes:</strong> gestionan su historial y nuevas evaluaciones.</li>
          <li>👩‍⚕️ <strong>Doctores especialistas:</strong> revisan pacientes y diagnósticos.</li>
          <li>🛡️ <strong>Administradores:</strong> gestionan usuarios y el sistema.</li>
        </ul>
        <div class="privacy-notice" role="complementary" aria-label="Aviso de privacidad">
          🔒 Tus datos se procesan y almacenan de forma local en tu dispositivo.
        </div>
      </div>
      <ErrorBoundary><router-view /></ErrorBoundary>
    </div>
  </main>

  <main v-else id="main-content">
    <ErrorBoundary><router-view /></ErrorBoundary>
  </main>

  <ModalHistorial v-if="sesion" :abierto="historialAbierto" :correo-usuario="sesion.correo" @cerrar="cerrarHistorial" />
  <PiePagina v-if="route.name !== 'login'" />

  <!-- Estos dos se montan UNA sola vez: cualquier componente de la app
       puede disparar un toast o un modal de confirmación sin importar
       en qué pantalla esté (ver usar-notificaciones.ts / usar-confirmacion.ts). -->
  <ToastContenedor />
  <ModalConfirmacion />
</template>
