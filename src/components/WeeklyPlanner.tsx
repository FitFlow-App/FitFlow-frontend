import { useState, useEffect } from 'react';
import type { PlanificacionSemanal, Rutina } from '../types';
import apiClient from '../api/axiosConfig';
import { TrashIcon } from '@heroicons/react/24/outline';

interface WeeklyPlannerProps {
  userId: number;
  planificaciones: PlanificacionSemanal[];
  onDataChange: () => void;
}

const getSemanasDelMes = () => {
  const hoy = new Date();
  const primerDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimoDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  const semanas = [];
  let fechaInicioSemana = new Date(primerDiaDelMes);
  const diaDeSemana = fechaInicioSemana.getDay();
  const ajuste = diaDeSemana === 0 ? 6 : diaDeSemana - 1;
  fechaInicioSemana.setDate(fechaInicioSemana.getDate() - ajuste);
  let numeroSemana = 1;
  while (fechaInicioSemana <= ultimoDiaDelMes) {
    const fechaFinSemana = new Date(fechaInicioSemana);
    fechaFinSemana.setDate(fechaInicioSemana.getDate() + 6);
    if (
      fechaFinSemana.getMonth() === hoy.getMonth() ||
      fechaInicioSemana.getMonth() === hoy.getMonth()
    ) {
      semanas.push({
        numero: numeroSemana,
        rangoFechas: `${fechaInicioSemana.getDate()} - ${fechaFinSemana.getDate()} de ${hoy.toLocaleString(
          'es-ES',
          { month: 'long' }
        )}`,
      });
    }
    fechaInicioSemana.setDate(fechaInicioSemana.getDate() + 7);
    numeroSemana++;
  }
  return semanas;
};

export default function WeeklyPlanner({
  userId,
  planificaciones,
  onDataChange,
}: WeeklyPlannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const semanasDelMes = getSemanasDelMes();

  useEffect(() => {
    const fetchRutinas = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/routines');
        setRutinas(response.data as Rutina[]);
      } catch (error) {
        console.error('Error fetching rutinas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRutinas();
  }, []);

  const handleCrearPlanificacion = async (
    numeroSemana: number,
    rangoFechas: string
  ) => {
    try {
      await apiClient.post('/planificaciones', {
        nombre: `Semana ${numeroSemana} (${rangoFechas.split(' de ')[0]})`,
        numero: numeroSemana,
        usuarioId: userId,
      });
      onDataChange();
    } catch (error) {
      console.error('Error creando planificación:', error);
      alert('Error al crear la planificación.');
    }
  };

  const handleEliminarPlanificacion = async (planificacionId: number) => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar esta planificación semanal?'
      )
    ) {
      try {
        await apiClient.delete(`/planificaciones/${planificacionId}`);
        onDataChange();
      } catch (error) {
        console.error('Error eliminando planificación:', error);
        alert('Error al eliminar la planificación.');
      }
    }
  };

  const handleAsignarRutina = async (
    planificacionId: number,
    diaSemana: number,
    rutinaId: number
  ) => {
    try {
      const diasSemanaNombres = [
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo',
      ];
      const planificacion = planificaciones.find(
        (p) => p.id === planificacionId
      );
      const diaPlanificadoExistente = planificacion?.dias.find(
        (d) => d.diaSemana === diaSemana
      );
      const rutinaNombre = rutinas.find((r) => r.id === rutinaId)?.nombre || '';
      const body = {
        nombre: `${diasSemanaNombres[diaSemana - 1]} - ${rutinaNombre}`,
        diaSemana,
        planificacionId,
        rutinaId,
      };

      if (diaPlanificadoExistente) {
        await apiClient.put(
          `/planificaciones/dias/${diaPlanificadoExistente.id}`,
          body
        );
      } else {
        await apiClient.post('/planificaciones/dias', body);
      }
      onDataChange();
    } catch (error) {
      console.error('Error asignando rutina:', error);
      alert('Error al asignar la rutina.');
    }
  };

  const diasSemanaNombres = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  if (isLoading) return <div className="text-center p-8">Cargando...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Planificador de{' '}
          {new Date().toLocaleString('es-ES', { month: 'long' })}
        </h2>
      </div>
      <div className="space-y-8">
        {semanasDelMes.map((semana) => {
          const planificacionExistente = planificaciones.find(
            (p) => p.numero === semana.numero
          );
          if (planificacionExistente) {
            return (
              <div
                key={planificacionExistente.id}
                className="p-4 bg-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {planificacionExistente.nombre}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {semana.rangoFechas}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleEliminarPlanificacion(planificacionExistente.id)
                    }
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full"
                    title="Eliminar Planificación"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {diasSemanaNombres.map((diaNombre, index) => {
                    const diaNumero = index + 1;
                    const diaPlanificado = planificacionExistente.dias.find(
                      (d) => d.diaSemana === diaNumero
                    );
                    return (
                      <div
                        key={diaNombre}
                        className="bg-gray-800 p-4 rounded-lg"
                      >
                        <h4 className="font-semibold mb-3">{diaNombre}</h4>
                        <select
                          onChange={(e) =>
                            handleAsignarRutina(
                              planificacionExistente.id,
                              diaNumero,
                              parseInt(e.target.value)
                            )
                          }
                          value={diaPlanificado?.rutina.id || ''}
                          className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
                        >
                          <option value="">Seleccionar rutina</option>
                          {rutinas.map((rutina) => (
                            <option key={rutina.id} value={rutina.id}>
                              {rutina.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={semana.numero}
                className="p-4 bg-gray-700/50 rounded-lg flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-400">
                    Semana {semana.numero}
                  </h3>
                  <p className="text-sm text-gray-500">{semana.rangoFechas}</p>
                </div>
                <button
                  onClick={() =>
                    handleCrearPlanificacion(semana.numero, semana.rangoFechas)
                  }
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  + Crear Planificación
                </button>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
