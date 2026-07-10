-- SaludAsist — esquema compartido de Supabase (equipo Grupo H)
-- Pegar completo en Supabase Dashboard → SQL Editor → New query → Run.
-- Requiere: proyecto Supabase ya creado (Auth con Email habilitado, que es el default).

-- ══════════════════════════════════════════════════════════════
-- 1. PERFILES (rol, especialidad, etc. — 1:1 con auth.users)
-- ══════════════════════════════════════════════════════════════
create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  correo text not null,
  rol text not null check (rol in ('administrador', 'doctor', 'usuario')) default 'usuario',
  especialidad text,
  activo boolean not null default true,
  disponible boolean not null default true,
  created_at timestamptz not null default now()
);

-- Función auxiliar (security definer): evita recursión infinita en las
-- políticas RLS de perfiles (una política de perfiles no puede consultar
-- perfiles directamente sin definer, o se dispara a sí misma).
create function public.rol_actual()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid();
$$;

-- Crea automáticamente el perfil cuando alguien se registra con Supabase Auth.
-- El rol y nombre llegan como "user metadata" desde el signUp() del cliente.
create function public.manejar_usuario_nuevo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, correo, rol, especialidad)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', new.email),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'rol', 'usuario'),
    new.raw_user_meta_data ->> 'especialidad'
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute procedure public.manejar_usuario_nuevo();

alter table public.perfiles enable row level security;

-- Cualquier persona autenticada puede LEER perfiles (se necesita para
-- listar doctores en el panel admin, ver el doctor asignado, etc.).
create policy "perfiles_select_autenticados"
  on public.perfiles for select
  to authenticated
  using (true);

-- Cada quien actualiza su propio perfil; el admin puede actualizar cualquiera.
create policy "perfiles_update_propio_o_admin"
  on public.perfiles for update
  to authenticated
  using (id = auth.uid() or public.rol_actual() = 'administrador');

-- Solo el admin desactiva/reactiva o borra cuentas.
create policy "perfiles_delete_admin"
  on public.perfiles for delete
  to authenticated
  using (public.rol_actual() = 'administrador');

-- ══════════════════════════════════════════════════════════════
-- 2. CATEGORÍAS Y SÍNTOMAS (catálogo del menú de síntomas)
-- ══════════════════════════════════════════════════════════════
create table public.categorias (
  id text primary key,
  nombre text not null,
  icono text not null
);

create table public.sintomas (
  id bigint generated always as identity primary key,
  categoria_id text not null references public.categorias(id) on delete cascade,
  valor text not null unique,
  etiqueta text not null
);

alter table public.categorias enable row level security;
alter table public.sintomas enable row level security;

-- Catálogo público: lo puede leer cualquiera, incluso sin iniciar sesión
-- (útil si algún día se muestra un preview antes del login).
create policy "categorias_select_publico"
  on public.categorias for select
  to anon, authenticated
  using (true);

create policy "sintomas_select_publico"
  on public.sintomas for select
  to anon, authenticated
  using (true);

-- Solo el admin edita el catálogo.
create policy "categorias_admin_escribe"
  on public.categorias for all
  to authenticated
  using (public.rol_actual() = 'administrador')
  with check (public.rol_actual() = 'administrador');

create policy "sintomas_admin_escribe"
  on public.sintomas for all
  to authenticated
  using (public.rol_actual() = 'administrador')
  with check (public.rol_actual() = 'administrador');

-- ══════════════════════════════════════════════════════════════
-- 3. REGLAS DE DIAGNÓSTICO (el motor de diagnóstico)
-- ══════════════════════════════════════════════════════════════
create table public.reglas_diagnostico (
  id uuid primary key default gen_random_uuid(),
  requeridos text[] not null,
  opcionales text[] not null default '{}',
  enfermedad text not null,
  probabilidad_base int not null,
  gravedad text not null check (gravedad in ('leve', 'moderado', 'grave')),
  derivacion text not null,
  descripcion text not null,
  recomendaciones text[] not null default '{}'
);

alter table public.reglas_diagnostico enable row level security;

create policy "reglas_select_publico"
  on public.reglas_diagnostico for select
  to anon, authenticated
  using (true);

create policy "reglas_admin_escribe"
  on public.reglas_diagnostico for all
  to authenticated
  using (public.rol_actual() = 'administrador')
  with check (public.rol_actual() = 'administrador');

-- ══════════════════════════════════════════════════════════════
-- 4. ASIGNACIONES (paciente -> doctor)
-- ══════════════════════════════════════════════════════════════
create table public.asignaciones (
  paciente_id uuid primary key references public.perfiles(id) on delete cascade,
  doctor_id uuid references public.perfiles(id) on delete set null
);

alter table public.asignaciones enable row level security;

-- El paciente ve su propia asignación; el doctor ve las suyas; el admin ve todo.
create policy "asignaciones_select"
  on public.asignaciones for select
  to authenticated
  using (
    paciente_id = auth.uid()
    or doctor_id = auth.uid()
    or public.rol_actual() = 'administrador'
  );

-- Solo el admin asigna/reasigna doctores.
create policy "asignaciones_escritura_admin"
  on public.asignaciones for all
  to authenticated
  using (public.rol_actual() = 'administrador')
  with check (public.rol_actual() = 'administrador');

-- ══════════════════════════════════════════════════════════════
-- 5. EVALUACIONES (historial de diagnósticos)
-- ══════════════════════════════════════════════════════════════
create table public.evaluaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  sintomas text[] not null,
  resultado jsonb,
  nota_doctor text,
  fecha timestamptz not null default now()
);

alter table public.evaluaciones enable row level security;

-- El paciente ve su propio historial; su doctor asignado también; el admin ve todo.
create policy "evaluaciones_select"
  on public.evaluaciones for select
  to authenticated
  using (
    usuario_id = auth.uid()
    or public.rol_actual() = 'administrador'
    or exists (
      select 1 from public.asignaciones a
      where a.paciente_id = evaluaciones.usuario_id
        and a.doctor_id = auth.uid()
    )
  );

-- Un usuario solo puede crear evaluaciones propias.
create policy "evaluaciones_insert_propio"
  on public.evaluaciones for insert
  to authenticated
  with check (usuario_id = auth.uid());

-- El propio usuario puede borrar su evaluación; el doctor asignado puede
-- dejar/editar la nota clínica (nota_doctor) de sus pacientes; el admin, todo.
create policy "evaluaciones_delete_propio_o_admin"
  on public.evaluaciones for delete
  to authenticated
  using (usuario_id = auth.uid() or public.rol_actual() = 'administrador');

create policy "evaluaciones_update_doctor_o_propio"
  on public.evaluaciones for update
  to authenticated
  using (
    usuario_id = auth.uid()
    or public.rol_actual() = 'administrador'
    or exists (
      select 1 from public.asignaciones a
      where a.paciente_id = evaluaciones.usuario_id
        and a.doctor_id = auth.uid()
    )
  );

-- ══════════════════════════════════════════════════════════════
-- 6. SEMILLA — categorías y síntomas (de categorias.ts)
-- ══════════════════════════════════════════════════════════════
insert into public.categorias (id, nombre, icono) values
  ('respiratorio', 'Respiratorio', '🫁'),
  ('sistemico', 'General / Sistémico', '🌡️'),
  ('neurologico', 'Neurológico', '🧠'),
  ('digestivo', 'Digestivo', '🫃'),
  ('cardiovascular', 'Cardiovascular', '❤️'),
  ('piel', 'Piel', '💆'),
  ('musculoesqueletico', 'Músculos y articulaciones', '🦴'),
  ('oidos-ojos', 'Oídos y ojos', '👂'),
  ('urinario', 'Urinario', '🚻'),
  ('animo', 'Ánimo y sueño', '🧘');

insert into public.sintomas (categoria_id, valor, etiqueta) values
  ('respiratorio', 'tos', '😮‍💨 Tos'),
  ('respiratorio', 'dificultad-respirar', '💨 Dificultad para respirar'),
  ('respiratorio', 'congestion-nasal', '🤧 Congestión nasal'),
  ('respiratorio', 'dolor-garganta', '🗣️ Dolor de garganta'),
  ('respiratorio', 'silbido-respirar', '🎵 Silbido al respirar'),
  ('respiratorio', 'estornudos', '🤧 Estornudos frecuentes'),
  ('sistemico', 'fiebre', '🤒 Fiebre'),
  ('sistemico', 'escalofrios', '🥶 Escalofríos'),
  ('sistemico', 'cansancio', '😴 Cansancio extremo'),
  ('sistemico', 'dolor-corporal', '🦴 Dolor corporal generalizado'),
  ('sistemico', 'sudoracion-nocturna', '💦 Sudoración nocturna'),
  ('sistemico', 'perdida-peso', '⚖️ Pérdida de peso sin causa aparente'),
  ('sistemico', 'perdida-apetito', '🍽️ Pérdida de apetito'),
  ('neurologico', 'dolor-cabeza', '🧠 Dolor de cabeza'),
  ('neurologico', 'vision-borrosa', '👀 Visión borrosa'),
  ('neurologico', 'mareos', '💫 Mareos / vértigo'),
  ('neurologico', 'perdida-conocimiento', '😵 Pérdida del conocimiento'),
  ('neurologico', 'hormigueo', '⚡ Hormigueo en extremidades'),
  ('neurologico', 'debilidad-lado', '🚨 Debilidad repentina en un lado del cuerpo'),
  ('neurologico', 'dificultad-hablar', '🚨 Dificultad repentina para hablar'),
  ('digestivo', 'nauseas', '🤢 Náuseas'),
  ('digestivo', 'vomito', '🤮 Vómito'),
  ('digestivo', 'diarrea', '🚽 Diarrea'),
  ('digestivo', 'dolor-abdominal', '🫃 Dolor abdominal'),
  ('digestivo', 'acidez', '🔥 Acidez o ardor estomacal'),
  ('digestivo', 'estrenimiento', '🚫 Estreñimiento'),
  ('cardiovascular', 'dolor-pecho', '💔 Dolor de pecho'),
  ('cardiovascular', 'palpitaciones', '💓 Palpitaciones'),
  ('cardiovascular', 'hinchazon-piernas', '🦵 Hinchazón en piernas'),
  ('cardiovascular', 'labios-azulados', '🚨 Labios o dedos azulados'),
  ('piel', 'sarpullido', '🔴 Sarpullido o ronchas'),
  ('piel', 'picazon', '🤚 Picazón generalizada'),
  ('piel', 'piel-amarilla', '🟡 Piel amarillenta'),
  ('piel', 'hinchazon-cara-labios', '🚨 Hinchazón repentina de cara o labios'),
  ('piel', 'moretones-faciles', '🟣 Moretones que aparecen con facilidad'),
  ('musculoesqueletico', 'dolor-articular', '🦴 Dolor articular'),
  ('musculoesqueletico', 'rigidez-articular', '🕗 Rigidez (sobre todo en la mañana)'),
  ('musculoesqueletico', 'debilidad-muscular', '💪 Debilidad muscular'),
  ('musculoesqueletico', 'dolor-espalda', '🔙 Dolor de espalda o lumbar'),
  ('oidos-ojos', 'dolor-oido', '👂 Dolor de oído'),
  ('oidos-ojos', 'perdida-audicion', '🔇 Pérdida de audición'),
  ('oidos-ojos', 'ojos-rojos', '👁️ Ojos rojos o irritados'),
  ('oidos-ojos', 'secrecion-ocular', '💧 Secreción o legañas en los ojos'),
  ('urinario', 'dolor-orinar', '🔥 Ardor o dolor al orinar'),
  ('urinario', 'orina-frecuente', '🚻 Necesidad frecuente de orinar'),
  ('urinario', 'sangre-orina', '🩸 Sangre en la orina'),
  ('urinario', 'dolor-costado', '🫲 Dolor en el costado o zona lumbar baja'),
  ('animo', 'ansiedad', '😟 Ansiedad o nerviosismo constante'),
  ('animo', 'animo-bajo', '😔 Tristeza o desánimo persistente'),
  ('animo', 'insomnio', '🌙 Dificultad para dormir'),
  ('animo', 'estres', '😣 Estrés que afecta tu día a día');

-- ══════════════════════════════════════════════════════════════
-- 7. SEMILLA — reglas de diagnóstico (de catalogo-enfermedades.ts)
-- ══════════════════════════════════════════════════════════════
insert into public.reglas_diagnostico (requeridos, opcionales, enfermedad, probabilidad_base, gravedad, derivacion, descripcion, recomendaciones) values
(array['dolor-pecho','dificultad-respirar'], array['palpitaciones','mareos','cansancio','labios-azulados'], 'Posible Síndrome Coronario Agudo (Infarto)', 90, 'grave', '🚨 Emergencias — Cardiólogo', 'La combinación de dolor de pecho con dificultad respiratoria puede indicar un evento cardíaco grave.', array['🚨 Llama al 911 AHORA.','No te quedes solo/a — busca ayuda inmediata.','Quédate en reposo, no hagas esfuerzo físico.','Si tienes aspirina y no eres alérgico/a, mastícala mientras esperas.']),
(array['perdida-conocimiento'], array['mareos','dolor-cabeza','hormigueo'], 'Pérdida de Conocimiento — Urgencia Neurológica', 85, 'grave', '🚨 Emergencias — Neurólogo', 'La pérdida de conocimiento es una emergencia médica que requiere atención inmediata.', array['🚨 Llama al 911 AHORA.','No dejes sola a la persona.','Colócala de lado para evitar que se ahogue.','No le des nada de comer ni beber.']),
(array['debilidad-lado','dificultad-hablar'], array['vision-borrosa','mareos','dolor-cabeza'], 'Posible ACV (Accidente Cerebrovascular)', 95, 'grave', '🚨 Emergencias — Neurólogo (código ACV)', 'Debilidad repentina de un lado del cuerpo junto con dificultad para hablar son señales de alarma de un posible ACV (protocolo FAST: cara, brazo, habla, tiempo).', array['🚨 Llama al 911 AHORA — cada minuto cuenta.','Anota la hora exacta en que empezaron los síntomas.','No le des de comer, beber ni medicamentos.','Mantén a la persona tranquila y en un lugar seguro hasta que llegue ayuda.']),
(array['hinchazon-cara-labios','dificultad-respirar'], array['sarpullido','picazon'], 'Posible Reacción Alérgica Grave (Anafilaxia)', 90, 'grave', '🚨 Emergencias — Alergólogo', 'La hinchazón repentina de cara o labios junto con dificultad para respirar puede indicar una reacción alérgica severa.', array['🚨 Llama al 911 AHORA.','Si tienes un autoinyector de epinefrina prescrito, úsalo.','Aléjate del posible alérgeno (comida, picadura, medicamento).','No esperes a que "se le pase solo".']),
(array['labios-azulados','dificultad-respirar'], array['dolor-pecho','cansancio'], 'Signos de Falta de Oxígeno', 88, 'grave', '🚨 Emergencias', 'Los labios o dedos azulados junto con dificultad para respirar son señales de que el cuerpo no está recibiendo suficiente oxígeno.', array['🚨 Llama al 911 AHORA.','Siéntate en posición erguida, no te acuestes.','Afloja ropa ajustada alrededor del cuello y pecho.','No hagas esfuerzo físico mientras esperas ayuda.']),
(array['piel-amarilla'], array['dolor-abdominal','nauseas','cansancio'], 'Posible Ictericia — Problema Hepático', 80, 'grave', '🏥 Gastroenterólogo / Hepatólogo — Urgente', 'La piel amarillenta (ictericia) puede indicar problemas graves en el hígado o vesícula biliar.', array['Busca atención médica ese mismo día.','Evita el alcohol por completo.','No tomes medicamentos sin prescripción médica.','Necesitarás análisis de sangre urgentes.']),
(array['dolor-pecho'], array['palpitaciones','dificultad-respirar','hinchazon-piernas'], 'Posible Problema Cardíaco', 75, 'grave', '❤️ Cardiólogo — Urgente', 'El dolor de pecho puede tener causas cardíacas graves que requieren evaluación urgente.', array['Busca atención médica urgente hoy mismo.','Evita esfuerzos físicos.','Llama al 911 si el dolor se irradia al brazo o mandíbula.','Anota cuándo comenzó y cómo es el dolor.']),
(array['hinchazon-piernas','dificultad-respirar'], array['cansancio','palpitaciones'], 'Posible Insuficiencia Cardíaca', 78, 'grave', '❤️ Cardiólogo — Urgente', 'La combinación de hinchazón en piernas con dificultad para respirar puede indicar que el corazón no está bombeando eficientemente.', array['Busca atención médica en las próximas 24 horas.','Reduce el consumo de sal y líquidos.','Duerme con la cabecera elevada si te falta el aire acostado.','Pésate a diario: un aumento rápido de peso puede indicar retención de líquidos.']),
(array['palpitaciones'], array['mareos','cansancio','dificultad-respirar'], 'Arritmia o Taquicardia', 65, 'moderado', '❤️ Cardiólogo', 'Las palpitaciones frecuentes pueden indicar una alteración del ritmo cardíaco.', array['Agenda cita con cardiólogo pronto.','Reduce el consumo de cafeína y alcohol.','Evita el estrés y descansa bien.','Lleva un registro de cuándo ocurren las palpitaciones.']),
(array['hinchazon-piernas'], array['cansancio'], 'Posible Insuficiencia Venosa', 55, 'leve', '❤️ Cardiólogo / Médico General', 'La hinchazón aislada en piernas suele estar relacionada con problemas de circulación venosa.', array['Eleva las piernas cuando estés en reposo.','Evita estar mucho tiempo de pie sin moverte.','Usa medias de compresión si tu médico las recomienda.','Consulta con tu médico esta semana.']),
(array['fiebre','tos','dificultad-respirar','dolor-pecho'], array['cansancio','escalofrios'], 'Posible Neumonía', 85, 'grave', '🫁 Neumólogo — Urgente', 'Fiebre, tos, dificultad respiratoria y dolor de pecho juntos son compatibles con una infección pulmonar que requiere evaluación pronta.', array['Busca atención médica hoy mismo.','Puede requerir radiografía de tórax y antibióticos.','Reposo total y buena hidratación.','Si te cuesta mucho respirar, ve a urgencias de inmediato.']),
(array['silbido-respirar'], array['tos','dificultad-respirar','cansancio'], 'Posible Asma o Broncoespasmo', 75, 'moderado', '🫁 Neumólogo', 'El silbido al respirar (sibilancias) puede indicar asma u otras condiciones bronquiales.', array['Consulta con un neumólogo pronto.','Evita humo, polvo y alérgenos.','Si tienes inhalador, úsalo según indicación.','En crisis severa, ve a urgencias.']),
(array['fiebre','tos','cansancio'], array['dificultad-respirar','dolor-corporal','congestion-nasal'], 'Infección Viral Respiratoria (tipo gripal / COVID-19)', 78, 'moderado', '👨‍⚕️ Médico General — considerar prueba diagnóstica', 'Fiebre, tos y cansancio son el patrón típico de infecciones virales respiratorias, incluyendo gripe estacional y COVID-19.', array['Aíslate y usa mascarilla cerca de otras personas.','Considera hacerte una prueba diagnóstica si está disponible.','Reposo, hidratación y paracetamol para el malestar.','Busca atención si te falta el aire o la fiebre no cede.']),
(array['fiebre','tos','dolor-garganta'], array['congestion-nasal','cansancio','escalofrios'], 'Infección Respiratoria — Gripe o Faringitis', 80, 'leve', '👨‍⚕️ Médico General', 'Cuadro clínico compatible con infección viral respiratoria estacional.', array['Reposo en casa y abundante líquido.','Paracetamol o ibuprofeno para la fiebre.','Consulta si la fiebre supera 39°C o persiste más de 3 días.','Aíslate para no contagiar a otros.']),
(array['congestion-nasal','dolor-cabeza'], array['fiebre','dolor-garganta'], 'Posible Sinusitis', 68, 'leve', '👂 Otorrinolaringólogo / Médico General', 'La congestión nasal junto con dolor de cabeza (especialmente en la frente o mejillas) sugiere inflamación de los senos paranasales.', array['Lavados nasales con solución salina.','Aplica calor local en la zona de la frente y mejillas.','Consulta si dura más de 10 días o empeora.','Mantente bien hidratado.']),
(array['estornudos','congestion-nasal'], array['picazon'], 'Rinitis Alérgica', 65, 'leve', '🤧 Alergólogo', 'Los estornudos frecuentes junto con congestión nasal, sin fiebre, suelen indicar una reacción alérgica más que una infección.', array['Identifica y evita el alérgeno (polvo, polen, mascotas).','Antihistamínicos de venta libre pueden ayudar.','Ventila y limpia tu espacio con frecuencia.','Consulta a un alergólogo si es un problema recurrente.']),
(array['congestion-nasal','tos'], array['dolor-garganta','fiebre'], 'Resfriado Común', 70, 'leve', '👨‍⚕️ Médico General (si persiste)', 'Síntomas típicos de resfriado viral. Generalmente se resuelve solo en 7-10 días.', array['Descansa y toma mucho líquido.','Descongestionantes nasales de venta libre.','Caldo caliente y miel con limón ayudan.','Consulta si no mejoras en una semana.']),
(array['dolor-garganta'], array['fiebre','tos'], 'Faringitis', 55, 'leve', '👨‍⚕️ Médico General', 'El dolor de garganta aislado suele deberse a una inflamación viral o bacteriana de la faringe.', array['Gárgaras con agua tibia y sal.','Pastillas o caramelos para la garganta.','Consulta si aparecen placas blancas o fiebre alta (podría ser bacteriano).','Evita irritantes como el humo del cigarro.']),
(array['dolor-cabeza','vision-borrosa'], array['mareos','nauseas'], 'Migraña con Aura o Hipertensión', 70, 'moderado', '🧠 Neurólogo / Médico General', 'La combinación de dolor de cabeza con visión borrosa puede indicar migraña o presión arterial elevada.', array['Controla tu presión arterial.','Descansa en un lugar oscuro y silencioso.','Consulta al médico si ocurre frecuentemente.','Lleva un diario de episodios (hora, duración, intensidad).']),
(array['hormigueo'], array['dolor-cabeza','mareos','vision-borrosa'], 'Posible Neuropatía o Problema Circulatorio', 60, 'moderado', '🧠 Neurólogo', 'El hormigueo en extremidades puede indicar problemas nerviosos o circulatorios.', array['Agenda cita con neurólogo.','Evita posturas que compriman nervios.','Controla niveles de azúcar en sangre.','Haz ejercicio suave de forma regular.']),
(array['mareos'], array['nauseas','dolor-cabeza','vision-borrosa'], 'Vértigo o Mareo Postural', 60, 'leve', '👂 Otorrinolaringólogo / Médico General', 'Los mareos frecuentes pueden tener origen en el oído interno o la presión arterial.', array['Levántate despacio para evitar mareos.','Mantente bien hidratado.','Consulta si los episodios son frecuentes o intensos.','Evita movimientos bruscos de cabeza.']),
(array['dolor-cabeza'], array['cansancio','estres'], 'Cefalea Tensional', 50, 'leve', '👨‍⚕️ Médico General', 'El dolor de cabeza aislado, sin otras señales de alarma, suele estar relacionado con tensión muscular o estrés.', array['Descansa en un ambiente tranquilo.','Aplica compresas frías o calientes según lo que te alivie.','Identifica y reduce fuentes de estrés.','Consulta si el dolor es muy frecuente o intenso.']),
(array['vomito','diarrea','dolor-abdominal'], array['fiebre','nauseas'], 'Posible Intoxicación Alimentaria', 78, 'moderado', '🫃 Médico General / Urgencias si es severo', 'La combinación de vómito, diarrea y dolor abdominal, sobre todo si aparece pocas horas después de comer, sugiere intoxicación alimentaria.', array['Hidratación oral constante — suero o agua con sales.','Evita alimentos sólidos hasta que ceda el vómito.','Ve a urgencias si hay signos de deshidratación severa o sangre en vómito/heces.','Identifica qué comiste recientemente que pudo estar en mal estado.']),
(array['nauseas','vomito','diarrea'], array['dolor-abdominal','fiebre','cansancio'], 'Gastroenteritis Aguda', 85, 'leve', '🫃 Gastroenterólogo / Médico General', 'Infección gastrointestinal, probablemente viral o bacteriana.', array['Hidratación oral constante — suero o agua.','Dieta blanda: arroz, plátano, tostadas.','Evita lácteos y comidas grasas.','Consulta si hay sangre en heces o fiebre alta.']),
(array['acidez'], array['dolor-abdominal','nauseas'], 'Reflujo Gastroesofágico o Gastritis', 65, 'leve', '🫃 Gastroenterólogo', 'La acidez o ardor estomacal frecuente puede deberse a reflujo del ácido gástrico o inflamación de la mucosa del estómago.', array['Evita comidas muy grasosas, picantes o café en exceso.','No te acuestes inmediatamente después de comer.','Come porciones más pequeñas y frecuentes.','Consulta si el ardor es diario o muy intenso.']),
(array['dolor-abdominal'], array['nauseas','fiebre','vomito'], 'Dolor Abdominal — Evaluación Necesaria', 60, 'moderado', '🫃 Gastroenterólogo / Médico General', 'El dolor abdominal puede tener múltiples causas que requieren evaluación médica.', array['Si el dolor es intenso o repentino, ve a urgencias.','Anota la ubicación exacta y tipo de dolor.','Evita automedicarte con analgésicos fuertes.','Consulta con tu médico esta semana.']),
(array['estrenimiento'], array['dolor-abdominal'], 'Estreñimiento', 55, 'leve', '🫃 Médico General / Gastroenterólogo', 'La dificultad persistente para evacuar puede deberse a la dieta, hidratación o falta de actividad física.', array['Aumenta el consumo de fibra (frutas, verduras, granos enteros).','Bebe más agua durante el día.','Mantente físicamente activo.','Consulta si dura más de 3 semanas o hay sangre.']),
(array['fiebre','escalofrios','dolor-corporal'], array['cansancio','sudoracion-nocturna'], 'Síndrome Gripal o Infección Sistémica', 80, 'moderado', '👨‍⚕️ Médico General', 'Cuadro compatible con infección viral o bacteriana que afecta todo el organismo.', array['Reposo absoluto y abundante hidratación.','Consulta al médico si la fiebre supera 39°C.','Analgésicos de venta libre para el malestar.','Aíslate para evitar contagios.']),
(array['cansancio','mareos'], array['dolor-cabeza','perdida-apetito'], 'Posible Anemia', 60, 'moderado', '👨‍⚕️ Médico General — Análisis de sangre', 'El cansancio persistente junto con mareos puede indicar niveles bajos de hemoglobina (anemia).', array['Agenda un análisis de sangre completo (hemograma).','Aumenta el consumo de alimentos ricos en hierro.','Evita levantarte bruscamente para prevenir mareos.','Consulta con tu médico esta semana.']),
(array['perdida-peso'], array['perdida-apetito','cansancio'], 'Pérdida de Peso Inexplicada — Evaluación Necesaria', 65, 'moderado', '👨‍⚕️ Médico General — Evaluación exhaustiva', 'La pérdida de peso sin causa aparente (sin cambios en dieta o ejercicio) siempre amerita una evaluación médica para descartar causas subyacentes.', array['Agenda una cita médica en los próximos días.','Lleva un registro de tu peso y alimentación.','Informa sobre cualquier otro síntoma, aunque parezca menor.','No asumas que es "normal" sin confirmarlo con un profesional.']),
(array['sudoracion-nocturna','cansancio'], array['fiebre','perdida-peso'], 'Posible Infección Crónica o Problema Hormonal', 55, 'moderado', '👨‍⚕️ Médico General — Análisis de Sangre', 'La sudoración nocturna con cansancio prolongado puede indicar infecciones crónicas o alteraciones hormonales.', array['Agenda análisis de sangre completos.','Informa al médico sobre la duración de los síntomas.','Mantén un registro de cuándo ocurren los episodios.','Evalúa niveles de tiroides y glucosa.']),
(array['sarpullido','fiebre'], array['picazon','dolor-corporal'], 'Infección Viral Cutánea (ej. Varicela, Sarampión)', 65, 'moderado', '💆 Médico General / Dermatólogo', 'El sarpullido acompañado de fiebre puede corresponder a una infección viral que se manifiesta en la piel.', array['Aíslate para evitar contagiar a otras personas, especialmente niños.','No revientes ni rasques las lesiones.','Consulta pronto, sobre todo si no estás vacunado.','Mantén buena higiene de la piel.']),
(array['sarpullido','picazon'], array['fiebre','congestion-nasal'], 'Reacción Alérgica o Dermatitis', 75, 'leve', '💆 Dermatólogo / Alergólogo', 'Reacción cutánea compatible con alergia o dermatitis de contacto.', array['Identifica y evita el posible alérgeno.','Antihistamínicos de venta libre pueden aliviar.','No rasques la zona afectada.','Consulta al dermatólogo si empeora o se extiende.']),
(array['moretones-faciles'], array['cansancio'], 'Moretones Fáciles — Evaluar Coagulación', 55, 'moderado', '👨‍⚕️ Médico General — Análisis de sangre', 'Los moretones que aparecen con golpes muy leves (o sin golpe aparente) pueden indicar un problema de coagulación o plaquetas.', array['Agenda un análisis de sangre (incluyendo plaquetas).','Anota si tomas medicamentos anticoagulantes.','Evita golpes y actividades de alto riesgo mientras te evalúan.','Consulta pronto si los moretones son muy grandes o frecuentes.']),
(array['dolor-articular','rigidez-articular'], array['debilidad-muscular'], 'Posible Artritis o Artrosis', 70, 'moderado', '🦴 Reumatólogo', 'El dolor articular junto con rigidez, especialmente en la mañana, es característico de procesos inflamatorios o degenerativos de las articulaciones.', array['Agenda cita con reumatólogo.','Aplica calor local para aliviar la rigidez matutina.','Mantén actividad física suave (ej. caminar, estirar).','Evita cargar peso excesivo en las articulaciones afectadas.']),
(array['dolor-espalda'], array['debilidad-muscular','dolor-articular'], 'Lumbalgia (Dolor de Espalda)', 60, 'leve', '🦴 Traumatólogo / Médico General', 'El dolor de espalda o lumbar suele deberse a tensión muscular, mala postura o esfuerzo físico.', array['Evita cargar peso mientras dura el dolor.','Aplica calor local en la zona afectada.','Mantén una postura correcta al sentarte.','Consulta si el dolor se irradia a la pierna o no mejora en 2 semanas.']),
(array['dolor-oido'], array['fiebre','perdida-audicion'], 'Posible Otitis (Infección de Oído)', 68, 'moderado', '👂 Otorrinolaringólogo', 'El dolor de oído, especialmente con fiebre, suele indicar una infección del oído medio o externo.', array['No introduzcas objetos ni hisopos en el oído.','Consulta pronto, sobre todo en niños.','El médico puede indicar gotas o antibióticos según el caso.','Evita que entre agua al oído mientras dura la molestia.']),
(array['ojos-rojos','secrecion-ocular'], array['picazon'], 'Posible Conjuntivitis', 65, 'leve', '👁️ Oftalmólogo', 'Los ojos rojos con secreción son característicos de la conjuntivitis, que puede ser viral, bacteriana o alérgica.', array['Lávate las manos con frecuencia y evita tocarte los ojos.','No compartas toallas ni almohadas mientras dure.','Aplica compresas frías para aliviar la molestia.','Consulta si no mejora en unos días o hay dolor intenso.']),
(array['perdida-audicion'], array['dolor-oido','mareos'], 'Pérdida de Audición — Evaluación Necesaria', 60, 'moderado', '👂 Otorrinolaringólogo', 'La disminución de la audición amerita una evaluación para identificar la causa (cerumen, infección, u otras).', array['No intentes limpiar el oído con objetos afilados.','Agenda una audiometría con un especialista.','Evita exponerte a ruidos muy fuertes mientras te evalúan.','Consulta pronto si la pérdida fue repentina.']),
(array['dolor-orinar','orina-frecuente'], array['sangre-orina','fiebre'], 'Posible Infección Urinaria', 78, 'moderado', '🚻 Urólogo / Médico General', 'El ardor al orinar junto con necesidad frecuente de orinar son los síntomas típicos de una infección de las vías urinarias.', array['Bebe abundante agua para ayudar a eliminar la infección.','Consulta pronto — normalmente se trata con antibióticos.','Evita retener la orina por mucho tiempo.','Busca atención urgente si además tienes fiebre o dolor de espalda.']),
(array['dolor-costado','sangre-orina'], array['nauseas','vomito'], 'Posibles Cálculos Renales', 75, 'moderado', '🚻 Urólogo — Urgente si el dolor es intenso', 'El dolor en el costado o zona lumbar baja junto con sangre en la orina puede indicar cálculos (piedras) en el riñón.', array['Bebe abundante agua, salvo indicación médica contraria.','Ve a urgencias si el dolor es súbito e insoportable.','Evita automedicarte con antiinflamatorios sin consultar.','El médico puede solicitar una ecografía o tomografía.']),
(array['ansiedad'], array['insomnio','estres'], 'Ansiedad — Valoración Recomendada', 55, 'leve', '🧘 Psicólogo', 'La ansiedad o nerviosismo constante que afecta tu día a día es algo que vale la pena conversar con un profesional de salud mental.', array['Hablar con un psicólogo puede ayudarte a manejarlo mejor.','Técnicas de respiración y actividad física suelen ayudar a corto plazo.','Reduce el consumo de cafeína si notas que te afecta.','Si sientes que no puedes manejarlo solo/a, no esperes para pedir ayuda.']),
(array['animo-bajo'], array['insomnio','cansancio'], 'Malestar Emocional Persistente — Valoración Recomendada', 55, 'moderado', '🧘 Psicólogo / Psiquiatra', 'La tristeza o desánimo persistente merece ser conversado con un profesional; esta herramienta no puede ni debe hacer un diagnóstico de salud mental.', array['Habla con un psicólogo o psiquiatra sobre cómo te sientes.','Apóyate en personas de confianza — no tienes que pasar por esto solo/a.','Mantener rutinas de sueño y actividad física puede ayudar.','Si en algún momento tienes pensamientos de hacerte daño, contacta de inmediato una línea de crisis o acude a urgencias.']),
(array['insomnio'], array['ansiedad','estres'], 'Trastorno del Sueño', 50, 'leve', '👨‍⚕️ Médico General / Psicólogo', 'La dificultad persistente para dormir puede afectar tu salud física y emocional a largo plazo.', array['Mantén horarios regulares para dormir y despertar.','Evita pantallas y cafeína antes de dormir.','Consulta si el insomnio dura más de un mes.','Considera técnicas de relajación antes de acostarte.']);
