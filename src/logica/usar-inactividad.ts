// usar-inactividad.ts — cierra la sesión sola tras un rato sin actividad
// (mover el mouse, tocar una tecla, hacer clic). Es una medida de
// seguridad simple: si alguien deja la sesión abierta en una compu
// compartida y se aleja, no queda expuesta para siempre.
import { onMounted, onUnmounted } from 'vue';
import { obtenerSesion } from '../almacenamiento/cuentas-usuarios';

const MINUTOS_INACTIVIDAD = 15;
const EVENTOS_DE_ACTIVIDAD = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

// alExpirar: qué hacer cuando se cumple el tiempo (normalmente: cerrar
// sesión, avisar con un toast, y mandar al login).
export function usarInactividad(alExpirar: () => void): void {
  let temporizador: ReturnType<typeof setTimeout> | null = null;

  // Cada vez que hay actividad, se reinicia la cuenta regresiva desde cero.
  function reiniciarTemporizador(): void {
    if (!obtenerSesion()) return; // sin sesión activa, no hay nada que expirar
    if (temporizador) clearTimeout(temporizador);
    temporizador = setTimeout(alExpirar, MINUTOS_INACTIVIDAD * 60_000);
  }

  onMounted(() => {
    EVENTOS_DE_ACTIVIDAD.forEach(ev => window.addEventListener(ev, reiniciarTemporizador));
    reiniciarTemporizador();
  });

  onUnmounted(() => {
    EVENTOS_DE_ACTIVIDAD.forEach(ev => window.removeEventListener(ev, reiniciarTemporizador));
    if (temporizador) clearTimeout(temporizador);
  });
}
