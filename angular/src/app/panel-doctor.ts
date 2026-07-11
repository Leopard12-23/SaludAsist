// panel-doctor.ts — módulo individual de Alex (Angular).
//  el doctor revisa a SUS pacientes asignados y las
// evaluaciones que el módulo Vue escribió en Supabase (misma tabla
// `evaluaciones`, filtrada por RLS), y deja una nota clínica.
import { Component, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { supabase } from './supabase-client';

interface Evaluacion {
  id: string;
  usuario_id: string;
  sintomas: string[];
  resultado: { enfermedad: string; gravedad: string; probabilidad: number } | null;
  fecha: string;
  nota_doctor: string | null;
}

interface PacienteFila {
  id: string;
  nombre: string;
  correo: string;
  historial: Evaluacion[];
}

@Component({
  selector: 'app-panel-doctor',
  imports: [DatePipe],
  template: `
    <div class="topbar">
      <strong>🩺 SaludAsist — Módulo Angular</strong>
      @if (!cargando() && !sinSesion() && !noEsDoctor()) {
        <div class="topbar-right">
          <span>Dr(a). {{ nombreDoctor() }} @if (especialidad()) { · {{ especialidad() }} }</span>
          <button type="button" (click)="alternarDisponibilidad()">
            {{ disponible() ? '🗓️ Disponible ✅' : '🗓️ No disponible ❌' }}
          </button>
          <button type="button" (click)="cerrarSesion()">Salir</button>
        </div>
      }
    </div>

    <main>
      @if (cargando()) {
        <p class="aviso">Cargando panel del doctor...</p>
      } @else if (sinSesion()) {
        <p class="aviso">No hay sesión activa. Inicia sesión desde la contenedora.</p>
      } @else if (noEsDoctor()) {
        <p class="aviso">Esta sección es para cuentas de tipo doctor. Tu cuenta actual no tiene ese rol.</p>
      } @else {
        <div class="stats">
          <div class="stat"><span class="num">{{ totalPacientes() }}</span><span>Pacientes asignados</span></div>
          <div class="stat"><span class="num">{{ casosGraves() }}</span><span>Casos graves recientes</span></div>
        </div>

        <h2>Mis pacientes</h2>
        @if (pacientes().length === 0) {
          <p class="aviso">Todavía no tienes pacientes asignados. Pídele al administrador que te asigne alguno desde el módulo Vue.</p>
        }

        @for (p of pacientes(); track p.id) {
          <div class="paciente-card">
            <button type="button" class="paciente-header" (click)="alternarPaciente(p.correo)">
              🧑‍⚕️ {{ p.nombre }} <span class="badge">{{ p.historial.length }} evaluación(es)</span>
            </button>

            @if (pacienteAbierto() === p.correo) {
              <div class="paciente-body">
                @if (p.historial.length === 0) {
                  <p class="aviso">Este paciente todavía no registró evaluaciones.</p>
                }
                @for (ev of p.historial; track ev.id) {
                  <div class="evaluacion">
                    <div class="evaluacion-header">
                      <span>{{ ev.fecha | date: 'short' }}</span>
                      <span class="badge" [class]="'gravedad-' + (ev.resultado?.gravedad ?? 'na')">
                        {{ ev.resultado?.enfermedad ?? 'Sin coincidencia' }}
                      </span>
                    </div>
                    <p><strong>Síntomas:</strong> {{ ev.sintomas.join(', ') }}</p>
                    <label>Nota clínica:
                      <textarea rows="2" [value]="ev.nota_doctor ?? ''" #nota></textarea>
                    </label>
                    <button type="button" (click)="guardarNota(ev.id, nota.value)">💾 Guardar nota</button>
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </main>
  `,
  styles: [`
    :host { font-family: system-ui, sans-serif; display: block; min-height: 100vh; }
    .topbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #0f172a; color: #fff; }
    .topbar-right { display: flex; gap: 10px; align-items: center; font-size: .85rem; }
    .topbar-right button { background: #1e293b; color: #fff; border: none; border-radius: 6px; padding: 6px 10px; cursor: pointer; }
    main { max-width: 760px; margin: 0 auto; padding: 24px 16px; }
    .aviso { color: #555; }
    .stats { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat { flex: 1; background: #f1f5f9; border-radius: 10px; padding: 16px; text-align: center; }
    .stat .num { display: block; font-size: 1.6rem; font-weight: 700; }
    .paciente-card { border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
    .paciente-header { width: 100%; text-align: left; padding: 12px 16px; background: #fff; border: none; cursor: pointer; font-size: 1rem; }
    .badge { background: #2563eb; color: #fff; border-radius: 999px; padding: 2px 10px; font-size: .75rem; margin-left: 8px; }
    .gravedad-grave { background: #dc2626; }
    .gravedad-moderado { background: #d97706; }
    .gravedad-leve { background: #16a34a; }
    .paciente-body { padding: 12px 16px; background: #f8fafc; }
    .evaluacion { background: #fff; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
    .evaluacion-header { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: .85rem; }
    textarea { width: 100%; margin: 6px 0; }
  `],
})
export class PanelDoctor implements OnInit {
  cargando = signal(true);
  sinSesion = signal(false);
  noEsDoctor = signal(false);
  correoDoctor = signal('');
  nombreDoctor = signal('');
  especialidad = signal<string | null>(null);
  disponible = signal(true);
  pacientes = signal<PacienteFila[]>([]);
  pacienteAbierto = signal<string | null>(null);

  totalPacientes = computed(() => this.pacientes().length);
  casosGraves = computed(() => this.pacientes().filter(p => p.historial[0]?.resultado?.gravedad === 'grave').length);

  async ngOnInit(): Promise<void> {
    // Sesión compartida: la contenedora (o el módulo Vue) ya hizo el login
    // real contra Supabase; al vivir bajo el mismo origen, supabase-js
    // recupera esa MISMA sesión de localStorage sin pedir credenciales de nuevo.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { this.sinSesion.set(true); this.cargando.set(false); return; }

    const { data: perfil } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single();
    if (!perfil) { this.sinSesion.set(true); this.cargando.set(false); return; }
    if (perfil['rol'] !== 'doctor') { this.noEsDoctor.set(true); this.cargando.set(false); return; }

    this.correoDoctor.set(perfil['correo']);
    this.nombreDoctor.set(perfil['nombre']);
    this.especialidad.set(perfil['especialidad'] ?? null);
    this.disponible.set(perfil['disponible']);

    const { data: asignaciones } = await supabase.from('asignaciones').select('paciente_id').eq('doctor_id', perfil['id']);
    const idsPacientes = (asignaciones ?? []).map(a => a.paciente_id);

    if (idsPacientes.length > 0) {
      const [{ data: perfilesPacientes }, { data: evaluaciones }] = await Promise.all([
        supabase.from('perfiles').select('id,nombre,correo').in('id', idsPacientes),
        supabase.from('evaluaciones').select('id,usuario_id,sintomas,resultado,fecha,nota_doctor').in('usuario_id', idsPacientes).order('fecha', { ascending: false }),
      ]);

      const filas: PacienteFila[] = (perfilesPacientes ?? []).map(p => ({
        id: p.id, nombre: p.nombre, correo: p.correo,
        historial: (evaluaciones ?? []).filter(e => e.usuario_id === p.id),
      }));
      this.pacientes.set(filas);
    }

    this.cargando.set(false);
  }

  alternarPaciente(correo: string): void {
    this.pacienteAbierto.set(this.pacienteAbierto() === correo ? null : correo);
  }

  async guardarNota(idEvaluacion: string, nota: string): Promise<void> {
    await supabase.from('evaluaciones').update({ nota_doctor: nota }).eq('id', idEvaluacion);
  }

  async alternarDisponibilidad(): Promise<void> {
    const nuevo = !this.disponible();
    await supabase.from('perfiles').update({ disponible: nuevo }).eq('correo', this.correoDoctor());
    this.disponible.set(nuevo);
  }

  async cerrarSesion(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/';
  }
}
