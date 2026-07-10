// main.ts — la contenedora. Su única responsabilidad: el login real
// contra Supabase y un menú que carga cada módulo (Vue, Angular) en un
// iframe. Al vivir los tres bajo el mismo origen, comparten localStorage:
// ese es todo el secreto de la "sesión única" que pide el instructivo.
import { supabase } from './supabaseClient';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

function vistaLogin(mensajeError = ''): void {
  app.innerHTML = `
    <main class="login-wrap">
      <div class="login-card">
        <h1>🩺 SaludAsist</h1>
        <p class="subt">Inicia sesión para entrar al sistema (Vue + Angular integrados).</p>
        ${mensajeError ? `<p class="error">${mensajeError}</p>` : ''}
        <form id="form-login">
          <label>Correo<input type="email" id="correo" required autocomplete="username"></label>
          <label>Contraseña<input type="password" id="clave" required autocomplete="current-password"></label>
          <button type="submit">Iniciar sesión</button>
        </form>
        <p class="hint">Cuentas demo: admin@saludasist.com · doctor@saludasist.com · paciente@saludasist.com</p>
      </div>
    </main>
  `;

  document.querySelector<HTMLFormElement>('#form-login')!.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const correo = (document.querySelector<HTMLInputElement>('#correo')!).value.trim().toLowerCase();
    const clave = (document.querySelector<HTMLInputElement>('#clave')!).value;

    const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password: clave });
    if (error || !data.session) { vistaLogin('Correo o contraseña incorrectos.'); return; }

    // token/usuario en localStorage: lo que el instructivo pide como
    // "sesión compartida" explícita (además de la sesión que supabase-js
    // ya comparte por sí solo al vivir los módulos bajo el mismo origen).
    localStorage.setItem('token', data.session.access_token);
    localStorage.setItem('usuario', correo);
    vistaMenu(correo);
  });
}

function vistaMenu(correo: string): void {
  app.innerHTML = `
    <div class="shell">
      <nav class="shell-nav">
        <strong>🩺 SaludAsist</strong>
        <div class="shell-botones">
          <button type="button" data-src="/vue/">Módulo Vue</button>
          <button type="button" data-src="/angular/">Módulo Angular</button>
        </div>
        <div class="shell-usuario">
          <span>${correo}</span>
          <button type="button" id="btn-salir">Salir</button>
        </div>
      </nav>
      <iframe id="marco" src="/vue/" title="Módulo activo"></iframe>
    </div>
  `;

  const marco = document.querySelector<HTMLIFrameElement>('#marco')!;
  document.querySelectorAll<HTMLButtonElement>('.shell-botones button').forEach((boton) => {
    boton.addEventListener('click', () => { marco.src = boton.dataset.src ?? '/vue/'; });
  });

  document.querySelector<HTMLButtonElement>('#btn-salir')!.addEventListener('click', async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    vistaLogin();
  });
}

// Al arrancar: si ya hay sesión de Supabase activa (recarga de página),
// se va directo al menú sin pedir login de nuevo.
async function arrancar(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    const correo = localStorage.getItem('usuario') ?? data.session.user.email ?? '';
    vistaMenu(correo);
  } else {
    vistaLogin();
  }
}

void arrancar();
