// cuentas-usuarios.test.ts — prueba las validaciones y el flujo de
// registro/login. Usa jsdom (ver vite.config.ts) para tener localStorage
// disponible como en un navegador real.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  correoValido, normalizarCorreo, evaluarFortaleza, registrar, iniciarSesion, resetearClave, eliminarUsuarioPermanente,
} from './cuentas-usuarios';

// Antes de cada test se limpia todo, para que un test no contamine al siguiente.
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('correoValido', () => {
  it('acepta un correo con formato normal', () => {
    expect(correoValido('persona@ejemplo.com')).toBe(true);
  });
  it('rechaza un correo sin arroba', () => {
    expect(correoValido('persona-ejemplo.com')).toBe(false);
  });
  it('rechaza un correo sin dominio', () => {
    expect(correoValido('persona@')).toBe(false);
  });
});

describe('normalizarCorreo', () => {
  it('pasa a minúsculas y recorta espacios', () => {
    expect(normalizarCorreo('  Persona@Ejemplo.COM  ')).toBe('persona@ejemplo.com');
  });
});

describe('evaluarFortaleza', () => {
  it('marca como inválida una contraseña de menos de 8 caracteres', () => {
    expect(evaluarFortaleza('abc123').valida).toBe(false);
  });
  it('da la puntuación más alta a una contraseña larga, con mayúsculas, números y símbolos', () => {
    expect(evaluarFortaleza('Contrasena123!Segura').puntuacion).toBe(4);
  });
  it('da puntuación baja a una contraseña simple, aunque cumpla el mínimo', () => {
    expect(evaluarFortaleza('abcdefgh').puntuacion).toBeLessThan(2);
  });
});

describe('registrar', () => {
  it('registra una cuenta nueva de paciente correctamente', async () => {
    const resultado = await registrar('Juan Pérez', 'juan@ejemplo.com', 'Segura123!', 'usuario');
    expect(resultado.ok).toBe(true);
  });

  it('no permite registrar dos cuentas con el mismo correo', async () => {
    await registrar('Juan Pérez', 'juan@ejemplo.com', 'Segura123!', 'usuario');
    const segundoIntento = await registrar('Otro Nombre', 'juan@ejemplo.com', 'OtraClave123!', 'usuario');
    expect(segundoIntento.ok).toBe(false);
  });

  it('no permite registrarse como administrador desde el formulario público', async () => {
    const resultado = await registrar('Alguien', 'alguien@ejemplo.com', 'Segura123!', 'administrador');
    expect(resultado.ok).toBe(false);
  });

  it('rechaza contraseñas demasiado cortas', async () => {
    const resultado = await registrar('Juan', 'juan2@ejemplo.com', '123', 'usuario');
    expect(resultado.ok).toBe(false);
  });
});

describe('iniciarSesion', () => {
  it('permite iniciar sesión con el correo y contraseña correctos', async () => {
    await registrar('Juan Pérez', 'juan@ejemplo.com', 'Segura123!', 'usuario');
    const resultado = await iniciarSesion('juan@ejemplo.com', 'Segura123!');
    expect(resultado.ok).toBe(true);
    expect(resultado.sesion?.rol).toBe('usuario');
  });

  it('rechaza una contraseña incorrecta', async () => {
    await registrar('Juan Pérez', 'juan@ejemplo.com', 'Segura123!', 'usuario');
    const resultado = await iniciarSesion('juan@ejemplo.com', 'ClaveIncorrecta1!');
    expect(resultado.ok).toBe(false);
  });

  it('bloquea la cuenta tras 5 intentos fallidos seguidos', async () => {
    await registrar('Juan Pérez', 'juan@ejemplo.com', 'Segura123!', 'usuario');
    for (let i = 0; i < 5; i++) {
      await iniciarSesion('juan@ejemplo.com', 'ClaveIncorrecta1!');
    }
    // El sexto intento, aunque la contraseña ahora sea la correcta, debe estar bloqueado.
    const resultado = await iniciarSesion('juan@ejemplo.com', 'Segura123!');
    expect(resultado.ok).toBe(false);
    expect(resultado.error).toContain('intentos');
  });
});

describe('resetearClave', () => {
  it('genera una contraseña nueva que permite iniciar sesión de inmediato', async () => {
    await registrar('Juan Pérez', 'juan@ejemplo.com', 'Segura123!', 'usuario');
    const claveTemporal = await resetearClave('juan@ejemplo.com');

    // La clave vieja ya no funciona...
    const conClaveVieja = await iniciarSesion('juan@ejemplo.com', 'Segura123!');
    expect(conClaveVieja.ok).toBe(false);

    // ...pero la nueva sí.
    const conClaveNueva = await iniciarSesion('juan@ejemplo.com', claveTemporal);
    expect(conClaveNueva.ok).toBe(true);
  });
});

describe('eliminarUsuarioPermanente', () => {
  it('borra la cuenta y ya no se puede iniciar sesión con ella', async () => {
    await registrar('Juan Pérez', 'juan@ejemplo.com', 'Segura123!', 'usuario');
    eliminarUsuarioPermanente('juan@ejemplo.com');

    const resultado = await iniciarSesion('juan@ejemplo.com', 'Segura123!');
    expect(resultado.ok).toBe(false);
  });
});
