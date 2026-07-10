<!-- VistaAdmin.vue — panel del administrador. A propósito tiene un layout
     de sidebar (distinto al de paciente/doctor) para que se sienta como
     una herramienta de gestión, no una variante de la pantalla del paciente. -->
<script setup lang="ts">
import { ref } from 'vue';
import { obtenerSesion } from '../almacenamiento/cuentas-usuarios';
import ContenidoUsuarios from '../componentes/ContenidoUsuarios.vue';
import ContenidoAsignaciones from '../componentes/ContenidoAsignaciones.vue';
import GestionEnfermedades from '../componentes/GestionEnfermedades.vue';
import GestionCategorias from '../componentes/GestionCategorias.vue';
import ContenidoReportes from '../componentes/ContenidoReportes.vue';
import ContenidoConfiguracion from '../componentes/ContenidoConfiguracion.vue';
import ModalInfo from '../componentes/ModalInfo.vue';
import ContenidoPerfil from '../componentes/ContenidoPerfil.vue';

// La guarda de navegación del router ya garantiza que solo un admin
// con sesión llega hasta acá.
const sesion = obtenerSesion()!;
const verPerfil = ref(false);

type Pestana = 'usuarios' | 'doctores' | 'asignaciones' | 'enfermedades' | 'categorias' | 'reportes' | 'configuracion';
const pestana = ref<Pestana>('usuarios');

// Menú del sidebar: un solo lugar con el ícono, nombre y valor de cada opción.
const menu: Array<{ id: Pestana; icono: string; nombre: string }> = [
  { id: 'usuarios', icono: '👥', nombre: 'Usuarios' },
  { id: 'doctores', icono: '🩺', nombre: 'Doctores' },
  { id: 'asignaciones', icono: '🔗', nombre: 'Asignaciones' },
  { id: 'enfermedades', icono: '🦠', nombre: 'Enfermedades' },
  { id: 'categorias', icono: '🗂️', nombre: 'Síntomas' },
  { id: 'reportes', icono: '📊', nombre: 'Reportes' },
  { id: 'configuracion', icono: '⚙️', nombre: 'Configuración' },
];

function alBorrarTodosLosDatos(): void {
  window.location.reload(); // ya no queda sesión ni datos: vuelve al login
}
</script>

<template>
  <div class="rol-banner">
    <div class="rol-banner-inner">
      <div>
        <p class="rol-banner-eyebrow">Panel de administrador</p>
        <h2>Hola, {{ sesion.nombre.split(' ')[0] }} 👋</h2>
        <p>Gestión completa del sistema.</p>
      </div>
      <div class="rol-banner-opciones">
        <button type="button" class="btn btn-secondary btn-small" @click="verPerfil = true">👤 Mi perfil</button>
      </div>
    </div>
  </div>

  <div class="admin-layout">
    <aside class="admin-sidebar">
      <p class="admin-sidebar-titulo">Administración</p>
      <button
        v-for="item in menu" :key="item.id" type="button"
        :class="['admin-sidebar-item', { activo: pestana === item.id }]"
        @click="pestana = item.id"
      >
        {{ item.icono }} {{ item.nombre }}
      </button>
    </aside>

    <main class="admin-content">
      <div v-if="pestana === 'usuarios'">
        <h2>Todos los usuarios</h2>
        <ContenidoUsuarios />
      </div>
      <div v-else-if="pestana === 'doctores'">
        <h2>Doctores registrados</h2>
        <ContenidoUsuarios filtro-rol="doctor" />
      </div>
      <div v-else-if="pestana === 'asignaciones'">
        <h2>Asignar pacientes a doctores</h2>
        <ContenidoAsignaciones />
      </div>
      <div v-else-if="pestana === 'enfermedades'">
        <h2>Catálogo de enfermedades</h2>
        <p class="section-lead">Agrega, edita o borra las enfermedades que usa el motor de diagnóstico.</p>
        <GestionEnfermedades />
      </div>
      <div v-else-if="pestana === 'categorias'">
        <h2>Categorías y síntomas</h2>
        <p class="section-lead">Agrega categorías o síntomas nuevos al menú que ve el paciente al evaluarse.</p>
        <GestionCategorias />
      </div>
      <div v-else-if="pestana === 'reportes'">
        <h2>Reportes del sistema</h2>
        <ContenidoReportes />
      </div>
      <div v-else>
        <h2>Configuración</h2>
        <ContenidoConfiguracion @datos-borrados="alBorrarTodosLosDatos" />
      </div>
    </main>
  </div>

  <ModalInfo :abierto="verPerfil" titulo="👤 Mi perfil" @cerrar="verPerfil = false">
    <ContenidoPerfil :sesion="sesion" />
  </ModalInfo>
</template>
