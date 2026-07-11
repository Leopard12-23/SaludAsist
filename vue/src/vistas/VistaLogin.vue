<!-- VistaLogin.vue — pantalla de inicio de sesión y registro (contra Supabase Auth) -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { rutaInicioPorRol } from '../router';
import {
  iniciarSesion, registrar, correoValido, evaluarFortaleza, ESPECIALIDADES, type Rol,
} from '../almacenamiento/cuentas-usuarios';

const router = useRouter();

const modo = ref<'login' | 'registro'>('login');
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

// Controla si cada campo de contraseña se muestra en texto plano o oculto (••••).
const verClave = ref(false);
const verClaveRegistro = ref(false);

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
</script>

<template>
  <div class="auth-card">
    <div class="auth-tabs">
      <button type="button" :class="['auth-tab', { 'is-active': modo === 'login' }]" @click="modo = 'login'; limpiarMensajes()">Iniciar sesión</button>
      <button type="button" :class="['auth-tab', { 'is-active': modo === 'registro' }]" @click="modo = 'registro'; limpiarMensajes()">Crear cuenta</button>
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
      <button class="btn btn-primary auth-submit" :disabled="cargando">
        {{ cargando ? 'Verificando...' : 'Iniciar sesión' }}
      </button>
    </form>

    <!-- Crear cuenta -->
    <form v-else class="auth-form" @submit.prevent="enviarRegistro">
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
  </div>
</template>
