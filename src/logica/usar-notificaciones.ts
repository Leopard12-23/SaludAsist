// usar-notificaciones.ts — reemplaza los alert() del navegador por avisos
// propios (toasts) que combinan con el diseño del sitio.
//
// El estado vive AFUERA de la función (a nivel de módulo), no adentro.
// Así, sin importar desde qué componente se llame a notificar(), todos
// comparten la misma lista de avisos, y un solo <ToastContenedor> (montado
// una vez en App.vue) los muestra a todos.
import { ref } from 'vue';

export interface Toast { id: number; mensaje: string; tipo: 'exito' | 'error' | 'info' }

const toasts = ref<Toast[]>([]);
let contador = 0;

// Muestra un aviso durante unos segundos y luego lo quita solo.
// Se exporta también suelta (no solo dentro del composable) para poder
// usarla desde archivos .ts que no son componentes, como historial-evaluaciones.ts.
export function notificar(mensaje: string, tipo: Toast['tipo'] = 'info'): void {
  const id = ++contador;
  toasts.value.push({ id, mensaje, tipo });
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id); }, 4000);
}

export function usarNotificaciones() {
  return { toasts, notificar };
}
