// usar-modal-historial.ts — estado compartido para abrir/cerrar el modal
// de historial desde cualquier componente (ej: el botón del nav en
// App.vue, o el botón "Mi historial" dentro de VistaPaciente.vue),
// sin tener que pasar props/emit a través de varias pantallas.
import { ref } from 'vue';

const abierto = ref(false);

export function usarModalHistorial() {
  return {
    abierto,
    abrir: () => { abierto.value = true; },
    cerrar: () => { abierto.value = false; },
  };
}
