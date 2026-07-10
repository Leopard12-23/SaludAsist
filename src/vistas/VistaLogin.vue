<!-- VistaLogin.vue — pantalla de inicio de sesión, registro y recuperación -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { rutaInicioPorRol } from '../router';
import {
  iniciarSesion, registrar, correoValido, solicitarRecuperacion, confirmarRecuperacion, evaluarFortaleza, ESPECIALIDADES, type Rol,
} from '../almacenamiento/cuentas-usuarios';

const router = useRouter();

const modo = ref<'login' | 'registro' | 'recuperar'>('login');
const error = ref('');
const exito = ref('');
const cargando = ref(false);

const correo = ref('');
const clave = ref('');
const nombre = ref('');
const rol = ref<Rol>('usuario');
const especialidad = ref(''); // solo aplica si rol === 'doctor'

// Se recalcula automáticamente cada vez que la persona escribe una nueva contraseña.
const fortaleza = computed(() => evaluarFortaleza(clave.value));

// Datos propios del flujo de recuperación (paso 1: pedir código; paso 2: usarlo).
const pasoRecuperar = ref<1 | 2>(1);
const codigo = ref('');
const nuevaClave = ref('');
const mensajeCodigoDemo = ref(''); // simula el "correo" mostrando el código en pantalla

// Controla si cada campo de contraseña se muestra en texto plano o oculto (••••).
const verClave = ref(false);
const verClaveRegistro = ref(false);
const verNuevaClave = ref(false);

function limpiarMensajes(): void {
  error.value = '';
  exito.value = '';
}

// Valida los datos y llama a iniciarSesion(). Si es correcto, navega
// directo a la pantalla que le corresponde según su rol.
async function enviarLogin(): Promise<void> {
  limpiarMensajes();
  if (!correoValido(correo.value) || !clave.value) { error.value = 'Completa correo y contraseña.'; return; }
  cargando.value = true;
  const res = await iniciarSesion(correo.value, clave.value);
  cargando.value = false;
  if (!res.ok) { error.value = res.error!; return; }
  router.push(rutaInicioPorRol(res.sesion!.rol));
}

// Crea la cuenta nueva y, si todo salió bien, vuelve a la pestaña de login.
async function enviarRegistro(): Promise<void> {
  limpiarMensajes();
  cargando.value = true;
  const res = await registrar(nombre.value, correo.value, clave.value, rol.value, rol.value === 'doctor' ? especialidad.value : undefined);
  cargando.value = false;
  if (!res.ok) { error.value = res.error!; return; }
  modo.value = 'login';
  especialidad.value = '';
  exito.value = 'Cuenta creada correctamente. Ya puedes iniciar sesión.';
}

// Paso 1 de recuperación: pide el código de 6 dígitos para el correo indicado.
async function pedirCodigo(): Promise<void> {
  limpiarMensajes();
  if (!correoValido(correo.value)) { error.value = 'Ingresa un correo válido.'; return; }
  cargando.value = true;
  const codigoGenerado = await solicitarRecuperacion(correo.value);
  cargando.value = false;

  // Mismo mensaje exista o no la cuenta, para no revelar qué correos están registrados.
  exito.value = 'Si el correo está registrado, se envió un código de verificación.';
  if (codigoGenerado) {
    mensajeCodigoDemo.value = `📧 Simulación de correo (solo demo): tu código es ${codigoGenerado}. Expira en 15 minutos.`;
  }
  pasoRecuperar.value = 2;
}

// Paso 2 de recuperación: valida el código e ingresa la nueva contraseña.
async function cambiarClave(): Promise<void> {
  limpiarMensajes();
  cargando.value = true;
  const res = await confirmarRecuperacion(correo.value, codigo.value, nuevaClave.value);
  cargando.value = false;
  if (!res.ok) { error.value = res.error!; return; }

  exito.value = 'Contraseña actualizada. Ya puedes iniciar sesión.';
  modo.value = 'login';
  pasoRecuperar.value = 1;
  codigo.value = '';
  nuevaClave.value = '';
  mensajeCodigoDemo.value = '';
}

function irARecuperar(): void {
  limpiarMensajes();
  modo.value = 'recuperar';
  pasoRecuperar.value = 1;
}
</script>

<template>
  <div class="auth-card">
    <div class="auth-tabs">
      <button type="button" :class="['auth-tab', { 'is-active': modo === 'login' }]" @click="modo = 'login'; limpiarMensajes()">Iniciar sesión</button>
      <button type="button" :class="['auth-tab', { 'is-active': modo === 'registro' }]" @click="modo = 'registro'; limpiarMensajes()">Crear cuenta</button>
      <button type="button" :class="['auth-tab', { 'is-active': modo === 'recuperar' }]" @click="irARecuperar">Recuperar</button>
    </div>

    <div v-if="error" class="auth-alert auth-alert--error">{{ error }}</div>
    <div v-if="exito" class="auth-alert auth-alert--exito">{{ exito }}</div>

    <!-- Iniciar sesión -->
    <form v-if="modo === 'login'" class="auth-form" @submit.prevent="enviarLogin">
      <div class="form-group">
        <label>Correo</label>
        <input v-model="correo" type="email" required>
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <div class="password-field">
          <input v-model="clave" :type="verClave ? 'text' : 'password'" required>
          <button type="button" :class="['password-toggle', { 'is-visible': verClave }]" @click="verClave = !verClave" :aria-label="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'" :title="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'">
            <span aria-hidden="true">👁️</span>
          </button>
        </div>
      </div>
      <div class="auth-form-row">
        <button type="button" class="auth-link" @click="irARecuperar">¿Olvidaste tu contraseña?</button>
      </div>
      <button class="btn btn-primary auth-submit" :disabled="cargando">
        {{ cargando ? 'Verificando...' : 'Iniciar sesión' }}
      </button>
    </form>

    <!-- Crear cuenta -->
    <form v-else-if="modo === 'registro'" class="auth-form" @submit.prevent="enviarRegistro">
      <div class="form-group">
        <label>Nombre completo</label>
        <input v-model="nombre" type="text" required>
      </div>
      <div class="form-group">
        <label>Correo</label>
        <input v-model="correo" type="email" required>
      </div>
      <div class="form-group">
        <label>Tipo de cuenta</label>
        <select v-model="rol" class="form-select">
          <option value="usuario">Paciente / Usuario</option>
          <option value="doctor">Doctor especialista</option>
        </select>
      </div>
      <div v-if="rol === 'doctor'" class="form-group">
        <label>Especialidad</label>
        <select v-model="especialidad" class="form-select" required>
          <option value="" disabled>Selecciona tu especialidad</option>
          <option v-for="e in ESPECIALIDADES" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <div class="password-field">
          <input v-model="clave" :type="verClaveRegistro ? 'text' : 'password'" required minlength="8">
          <button type="button" :class="['password-toggle', { 'is-visible': verClaveRegistro }]" @click="verClaveRegistro = !verClaveRegistro" :aria-label="verClaveRegistro ? 'Ocultar contraseña' : 'Mostrar contraseña'" :title="verClaveRegistro ? 'Ocultar contraseña' : 'Mostrar contraseña'">
            <span aria-hidden="true">👁️</span>
          </button>
        </div>
        <div class="password-strength" aria-hidden="true">
          <div class="password-strength-bar" :style="{ width: (fortaleza.puntuacion / 4 * 100) + '%' }" :class="`fuerza-${fortaleza.puntuacion}`"></div>
        </div>
        <span class="form-hint">{{ clave ? `Fortaleza: ${fortaleza.texto}` : 'Mínimo 8 caracteres.' }}</span>
      </div>
      <button class="btn btn-primary auth-submit" :disabled="cargando">
        {{ cargando ? 'Creando...' : 'Crear cuenta' }}
      </button>
    </form>

    <!-- Recuperar contraseña: paso 1 (pedir código) -->
    <form v-else-if="pasoRecuperar === 1" class="auth-form" @submit.prevent="pedirCodigo">
      <p class="auth-step-desc">Ingresa tu correo y te enviaremos un código de verificación de 6 dígitos.</p>
      <div class="form-group">
        <label>Correo</label>
        <input v-model="correo" type="email" required>
      </div>
      <button class="btn btn-primary auth-submit" :disabled="cargando">
        {{ cargando ? 'Enviando...' : 'Enviar código' }}
      </button>
    </form>

    <!-- Recuperar contraseña: paso 2 (código + nueva contraseña) -->
    <form v-else class="auth-form" @submit.prevent="cambiarClave">
      <div v-if="mensajeCodigoDemo" class="demo-email-box">{{ mensajeCodigoDemo }}</div>
      <div class="form-group">
        <label>Código de verificación</label>
        <input v-model="codigo" type="text" inputmode="numeric" maxlength="6" required>
      </div>
      <div class="form-group">
        <label>Nueva contraseña</label>
        <div class="password-field">
          <input v-model="nuevaClave" :type="verNuevaClave ? 'text' : 'password'" required minlength="8">
          <button type="button" :class="['password-toggle', { 'is-visible': verNuevaClave }]" @click="verNuevaClave = !verNuevaClave" :aria-label="verNuevaClave ? 'Ocultar contraseña' : 'Mostrar contraseña'" :title="verNuevaClave ? 'Ocultar contraseña' : 'Mostrar contraseña'">
            <span aria-hidden="true">👁️</span>
          </button>
        </div>
      </div>
      <button class="btn btn-primary auth-submit" :disabled="cargando">
        {{ cargando ? 'Actualizando...' : 'Cambiar contraseña' }}
      </button>
    </form>
  </div>
</template>
