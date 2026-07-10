// catalogo-enfermedades.ts
// 29 reglas de diagnóstico "de fábrica". Cada regla dice: "si se marcan
// estos síntomas, sugiere esta enfermedad". No es una lista de TODAS las
// enfermedades que existen (son decenas de miles); cubre los motivos de
// consulta más comunes y señales de alarma que ameritan atención urgente.
//
// Esta es solo la SEMILLA inicial: el administrador puede agregar, editar
// o borrar enfermedades desde la interfaz (ver logica/gestion-enfermedades.ts),
// y esos cambios se guardan aparte, sin tocar este archivo.
import type { ReglaDiagnostico } from '../tipos/tipos';

export const CATALOGO_BASE: Omit<ReglaDiagnostico, 'id'>[] = [

  // ══════════════════════════════════════════════════════════
  // 🚨 EMERGENCIAS — combinaciones de síntomas que ameritan
  // atención inmediata, sin importar qué otra cosa se marque.
  // ══════════════════════════════════════════════════════════
  {
    requeridos: ['dolor-pecho', 'dificultad-respirar'],
    opcionales: ['palpitaciones', 'mareos', 'cansancio', 'labios-azulados'],
    enfermedad: 'Posible Síndrome Coronario Agudo (Infarto)',
    probabilidadBase: 90,
    gravedad: 'grave',
    derivacion: '🚨 Emergencias — Cardiólogo',
    descripcion: 'La combinación de dolor de pecho con dificultad respiratoria puede indicar un evento cardíaco grave.',
    recomendaciones: [
      '🚨 Llama al 911 AHORA.',
      'No te quedes solo/a — busca ayuda inmediata.',
      'Quédate en reposo, no hagas esfuerzo físico.',
      'Si tienes aspirina y no eres alérgico/a, mastícala mientras esperas.'
    ]
  },
  {
    requeridos: ['perdida-conocimiento'],
    opcionales: ['mareos', 'dolor-cabeza', 'hormigueo'],
    enfermedad: 'Pérdida de Conocimiento — Urgencia Neurológica',
    probabilidadBase: 85,
    gravedad: 'grave',
    derivacion: '🚨 Emergencias — Neurólogo',
    descripcion: 'La pérdida de conocimiento es una emergencia médica que requiere atención inmediata.',
    recomendaciones: [
      '🚨 Llama al 911 AHORA.',
      'No dejes sola a la persona.',
      'Colócala de lado para evitar que se ahogue.',
      'No le des nada de comer ni beber.'
    ]
  },
  {
    requeridos: ['debilidad-lado', 'dificultad-hablar'],
    opcionales: ['vision-borrosa', 'mareos', 'dolor-cabeza'],
    enfermedad: 'Posible ACV (Accidente Cerebrovascular)',
    probabilidadBase: 95,
    gravedad: 'grave',
    derivacion: '🚨 Emergencias — Neurólogo (código ACV)',
    descripcion: 'Debilidad repentina de un lado del cuerpo junto con dificultad para hablar son señales de alarma de un posible ACV (protocolo FAST: cara, brazo, habla, tiempo).',
    recomendaciones: [
      '🚨 Llama al 911 AHORA — cada minuto cuenta.',
      'Anota la hora exacta en que empezaron los síntomas.',
      'No le des de comer, beber ni medicamentos.',
      'Mantén a la persona tranquila y en un lugar seguro hasta que llegue ayuda.'
    ]
  },
  {
    requeridos: ['hinchazon-cara-labios', 'dificultad-respirar'],
    opcionales: ['sarpullido', 'picazon'],
    enfermedad: 'Posible Reacción Alérgica Grave (Anafilaxia)',
    probabilidadBase: 90,
    gravedad: 'grave',
    derivacion: '🚨 Emergencias — Alergólogo',
    descripcion: 'La hinchazón repentina de cara o labios junto con dificultad para respirar puede indicar una reacción alérgica severa.',
    recomendaciones: [
      '🚨 Llama al 911 AHORA.',
      'Si tienes un autoinyector de epinefrina prescrito, úsalo.',
      'Aléjate del posible alérgeno (comida, picadura, medicamento).',
      'No esperes a que "se le pase solo".'
    ]
  },
  {
    requeridos: ['labios-azulados', 'dificultad-respirar'],
    opcionales: ['dolor-pecho', 'cansancio'],
    enfermedad: 'Signos de Falta de Oxígeno',
    probabilidadBase: 88,
    gravedad: 'grave',
    derivacion: '🚨 Emergencias',
    descripcion: 'Los labios o dedos azulados junto con dificultad para respirar son señales de que el cuerpo no está recibiendo suficiente oxígeno.',
    recomendaciones: [
      '🚨 Llama al 911 AHORA.',
      'Siéntate en posición erguida, no te acuestes.',
      'Afloja ropa ajustada alrededor del cuello y pecho.',
      'No hagas esfuerzo físico mientras esperas ayuda.'
    ]
  },
  {
    requeridos: ['piel-amarilla'],
    opcionales: ['dolor-abdominal', 'nauseas', 'cansancio'],
    enfermedad: 'Posible Ictericia — Problema Hepático',
    probabilidadBase: 80,
    gravedad: 'grave',
    derivacion: '🏥 Gastroenterólogo / Hepatólogo — Urgente',
    descripcion: 'La piel amarillenta (ictericia) puede indicar problemas graves en el hígado o vesícula biliar.',
    recomendaciones: [
      'Busca atención médica ese mismo día.',
      'Evita el alcohol por completo.',
      'No tomes medicamentos sin prescripción médica.',
      'Necesitarás análisis de sangre urgentes.'
    ]
  },

  // ══════════════════════════════════════════════════════════
  // ❤️ CARDIOVASCULAR
  // ══════════════════════════════════════════════════════════
  {
    requeridos: ['dolor-pecho'],
    opcionales: ['palpitaciones', 'dificultad-respirar', 'hinchazon-piernas'],
    enfermedad: 'Posible Problema Cardíaco',
    probabilidadBase: 75,
    gravedad: 'grave',
    derivacion: '❤️ Cardiólogo — Urgente',
    descripcion: 'El dolor de pecho puede tener causas cardíacas graves que requieren evaluación urgente.',
    recomendaciones: [
      'Busca atención médica urgente hoy mismo.',
      'Evita esfuerzos físicos.',
      'Llama al 911 si el dolor se irradia al brazo o mandíbula.',
      'Anota cuándo comenzó y cómo es el dolor.'
    ]
  },
  {
    requeridos: ['hinchazon-piernas', 'dificultad-respirar'],
    opcionales: ['cansancio', 'palpitaciones'],
    enfermedad: 'Posible Insuficiencia Cardíaca',
    probabilidadBase: 78,
    gravedad: 'grave',
    derivacion: '❤️ Cardiólogo — Urgente',
    descripcion: 'La combinación de hinchazón en piernas con dificultad para respirar puede indicar que el corazón no está bombeando eficientemente.',
    recomendaciones: [
      'Busca atención médica en las próximas 24 horas.',
      'Reduce el consumo de sal y líquidos.',
      'Duerme con la cabecera elevada si te falta el aire acostado.',
      'Pésate a diario: un aumento rápido de peso puede indicar retención de líquidos.'
    ]
  },
  {
    requeridos: ['palpitaciones'],
    opcionales: ['mareos', 'cansancio', 'dificultad-respirar'],
    enfermedad: 'Arritmia o Taquicardia',
    probabilidadBase: 65,
    gravedad: 'moderado',
    derivacion: '❤️ Cardiólogo',
    descripcion: 'Las palpitaciones frecuentes pueden indicar una alteración del ritmo cardíaco.',
    recomendaciones: [
      'Agenda cita con cardiólogo pronto.',
      'Reduce el consumo de cafeína y alcohol.',
      'Evita el estrés y descansa bien.',
      'Lleva un registro de cuándo ocurren las palpitaciones.'
    ]
  },
  {
    requeridos: ['hinchazon-piernas'],
    opcionales: ['cansancio'],
    enfermedad: 'Posible Insuficiencia Venosa',
    probabilidadBase: 55,
    gravedad: 'leve',
    derivacion: '❤️ Cardiólogo / Médico General',
    descripcion: 'La hinchazón aislada en piernas suele estar relacionada con problemas de circulación venosa.',
    recomendaciones: [
      'Eleva las piernas cuando estés en reposo.',
      'Evita estar mucho tiempo de pie sin moverte.',
      'Usa medias de compresión si tu médico las recomienda.',
      'Consulta con tu médico esta semana.'
    ]
  },

  // ══════════════════════════════════════════════════════════
  // 🫁 RESPIRATORIO
  // ══════════════════════════════════════════════════════════
  {
    requeridos: ['fiebre', 'tos', 'dificultad-respirar', 'dolor-pecho'],
    opcionales: ['cansancio', 'escalofrios'],
    enfermedad: 'Posible Neumonía',
    probabilidadBase: 85,
    gravedad: 'grave',
    derivacion: '🫁 Neumólogo — Urgente',
    descripcion: 'Fiebre, tos, dificultad respiratoria y dolor de pecho juntos son compatibles con una infección pulmonar que requiere evaluación pronta.',
    recomendaciones: [
      'Busca atención médica hoy mismo.',
      'Puede requerir radiografía de tórax y antibióticos.',
      'Reposo total y buena hidratación.',
      'Si te cuesta mucho respirar, ve a urgencias de inmediato.'
    ]
  },
  {
    requeridos: ['silbido-respirar'],
    opcionales: ['tos', 'dificultad-respirar', 'cansancio'],
    enfermedad: 'Posible Asma o Broncoespasmo',
    probabilidadBase: 75,
    gravedad: 'moderado',
    derivacion: '🫁 Neumólogo',
    descripcion: 'El silbido al respirar (sibilancias) puede indicar asma u otras condiciones bronquiales.',
    recomendaciones: [
      'Consulta con un neumólogo pronto.',
      'Evita humo, polvo y alérgenos.',
      'Si tienes inhalador, úsalo según indicación.',
      'En crisis severa, ve a urgencias.'
    ]
  },
  {
    requeridos: ['fiebre', 'tos', 'cansancio'],
    opcionales: ['dificultad-respirar', 'dolor-corporal', 'congestion-nasal'],
    enfermedad: 'Infección Viral Respiratoria (tipo gripal / COVID-19)',
    probabilidadBase: 78,
    gravedad: 'moderado',
    derivacion: '👨‍⚕️ Médico General — considerar prueba diagnóstica',
    descripcion: 'Fiebre, tos y cansancio son el patrón típico de infecciones virales respiratorias, incluyendo gripe estacional y COVID-19.',
    recomendaciones: [
      'Aíslate y usa mascarilla cerca de otras personas.',
      'Considera hacerte una prueba diagnóstica si está disponible.',
      'Reposo, hidratación y paracetamol para el malestar.',
      'Busca atención si te falta el aire o la fiebre no cede.'
    ]
  },
  {
    requeridos: ['fiebre', 'tos', 'dolor-garganta'],
    opcionales: ['congestion-nasal', 'cansancio', 'escalofrios'],
    enfermedad: 'Infección Respiratoria — Gripe o Faringitis',
    probabilidadBase: 80,
    gravedad: 'leve',
    derivacion: '👨‍⚕️ Médico General',
    descripcion: 'Cuadro clínico compatible con infección viral respiratoria estacional.',
    recomendaciones: [
      'Reposo en casa y abundante líquido.',
      'Paracetamol o ibuprofeno para la fiebre.',
      'Consulta si la fiebre supera 39°C o persiste más de 3 días.',
      'Aíslate para no contagiar a otros.'
    ]
  },
  {
    requeridos: ['congestion-nasal', 'dolor-cabeza'],
    opcionales: ['fiebre', 'dolor-garganta'],
    enfermedad: 'Posible Sinusitis',
    probabilidadBase: 68,
    gravedad: 'leve',
    derivacion: '👂 Otorrinolaringólogo / Médico General',
    descripcion: 'La congestión nasal junto con dolor de cabeza (especialmente en la frente o mejillas) sugiere inflamación de los senos paranasales.',
    recomendaciones: [
      'Lavados nasales con solución salina.',
      'Aplica calor local en la zona de la frente y mejillas.',
      'Consulta si dura más de 10 días o empeora.',
      'Mantente bien hidratado.'
    ]
  },
  {
    requeridos: ['estornudos', 'congestion-nasal'],
    opcionales: ['picazon'],
    enfermedad: 'Rinitis Alérgica',
    probabilidadBase: 65,
    gravedad: 'leve',
    derivacion: '🤧 Alergólogo',
    descripcion: 'Los estornudos frecuentes junto con congestión nasal, sin fiebre, suelen indicar una reacción alérgica más que una infección.',
    recomendaciones: [
      'Identifica y evita el alérgeno (polvo, polen, mascotas).',
      'Antihistamínicos de venta libre pueden ayudar.',
      'Ventila y limpia tu espacio con frecuencia.',
      'Consulta a un alergólogo si es un problema recurrente.'
    ]
  },
  {
    requeridos: ['congestion-nasal', 'tos'],
    opcionales: ['dolor-garganta', 'fiebre'],
    enfermedad: 'Resfriado Común',
    probabilidadBase: 70,
    gravedad: 'leve',
    derivacion: '👨‍⚕️ Médico General (si persiste)',
    descripcion: 'Síntomas típicos de resfriado viral. Generalmente se resuelve solo en 7-10 días.',
    recomendaciones: [
      'Descansa y toma mucho líquido.',
      'Descongestionantes nasales de venta libre.',
      'Caldo caliente y miel con limón ayudan.',
      'Consulta si no mejoras en una semana.'
    ]
  },
  {
    requeridos: ['dolor-garganta'],
    opcionales: ['fiebre', 'tos'],
    enfermedad: 'Faringitis',
    probabilidadBase: 55,
    gravedad: 'leve',
    derivacion: '👨‍⚕️ Médico General',
    descripcion: 'El dolor de garganta aislado suele deberse a una inflamación viral o bacteriana de la faringe.',
    recomendaciones: [
      'Gárgaras con agua tibia y sal.',
      'Pastillas o caramelos para la garganta.',
      'Consulta si aparecen placas blancas o fiebre alta (podría ser bacteriano).',
      'Evita irritantes como el humo del cigarro.'
    ]
  },

  // ══════════════════════════════════════════════════════════
  // 🧠 NEUROLÓGICO
  // ══════════════════════════════════════════════════════════
  {
    requeridos: ['dolor-cabeza', 'vision-borrosa'],
    opcionales: ['mareos', 'nauseas'],
    enfermedad: 'Migraña con Aura o Hipertensión',
    probabilidadBase: 70,
    gravedad: 'moderado',
    derivacion: '🧠 Neurólogo / Médico General',
    descripcion: 'La combinación de dolor de cabeza con visión borrosa puede indicar migraña o presión arterial elevada.',
    recomendaciones: [
      'Controla tu presión arterial.',
      'Descansa en un lugar oscuro y silencioso.',
      'Consulta al médico si ocurre frecuentemente.',
      'Lleva un diario de episodios (hora, duración, intensidad).'
    ]
  },
  {
    requeridos: ['hormigueo'],
    opcionales: ['dolor-cabeza', 'mareos', 'vision-borrosa'],
    enfermedad: 'Posible Neuropatía o Problema Circulatorio',
    probabilidadBase: 60,
    gravedad: 'moderado',
    derivacion: '🧠 Neurólogo',
    descripcion: 'El hormigueo en extremidades puede indicar problemas nerviosos o circulatorios.',
    recomendaciones: [
      'Agenda cita con neurólogo.',
      'Evita posturas que compriman nervios.',
      'Controla niveles de azúcar en sangre.',
      'Haz ejercicio suave de forma regular.'
    ]
  },
  {
    requeridos: ['mareos'],
    opcionales: ['nauseas', 'dolor-cabeza', 'vision-borrosa'],
    enfermedad: 'Vértigo o Mareo Postural',
    probabilidadBase: 60,
    gravedad: 'leve',
    derivacion: '👂 Otorrinolaringólogo / Médico General',
    descripcion: 'Los mareos frecuentes pueden tener origen en el oído interno o la presión arterial.',
    recomendaciones: [
      'Levántate despacio para evitar mareos.',
      'Mantente bien hidratado.',
      'Consulta si los episodios son frecuentes o intensos.',
      'Evita movimientos bruscos de cabeza.'
    ]
  },
  {
    requeridos: ['dolor-cabeza'],
    opcionales: ['cansancio', 'estres'],
    enfermedad: 'Cefalea Tensional',
    probabilidadBase: 50,
    gravedad: 'leve',
    derivacion: '👨‍⚕️ Médico General',
    descripcion: 'El dolor de cabeza aislado, sin otras señales de alarma, suele estar relacionado con tensión muscular o estrés.',
    recomendaciones: [
      'Descansa en un ambiente tranquilo.',
      'Aplica compresas frías o calientes según lo que te alivie.',
      'Identifica y reduce fuentes de estrés.',
      'Consulta si el dolor es muy frecuente o intenso.'
    ]
  },

  // ══════════════════════════════════════════════════════════
  // 🫃 DIGESTIVO
  // ══════════════════════════════════════════════════════════
  {
    requeridos: ['vomito', 'diarrea', 'dolor-abdominal'],
    opcionales: ['fiebre', 'nauseas'],
    enfermedad: 'Posible Intoxicación Alimentaria',
    probabilidadBase: 78,
    gravedad: 'moderado',
    derivacion: '🫃 Médico General / Urgencias si es severo',
    descripcion: 'La combinación de vómito, diarrea y dolor abdominal, sobre todo si aparece pocas horas después de comer, sugiere intoxicación alimentaria.',
    recomendaciones: [
      'Hidratación oral constante — suero o agua con sales.',
      'Evita alimentos sólidos hasta que ceda el vómito.',
      'Ve a urgencias si hay signos de deshidratación severa o sangre en vómito/heces.',
      'Identifica qué comiste recientemente que pudo estar en mal estado.'
    ]
  },
  {
    requeridos: ['nauseas', 'vomito', 'diarrea'],
    opcionales: ['dolor-abdominal', 'fiebre', 'cansancio'],
    enfermedad: 'Gastroenteritis Aguda',
    probabilidadBase: 85,
    gravedad: 'leve',
    derivacion: '🫃 Gastroenterólogo / Médico General',
    descripcion: 'Infección gastrointestinal, probablemente viral o bacteriana.',
    recomendaciones: [
      'Hidratación oral constante — suero o agua.',
      'Dieta blanda: arroz, plátano, tostadas.',
      'Evita lácteos y comidas grasas.',
      'Consulta si hay sangre en heces o fiebre alta.'
    ]
  },
  {
    requeridos: ['acidez'],
    opcionales: ['dolor-abdominal', 'nauseas'],
    enfermedad: 'Reflujo Gastroesofágico o Gastritis',
    probabilidadBase: 65,
    gravedad: 'leve',
    derivacion: '🫃 Gastroenterólogo',
    descripcion: 'La acidez o ardor estomacal frecuente puede deberse a reflujo del ácido gástrico o inflamación de la mucosa del estómago.',
    recomendaciones: [
      'Evita comidas muy grasosas, picantes o café en exceso.',
      'No te acuestes inmediatamente después de comer.',
      'Come porciones más pequeñas y frecuentes.',
      'Consulta si el ardor es diario o muy intenso.'
    ]
  },
  {
    requeridos: ['dolor-abdominal'],
    opcionales: ['nauseas', 'fiebre', 'vomito'],
    enfermedad: 'Dolor Abdominal — Evaluación Necesaria',
    probabilidadBase: 60,
    gravedad: 'moderado',
    derivacion: '🫃 Gastroenterólogo / Médico General',
    descripcion: 'El dolor abdominal puede tener múltiples causas que requieren evaluación médica.',
    recomendaciones: [
      'Si el dolor es intenso o repentino, ve a urgencias.',
      'Anota la ubicación exacta y tipo de dolor.',
      'Evita automedicarte con analgésicos fuertes.',
      'Consulta con tu médico esta semana.'
    ]
  },
  {
    requeridos: ['estrenimiento'],
    opcionales: ['dolor-abdominal'],
    enfermedad: 'Estreñimiento',
    probabilidadBase: 55,
    gravedad: 'leve',
    derivacion: '🫃 Médico General / Gastroenterólogo',
    descripcion: 'La dificultad persistente para evacuar puede deberse a la dieta, hidratación o falta de actividad física.',
    recomendaciones: [
      'Aumenta el consumo de fibra (frutas, verduras, granos enteros).',
      'Bebe más agua durante el día.',
      'Mantente físicamente activo.',
      'Consulta si dura más de 3 semanas o hay sangre.'
    ]
  },

  // ══════════════════════════════════════════════════════════
  // 🌡️ GENERAL / SISTÉMICO
  // ══════════════════════════════════════════════════════════
  {
    requeridos: ['fiebre', 'escalofrios', 'dolor-corporal'],
    opcionales: ['cansancio', 'sudoracion-nocturna'],
    enfermedad: 'Síndrome Gripal o Infección Sistémica',
    probabilidadBase: 80,
    gravedad: 'moderado',
    derivacion: '👨‍⚕️ Médico General',
    descripcion: 'Cuadro compatible con infección viral o bacteriana que afecta todo el organismo.',
    recomendaciones: [
      'Reposo absoluto y abundante hidratación.',
      'Consulta al médico si la fiebre supera 39°C.',
      'Analgésicos de venta libre para el malestar.',
      'Aíslate para evitar contagios.'
    ]
  },
  {
    requeridos: ['cansancio', 'mareos'],
    opcionales: ['dolor-cabeza', 'perdida-apetito'],
    enfermedad: 'Posible Anemia',
    probabilidadBase: 60,
    gravedad: 'moderado',
    derivacion: '👨‍⚕️ Médico General — Análisis de sangre',
    descripcion: 'El cansancio persistente junto con mareos puede indicar niveles bajos de hemoglobina (anemia).',
    recomendaciones: [
      'Agenda un análisis de sangre completo (hemograma).',
      'Aumenta el consumo de alimentos ricos en hierro.',
      'Evita levantarte bruscamente para prevenir mareos.',
      'Consulta con tu médico esta semana.'
    ]
  },
  {
    requeridos: ['perdida-peso'],
    opcionales: ['perdida-apetito', 'cansancio'],
    enfermedad: 'Pérdida de Peso Inexplicada — Evaluación Necesaria',
    probabilidadBase: 65,
    gravedad: 'moderado',
    derivacion: '👨‍⚕️ Médico General — Evaluación exhaustiva',
    descripcion: 'La pérdida de peso sin causa aparente (sin cambios en dieta o ejercicio) siempre amerita una evaluación médica para descartar causas subyacentes.',
    recomendaciones: [
      'Agenda una cita médica en los próximos días.',
      'Lleva un registro de tu peso y alimentación.',
      'Informa sobre cualquier otro síntoma, aunque parezca menor.',
      'No asumas que es "normal" sin confirmarlo con un profesional.'
    ]
  },
  {
    requeridos: ['sudoracion-nocturna', 'cansancio'],
    opcionales: ['fiebre', 'perdida-peso'],
    enfermedad: 'Posible Infección Crónica o Problema Hormonal',
    probabilidadBase: 55,
    gravedad: 'moderado',
    derivacion: '👨‍⚕️ Médico General — Análisis de Sangre',
    descripcion: 'La sudoración nocturna con cansancio prolongado puede indicar infecciones crónicas o alteraciones hormonales.',
    recomendaciones: [
      'Agenda análisis de sangre completos.',
      'Informa al médico sobre la duración de los síntomas.',
      'Mantén un registro de cuándo ocurren los episodios.',
      'Evalúa niveles de tiroides y glucosa.'
    ]
  },

  // ══════════════════════════════════════════════════════════
  // 💆 PIEL / DERMATOLÓGICO
  // ══════════════════════════════════════════════════════════
  {
    requeridos: ['sarpullido', 'fiebre'],
    opcionales: ['picazon', 'dolor-corporal'],
    enfermedad: 'Infección Viral Cutánea (ej. Varicela, Sarampión)',
    probabilidadBase: 65,
    gravedad: 'moderado',
    derivacion: '💆 Médico General / Dermatólogo',
    descripcion: 'El sarpullido acompañado de fiebre puede corresponder a una infección viral que se manifiesta en la piel.',
    recomendaciones: [
      'Aíslate para evitar contagiar a otras personas, especialmente niños.',
      'No revientes ni rasques las lesiones.',
      'Consulta pronto, sobre todo si no estás vacunado.',
      'Mantén buena higiene de la piel.'
    ]
  },
  {
    requeridos: ['sarpullido', 'picazon'],
    opcionales: ['fiebre', 'congestion-nasal'],
    enfermedad: 'Reacción Alérgica o Dermatitis',
    probabilidadBase: 75,
    gravedad: 'leve',
    derivacion: '💆 Dermatólogo / Alergólogo',
    descripcion: 'Reacción cutánea compatible con alergia o dermatitis de contacto.',
    recomendaciones: [
      'Identifica y evita el posible alérgeno.',
      'Antihistamínicos de venta libre pueden aliviar.',
      'No rasques la zona afectada.',
      'Consulta al dermatólogo si empeora o se extiende.'
    ]
  },
  {
    requeridos: ['moretones-faciles'],
    opcionales: ['cansancio'],
    enfermedad: 'Moretones Fáciles — Evaluar Coagulación',
    probabilidadBase: 55,
    gravedad: 'moderado',
    derivacion: '👨‍⚕️ Médico General — Análisis de sangre',
    descripcion: 'Los moretones que aparecen con golpes muy leves (o sin golpe aparente) pueden indicar un problema de coagulación o plaquetas.',
    recomendaciones: [
      'Agenda un análisis de sangre (incluyendo plaquetas).',
      'Anota si tomas medicamentos anticoagulantes.',
      'Evita golpes y actividades de alto riesgo mientras te evalúan.',
      'Consulta pronto si los moretones son muy grandes o frecuentes.'
    ]
  },

  // ══════════════════════════════════════════════════════════
  // 🦴 MÚSCULOS Y ARTICULACIONES
  // ══════════════════════════════════════════════════════════
  {
    requeridos: ['dolor-articular', 'rigidez-articular'],
    opcionales: ['debilidad-muscular'],
    enfermedad: 'Posible Artritis o Artrosis',
    probabilidadBase: 70,
    gravedad: 'moderado',
    derivacion: '🦴 Reumatólogo',
    descripcion: 'El dolor articular junto con rigidez, especialmente en la mañana, es característico de procesos inflamatorios o degenerativos de las articulaciones.',
    recomendaciones: [
      'Agenda cita con reumatólogo.',
      'Aplica calor local para aliviar la rigidez matutina.',
      'Mantén actividad física suave (ej. caminar, estirar).',
      'Evita cargar peso excesivo en las articulaciones afectadas.'
    ]
  },
  {
    requeridos: ['dolor-espalda'],
    opcionales: ['debilidad-muscular', 'dolor-articular'],
    enfermedad: 'Lumbalgia (Dolor de Espalda)',
    probabilidadBase: 60,
    gravedad: 'leve',
    derivacion: '🦴 Traumatólogo / Médico General',
    descripcion: 'El dolor de espalda o lumbar suele deberse a tensión muscular, mala postura o esfuerzo físico.',
    recomendaciones: [
      'Evita cargar peso mientras dura el dolor.',
      'Aplica calor local en la zona afectada.',
      'Mantén una postura correcta al sentarte.',
      'Consulta si el dolor se irradia a la pierna o no mejora en 2 semanas.'
    ]
  },

  // ══════════════════════════════════════════════════════════
  // 👂 OÍDOS Y OJOS
  // ══════════════════════════════════════════════════════════
  {
    requeridos: ['dolor-oido'],
    opcionales: ['fiebre', 'perdida-audicion'],
    enfermedad: 'Posible Otitis (Infección de Oído)',
    probabilidadBase: 68,
    gravedad: 'moderado',
    derivacion: '👂 Otorrinolaringólogo',
    descripcion: 'El dolor de oído, especialmente con fiebre, suele indicar una infección del oído medio o externo.',
    recomendaciones: [
      'No introduzcas objetos ni hisopos en el oído.',
      'Consulta pronto, sobre todo en niños.',
      'El médico puede indicar gotas o antibióticos según el caso.',
      'Evita que entre agua al oído mientras dura la molestia.'
    ]
  },
  {
    requeridos: ['ojos-rojos', 'secrecion-ocular'],
    opcionales: ['picazon'],
    enfermedad: 'Posible Conjuntivitis',
    probabilidadBase: 65,
    gravedad: 'leve',
    derivacion: '👁️ Oftalmólogo',
    descripcion: 'Los ojos rojos con secreción son característicos de la conjuntivitis, que puede ser viral, bacteriana o alérgica.',
    recomendaciones: [
      'Lávate las manos con frecuencia y evita tocarte los ojos.',
      'No compartas toallas ni almohadas mientras dure.',
      'Aplica compresas frías para aliviar la molestia.',
      'Consulta si no mejora en unos días o hay dolor intenso.'
    ]
  },
  {
    requeridos: ['perdida-audicion'],
    opcionales: ['dolor-oido', 'mareos'],
    enfermedad: 'Pérdida de Audición — Evaluación Necesaria',
    probabilidadBase: 60,
    gravedad: 'moderado',
    derivacion: '👂 Otorrinolaringólogo',
    descripcion: 'La disminución de la audición amerita una evaluación para identificar la causa (cerumen, infección, u otras).',
    recomendaciones: [
      'No intentes limpiar el oído con objetos afilados.',
      'Agenda una audiometría con un especialista.',
      'Evita exponerte a ruidos muy fuertes mientras te evalúan.',
      'Consulta pronto si la pérdida fue repentina.'
    ]
  },

  // ══════════════════════════════════════════════════════════
  // 🚻 URINARIO
  // ══════════════════════════════════════════════════════════
  {
    requeridos: ['dolor-orinar', 'orina-frecuente'],
    opcionales: ['sangre-orina', 'fiebre'],
    enfermedad: 'Posible Infección Urinaria',
    probabilidadBase: 78,
    gravedad: 'moderado',
    derivacion: '🚻 Urólogo / Médico General',
    descripcion: 'El ardor al orinar junto con necesidad frecuente de orinar son los síntomas típicos de una infección de las vías urinarias.',
    recomendaciones: [
      'Bebe abundante agua para ayudar a eliminar la infección.',
      'Consulta pronto — normalmente se trata con antibióticos.',
      'Evita retener la orina por mucho tiempo.',
      'Busca atención urgente si además tienes fiebre o dolor de espalda.'
    ]
  },
  {
    requeridos: ['dolor-costado', 'sangre-orina'],
    opcionales: ['nauseas', 'vomito'],
    enfermedad: 'Posibles Cálculos Renales',
    probabilidadBase: 75,
    gravedad: 'moderado',
    derivacion: '🚻 Urólogo — Urgente si el dolor es intenso',
    descripcion: 'El dolor en el costado o zona lumbar baja junto con sangre en la orina puede indicar cálculos (piedras) en el riñón.',
    recomendaciones: [
      'Bebe abundante agua, salvo indicación médica contraria.',
      'Ve a urgencias si el dolor es súbito e insoportable.',
      'Evita automedicarte con antiinflamatorios sin consultar.',
      'El médico puede solicitar una ecografía o tomografía.'
    ]
  },

  // ══════════════════════════════════════════════════════════
  // 🧘 ÁNIMO Y SUEÑO
  // Nota: estos síntomas NUNCA se usan para "diagnosticar" una
  // condición de salud mental — solo para sugerir hablar con un
  // profesional. Un algoritmo de reglas no puede ni debe evaluar
  // salud mental con la seriedad que eso requiere.
  // ══════════════════════════════════════════════════════════
  {
    requeridos: ['ansiedad'],
    opcionales: ['insomnio', 'estres'],
    enfermedad: 'Ansiedad — Valoración Recomendada',
    probabilidadBase: 55,
    gravedad: 'leve',
    derivacion: '🧘 Psicólogo',
    descripcion: 'La ansiedad o nerviosismo constante que afecta tu día a día es algo que vale la pena conversar con un profesional de salud mental.',
    recomendaciones: [
      'Hablar con un psicólogo puede ayudarte a manejarlo mejor.',
      'Técnicas de respiración y actividad física suelen ayudar a corto plazo.',
      'Reduce el consumo de cafeína si notas que te afecta.',
      'Si sientes que no puedes manejarlo solo/a, no esperes para pedir ayuda.'
    ]
  },
  {
    requeridos: ['animo-bajo'],
    opcionales: ['insomnio', 'cansancio'],
    enfermedad: 'Malestar Emocional Persistente — Valoración Recomendada',
    probabilidadBase: 55,
    gravedad: 'moderado',
    derivacion: '🧘 Psicólogo / Psiquiatra',
    descripcion: 'La tristeza o desánimo persistente merece ser conversado con un profesional; esta herramienta no puede ni debe hacer un diagnóstico de salud mental.',
    recomendaciones: [
      'Habla con un psicólogo o psiquiatra sobre cómo te sientes.',
      'Apóyate en personas de confianza — no tienes que pasar por esto solo/a.',
      'Mantener rutinas de sueño y actividad física puede ayudar.',
      'Si en algún momento tienes pensamientos de hacerte daño, contacta de inmediato una línea de crisis o acude a urgencias.'
    ]
  },
  {
    requeridos: ['insomnio'],
    opcionales: ['ansiedad', 'estres'],
    enfermedad: 'Trastorno del Sueño',
    probabilidadBase: 50,
    gravedad: 'leve',
    derivacion: '👨‍⚕️ Médico General / Psicólogo',
    descripcion: 'La dificultad persistente para dormir puede afectar tu salud física y emocional a largo plazo.',
    recomendaciones: [
      'Mantén horarios regulares para dormir y despertar.',
      'Evita pantallas y cafeína antes de dormir.',
      'Consulta si el insomnio dura más de un mes.',
      'Considera técnicas de relajación antes de acostarte.'
    ]
  }
];
