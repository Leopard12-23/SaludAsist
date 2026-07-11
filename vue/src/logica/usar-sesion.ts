// usar-sesion.ts — estado de sesión compartido por toda la app (nav,
// router, vistas). Es un solo ref a nivel de módulo: cuando alguien
// inicia o cierra sesión desde cualquier lado, todos se enteran.
import { ref } from 'vue';
import { obtenerSesion, cerrarSesion, type Sesion } from '../almacenamiento/cuentas-usuarios';

const sesionActual = ref<Sesion | null>(obtenerSesion());

// Vuelve a leer la sesión desde sessionStorage (se llama tras login/logout).
function refrescarSesion(): void {
  sesionActual.value = obtenerSesion();
}

// Cierra sesión y actualiza el estado compartido al instante.
function cerrarSesionGlobal(): void {
  cerrarSesion();
  sesionActual.value = null;
}

export function usarSesion() {
  return { sesionActual, refrescarSesion, cerrarSesionGlobal };
}
