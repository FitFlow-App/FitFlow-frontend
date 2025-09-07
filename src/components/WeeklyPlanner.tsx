// src/components/WeeklyPlanner.tsx
import React, { useState, useEffect } from 'react';
import type { PlanificacionSemanal, Rutina } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface WeeklyPlannerProps {
  token: string;
  userId: number;
  planificaciones: PlanificacionSemanal[];
  onPlanificacionChange: () => void;
}

export default function WeeklyPlanner({ token, userId, planificaciones, onPlanificacionChange }: WeeklyPlannerProps) {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [isLoadingRutinas, setIsLoadingRutinas] = useState(true);
  const [showPlanificacionForm, setShowPlanificacionForm] = useState(false);

  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        setIsLoadingRutinas(true);
        const response = await fetch(`${API_BASE_URL}/routines`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const rutinasData = await response.json();
          setRutinas(rutinasData);
        }
      } catch (error) {
        console.error('Error fetching rutinas:', error);
      } finally {
        setIsLoadingRutinas(false);
      }
    };
    fetchRutinas();
  }, [token]);

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
        onPlanificacionChange();
      }
    } catch (error) {
      console.error('Error creating planificación:', error);
    }
  };

  const handleAsignarRutina = async (planificacionId: number, diaSemana: number, rutinaId: number) => {
    try {
      // Intentar actualizar si ya existe una asignación para ese día y planificación
      const planificacion = planificaciones.find(p => p.id === planificacionId);
      const diaPlanificadoExistente = planificacion?.dias.find(d => d.diaSemana === diaSemana);
      
      let response;
      if (diaPlanificadoExistente) {
        // Lógica para actualizar una rutina existente
        response = await fetch(`${API_BASE_URL}/planificaciones/dias/${diaPlanificadoExistente.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: `${diasSemana[diaSemana - 1]} - ${rutinas.find(r => r.id === rutinaId)?.nombre}`,
            diaSemana,
            planificacionId,
            rutinaId,
          }),
        });
      } else {
        // Lógica para crear una nueva asignación de rutina
        response = await fetch(`${API_BASE_URL}/planificaciones/dias`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: `${diasSemana[diaSemana - 1]} - ${rutinas.find(r => r.id === rutinaId)?.nombre}`,
            diaSemana,
            planificacionId,
            rutinaId,
          }),
        });
      }

      if (response.ok) {
        onPlanificacionChange();
      } else {
        throw new Error('Error al asignar o actualizar la rutina.');
      }
    } catch (error) {
      console.error('Error assigning/updating routine:', error);
      alert('Error al asignar o actualizar la rutina.');
    }
  };

  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  if (isLoadingRutinas) return <div className="text-center p-8">Cargando rutinas...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-y-4">
        <h2 className="text-2xl font-bold">Planificador Semanal</h2>
        <button
          onClick={() => setShowPlanificacionForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full sm:w-auto"
        >
          Nueva Planificación
        </button>
      </div>

      {showPlanificacionForm && (
        <PlanificacionForm
          onCancel={() => setShowPlanificacionForm(false)}
          onSubmit={handleCrearPlanificacion}
        />
      )}
      
      {planificaciones.length > 0 ? (
        <div className="space-y-8">
          {planificaciones.sort((a, b) => a.numero - b.numero).map(planificacion => (
            <div key={planificacion.id} className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-bold mb-4">{planificacion.nombre}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {diasSemana.map((dia, index) => {
                  const diaNumero = index + 1;
                  const diaPlanificado = planificacion.dias.find(d => d.diaSemana === diaNumero);
                  
                  return (
                    <div key={dia} className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">{dia}</h4>
                      {/* Aquí se muestra el selector de rutinas */}
                      <select
                        onChange={(e) => handleAsignarRutina(planificacion.id, diaNumero, parseInt(e.target.value))}
                        value={diaPlanificado?.rutina.id || ''}
                        className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
                      >
                        <option value="">Seleccionar rutina</option>
                        {rutinas.map(rutina => (
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
          ))}
        </div>
      ) : (
        <div className="text-center p-8 text-gray-400">
          Aún no tienes planificaciones. ¡Crea una para empezar!
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
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
            <button onClick={onCancel} className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">
              Cancelar
            </button>
            <button
              onClick={() => onSubmit(nombre, numero)}
              className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}