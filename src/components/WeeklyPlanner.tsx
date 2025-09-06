import React, { useState, useEffect } from 'react';
import type { PlanificacionSemanal, Rutina } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface WeeklyPlannerProps {
  token: string;
  userId: number;
}

export default function WeeklyPlanner({ token, userId }: WeeklyPlannerProps) {
  const [planificaciones, setPlanificaciones] = useState<PlanificacionSemanal[]>([]);
  const [planificacionActiva, setPlanificacionActiva] = useState<PlanificacionSemanal | null>(null);
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanificacionForm, setShowPlanificacionForm] = useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [planificacionesRes, rutinasRes] = await Promise.all([
        fetch(`${API_BASE_URL}/planificaciones/usuario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/routines`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (planificacionesRes.ok) {
        const planificacionesData = await planificacionesRes.json();
        setPlanificaciones(planificacionesData);
        const activa = planificacionesData.find((p: PlanificacionSemanal) => p.activa);
        setPlanificacionActiva(activa || null);
      }

      if (rutinasRes.ok) {
        const rutinasData = await rutinasRes.json();
        setRutinas(rutinasData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  const handleCrearPlanificacion = async (nombre: string, numero: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/planificaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, numero, usuarioId: userId }),
      });

      if (response.ok) {
        setShowPlanificacionForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating planificación:', error);
    }
  };

  const handleAsignarRutina = async (diaSemana: number, rutinaId: number) => {
    if (!planificacionActiva) return;

    try {
      const response = await fetch(`${API_BASE_URL}/planificaciones/dias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: `${diasSemana[diaSemana - 1]} - ${rutinas.find(r => r.id === rutinaId)?.nombre}`,
          diaSemana,
          planificacionId: planificacionActiva.id,
          rutinaId,
        }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error assigning routine:', error);
    }
  };

  const handleActivarPlanificacion = async (planificacionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/planificaciones/${planificacionId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ usuarioId: userId }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error activating planificación:', error);
    }
  };

  if (isLoading) return <div className="text-center p-8">Cargando planificación...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Planificación Semanal</h2>
        <div className="flex gap-2">
          <select
            value={planificacionActiva?.id || ''}
            onChange={(e) => {
              const planificacion = planificaciones.find(p => p.id === parseInt(e.target.value));
              if (planificacion) setPlanificacionActiva(planificacion);
            }}
            className="bg-gray-700 text-white px-3 py-2 rounded"
          >
            <option value="">Seleccionar planificación</option>
            {planificaciones.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.activa && '(Activa)'}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowPlanificacionForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Nueva Planificación
          </button>
        </div>
      </div>

      {showPlanificacionForm && (
        <PlanificacionForm
          onCancel={() => setShowPlanificacionForm(false)}
          onSubmit={handleCrearPlanificacion}
        />
      )}

      {planificacionActiva && (
        <div className="grid grid-cols-7 gap-4">
          {diasSemana.map((dia, index) => {
            const diaNumero = index + 1;
            const diaPlanificado = planificacionActiva.dias.find(d => d.diaSemana === diaNumero);
            
            return (
              <div key={dia} className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">{dia}</h3>
                {diaPlanificado ? (
                  <div>
                    <p className="text-indigo-300">{diaPlanificado.rutina.nombre}</p>
                    <button className="text-sm text-red-400 mt-2">
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <select
                    onChange={(e) => handleAsignarRutina(diaNumero, parseInt(e.target.value))}
                    className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
                  >
                    <option value="">Seleccionar rutina</option>
                    {rutinas.map(rutina => (
                      <option key={rutina.id} value={rutina.id}>
                        {rutina.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!planificacionActiva && planificaciones.length > 0 && (
        <div className="text-center p-8">
          <p className="text-gray-400 mb-4">Selecciona o activa una planificación</p>
          <div className="space-y-2">
            {planificaciones.map(planificacion => (
              <div key={planificacion.id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                <span>{planificacion.nombre}</span>
                <button
                  onClick={() => handleActivarPlanificacion(planificacion.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Activar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlanificacionForm({ onCancel, onSubmit }: { 
  onCancel: () => void; 
  onSubmit: (nombre: string, numero: number) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Nueva Planificación</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Número de semana</label>
            <input
              type="number"
              value={numero}
              onChange={(e) => setNumero(parseInt(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button onClick={onCancel} className="bg-gray-600 px-4 py-2 rounded">
              Cancelar
            </button>
            <button 
              onClick={() => onSubmit(nombre, numero)} 
              className="bg-indigo-600 px-4 py-2 rounded"
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}