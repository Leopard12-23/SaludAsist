// gestion-categorias.test.ts — prueba que el menú de síntomas sea
// realmente editable (agregar/borrar categorías y síntomas).
import { describe, it, expect, beforeEach } from 'vitest';
import {
  obtenerCategorias, agregarCategoria, eliminarCategoria,
  agregarSintoma, eliminarSintoma, restaurarCategoriasOriginales,
} from './gestion-categorias';
import { CATEGORIAS_BASE } from './categorias';

beforeEach(() => {
  localStorage.clear();
});

describe('obtenerCategorias', () => {
  it('la primera vez arma las categorías a partir de la semilla original', () => {
    expect(obtenerCategorias().length).toBe(CATEGORIAS_BASE.length);
  });
});

describe('agregarCategoria', () => {
  it('agrega una categoría nueva, vacía, al final de la lista', () => {
    const totalAntes = obtenerCategorias().length;
    agregarCategoria('Salud dental', '🦷');

    const categorias = obtenerCategorias();
    expect(categorias.length).toBe(totalAntes + 1);
    expect(categorias.at(-1)?.nombre).toBe('Salud dental');
    expect(categorias.at(-1)?.sintomas).toEqual([]);
  });
});

describe('eliminarCategoria', () => {
  it('borra la categoría indicada y ninguna otra', () => {
    const totalAntes = obtenerCategorias().length;
    const idABorrar = obtenerCategorias()[0].id;

    eliminarCategoria(idABorrar);

    const categorias = obtenerCategorias();
    expect(categorias.length).toBe(totalAntes - 1);
    expect(categorias.find(c => c.id === idABorrar)).toBeUndefined();
  });
});

describe('agregarSintoma / eliminarSintoma', () => {
  it('agrega un síntoma nuevo a una categoría existente', () => {
    agregarCategoria('Salud dental', '🦷');
    const categoria = obtenerCategorias().at(-1)!;

    const nuevo = agregarSintoma(categoria.id, 'Dolor de muela');
    expect(nuevo?.valor).toBe('dolor-de-muela'); // se genera sin tildes ni espacios

    const categoriaActualizada = obtenerCategorias().find(c => c.id === categoria.id);
    expect(categoriaActualizada?.sintomas).toHaveLength(1);
  });

  it('quita un síntoma sin afectar a los demás', () => {
    agregarCategoria('Salud dental', '🦷');
    const categoria = obtenerCategorias().at(-1)!;
    agregarSintoma(categoria.id, 'Dolor de muela');
    agregarSintoma(categoria.id, 'Sangrado de encías');

    eliminarSintoma(categoria.id, 'dolor-de-muela');

    const actualizada = obtenerCategorias().find(c => c.id === categoria.id);
    expect(actualizada?.sintomas).toHaveLength(1);
    expect(actualizada?.sintomas[0].valor).toBe('sangrado-de-encias');
  });
});

describe('restaurarCategoriasOriginales', () => {
  it('descarta los cambios y vuelve a la semilla original', () => {
    agregarCategoria('Categoría Temporal', '🧪');
    expect(obtenerCategorias().length).toBe(CATEGORIAS_BASE.length + 1);

    restaurarCategoriasOriginales();

    expect(obtenerCategorias().length).toBe(CATEGORIAS_BASE.length);
  });
});
