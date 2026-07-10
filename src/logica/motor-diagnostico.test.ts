// motor-diagnostico.test.ts — prueba que el motor elija bien la enfermedad
// según los síntomas marcados. Es lógica pura (sin localStorage ni red),
// así que es la más fácil e importante de testear: si alguien cambia una
// regla del catálogo sin querer romper otra, estos tests deberían avisar.
import { describe, it, expect } from 'vitest';
import { evaluarSintomas } from './motor-diagnostico';

describe('evaluarSintomas', () => {
  it('devuelve una lista vacía si no hay síntomas marcados', () => {
    expect(evaluarSintomas([])).toEqual([]);
  });

  it('devuelve una lista vacía si los síntomas no coinciden con ninguna regla', () => {
    // "tos" solo no alcanza para ninguna regla que exija más síntomas juntos.
    const resultado = evaluarSintomas(['sintoma-inventado-que-no-existe']);
    expect(resultado).toEqual([]);
  });

  it('detecta la emergencia de posible infarto cuando hay dolor de pecho + dificultad para respirar', () => {
    const resultado = evaluarSintomas(['dolor-pecho', 'dificultad-respirar']);
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado[0].gravedad).toBe('grave');
    expect(resultado[0].enfermedad).toContain('Infarto');
  });

  it('detecta el patrón de ACV con debilidad de un lado + dificultad para hablar', () => {
    const resultado = evaluarSintomas(['debilidad-lado', 'dificultad-hablar']);
    expect(resultado[0].enfermedad).toContain('ACV');
    expect(resultado[0].gravedad).toBe('grave');
  });

  it('nunca devuelve más de 3 posibles diagnósticos', () => {
    // Marcamos muchísimos síntomas de distintas categorías a la vez.
    const muchosSintomas = [
      'tos', 'fiebre', 'dolor-cabeza', 'nauseas', 'dolor-pecho',
      'sarpullido', 'dolor-articular', 'dolor-oido', 'dolor-orinar', 'ansiedad',
    ];
    const resultado = evaluarSintomas(muchosSintomas);
    expect(resultado.length).toBeLessThanOrEqual(3);
  });

  it('ordena los resultados del más probable al menos probable', () => {
    const resultado = evaluarSintomas(['fiebre', 'tos', 'dolor-garganta', 'congestion-nasal', 'cansancio']);
    for (let i = 0; i < resultado.length - 1; i++) {
      expect(resultado[i].probabilidad).toBeGreaterThanOrEqual(resultado[i + 1].probabilidad);
    }
  });

  it('la probabilidad nunca supera 98%, sin importar cuántos síntomas opcionales coincidan', () => {
    const resultado = evaluarSintomas(['fiebre', 'tos', 'dificultad-respirar', 'dolor-corporal', 'congestion-nasal']);
    resultado.forEach(r => expect(r.probabilidad).toBeLessThanOrEqual(98));
  });

  it('la edad puede subir la probabilidad de un resultado grave en adultos mayores', () => {
    const sinEdad = evaluarSintomas(['dolor-pecho', 'dificultad-respirar'], null);
    const conEdadMayor = evaluarSintomas(['dolor-pecho', 'dificultad-respirar'], 70);
    expect(conEdadMayor[0].probabilidad).toBeGreaterThanOrEqual(sinEdad[0].probabilidad);
  });
});
