// usar-confirmacion.ts — reemplaza el confirm() del navegador por un
// modal propio. Funciona con async/await: se "pausa" el código hasta
// que la persona toca Sí o No, igual que haría confirm(), pero bonito.
import { ref } from 'vue';

const visible = ref(false);
const mensaje = ref('');
let resolverPromesa: ((respuesta: boolean) => void) | null = null;

// Muestra el modal y espera la respuesta de la persona.
// Uso: const acepta = await pedirConfirmacion('¿Seguro?');
function pedirConfirmacion(texto: string): Promise<boolean> {
  mensaje.value = texto;
  visible.value = true;
  return new Promise(resolve => { resolverPromesa = resolve; });
}

// Se llama al tocar el botón Sí o No del modal.
function responder(valor: boolean): void {
  visible.value = false;
  resolverPromesa?.(valor);
}

export function usarConfirmacion() {
  return { visible, mensaje, pedirConfirmacion, responder };
}
