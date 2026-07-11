<!-- VistaAvisoLegal.vue — Aviso Legal / Médico (contenido real) -->
<script setup lang="ts">
</script>

<template>
  <section class="container" style="padding:50px 20px; max-width:800px; margin:0 auto;">
    <router-link to="/login" class="auth-link">← Volver</router-link>
    <h1 style="margin-top:16px;">Aviso Legal y Médico</h1>

    <div class="alert alert-warning" role="note" style="margin:20px 0;">
      <strong>⚠️ Si estás viviendo una emergencia médica, cierra esta app y llama al 911 (o al número de emergencias de tu país) ahora mismo.</strong>
    </div>

    <h3>Esto no es un diagnóstico médico</h3>
    <p>Los resultados que muestra SaludAsist se generan con un motor de reglas simples que compara los síntomas que marcaste contra un catálogo predefinido. <strong>No es inteligencia artificial diagnóstica certificada, no analiza imágenes ni estudios clínicos</strong>, y su catálogo cubre motivos de consulta frecuentes — no la totalidad de enfermedades existentes.</p>

    <h3>Las notas de un doctor dentro de la app no son un historial clínico oficial</h3>
    <p>Si un doctor deja una nota sobre tu evaluación, es una observación informal dentro de esta herramienta, no un registro médico legal ni una indicación de tratamiento formal.</p>

    <h3>Consultá siempre a un profesional</h3>
    <p>Ante cualquier duda, síntoma persistente, o si la app marca un resultado de gravedad "moderada" o "grave", buscá atención médica presencial. La derivación sugerida por la app es orientativa.</p>

    <h3>Jurisdicción</h3>
    <p>Este es un proyecto educativo/de portafolio, sin una entidad legal comercial constituida al momento de esta versión.</p>
  </section>
</template>
