// main.ts — arranca la app Vue y carga los estilos globales
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { restaurarSesionDesdeSupabase } from './almacenamiento/cuentas-usuarios';
import './estilos.css';
import './estilos-login.css';

async function arrancar(): Promise<void> {
  // Se espera ANTES de montar el router: si ya había una sesión de
  // Supabase activa (recarga de página, o login hecho desde la
  // contenedora que comparte el mismo origen/localStorage), la guarda de
  // navegación necesita encontrar la caché de sesión ya lista en su
  // primera ejecución (ver cuentas-usuarios.ts).
  await restaurarSesionDesdeSupabase();

  const app = createApp(App);

  // Manejador global de errores: segunda capa de seguridad además de
  // ErrorBoundary.vue (que atrapa errores DENTRO del árbol de componentes).
  // Este atrapa lo que se le escape a esa primera capa, para que nunca
  // quede un error silencioso sin registrar.
  app.config.errorHandler = (error, _instance, info) => {
    console.error('Error global no atrapado:', error, '| contexto:', info);
  };

  app.use(router).mount('#app');
}

void arrancar();

// El service worker (PWA) se desactivó al integrar este módulo dentro de
// la contenedora: cachear agresivamente una app que vive en un iframe en
// /vue/ es una fuente de bugs (versión vieja "pegada" durante la demo)
// que no vale la pena para este entregable.
