// Este archivo centraliza todas las "formas" de nuestros datos.

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
  ejercicios: RutinaEjercicio[];
}
