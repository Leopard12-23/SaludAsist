<!-- PiePagina.vue — footer con marca, links legales y aviso médico -->
<script setup lang="ts">
</script>

<template>
  <footer role="contentinfo">
    <div class="footer-content">
      <div class="footer-main">
        <div class="footer-brand">
          <h4>SaludAsist</h4>
          <p>Herramienta educativa de pre-diagnóstico médico con IA. Backend seguro con Supabase (autenticación real y RLS).</p>
          <p class="footer-year">&copy; 2026 SaludAsist — Hecho con ❤️ en Manta, Ecuador</p>
        </div>
        <div class="footer-links">
          <h4>Legal</h4>
          <ul>
            <li><router-link to="/terminos">Términos de Servicio</router-link></li>
            <li><router-link to="/privacidad">Política de Privacidad</router-link></li>
            <li><router-link to="/legal">Aviso Legal</router-link></li>
          </ul>
        </div>
      </div>

      <div class="footer-disclaimer">
        <strong>⚠️ Aviso Importante:</strong> SaludAsist NO proporciona diagnóstico médico. Es una herramienta educativa únicamente. No reemplaza consulta con profesional de salud. En emergencia médica: llama al 911 inmediatamente.
      </div>

      <div class="footer-bottom">
        <p>🔒 Autenticación real • 🌐 Backend compartido (Supabase) • 🛡️ RLS activado</p>
        <p class="footer-version">v2.0.0 (Vue) | Julio 2026</p>
      </div>
    </div>
  </footer>
</template>
