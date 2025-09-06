import React, { useState, useEffect } from 'react';
import type { EjercicioDetallado, RutinaEjercicio } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ExerciseFormProps {
  token: string;
  rutinaId: number;
  // Si pasamos un ejercicio, significa que estamos editando la relación (series, reps, etc.)
  ejercicioToEdit?: RutinaEjercicio | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ExerciseForm({
  token,
  rutinaId,
  ejercicioToEdit,
  onSuccess,
  onCancel,
}: ExerciseFormProps) {
  // Lista de todos los ejercicios disponibles en tu biblioteca para el <select>
  const [availableExercises, setAvailableExercises] = useState<
    EjercicioDetallado[]
  >([]);

  // Datos del formulario
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [series, setSeries] = useState('');
  const [repeticiones, setRepeticiones] = useState('');
  const [peso, setPeso] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!ejercicioToEdit;

  // Al abrir el formulario, busca todos los ejercicios de tu biblioteca
  useEffect(() => {
    const fetchAllExercises = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/ejercicios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok)
          throw new Error(
            'No se pudieron cargar los ejercicios de la biblioteca.'
          );
        const data = await response.json();
        setAvailableExercises(data);

        if (isEditing) {
          // Si estamos editando, pre-rellena los campos con los datos existentes
          setSelectedExerciseId(ejercicioToEdit.ejercicio.id.toString());
          setSeries(ejercicioToEdit.series?.toString() || '');
          setRepeticiones(ejercicioToEdit.repeticiones?.toString() || '');
          setPeso(ejercicioToEdit.peso?.toString() || '');
        } else if (data.length > 0) {
          // Si estamos creando, selecciona el primer ejercicio de la lista por defecto
          setSelectedExerciseId(data[0].id.toString());
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllExercises();
  }, [token, ejercicioToEdit, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const url = isEditing
      ? `${API_BASE_URL}/routine-exercises/${ejercicioToEdit.id}`
      : `${API_BASE_URL}/routine-exercises`;

    const method = isEditing ? 'PUT' : 'POST';

    const body = isEditing
      ? {
          // Para editar, solo enviamos lo que puede cambiar
          series: series ? parseInt(series) : undefined,
          repeticiones: repeticiones ? parseInt(repeticiones) : undefined,
          peso: peso ? parseFloat(peso) : undefined,
        }
      : {
          // Para crear, enviamos todo
          rutinaId: rutinaId,
          ejercicioId: parseInt(selectedExerciseId),
          series: series ? parseInt(series) : undefined,
          repeticiones: repeticiones ? parseInt(repeticiones) : undefined,
          peso: peso ? parseFloat(peso) : undefined,
        };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'La operación falló.');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg max-w-lg w-full">
      <h2 className="text-2xl font-bold text-white mb-4">
        {isEditing
          ? 'Editar Ejercicio en Rutina'
          : 'Añadir Ejercicio a la Rutina'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Elige un ejercicio de la lista. Solo se muestra al crear. */}
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Seleccionar Ejercicio
            </label>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
            >
              {availableExercises.length === 0 && (
                <option>Cargando ejercicios...</option>
              )}
              {availableExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Campos para series, repeticiones y peso */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Series
            </label>
            <input
              type="number"
              placeholder="ej: 4"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Reps
            </label>
            <input
              type="number"
              placeholder="ej: 12"
              value={repeticiones}
              onChange={(e) => setRepeticiones(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="ej: 80.5"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
