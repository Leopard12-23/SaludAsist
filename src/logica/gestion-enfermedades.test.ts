// gestion-enfermedades.test.ts — prueba que el catálogo de enfermedades
// sea realmente editable (agregar, editar, borrar, restaurar), y que el
// motor de diagnóstico use esos cambios de inmediato.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  obtenerCatalogo, agregarEnfermedad, editarEnfermedad, eliminarEnfermedad, restaurarCatalogoOriginal,
} from './gestion-enfermedades';
import { CATALOGO_BASE } from './catalogo-enfermedades';
import { evaluarSintomas } from './motor-diagnostico';

beforeEach(() => {
  localStorage.clear();
});

describe('obtenerCatalogo', () => {
  it('la primera vez arma el catálogo a partir de las 29 reglas base', () => {
    const catalogo = obtenerCatalogo();
    expect(catalogo.length).toBe(CATALOGO_BASE.length);
  });

  it('cada enfermedad del catálogo tiene un id único', () => {
    const catalogo = obtenerCatalogo();
    const ids = new Set(catalogo.map(r => r.id));
    expect(ids.size).toBe(catalogo.length);
  });
});

describe('agregarEnfermedad', () => {
  it('agrega una enfermedad nueva y queda disponible para el motor de diagnóstico', () => {
    const totalAntes = obtenerCatalogo().length;
    agregarEnfermedad({
      enfermedad: 'Enfermedad de Prueba',
      gravedad: 'leve',
      derivacion: 'Médico General',
      descripcion: 'Una enfermedad inventada para el test.',
      probabilidadBase: 70,
      requeridos: ['sintoma-de-prueba'],
      opcionales: [],
      recomendaciones: ['Descansar.'],
    });

    const catalogo = obtenerCatalogo();
    expect(catalogo.length).toBe(totalAntes + 1);

    const resultado = evaluarSintomas(['sintoma-de-prueba']);
    expect(resultado[0].enfermedad).toBe('Enfermedad de Prueba');
  });
});

describe('editarEnfermedad', () => {
  it('actualiza los datos sin cambiar el id ni la cantidad de enfermedades', () => {
    const catalogo = obtenerCatalogo();
    const primera = catalogo[0];
    const totalAntes = catalogo.length;

    editarEnfermedad(primera.id, { ...primera, enfermedad: 'Nombre Editado' });

    const catalogoActualizado = obtenerCatalogo();
    expect(catalogoActualizado.length).toBe(totalAntes);
    expect(catalogoActualizado.find(r => r.id === primera.id)?.enfermedad).toBe('Nombre Editado');
  });
});

describe('eliminarEnfermedad', () => {
  it('borra la enfermedad indicada y ninguna otra', () => {
    const catalogo = obtenerCatalogo();
    const totalAntes = catalogo.length;
    const idABorrar = catalogo[0].id;

    eliminarEnfermedad(idABorrar);

    const catalogoActualizado = obtenerCatalogo();
    expect(catalogoActualizado.length).toBe(totalAntes - 1);
    expect(catalogoActualizado.find(r => r.id === idABorrar)).toBeUndefined();
  });
});

describe('restaurarCatalogoOriginal', () => {
  it('descarta los cambios y vuelve a las 29 enfermedades originales', () => {
    agregarEnfermedad({
      enfermedad: 'Temporal', gravedad: 'leve', derivacion: 'X', descripcion: '',
      probabilidadBase: 50, requeridos: ['x'], opcionales: [], recomendaciones: [],
    });
    expect(obtenerCatalogo().length).toBe(CATALOGO_BASE.length + 1);

    restaurarCatalogoOriginal();

    expect(obtenerCatalogo().length).toBe(CATALOGO_BASE.length);
  });
});
