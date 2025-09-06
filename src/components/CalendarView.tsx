// src/components/CalendarView.tsx
import React, { useState, useEffect } from 'react';
import type { DiaPlanificado, PlanificacionSemanal } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CalendarViewProps {
  token: string;
  userId: number;
}

export default function CalendarView({ token, userId }: CalendarViewProps) {
  const [fechaSeleccionada] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaPlanificado | null>(null);
  const [planificacionActiva, setPlanificacionActiva] = useState<PlanificacionSemanal | null>(null);

  useEffect(() => {
    const fetchPlanificacionActiva = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/planificaciones/usuario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const planificaciones = await response.json();
          const activa = planificaciones.find((p: PlanificacionSemanal) => p.activa);
          setPlanificacionActiva(activa);
        }
      } catch (error) {
        console.error('Error fetching planificación:', error);
      }
    };
    fetchPlanificacionActiva();
  }, [token, userId]);

  const obtenerDiaDeLaSemana = (fecha: Date): number => {
    return fecha.getDay() === 0 ? 7 : fecha.getDay();
  };

  const obtenerDiaPlanificado = (fecha: Date): DiaPlanificado | undefined => {
    if (!planificacionActiva) return undefined;
    const diaSemana = obtenerDiaDeLaSemana(fecha);
    return planificacionActiva.dias.find(d => d.diaSemana === diaSemana);
  };

  const generarSemanasDelMes = (fecha: Date): Date[][] => {
    const weeks: Date[][] = [];
    const firstDay = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const lastDay = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    
    let currentWeek: Date[] = [];
    
    // Rellenar días de la semana anterior
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(firstDay);
      prevDate.setDate(prevDate.getDate() - (firstDayOfWeek - i));
      currentWeek.push(prevDate);
    }
    
    // Días del mes actual
    const currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      currentWeek.push(new Date(currentDate));
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Rellenar días de la semana siguiente
    if (currentWeek.length > 0) {
      const nextDate = new Date(currentWeek[currentWeek.length - 1]);
      while (currentWeek.length < 7) {
        nextDate.setDate(nextDate.getDate() + 1);
        currentWeek.push(new Date(nextDate));
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const semanas = generarSemanasDelMes(fechaSeleccionada);
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Calendario de Entrenamiento</h2>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {diasSemana.map(dia => (
          <div key={dia} className="text-center font-semibold p-2">
            {dia}
          </div>
        ))}
      </div>

      {semanas.map((semana, index) => (
        <div key={index} className="grid grid-cols-7 gap-2 mb-2">
          {semana.map((fecha, diaIndex) => {
            const diaPlanificado = obtenerDiaPlanificado(fecha);
            const esHoy = fecha.toDateString() === new Date().toDateString();
            const esMesActual = fecha.getMonth() === fechaSeleccionada.getMonth();
            
            return (
              <div
                key={diaIndex}
                onClick={() => diaPlanificado && setDiaSeleccionado(diaPlanificado)}
                className={`p-2 rounded text-center cursor-pointer ${
                  esHoy ? 'bg-indigo-600' : 
                  diaPlanificado ? 'bg-green-600' : 
                  esMesActual ? 'bg-gray-700' : 'bg-gray-600'
                } ${!esMesActual ? 'text-gray-400' : 'text-white'}`}
              >
                {fecha.getDate()}
                {diaPlanificado && (
                  <div className="text-xs mt-1 truncate">
                    {diaPlanificado.rutina.nombre}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {diaSeleccionado && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">
            {diasSemana[diaSeleccionado.diaSemana - 1]} - {diaSeleccionado.rutina.nombre}
          </h3>
          <div className="space-y-2">
            {diaSeleccionado.rutina.ejercicios.map((ejercicio, index) => (
              <div key={index} className="flex justify-between">
                <span>{ejercicio.ejercicio.nombre}</span>
                <span>
                  {ejercicio.series}x{ejercicio.repeticiones} 
                  {ejercicio.peso && ` @ ${ejercicio.peso}kg`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}