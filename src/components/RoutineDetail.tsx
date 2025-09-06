import React, { useState } from 'react';
import type { Rutina, RutinaEjercicio } from '../types';
import ExerciseForm from './ExerciseForm.tsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface RoutineDetailProps {
  rutina: Rutina;
  token: string;
  onDataChange: () => void; // Función para notificar al Dashboard que debe refrescar los datos
}

export default function RoutineDetail({
  rutina,
  token,
  onDataChange,
}: RoutineDetailProps) {
  const [isManagingExercise, setIsManagingExercise] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<RutinaEjercicio | null>(
    null
  );

  const handleExerciseSuccess = () => {
    setIsManagingExercise(false);
    setExerciseToEdit(null);
    onDataChange(); // Llama a la función para refrescar
  };

  const handleOpenAddExercise = () => {
    setExerciseToEdit(null);
    setIsManagingExercise(true);
  };

  const handleOpenEditExercise = (ejercicio: RutinaEjercicio) => {
    setExerciseToEdit(ejercicio);
    setIsManagingExercise(true);
  };

  const handleDeleteExercise = async (rutinaEjercicioId: number) => {
    if (
      !window.confirm(
        '¿Estás seguro de que quieres quitar este ejercicio de la rutina?'
      )
    )
      return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/routine-exercises/${rutinaEjercicioId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('No se pudo eliminar el ejercicio.');
      onDataChange(); // Refresca para mostrar los cambios
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      {/* Modal para añadir/editar ejercicio */}
      {isManagingExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <ExerciseForm
            token={token}
            rutinaId={rutina.id}
            ejercicioToEdit={exerciseToEdit}
            onSuccess={handleExerciseSuccess}
            onCancel={() => setIsManagingExercise(false)}
          />
        </div>
      )}

      {/* Contenido principal del detalle de la rutina */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-3xl font-bold mb-1">{rutina.nombre}</h2>
            <p className="text-gray-400">{rutina.descripcion}</p>
          </div>
          <button
            onClick={handleOpenAddExercise}
            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 flex-shrink-0 w-full sm:w-auto"
          >
            + Añadir Ejercicio a la Rutina
          </button>
        </div>
        <div className="space-y-4">
          {rutina.ejercicios.length > 0 ? (
            rutina.ejercicios.map((item) => (
              <div
                key={item.id}
                className="bg-gray-700/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center"
              >
                <div>
                  <h3 className="font-semibold text-lg text-indigo-300">
                    {item.ejercicio.nombre}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {item.ejercicio.descripcion}
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4 text-sm text-right flex-shrink-0 space-y-1">
                  <p>
                    Series:{' '}
                    <span className="font-bold text-white">
                      {item.series || 'N/A'}
                    </span>
                  </p>
                  <p>
                    Reps:{' '}
                    <span className="font-bold text-white">
                      {item.repeticiones || 'N/A'}
                    </span>
                  </p>
                  <p>
                    Peso:{' '}
                    <span className="font-bold text-white">
                      {item.peso || 'N/A'} kg
                    </span>
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleOpenEditExercise(item)}
                    className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(item.id)}
                    className="px-3 py-1 text-xs font-semibold text-white bg-red-700 rounded-md hover:bg-red-800"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">
              Esta rutina aún no tiene ejercicios. ¡Añade uno desde tu
              biblioteca!
            </p>
          )}
        </div>
      </div>
    </>
  );
}
