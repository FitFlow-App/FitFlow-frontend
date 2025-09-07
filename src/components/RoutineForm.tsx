import React, { useState, useEffect } from 'react';
import type { Rutina } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface RoutineFormProps {
  token: string;
  // Si pasamos una rutina, significa que estamos editando
  rutinaToEdit?: Rutina | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RoutineForm({
  token,
  rutinaToEdit,
  onSuccess,
  onCancel,
}: RoutineFormProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!rutinaToEdit;

  // Si estamos editando, llena los campos del formulario con los datos de la rutina
  useEffect(() => {
    if (isEditing) {
      setNombre(rutinaToEdit.nombre);
      setDescripcion(rutinaToEdit.descripcion || '');
    }
  }, [isEditing, rutinaToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const url = isEditing
      ? `${API_BASE_URL}/routines/${rutinaToEdit.id}`
      : `${API_BASE_URL}/routines`;

    const method = isEditing ? 'PUT' : 'POST';

    // Asume que el usuarioId está disponible en el token o lo recibes como prop
    // Por ejemplo, si lo recibes como prop, añade usuarioId a RoutineFormProps y úsalo aquí
    const usuarioId = rutinaToEdit?.usuarioId || 1; // Reemplaza 1 por el valor correcto o pásalo como prop

    const body = isEditing
      ? { nombre, descripcion } // Para editar, solo actualizamos estos campos
      : { nombre, descripcion, usuarioId }; // Para crear, necesitamos el usuarioId (temporal)

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
        {isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Nombre
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
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
