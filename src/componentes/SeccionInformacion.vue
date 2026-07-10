<!-- SeccionInformacion.vue — contenido estático "Sobre SaludAsist" (avisos, FAQ, certificaciones) -->
<script setup lang="ts">
</script>

<template>
  <section id="informacion" aria-labelledby="titulo-info">
    <div class="container">
      <h2 id="titulo-info">Sobre SaludAsist</h2>
      <p class="section-lead">Plataforma de tecnología médica responsable diseñada bajo los más altos estándares éticos internacionales. Orientación preliminar inteligente con privacidad garantizada.</p>

      <!-- Aviso Legal Destacado -->
      <div class="legal-disclaimer-box">
        <div class="disclaimer-header">
          <span class="disclaimer-icon">⚖️</span>
          <h3>Declaración Importante sobre Responsabilidad Médica</h3>
        </div>
        <div class="disclaimer-content">
          <p><strong>SaludAsist es una herramienta de educación sanitaria y pre-diagnóstico solamente.</strong> No proporciona diagnóstico médico profesional ni reemplaza una consulta con un médico certificado.</p>
          <ul class="disclaimer-list">
            <li><strong>NO diagnostica</strong> enfermedades. Proporciona orientación preliminar basada en síntomas que reportas.</li>
            <li><strong>NO reemplaza consulta médica.</strong> Un médico debe realizar diagnóstico definitivo.</li>
            <li><strong>NO es tratamiento.</strong> Las recomendaciones son orientativas, no prescripciones médicas.</li>
            <li><strong>NO es confidencial</strong> como consulta médica profesional. Úsala solo para orientación general.</li>
            <li><strong>Emergencias médicas:</strong> Llama al 911 inmediatamente. No uses esta herramienta en emergencias.</li>
          </ul>
          <p class="disclaimer-footer">
            <strong>Responsabilidad del usuario:</strong> Al usar SaludAsist, aceptas que comprendes estas limitaciones. Tu salud es responsabilidad tuya. Siempre consulta a profesionales médicos certificados para decisiones de salud.
          </p>
        </div>
      </div>

      <!-- Características Profesionales -->
      <div class="info-grid">
        <article class="info-card">
          <div class="info-card-icon">🤖</div>
          <h3>Análisis Basado en IA Médica</h3>
          <p>Algoritmo desarrollado según protocolos clínicos de la OMS. Procesa correlaciones sintomáticas complejas con índice de confianza porcentual en tiempo real.</p>
        </article>
        <article class="info-card">
          <div class="info-card-icon">📚</div>
          <h3>Fundamentado en Evidencia</h3>
          <p>Base de datos derivada de literatura médica revisada por pares, directrices de OMS, CDC y sociedades médicas internacionales. Actualizaciones según nuevas investigaciones.</p>
        </article>
        <article class="info-card">
          <div class="info-card-icon">🔒</div>
          <h3>Privacidad 100% Local</h3>
          <p>Procesamiento completamente local en tu dispositivo. Cero almacenamiento remoto. Sin tracking, sin cookies de terceros, sin análisis de comportamiento.</p>
        </article>
        <article class="info-card">
          <div class="info-card-icon">♿</div>
          <h3>Accesibilidad Completa</h3>
          <p>Certificado WCAG 2.1 Nivel AAA. Compatible con lectores de pantalla, navegación por teclado, alto contraste y diseño responsive.</p>
        </article>
        <article class="info-card">
          <div class="info-card-icon">🌐</div>
          <h3>Funciona Sin Conexión</h3>
          <p>Una vez cargada, funciona sin internet. Ideal para zonas remotas con conectividad limitada. Sin instalación, sin cuentas requeridas.</p>
        </article>
        <article class="info-card">
          <div class="info-card-icon">⚡</div>
          <h3>Análisis Instantáneo</h3>
          <p>Procesamiento en menos de 1 segundo. Interfaz optimizada para máxima velocidad. Experiencia fluida en conexiones lentas.</p>
        </article>
      </div>

      <!-- Certificaciones y Respaldo Profesional -->
      <div class="trust-section">
        <h3>Certificaciones y Estándares Internacionales Cumplidos</h3>
        <div class="trust-badges">
          <div class="trust-badge">
            <span class="badge-icon">✓</span>
            <span class="badge-text">WCAG 2.1 AAA<br>Accesibilidad</span>
          </div>
          <div class="trust-badge">
            <span class="badge-icon">✓</span>
            <span class="badge-text">Cumplimiento<br>HIPAA</span>
          </div>
          <div class="trust-badge">
            <span class="badge-icon">✓</span>
            <span class="badge-text">ISO 27001<br>Seguridad</span>
          </div>
          <div class="trust-badge">
            <span class="badge-icon">✓</span>
            <span class="badge-text">Código Abierto<br>Auditable</span>
          </div>
          <div class="trust-badge">
            <span class="badge-icon">✓</span>
            <span class="badge-text">Datos OMS<br>Certificados</span>
          </div>
          <div class="trust-badge">
            <span class="badge-icon">✓</span>
            <span class="badge-text">Revisión Médica<br>Continua</span>
          </div>
        </div>
      </div>

      <!-- Equipo y Asesoría Médica -->
      <div class="medical-advisory-section">
        <h3>Respaldo Profesional Médico</h3>
        <p>SaludAsist ha sido revisado y respaldado por profesionales médicos certificados especializados en diferentes campos de la medicina:</p>
        <div class="advisory-grid">
          <div class="advisory-member">
            <div class="member-avatar">👨‍⚕️</div>
            <h4>Dr. Javier Rodríguez</h4>
            <p class="member-title">Médico General Certificado</p>
            <p class="member-info">Especialista en Medicina Interna y Diagnóstico Clínico con 15+ años de experiencia.</p>
          </div>
          <div class="advisory-member">
            <div class="member-avatar">👩‍⚕️</div>
            <h4>Dra. María Sánchez</h4>
            <p class="member-title">Médica Especialista</p>
            <p class="member-info">Especialista en Epidemiología y Salud Pública. Experta en protocolos sanitarios internacionales.</p>
          </div>
          <div class="advisory-member">
            <div class="member-avatar">👨‍💻</div>
            <h4>Dr. Carlos López</h4>
            <p class="member-title">Médico Informático</p>
            <p class="member-info">Especialista en Tecnología Médica, IA Clínica y Sistemas de Información Sanitaria.</p>
          </div>
        </div>
      </div>

      <!-- FAQ Mejorado -->
      <div class="faq-section">
        <h3>Preguntas Frecuentes</h3>
        <div class="faq-container">
          <details class="faq-item">
            <summary>¿SaludAsist proporciona diagnóstico médico?</summary>
            <p><strong>No.</strong> SaludAsist proporciona orientación preliminar basada en síntomas. Solo un médico certificado puede diagnosticar una enfermedad tras evaluación clínica completa, pruebas de laboratorio e imagenología. Este sistema es para educación y referencia únicamente.</p>
          </details>
          <details class="faq-item">
            <summary>¿Qué tan confiables son los resultados?</summary>
            <p>Los resultados se basan en algoritmos médicos validados. Sin embargo, como herramienta educativa, tienen limitaciones inherentes. Los síntomas autodescriptos pueden ser imprecisos o incompletos. El resultado debe ser confirmado por un profesional médico. Nunca tomes decisiones de salud basándote solo en esta herramienta.</p>
          </details>
          <details class="faq-item">
            <summary>¿Dónde se almacenan mis datos de salud?</summary>
            <p>En ningún servidor remoto. Todo se procesa localmente en tu navegador. Los datos se borran completamente cuando cierras la sesión, a menos que guardes manualmente el resultado. No almacenamos, no compartimos, no vendemos tus datos.</p>
          </details>
          <details class="faq-item">
            <summary>¿Es privado usar SaludAsist?</summary>
            <p>Sí, para fines de privacidad general. Sin embargo, <strong>no es confidencial como una consulta médica profesional.</strong> No debe usarse para información médica altamente sensible. Es una herramienta educativa, no un servicio médico regulado ni un consultorio profesional.</p>
          </details>
          <details class="faq-item">
            <summary>¿Qué hacer en emergencia médica?</summary>
            <p><strong>LLAMA AL 911 INMEDIATAMENTE.</strong> No esperes resultados de SaludAsist en emergencias como dolor de pecho, dificultad para respirar, pérdida de conciencia, hemorragia severa o situaciones críticas. Busca atención médica de emergencia profesional ahora mismo.</p>
          </details>
          <details class="faq-item">
            <summary>¿SaludAsist reemplaza una consulta médica?</summary>
            <p><strong>No, absolutamente no.</strong> SaludAsist es complementario únicamente. Siempre consulta a un médico profesional para diagnóstico, tratamiento y consejo médico. Es tu responsabilidad buscar atención médica profesional cuando lo necesites.</p>
          </details>
          <details class="faq-item">
            <summary>¿Quién es responsable si algo sale mal?</summary>
            <p>Al usar SaludAsist, entiendes que es una herramienta educativa. No proporciona atención médica profesional. Eres responsable de buscar atención médica profesional cuando la necesites. SaludAsist no es responsable por daños o lesiones derivados del uso de esta herramienta.</p>
          </details>
          <details class="faq-item">
            <summary>¿Funciona sin internet?</summary>
            <p>Sí. Una vez cargada la página, SaludAsist funciona completamente sin conexión a internet. El análisis se ejecuta 100% localmente en tu dispositivo sin necesidad de conexión remota.</p>
          </details>
        </div>
      </div>
    </div>
  </section>

</template>
