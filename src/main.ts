// main.ts — arranca la app Vue y carga los estilos globales
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { asegurarAdminActivo } from './almacenamiento/cuentas-usuarios';
import './estilos.css';
import './estilos-login.css';

// Red de seguridad: se corre acá, antes de montar la app, para garantizar
// que el sistema NUNCA quede sin ningún administrador activo (por ejemplo,
// si alguien se desactivó su propia cuenta sin querer). No depende de que
// ningún componente termine de montarse primero.
asegurarAdminActivo();

const app = createApp(App);

// Manejador global de errores: segunda capa de seguridad además de
// ErrorBoundary.vue (que atrapa errores DENTRO del árbol de componentes).
// Este atrapa lo que se le escape a esa primera capa, para que nunca
// quede un error silencioso sin registrar.
app.config.errorHandler = (error, _instance, info) => {
  console.error('Error global no atrapado:', error, '| contexto:', info);
};

app.use(router).mount('#app');

// Registra el service worker SOLO en producción. En desarrollo (npm run
// dev) NO se registra a propósito: un service worker viejo puede quedar
// "pegado" en el navegador y seguir sirviendo una versión cacheada aunque
// el código en disco ya haya cambiado — una fuente clásica de confusión
// del tipo "¿por qué sigo viendo la versión anterior?".
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Si falla (ej: sin HTTPS), no rompe la app.
    });
  });
}
