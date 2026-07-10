// tipos.ts — formas de datos que se usan en toda la app

// Un síntoma individual, ej: "tos", "fiebre".
export interface Sintoma {
  valor: string;   // identificador único, ej: "tos"
  etiqueta: string; // texto que ve el usuario, ej: "😮‍💨 Tos"
}

// Una categoría principal (ej: "Respiratorio") con sus síntomas dentro.
// Esto es el "menú dinámico": marcas la categoría y se despliegan sus síntomas.
export interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  sintomas: Sintoma[];
}

// Gravedad de un posible diagnóstico (define el color con que se muestra).
export type Gravedad = 'leve' | 'moderado' | 'grave';

// Una "enfermedad derivada": si se marcan ciertos síntomas, esta es la sugerencia.
export interface ReglaDiagnostico {
  id: string;             // identificador único, necesario para editar/borrar desde el admin
  requeridos: string[];   // TODOS estos síntomas deben estar marcados
  opcionales: string[];   // si además se marcan estos, sube la probabilidad
  enfermedad: string;
  probabilidadBase: number;
  gravedad: Gravedad;
  derivacion: string;     // a qué especialista se recomienda ir
  descripcion: string;
  recomendaciones: string[];
}

// Resultado ya calculado, listo para mostrar en pantalla.
export interface ResultadoDiagnostico {
  enfermedad: string;
  probabilidad: number;
  gravedad: Gravedad;
  derivacion: string;
  descripcion: string;
  recomendaciones: string[];
}
