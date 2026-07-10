<!-- SeccionContacto.vue — formulario de contacto con validación reactiva -->
<script setup lang="ts">
import { ref, reactive } from 'vue';

const enviado = ref(false);

const campos = reactive({ nombre: '', correo: '', asunto: '', mensaje: '' });
// Guarda el mensaje de error de cada campo (vacío = sin error).
const errores = reactive({ nombre: '', correo: '', asunto: '', mensaje: '' });

const correoValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Valida un campo puntual al perder el foco (blur).
function validar(campo: keyof typeof campos): void {
  const valor = campos[campo].trim();
  if (!valor) { errores[campo] = 'Este campo es obligatorio.'; return; }
  if (campo === 'correo' && !correoValido(valor)) { errores[campo] = 'Ingresa un correo válido.'; return; }
  if (campo === 'mensaje' && valor.length < 10) { errores[campo] = 'El mensaje debe tener al menos 10 caracteres.'; return; }
  errores[campo] = '';
}

function enviar(): void {
  (Object.keys(campos) as (keyof typeof campos)[]).forEach(validar);
  const hayErrores = Object.values(errores).some(e => e !== '');
  if (!hayErrores) enviado.value = true;
}
</script>

<template>
  <section id="contacto" class="section" role="region" aria-labelledby="titulo-contacto">
    <div class="container">
      <div class="contact-header-clean">
        <h2 id="titulo-contacto">Contacto y Soporte</h2>
        <p class="section-lead">¿Preguntas o sugerencias? Estamos aquí para ayudarte.</p>
      </div>

      <div class="contact-methods-clean" role="list">
        <div class="contact-item" role="listitem">
          <div class="contact-item-header"><span class="contact-icon">📧</span><h3>Por Correo Electrónico</h3></div>
          <p>Para consultas generales y soporte técnico</p>
          <a href="mailto:soporte@saludasist.com" class="contact-link">soporte@saludasist.com</a>
        </div>
        <div class="contact-item" role="listitem">
          <div class="contact-item-header"><span class="contact-icon">🚨</span><h3>Emergencias Médicas</h3></div>
          <p>Si es una emergencia médica, no uses este sitio.</p>
          <a href="tel:911" class="contact-link emergency">Llamar 911 inmediatamente</a>
        </div>
      </div>

      <div class="contact-form-wrapper">
        <div v-if="enviado" class="form-success" role="alert" style="text-align:center;padding:40px;">
          <span style="font-size:3rem">✅</span>
          <h3>¡Mensaje enviado!</h3>
          <p>Gracias por contactarnos. Te responderemos pronto.</p>
        </div>

        <form v-else class="contact-form-clean" novalidate @submit.prevent="enviar">
          <fieldset>
            <legend class="form-legend">Cuéntanos cómo podemos ayudarte</legend>

            <div class="form-group">
              <label for="nombre-contacto">Nombre</label>
              <input id="nombre-contacto" v-model="campos.nombre" type="text" required @blur="validar('nombre')">
              <span v-if="errores.nombre" class="field-error" role="alert">{{ errores.nombre }}</span>
            </div>

            <div class="form-group">
              <label for="correo-contacto">Correo Electrónico</label>
              <input id="correo-contacto" v-model="campos.correo" type="email" required @blur="validar('correo')">
              <span v-if="errores.correo" class="field-error" role="alert">{{ errores.correo }}</span>
            </div>

            <div class="form-group">
              <label for="asunto-contacto">Asunto</label>
              <select id="asunto-contacto" v-model="campos.asunto" required @blur="validar('asunto')">
                <option value="">Selecciona un asunto...</option>
                <option value="soporte">Soporte Técnico</option>
                <option value="sugerencia">Sugerencia de Mejora</option>
                <option value="accesibilidad">Accesibilidad</option>
                <option value="privacidad">Privacidad y Seguridad</option>
                <option value="otro">Otro</option>
              </select>
              <span v-if="errores.asunto" class="field-error" role="alert">{{ errores.asunto }}</span>
            </div>

            <div class="form-group">
              <label for="mensaje-contacto">Mensaje</label>
              <textarea id="mensaje-contacto" v-model="campos.mensaje" rows="5" required @blur="validar('mensaje')"></textarea>
              <span v-if="errores.mensaje" class="field-error" role="alert">{{ errores.mensaje }}</span>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Enviar Mensaje</button>
              <button type="button" class="btn btn-secondary" @click="Object.assign(campos, { nombre: '', correo: '', asunto: '', mensaje: '' })">Limpiar</button>
            </div>
          </fieldset>
        </form>
      </div>

      <div class="contact-info-section">
        <h3>Sobre tu privacidad</h3>
        <p>SaludAsist procesa todos los datos <strong>localmente en tu dispositivo</strong>, sin enviarlos a servidores externos.</p>
        <p><strong>⚠️ Recordatorio:</strong> Este formulario no reemplaza una consulta médica. En emergencia, llama al 911.</p>
      </div>
    </div>
  </section>
</template>
