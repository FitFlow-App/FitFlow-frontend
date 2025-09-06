// src/types.ts
export interface EjercicioDetallado {
  id: number;
  nombre: string;
  descripcion: string | null;
  musculo: string | null;
}

export interface RutinaEjercicio {
  id: number;
  ejercicio: EjercicioDetallado;
  series: number | null;
  repeticiones: number | null;
  peso: number | null;
}

export interface Rutina {
  id: number;
  nombre: string;
  descripcion: string | null;
  usuarioId: number;
  ejercicios: RutinaEjercicio[];
  diasPlanificados: DiaPlanificado[];
}

export interface DiaPlanificado {
  id: number;
  nombre: string;
  diaSemana: number;
  planificacionId: number;
  rutinaId: number;
  rutina: Rutina;
  completado: boolean;
  fecha: Date | null;
}

export interface PlanificacionSemanal {
  id: number;
  nombre: string;
  numero: number;
  usuarioId: number;
  dias: DiaPlanificado[];
  activa: boolean;
}