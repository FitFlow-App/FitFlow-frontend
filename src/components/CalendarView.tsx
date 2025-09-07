// src/components/CalendarView.tsx
import { useState, useEffect } from 'react';
import type { DiaPlanificado, PlanificacionSemanal } from '../types';

interface CalendarViewProps {
  planificaciones: PlanificacionSemanal[];
}

// Componente para el tooltip cerca del cursor
const HoverTooltip = ({ dia, position }: { dia: DiaPlanificado; position: { top: number; left: number } }) => {
  if (!dia) return null;

  return (
    <div
      style={{ top: position.top, left: position.left, transform: 'translate(-50%, -110%)' }}
      className="fixed z-50 p-3 rounded-lg bg-gray-900 bg-opacity-80 text-white shadow-lg pointer-events-none"
    >
      <h4 className="font-bold text-sm mb-1">{dia.rutina.nombre}</h4>
      <ul className="text-xs space-y-1">
        {dia.rutina.ejercicios.slice(0, 3).map((ejercicio, index) => (
          <li key={index} className="truncate">
            {`${ejercicio.ejercicio.nombre}  ` }
            { ejercicio.series}x{ejercicio.repeticiones}
            { ejercicio.peso && ` @ ${ejercicio.peso}kg`}
          </li>
        ))}
        {dia.rutina.ejercicios.length > 3 && (
          <li className="text-gray-400">...y más ejercicios</li>
        )}
      </ul>
    </div>
  );
};

// Componente para mostrar los detalles de la rutina
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

export default function CalendarView({ planificaciones }: CalendarViewProps) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaPlanificado | null>(null);
  const [rutinaHoy, setRutinaHoy] = useState<DiaPlanificado | null>(null);
  const [hoveredDia, setHoveredDia] = useState<DiaPlanificado | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const diasSemanaNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diasSemanaCorta = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const sortedPlanificaciones = [...planificaciones].sort((a, b) => a.numero - b.numero);

  const obtenerDiaDeLaSemana = (fecha: Date): number => {
    return fecha.getDay() === 0 ? 7 : fecha.getDay();
  };

  const obtenerDiaPlanificado = (fecha: Date): DiaPlanificado | undefined => {
    const diaDelMes = fecha.getDate();
    const numeroSemana = Math.ceil(diaDelMes / 7);

    const planificacion = sortedPlanificaciones.find(p => p.numero === numeroSemana);

    if (planificacion) {
      const diaSemana = obtenerDiaDeLaSemana(fecha);
      return planificacion.dias.find(d => d.diaSemana === diaSemana);
    }
    return undefined;
  };

  useEffect(() => {
    const diaPlanificadoHoy = obtenerDiaPlanificado(new Date());
    setRutinaHoy(diaPlanificadoHoy || null);
  }, [planificaciones]);

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

  const handlePreviousMonth = () => {
    setFechaSeleccionada(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setDiaSeleccionado(null);
  };

  const handleNextMonth = () => {
    setFechaSeleccionada(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setDiaSeleccionado(null);
  };

  const handleDayClick = (dia: DiaPlanificado) => {
    setDiaSeleccionado(dia);
  };

  const handleDayHover = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, dia: DiaPlanificado) => {
    setTooltipPosition({ top: e.clientY, left: e.clientX });
    setHoveredDia(dia);
  };

  const handleDayLeave = () => {
    setHoveredDia(null);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Calendario de Entrenamiento</h2>

      {planificaciones.length > 0 && (
        <div className="mb-6">
          {rutinaHoy ? (
            <div className="bg-indigo-700 text-white p-4 rounded-lg text-center mb-4">
              <p className="text-lg font-semibold">
                ¡Hoy toca <b>{rutinaHoy.rutina.nombre}</b>! 💪
              </p>
            </div>
          ) : (
            <div className="bg-gray-700 text-gray-300 p-4 rounded-lg text-center mb-4">
              <p className="text-lg font-semibold">
                ¡Hoy no tienes una rutina planificada! 😌
              </p>
            </div>
          )}
          {rutinaHoy && <RutinaDetalles dia={rutinaHoy} />}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePreviousMonth} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-bold">
          {fechaSeleccionada.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={handleNextMonth} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {diasSemanaCorta.map(dia => (
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
                onClick={() => diaPlanificado && handleDayClick(diaPlanificado)}
                onMouseEnter={(e) => diaPlanificado && handleDayHover(e, diaPlanificado)}
                onMouseLeave={handleDayLeave}
                className={`p-2 rounded text-center cursor-pointer h-28 flex flex-col justify-center items-center relative ${esHoy ? 'bg-indigo-600' :
                    diaPlanificado ? 'bg-green-600' :
                      esMesActual ? 'bg-gray-700' : 'bg-gray-600'
                  } ${!esMesActual ? 'text-gray-400' : 'text-white'}`}
              >
                <div className="text-xl font-bold">{fecha.getDate()}</div>
                {diaPlanificado && (
                  <div className="text-xs mt-1 truncate w-full px-1">
                    {diaPlanificado.rutina.nombre}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {hoveredDia && <HoverTooltip dia={hoveredDia} position={tooltipPosition} />}
      {diaSeleccionado && <RutinaDetalles dia={diaSeleccionado} />}
    </div>
  );
}