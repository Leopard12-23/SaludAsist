<!-- VistaDoctor.vue — panel del doctor: solo sus pacientes asignados.
     Más dinámico que antes: estadísticas arriba, los pacientes con casos
     graves recientes aparecen primero, y se ve la gravedad de un vistazo
     sin tener que abrir cada paciente uno por uno. -->
<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { obtenerSesion, listarUsuarios } from '../almacenamiento/cuentas-usuarios';
import { pacientesDeDoctor } from '../logica/asignaciones';
import { cargarHistorial, guardarNotaDoctor, type EvaluacionGuardada } from '../logica/historial-evaluaciones';
import { estaDisponible, alternarDisponibilidad } from '../logica/disponibilidad';
import { usarNotificaciones } from '../logica/usar-notificaciones';
import type { Gravedad } from '../tipos/tipos';
import ModalInfo from '../componentes/ModalInfo.vue';
import ContenidoPerfil from '../componentes/ContenidoPerfil.vue';

const sesion = obtenerSesion()!;
const { notificar } = usarNotificaciones();

const disponible = ref(estaDisponible(sesion.correo));
const verPerfil = ref(false);
const busqueda = ref('');
const orden = ref<'urgencia' | 'nombre' | 'reciente'>('urgencia');

// Solo los pacientes que el admin le asignó a ESTE doctor, con el
// historial de cada uno ya cargado (para poder calcular estadísticas
// y ordenar sin tener que abrir cada uno primero).
const correosAsignados = pacientesDeDoctor(sesion.correo);
const pacientesConHistorial = listarUsuarios('usuario')
  .filter(p => correosAsignados.includes(p.correo))
  .map(p => {
    const historial = cargarHistorial(p.correo);
    const ultimaGravedad: Gravedad | null = historial[0]?.resultado?.gravedad ?? null;
    return { ...p, historial, ultimaGravedad, ultimaFecha: historial[0]?.fecha ?? null };
  });

// Estadísticas rápidas para las tarjetas de arriba.
const totalPacientes = pacientesConHistorial.length;
const casosGraves = pacientesConHistorial.filter(p => p.ultimaGravedad === 'grave').length;
const sinEvaluar = pacientesConHistorial.filter(p => p.historial.length === 0).length;

// Filtra por nombre/correo y además ordena según lo elegido.
const pacientesFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  let lista = pacientesConHistorial.filter(p =>
    p.nombre.toLowerCase().includes(texto) || p.correo.toLowerCase().includes(texto)
  );

  const pesoGravedad: Record<string, number> = { grave: 3, moderado: 2, leve: 1 };
  if (orden.value === 'urgencia') {
    lista = [...lista].sort((a, b) => (pesoGravedad[b.ultimaGravedad ?? ''] ?? 0) - (pesoGravedad[a.ultimaGravedad ?? ''] ?? 0));
  } else if (orden.value === 'nombre') {
    lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else {
    lista = [...lista].sort((a, b) => (b.ultimaFecha ?? '').localeCompare(a.ultimaFecha ?? ''));
  }
  return lista;
});

function colorGravedad(g: Gravedad | null): string {
  if (g === 'grave') return '#dc2626';
  if (g === 'moderado') return '#d97706';
  if (g === 'leve') return '#16a34a';
  return '#9ca3af';
}

// Qué paciente está expandido ahora mismo (null = ninguno).
const pacienteAbierto = ref<string | null>(null);
const notasEnEdicion = reactive<Record<string, string>>({});

function alternarPaciente(correo: string): void {
  pacienteAbierto.value = pacienteAbierto.value === correo ? null : correo;
  const paciente = pacientesConHistorial.find(p => p.correo === correo);
  paciente?.historial.forEach((ev: EvaluacionGuardada) => { notasEnEdicion[ev.id] = ev.notaDoctor ?? ''; });
}

function guardarNota(idEvaluacion: string): void {
  guardarNotaDoctor(idEvaluacion, notasEnEdicion[idEvaluacion] ?? '');
  notificar('Nota guardada.', 'exito');
}

function cambiarDisponibilidad(): void {
  disponible.value = alternarDisponibilidad(sesion.correo);
}
</script>

<template>
  <div class="rol-banner">
    <div class="rol-banner-inner">
      <div>
        <p class="rol-banner-eyebrow">Panel de doctor especialista</p>
        <h2>Hola, Dr(a). {{ sesion.nombre.split(' ')[0] }} 👋</h2>
        <p v-if="sesion.especialidad">🩺 {{ sesion.especialidad }}</p>
        <p>Revisa a tus pacientes asignados y sus evaluaciones.</p>
      </div>
      <div class="rol-banner-opciones">
        <button type="button" class="btn btn-secondary btn-small" @click="cambiarDisponibilidad">
          🗓️ {{ disponible ? 'Disponible ✅' : 'No disponible ❌' }}
        </button>
        <button type="button" class="btn btn-secondary btn-small" @click="verPerfil = true">👤 Mi perfil</button>
      </div>
    </div>
  </div>

  <section class="container" style="padding: 30px 0;">
    <!-- Tarjetas de resumen: dan una vista general antes de entrar al detalle. -->
    <div class="stats-grid" style="margin-bottom:24px;">
      <div class="stat-item">
        <span class="stat-number">{{ totalPacientes }}</span>
        <span class="stat-label">Pacientes asignados</span>
      </div>
      <div class="stat-item" :style="casosGraves > 0 ? 'background:#fef2f2;' : ''">
        <span class="stat-number" :style="casosGraves > 0 ? 'color:#dc2626;' : ''">{{ casosGraves }}</span>
        <span class="stat-label">Casos graves recientes</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ sinEvaluar }}</span>
        <span class="stat-label">Sin evaluaciones todavía</span>
      </div>
    </div>

    <h2>🧑‍⚕️ Mis pacientes</h2>
    <p class="section-lead">Toca a un paciente para ver su historial de evaluaciones y dejarle una nota.</p>

    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px;">
      <input v-model="busqueda" type="text" placeholder="🔍 Buscar por nombre o correo..." class="buscador-input" style="flex:1; min-width:200px;">
      <select v-model="orden" class="form-select" style="width:auto;">
        <option value="urgencia">Ordenar: más urgente primero</option>
        <option value="reciente">Ordenar: evaluación más reciente</option>
        <option value="nombre">Ordenar: nombre (A-Z)</option>
      </select>
    </div>

    <p v-if="totalPacientes === 0" class="empty-history">
      Todavía no tienes pacientes asignados. Pídele al administrador que te asigne alguno desde su panel.
    </p>
    <p v-else-if="pacientesFiltrados.length === 0" class="empty-history">No hay pacientes que coincidan con "{{ busqueda }}".</p>

    <div v-for="p in pacientesFiltrados" :key="p.correo" class="symptom-accordion">
      <button type="button" class="accordion-header" :aria-expanded="pacienteAbierto === p.correo" @click="alternarPaciente(p.correo)">
        <span style="display:flex; align-items:center; gap:8px;">
          <span style="width:10px; height:10px; border-radius:50%; display:inline-block;" :style="{ background: colorGravedad(p.ultimaGravedad) }" :title="p.ultimaGravedad ?? 'sin evaluaciones'"></span>
          🧑‍⚕️ {{ p.nombre }} <span class="accordion-badge">{{ p.historial.length }} evaluación(es)</span>
        </span>
        <span class="accordion-icon">▼</span>
      </button>

      <div v-show="pacienteAbierto === p.correo" class="accordion-content">
        <p v-if="p.historial.length === 0" class="empty-history">Este paciente todavía no registró evaluaciones.</p>

        <div v-for="ev in p.historial" :key="ev.id" class="history-item">
          <div class="history-item-header">
            <span class="history-date">{{ new Date(ev.fecha).toLocaleString('es-EC') }}</span>
            <span class="badge" :style="{ background: colorGravedad(ev.resultado?.gravedad ?? null) }">{{ ev.resultado?.enfermedad ?? 'Sin coincidencia' }}</span>
          </div>
          <p class="history-symptoms"><strong>Síntomas:</strong> {{ ev.sintomas.join(', ') }}</p>

          <label style="font-size:0.82rem; font-weight:600; color:var(--primary-dark);">Nota clínica:</label>
          <textarea v-model="notasEnEdicion[ev.id]" rows="2" style="width:100%; margin:6px 0;" placeholder="Ej: Recomendé control en 1 semana..."></textarea>
          <button type="button" class="btn btn-secondary btn-sm" @click="guardarNota(ev.id)">💾 Guardar nota</button>
        </div>
      </div>
    </div>
  </section>

  <ModalInfo :abierto="verPerfil" titulo="👤 Mi perfil" @cerrar="verPerfil = false">
    <ContenidoPerfil :sesion="sesion" />
  </ModalInfo>
</template>
