// categorias.ts — el "menú" de fábrica: cada categoría es una
// enfermedad/área principal, y sus síntomas son las "enfermedades
// derivadas" que se despliegan al marcarla.
//
// Esta es solo la SEMILLA inicial: el administrador puede agregar
// categorías o síntomas nuevos desde la interfaz (ver
// logica/gestion-categorias.ts), sin tocar este archivo.
import type { Categoria } from '../tipos/tipos';

export const CATEGORIAS_BASE: Categoria[] = [
  {
    id: 'respiratorio', nombre: 'Respiratorio', icono: '🫁',
    sintomas: [
      { valor: 'tos', etiqueta: '😮‍💨 Tos' },
      { valor: 'dificultad-respirar', etiqueta: '💨 Dificultad para respirar' },
      { valor: 'congestion-nasal', etiqueta: '🤧 Congestión nasal' },
      { valor: 'dolor-garganta', etiqueta: '🗣️ Dolor de garganta' },
      { valor: 'silbido-respirar', etiqueta: '🎵 Silbido al respirar' },
      { valor: 'estornudos', etiqueta: '🤧 Estornudos frecuentes' },
    ],
  },
  {
    id: 'sistemico', nombre: 'General / Sistémico', icono: '🌡️',
    sintomas: [
      { valor: 'fiebre', etiqueta: '🤒 Fiebre' },
      { valor: 'escalofrios', etiqueta: '🥶 Escalofríos' },
      { valor: 'cansancio', etiqueta: '😴 Cansancio extremo' },
      { valor: 'dolor-corporal', etiqueta: '🦴 Dolor corporal generalizado' },
      { valor: 'sudoracion-nocturna', etiqueta: '💦 Sudoración nocturna' },
      { valor: 'perdida-peso', etiqueta: '⚖️ Pérdida de peso sin causa aparente' },
      { valor: 'perdida-apetito', etiqueta: '🍽️ Pérdida de apetito' },
    ],
  },
  {
    id: 'neurologico', nombre: 'Neurológico', icono: '🧠',
    sintomas: [
      { valor: 'dolor-cabeza', etiqueta: '🧠 Dolor de cabeza' },
      { valor: 'vision-borrosa', etiqueta: '👀 Visión borrosa' },
      { valor: 'mareos', etiqueta: '💫 Mareos / vértigo' },
      { valor: 'perdida-conocimiento', etiqueta: '😵 Pérdida del conocimiento' },
      { valor: 'hormigueo', etiqueta: '⚡ Hormigueo en extremidades' },
      { valor: 'debilidad-lado', etiqueta: '🚨 Debilidad repentina en un lado del cuerpo' },
      { valor: 'dificultad-hablar', etiqueta: '🚨 Dificultad repentina para hablar' },
    ],
  },
  {
    id: 'digestivo', nombre: 'Digestivo', icono: '🫃',
    sintomas: [
      { valor: 'nauseas', etiqueta: '🤢 Náuseas' },
      { valor: 'vomito', etiqueta: '🤮 Vómito' },
      { valor: 'diarrea', etiqueta: '🚽 Diarrea' },
      { valor: 'dolor-abdominal', etiqueta: '🫃 Dolor abdominal' },
      { valor: 'acidez', etiqueta: '🔥 Acidez o ardor estomacal' },
      { valor: 'estrenimiento', etiqueta: '🚫 Estreñimiento' },
    ],
  },
  {
    id: 'cardiovascular', nombre: 'Cardiovascular', icono: '❤️',
    sintomas: [
      { valor: 'dolor-pecho', etiqueta: '💔 Dolor de pecho' },
      { valor: 'palpitaciones', etiqueta: '💓 Palpitaciones' },
      { valor: 'hinchazon-piernas', etiqueta: '🦵 Hinchazón en piernas' },
      { valor: 'labios-azulados', etiqueta: '🚨 Labios o dedos azulados' },
    ],
  },
  {
    id: 'piel', nombre: 'Piel', icono: '💆',
    sintomas: [
      { valor: 'sarpullido', etiqueta: '🔴 Sarpullido o ronchas' },
      { valor: 'picazon', etiqueta: '🤚 Picazón generalizada' },
      { valor: 'piel-amarilla', etiqueta: '🟡 Piel amarillenta' },
      { valor: 'hinchazon-cara-labios', etiqueta: '🚨 Hinchazón repentina de cara o labios' },
      { valor: 'moretones-faciles', etiqueta: '🟣 Moretones que aparecen con facilidad' },
    ],
  },
  {
    id: 'musculoesqueletico', nombre: 'Músculos y articulaciones', icono: '🦴',
    sintomas: [
      { valor: 'dolor-articular', etiqueta: '🦴 Dolor articular' },
      { valor: 'rigidez-articular', etiqueta: '🕗 Rigidez (sobre todo en la mañana)' },
      { valor: 'debilidad-muscular', etiqueta: '💪 Debilidad muscular' },
      { valor: 'dolor-espalda', etiqueta: '🔙 Dolor de espalda o lumbar' },
    ],
  },
  {
    id: 'oidos-ojos', nombre: 'Oídos y ojos', icono: '👂',
    sintomas: [
      { valor: 'dolor-oido', etiqueta: '👂 Dolor de oído' },
      { valor: 'perdida-audicion', etiqueta: '🔇 Pérdida de audición' },
      { valor: 'ojos-rojos', etiqueta: '👁️ Ojos rojos o irritados' },
      { valor: 'secrecion-ocular', etiqueta: '💧 Secreción o legañas en los ojos' },
    ],
  },
  {
    id: 'urinario', nombre: 'Urinario', icono: '🚻',
    sintomas: [
      { valor: 'dolor-orinar', etiqueta: '🔥 Ardor o dolor al orinar' },
      { valor: 'orina-frecuente', etiqueta: '🚻 Necesidad frecuente de orinar' },
      { valor: 'sangre-orina', etiqueta: '🩸 Sangre en la orina' },
      { valor: 'dolor-costado', etiqueta: '🫲 Dolor en el costado o zona lumbar baja' },
    ],
  },
  {
    id: 'animo', nombre: 'Ánimo y sueño', icono: '🧘',
    sintomas: [
      { valor: 'ansiedad', etiqueta: '😟 Ansiedad o nerviosismo constante' },
      { valor: 'animo-bajo', etiqueta: '😔 Tristeza o desánimo persistente' },
      { valor: 'insomnio', etiqueta: '🌙 Dificultad para dormir' },
      { valor: 'estres', etiqueta: '😣 Estrés que afecta tu día a día' },
    ],
  },
];
