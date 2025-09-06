import React, { useState, useEffect } from 'react';
import type { EjercicioDetallado } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ExerciseCRUDFormProps {
  token: string;
  ejercicioToEdit?: EjercicioDetallado | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ExerciseCRUDForm({
  token,
  ejercicioToEdit,
  onSuccess,
  onCancel,
}: ExerciseCRUDFormProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [musculo, setMusculo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!ejercicioToEdit;

  useEffect(() => {
    if (isEditing) {
      setNombre(ejercicioToEdit.nombre);
      setDescripcion(ejercicioToEdit.descripcion || '');
      setMusculo(ejercicioToEdit.musculo || '');
    }
  }, [isEditing, ejercicioToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const url = isEditing
      ? `${API_BASE_URL}/ejercicios/${ejercicioToEdit.id}`
      : `${API_BASE_URL}/ejercicios`;

    const method = isEditing ? 'PUT' : 'POST';
    const body = { nombre, descripcion, musculo };

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
        {isEditing ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Nombre del Ejercicio
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Descripción
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Músculo Principal
          </label>
          <input
            type="text"
            value={musculo}
            onChange={(e) => setMusculo(e.target.value)}
            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
          />
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
