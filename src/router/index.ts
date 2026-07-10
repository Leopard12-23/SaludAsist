// router/index.ts — define las URLs reales de la app (antes todo era
// un solo archivo con v-if cambiando de "pantalla" sin cambiar la URL).
// También protege las rutas: sin sesión no se puede entrar al sistema,
// y cada rol solo puede ver su propia pantalla.
import { createRouter, createWebHistory } from 'vue-router';
import { obtenerSesion, type Rol } from '../almacenamiento/cuentas-usuarios';

// Dado un rol, devuelve a qué ruta le corresponde entrar.
export function rutaInicioPorRol(rol: Rol): string {
  if (rol === 'doctor') return '/doctor';
  if (rol === 'administrador') return '/admin';
  return '/paciente';
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      component: () => import('../vistas/VistaLogin.vue'),
      // "soloInvitados": si ya hay sesión, no tiene sentido ver el login de nuevo.
      meta: { soloInvitados: true },
    },
    {
      path: '/paciente',
      name: 'paciente',
      component: () => import('../vistas/VistaPaciente.vue'),
      meta: { rolRequerido: 'usuario' as Rol },
    },
    {
      path: '/doctor',
      name: 'doctor',
      component: () => import('../vistas/VistaDoctor.vue'),
      meta: { rolRequerido: 'doctor' as Rol },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../vistas/VistaAdmin.vue'),
      meta: { rolRequerido: 'administrador' as Rol },
    },
    // Páginas legales: libres para cualquiera, con o sin sesión iniciada.
    {
      path: '/terminos',
      name: 'terminos',
      component: () => import('../vistas/legal/VistaTerminos.vue'),
    },
    {
      path: '/privacidad',
      name: 'privacidad',
      component: () => import('../vistas/legal/VistaPrivacidad.vue'),
    },
    {
      path: '/legal',
      name: 'legal',
      component: () => import('../vistas/legal/VistaAvisoLegal.vue'),
    },
    // Cualquier URL desconocida redirige al inicio correspondiente.
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

// Guarda de navegación: se ejecuta ANTES de mostrar cualquier ruta.
router.beforeEach((to) => {
  const sesion = obtenerSesion();

  // Ruta exclusiva para invitados (el login): si ya hay sesión, se redirige
  // a su panel en vez de mostrarle el formulario de login de nuevo.
  if (to.meta.soloInvitados) {
    if (sesion) return rutaInicioPorRol(sesion.rol);
    return true;
  }

  // Ruta protegida (pide un rol específico): exige sesión y el rol correcto.
  const rolRequerido = to.meta.rolRequerido as Rol | undefined;
  if (rolRequerido) {
    if (!sesion) return '/login';
    if (sesion.rol !== rolRequerido) return rutaInicioPorRol(sesion.rol);
  }

  // Cualquier otra ruta (ej: /terminos, /privacidad, /legal) es libre
  // para todos, haya o no sesión iniciada.
  return true;
});

export default router;
