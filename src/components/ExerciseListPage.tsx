// src/components/ExerciseListPage.tsx
import { useState, useEffect, useCallback } from 'react';
import type { EjercicioDetallado } from '../types';
import ExerciseCRUDForm from './ExerciseCRUDform';
import apiClient from '../api/axiosConfig'; // 1. IMPORTAR apiClient

interface ExerciseListPageProps {
  token: string; // Token se mantiene por si algún componente hijo lo necesita
}

export default function ExerciseListPage({ token }: ExerciseListPageProps) {
  const [ejercicios, setEjercicios] = useState<EjercicioDetallado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] =
    useState<EjercicioDetallado | null>(null);

  const fetchEjercicios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // MODIFICADO: Usar apiClient en lugar de fetch
      const response = await apiClient.get<EjercicioDetallado[]>('/ejercicios');
      setEjercicios(response.data);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        // El interceptor maneja el 401
        setError(
          err.response?.data?.message || 'No se pudieron cargar los ejercicios.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEjercicios();
  }, [fetchEjercicios]);

  const handleSuccess = () => {
    setIsFormVisible(false);
    setExerciseToEdit(null);
    fetchEjercicios();
  };

  const handleOpenCreate = () => {
    setExerciseToEdit(null);
    setIsFormVisible(true);
  };

  const handleOpenEdit = (ejercicio: EjercicioDetallado) => {
    setExerciseToEdit(ejercicio);
    setIsFormVisible(true);
  };

  const handleDelete = async (ejercicioId: number) => {
    if (
      !window.confirm('¿Estás seguro de que quieres eliminar este ejercicio?')
    )
      return;

    try {
      // MODIFICADO: Usar apiClient en lugar de fetch
      await apiClient.delete(`/ejercicios/${ejercicioId}`);
      fetchEjercicios(); // Refrescar la lista
    } catch (err: any) {
      if (err.response?.status !== 401) {
        alert(
          `Error: ${
            err.response?.data?.message || 'No se pudo eliminar el ejercicio.'
          }`
        );
      }
    }
  };

  return (
    <>
      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <ExerciseCRUDForm
            token={token}
            ejercicioToEdit={exerciseToEdit}
            onSuccess={handleSuccess}
            onCancel={() => setIsFormVisible(false)}
          />
        </div>
      )}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Mi Biblioteca de Ejercicios</h2>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            + Crear Ejercicio
          </button>
        </div>
        {isLoading && <p>Cargando ejercicios...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Músculo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {ejercicios.map((ejercicio) => (
                  <tr key={ejercicio.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {ejercicio.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {ejercicio.musculo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenEdit(ejercicio)}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(ejercicio.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
