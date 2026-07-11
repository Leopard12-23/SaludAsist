<!-- VistaPrivacidad.vue — Política de Privacidad (contenido real) -->
<script setup lang="ts">
</script>

<template>
  <section class="container" style="padding:50px 20px; max-width:800px; margin:0 auto;">
    <router-link to="/login" class="auth-link">← Volver</router-link>
    <h1 style="margin-top:16px;">Política de Privacidad</h1>
    <p class="section-lead">Última actualización: julio de 2026.</p>

    <h3>1. Dónde se guardan tus datos</h3>
    <p>SaludAsist <strong>no tiene servidor ni base de datos remota</strong>. Todo lo que ingresás (cuenta, síntomas, historial, notas) se guarda únicamente en el almacenamiento local (<code>localStorage</code>) de tu propio navegador. Nada se envía a internet.</p>

    <h3>2. Qué información se guarda</h3>
    <ul>
      <li>Nombre y correo electrónico (para tu cuenta).</li>
      <li>Contraseña, siempre como un <em>hash</em> irreversible — nunca en texto plano.</li>
      <li>Los síntomas que marcás y los resultados de cada evaluación.</li>
      <li>Si sos doctor, las notas clínicas que escribís sobre tus pacientes asignados.</li>
    </ul>

    <h3>3. Con quién se comparte</h3>
    <p>Con nadie. No hay terceros, no hay analítica externa, no hay publicidad, no hay cookies de rastreo. Al ser todo local, ni siquiera nosotros (los desarrolladores) tenemos acceso a tus datos.</p>

    <h3>4. Tus derechos sobre tus datos</h3>
    <p>Como todo vive en tu navegador, tenés control total: podés borrar tu historial individualmente, o borrar TODOS los datos de la app desde el panel de administrador. Si borrás el navegador o el almacenamiento local, los datos desaparecen de forma permanente (por eso existe la opción de respaldo/exportar).</p>

    <h3>5. Límite honesto de esta política</h3>
    <p>Que los datos sean "locales" no los hace invulnerables: cualquier persona con acceso físico o técnico a tu dispositivo podría inspeccionarlos. Evitá usar esta app en computadoras compartidas o públicas si te preocupa la privacidad de tu información de salud.</p>
  </section>
</template>
