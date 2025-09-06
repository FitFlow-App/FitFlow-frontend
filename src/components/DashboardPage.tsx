/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import type { Rutina, RutinaEjercicio } from '../types';
import RoutineForm from './RoutineForm.tsx';
import ExerciseForm from './ExerciseForm.tsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface DashboardPageProps {
  token: string;
  userId?: number | null;
}
export default function DashboardPage({ token, userId }: DashboardPageProps) {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRutina, setSelectedRutina] = useState<Rutina | null>(null);

  const [isManagingRoutine, setIsManagingRoutine] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<Rutina | null>(null);
  const [isManagingExercise, setIsManagingExercise] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<RutinaEjercicio | null>(
    null
  );

  const [refreshPlanificacion] = useState(0);

  const fetchRutinasData = useCallback(
    async (keepSelectionId: number | null = null) => {
      setIsLoading(true);
      setError(null);
      try {
        const routinesResponse = await fetch(`${API_BASE_URL}/routines`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!routinesResponse.ok)
          throw new Error('Error al cargar las rutinas.');
        const routinesData = await routinesResponse.json();

        const rutinasCompletas = await Promise.all(
          routinesData.map(async (rutina: any) => {
            const exercisesResponse = await fetch(
              `${API_BASE_URL}/routine-exercises/rutina/${rutina.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!exercisesResponse.ok) return { ...rutina, ejercicios: [] };
            const exercisesData = await exercisesResponse.json();
            return { ...rutina, ejercicios: exercisesData };
          })
        );
        setRutinas(rutinasCompletas);

        if (keepSelectionId) {
          const updatedSelection =
            rutinasCompletas.find((r) => r.id === keepSelectionId) || null;
          setSelectedRutina(updatedSelection);
        } else if (
          selectedRutina &&
          !rutinasCompletas.find((r) => r.id === selectedRutina.id)
        ) {
          setSelectedRutina(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [token, selectedRutina]
  );

  useEffect(() => {
    fetchRutinasData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoutineSuccess = () => {
    setIsManagingRoutine(false);
    setRoutineToEdit(null);
    fetchRutinasData();
  };
  const handleOpenCreateRoutine = () => {
    setRoutineToEdit(null);
    setIsManagingRoutine(true);
  };
  const handleOpenEditRoutine = (rutina: Rutina) => {
    setRoutineToEdit(rutina);
    setIsManagingRoutine(true);
  };
  const handleDeleteRoutine = async (rutinaId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta rutina?'))
      return;
    try {
      const response = await fetch(`${API_BASE_URL}/routines/${rutinaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('No se pudo eliminar la rutina.');
      fetchRutinasData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };
  const handleExerciseSuccess = () => {
    setIsManagingExercise(false);
    setExerciseToEdit(null);
    if (selectedRutina) fetchRutinasData(selectedRutina.id);
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
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('No se pudo eliminar el ejercicio.');
      if (selectedRutina) fetchRutinasData(selectedRutina.id);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  function WeeklyOverview({ token, userId }: { token: string; userId?: number | null }) {
    const [planificacionActiva, setPlanificacionActiva] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const fetchPlanificacionActiva = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/planificaciones/usuario/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const planificaciones = await response.json();
            const activa = planificaciones.find((p: any) => p.activa);
            setPlanificacionActiva(activa);
          }
        } catch (error) {
          console.error('Error fetching planificación:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPlanificacionActiva();
    }, [token, userId]);

    if (isLoading) return <div>Cargando planificación...</div>;
    if (!planificacionActiva) return <div>No hay planificación activa</div>;

    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return (
      <div className="grid grid-cols-7 gap-2">
        {diasSemana.map((dia, index) => {
          const diaNumero = index + 1;
          const diaPlanificado = planificacionActiva.dias.find((d: any) => d.diaSemana === diaNumero);

          return (
            <div key={dia} className="text-center p-2 bg-gray-700 rounded">
              <div className="font-semibold">{dia}</div>
              {diaPlanificado ? (
                <div className="text-sm text-indigo-300 mt-1">
                  {diaPlanificado.rutina.nombre}
                </div>
              ) : (
                <div className="text-sm text-gray-400 mt-1">-</div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {isManagingRoutine && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <RoutineForm
            token={token}
            rutinaToEdit={routineToEdit}
            onSuccess={handleRoutineSuccess}
            onCancel={() => setIsManagingRoutine(false)}
          />
        </div>
      )}
      {isManagingExercise && selectedRutina && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <ExerciseForm
            token={token}
            rutinaId={selectedRutina.id}
            ejercicioToEdit={exerciseToEdit}
            onSuccess={handleExerciseSuccess}
            onCancel={() => setIsManagingExercise(false)}
          />
        </div>
      )}

      {isLoading && <div className="text-center mt-10">Cargando datos...</div>}
      {error && (
        <div className="text-center mt-10 text-red-400">Error: {error}.</div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <aside className="md:col-span-1 lg:col-span-1 bg-gray-800 p-4 rounded-lg h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mis Rutinas</h2>
              <button
                onClick={handleOpenCreateRoutine}
                className="px-3 py-1 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                + Nueva
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Planificación Semanal Activa</h2>
                <WeeklyOverview
                  token={token}
                  userId={userId}
                  key={refreshPlanificacion}
                />
              </div>
            </div>
            <ul className="space-y-2">
              {rutinas.map((rutina) => (
                <li
                  key={rutina.id}
                  className="group bg-gray-700 rounded-md flex items-center justify-between pr-2 transition hover:bg-gray-600"
                >
                  <button
                    onClick={() => setSelectedRutina(rutina)}
                    className={`w-full text-left p-3 rounded-md transition ${selectedRutina?.id === rutina.id
                      ? 'bg-indigo-600'
                      : 'bg-transparent'
                      }`}
                  >
                    {rutina.nombre}
                  </button>
                  <div className="flex items-center space-x-2 transition-opacity md:opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleOpenEditRoutine(rutina)}
                      className="p-1 text-blue-300 hover:text-blue-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteRoutine(rutina.id)}
                      className="p-1 text-red-400 hover:text-red-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <main className="md:col-span-2 lg:col-span-3 bg-gray-800 p-6 rounded-lg min-h-[500px]">
            {selectedRutina ? (
              <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-3xl font-bold mb-1">
                      {selectedRutina.nombre}
                    </h2>
                    <p className="text-gray-400">
                      {selectedRutina.descripcion}
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddExercise}
                    className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 flex-shrink-0 w-full sm:w-auto"
                  >
                    + Añadir Ejercicio
                  </button>
                </div>
                <div className="space-y-4">
                  {selectedRutina.ejercicios.length > 0 ? (
                    selectedRutina.ejercicios.map((item) => (
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
                      Esta rutina aún no tiene ejercicios. ¡Añade uno!
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-lg">
                  Selecciona una rutina para ver sus detalles o crea una nueva.
                </p>
              </div>
            )}
          </main>
        </div>
      )}
    </>
  );
}
