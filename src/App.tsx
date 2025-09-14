import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.tsx';
import DashboardPage from './components/DashboardPage.tsx';
import ExerciseListPage from './components/ExerciseListPage.tsx';
import WeeklyPlanner from './components/WeeklyPlanner.tsx';
import CalendarView from './components/CalendarView.tsx';
import ProfilePage from './components/ProfilePage.tsx';
import type { PlanificacionSemanal } from './types';
import PwaPrompt from './components/PwaPrompt.tsx'; //

import {
  CalendarIcon,
  HomeIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('authToken')
  );
  const [userId, setUserId] = useState<number | null>(
    localStorage.getItem('userId')
      ? parseInt(localStorage.getItem('userId')!)
      : null
  );
  const [view, setView] = useState<
    'calendar' | 'dashboard' | 'exercises' | 'planner' | 'profile'
  >('calendar');
  const [planificaciones, setPlanificaciones] = useState<
    PlanificacionSemanal[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token && !userId) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          const newUserId = parseInt(payload.userId);
          setUserId(newUserId);
          localStorage.setItem('userId', newUserId.toString());
        }
      } catch (error) {
        console.error('Token inválido:', error);
        handleLogout();
      }
    }
  }, [token, userId]);

  const fetchPlanificaciones = async () => {
    if (!userId || !token) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/planificaciones/usuario/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) setPlanificaciones(await response.json());
    } catch (error) {
      console.error('Error fetching planificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanificaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token]);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setView('calendar');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
  };

  if (!token || !userId) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderView = () => {
    switch (view) {
      case 'calendar':
        return isLoading ? (
          <div>Cargando...</div>
        ) : (
          <CalendarView planificaciones={planificaciones} />
        );
      case 'dashboard':
        return <DashboardPage token={token} />;
      case 'exercises':
        return <ExerciseListPage token={token} />;
      case 'planner':
        return (
          <WeeklyPlanner
            token={token}
            userId={userId}
            planificaciones={planificaciones}
            onPlanificacionChange={fetchPlanificaciones}
          />
        );
      case 'profile':
        return (
          <ProfilePage token={token} userId={userId} onLogout={handleLogout} />
        );
      default:
        return <CalendarView planificaciones={planificaciones} />;
    }
  };

  const NavButtons = () => (
    <>
      <button
        onClick={() => setView('calendar')}
        className={`flex flex-col items-center justify-center flex-grow p-2 rounded-md text-xs sm:flex-row sm:text-sm sm:space-x-2 ${
          view === 'calendar'
            ? 'text-indigo-400'
            : 'text-gray-400 hover:bg-gray-700'
        }`}
      >
        <CalendarIcon className="h-5 w-5" />
        <span className="mt-1 sm:mt-0">Calendario</span>
      </button>
      <button
        onClick={() => setView('dashboard')}
        className={`flex flex-col items-center justify-center flex-grow p-2 rounded-md text-xs sm:flex-row sm:text-sm sm:space-x-2 ${
          view === 'dashboard'
            ? 'text-indigo-400'
            : 'text-gray-400 hover:bg-gray-700'
        }`}
      >
        <HomeIcon className="h-5 w-5" />
        <span className="mt-1 sm:mt-0">Rutinas</span>
      </button>
      <button
        onClick={() => setView('exercises')}
        className={`flex flex-col items-center justify-center flex-grow p-2 rounded-md text-xs sm:flex-row sm:text-sm sm:space-x-2 ${
          view === 'exercises'
            ? 'text-indigo-400'
            : 'text-gray-400 hover:bg-gray-700'
        }`}
      >
        <BookOpenIcon className="h-5 w-5" />
        <span className="mt-1 sm:mt-0">Ejercicios</span>
      </button>
      <button
        onClick={() => setView('planner')}
        className={`flex flex-col items-center justify-center flex-grow p-2 rounded-md text-xs sm:flex-row sm:text-sm sm:space-x-2 ${
          view === 'planner'
            ? 'text-indigo-400'
            : 'text-gray-400 hover:bg-gray-700'
        }`}
      >
        <CalendarDaysIcon className="h-5 w-5" />
        <span className="mt-1 sm:mt-0">Planificador</span>
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* --- BARRA SUPERIOR (visible en todos los tamaños) --- */}
      <header className="bg-gray-800 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <img
            src="/logoFitFlow.svg"
            alt="FitFlow Logo"
            className="h-8 w-auto"
          />
        </div>
        {/* Navegación para ESCRITORIO (se oculta en móvil) */}
        <div className="hidden sm:flex items-center space-x-2">
          <NavButtons />
        </div>
        {/* Botones de Usuario y Salir (siempre visibles) */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setView('profile')}
            className={`p-2 rounded-full ${
              view === 'profile' ? 'bg-indigo-600' : 'hover:bg-gray-700'
            }`}
            title="Mi Perfil"
          >
            <UserCircleIcon className="h-6 w-6" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-600"
            title="Cerrar Sesión"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      <PwaPrompt />
      <main className="flex-grow p-4 max-w-7xl mx-auto w-full pb-24 sm:pb-4">
        {renderView()}
      </main>

      {/* --- BARRA INFERIOR (solo visible en MÓVIL) --- */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around">
        <NavButtons />
      </nav>
    </div>
  );
}
