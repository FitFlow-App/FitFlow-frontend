import { useState, useEffect } from 'react';
import type { DiaPlanificado, PlanificacionSemanal } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CalendarViewProps {
  token: string;
  userId: number;
}

// Componente reutilizable para mostrar los detalles de la rutina
const RutinaDetalles = ({ dia }: { dia: DiaPlanificado }) => {
  const diasSemanaNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaNombre = diasSemanaNombres[dia.diaSemana === 7 ? 0 : dia.diaSemana];

  return (
    <div className="mt-4 p-4 bg-gray-700 rounded-lg">
      <h3 className="text-xl font-semibold mb-2">
        {diaNombre} - {dia.rutina.nombre}
      </h3>
      <div className="space-y-2">
        {dia.rutina.ejercicios.map((ejercicio, index) => (
          <div key={index} className="flex justify-between items-center border-b border-gray-600 last:border-0 py-2">
            <span>{ejercicio.ejercicio.nombre}</span>
            <span className="text-gray-400 text-right">
              {ejercicio.series}x{ejercicio.repeticiones}
              {ejercicio.peso && ` @ ${ejercicio.peso}kg`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CalendarView({ token, userId }: CalendarViewProps) {
  const [fechaSeleccionada] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaPlanificado | null>(null);
  const [planificacionActiva, setPlanificacionActiva] = useState<PlanificacionSemanal | null>(null);
  const [rutinaHoy, setRutinaHoy] = useState<DiaPlanificado | null>(null);
  const diasSemanaNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

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

  useEffect(() => {
    if (planificacionActiva) {
      const hoy = new Date();
      const diaPlanificadoHoy = obtenerDiaPlanificado(hoy);
      if (diaPlanificadoHoy) {
        setRutinaHoy(diaPlanificadoHoy);
      } else {
        setRutinaHoy(null);
      }
    }
  }, [planificacionActiva]);

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

    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(firstDay);
      prevDate.setDate(prevDate.getDate() - (firstDayOfWeek - i));
      currentWeek.push(prevDate);
    }

    const currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      currentWeek.push(new Date(currentDate));
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

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

      {/* Mostrar la rutina de hoy si existe */}
      {rutinaHoy ? (
        <div className="bg-indigo-700 text-white p-4 rounded-lg text-center mb-4">
          <p className="text-lg font-semibold">
            ¡Hoy te toca <b>{rutinaHoy.rutina.nombre}</b>! 💪
          </p>
        </div>
      ) : (
        <div className="bg-gray-700 text-gray-300 p-4 rounded-lg text-center mb-4">
          <p className="text-lg font-semibold">
            ¡Hoy no tienes una rutina planificada! 😌
          </p>
        </div>
      )}

      {/* Mostrar los detalles de la rutina de hoy si existe */}
      {rutinaHoy && <RutinaDetalles dia={rutinaHoy} />}

      {/* Calendario de entrenamiento */}
      <div className="grid grid-cols-7 gap-2 my-4">
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
                className={`p-2 rounded text-center cursor-pointer ${esHoy ? 'bg-indigo-600' :
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

      {/* Mostrar la rutina seleccionada por el usuario */}
      {diaSeleccionado && <RutinaDetalles dia={diaSeleccionado} />}
    </div>
  );
}