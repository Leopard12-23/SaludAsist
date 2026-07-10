// asignaciones.test.ts — prueba que asignar/desasignar pacientes a
// doctores funcione bien y que cada doctor solo vea a los suyos.
import { describe, it, expect, beforeEach } from 'vitest';
import { doctorAsignado, asignarDoctor, pacientesDeDoctor, limpiarAsignacionesDe } from './asignaciones';

beforeEach(() => {
  localStorage.clear();
});

describe('asignaciones', () => {
  it('un paciente sin asignar devuelve null', () => {
    expect(doctorAsignado('paciente@ejemplo.com')).toBeNull();
  });

  it('asigna un paciente a un doctor y lo puede consultar después', () => {
    asignarDoctor('paciente@ejemplo.com', 'doctor@ejemplo.com');
    expect(doctorAsignado('paciente@ejemplo.com')).toBe('doctor@ejemplo.com');
  });

  it('permite reasignar un paciente a otro doctor', () => {
    asignarDoctor('paciente@ejemplo.com', 'doctor1@ejemplo.com');
    asignarDoctor('paciente@ejemplo.com', 'doctor2@ejemplo.com');
    expect(doctorAsignado('paciente@ejemplo.com')).toBe('doctor2@ejemplo.com');
  });

  it('desasigna un paciente al pasar una cadena vacía', () => {
    asignarDoctor('paciente@ejemplo.com', 'doctor@ejemplo.com');
    asignarDoctor('paciente@ejemplo.com', '');
    expect(doctorAsignado('paciente@ejemplo.com')).toBeNull();
  });

  it('un doctor solo ve a SUS pacientes asignados, no a los de otro doctor', () => {
    asignarDoctor('paciente1@ejemplo.com', 'doctorA@ejemplo.com');
    asignarDoctor('paciente2@ejemplo.com', 'doctorB@ejemplo.com');
    asignarDoctor('paciente3@ejemplo.com', 'doctorA@ejemplo.com');

    const pacientesDeA = pacientesDeDoctor('doctorA@ejemplo.com');
    expect(pacientesDeA).toContain('paciente1@ejemplo.com');
    expect(pacientesDeA).toContain('paciente3@ejemplo.com');
    expect(pacientesDeA).not.toContain('paciente2@ejemplo.com');
  });

  it('limpiarAsignacionesDe borra la asignación si el correo era un paciente', () => {
    asignarDoctor('paciente@ejemplo.com', 'doctor@ejemplo.com');
    limpiarAsignacionesDe('paciente@ejemplo.com');
    expect(doctorAsignado('paciente@ejemplo.com')).toBeNull();
  });

  it('limpiarAsignacionesDe desasigna a todos los pacientes si el correo era un doctor', () => {
    asignarDoctor('paciente1@ejemplo.com', 'doctor@ejemplo.com');
    asignarDoctor('paciente2@ejemplo.com', 'doctor@ejemplo.com');
    limpiarAsignacionesDe('doctor@ejemplo.com');
    expect(pacientesDeDoctor('doctor@ejemplo.com')).toEqual([]);
    expect(doctorAsignado('paciente1@ejemplo.com')).toBeNull();
    expect(doctorAsignado('paciente2@ejemplo.com')).toBeNull();
  });
});
