// src/App.tsx
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.tsx';
import DashboardPage from './components/DashboardPage.tsx';
import ExerciseListPage from './components/ExerciseListPage.tsx';
import WeeklyPlanner from './components/WeeklyPlanner.tsx';
import CalendarView from './components/CalendarView.tsx';

// Importar los iconos de Heroicons
import {
  HomeIcon,            // Para 'Mis Rutinas' (Dashboard)
  BookOpenIcon,        // Para 'Biblioteca de Ejercicios'
  CalendarDaysIcon,    // Para 'Planificador Semanal'
  CalendarIcon,        // Para 'Calendario'
  ArrowRightOnRectangleIcon // Para 'Cerrar Sesión'
} from '@heroicons/react/24/outline'; // Puedes usar '24/solid' para iconos rellenos

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('authToken')
  );
  const [userId, setUserId] = useState<number | null>(
    localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')!) : null
  );
  const [view, setView] = useState<'dashboard' | 'exercises' | 'planner' | 'calendar'>('dashboard');

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          setUserId(payload.userId);
          localStorage.setItem('userId', payload.userId.toString());
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
  };

  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <nav className="bg-gray-800 p-4 flex flex-wrap items-center justify-between gap-2 sm:gap-4 sm:flex-nowrap">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Botón Mis Rutinas con Icono */}
          <button
            onClick={() => setView('dashboard')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1
              ${view === 'dashboard'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
              }`}
          >
            <HomeIcon className="h-5 w-5" /> {/* Icono */}
            <span className="hidden sm:inline">Mis Rutinas</span> {/* Texto visible en pantallas grandes */}
          </button>

          {/* Botón Biblioteca de Ejercicios con Icono */}
          <button
            onClick={() => setView('exercises')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1
              ${view === 'exercises'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
              }`}
          >
            <BookOpenIcon className="h-5 w-5" /> {/* Icono */}
            <span className="hidden sm:inline">Biblioteca de Ejercicios</span>
          </button>

          {/* Botón Planificador Semanal con Icono */}
          <button
            onClick={() => setView('planner')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1
              ${view === 'planner'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
              }`}
          >
            <CalendarDaysIcon className="h-5 w-5" /> {/* Icono */}
            <span className="hidden sm:inline">Planificador Semanal</span>
          </button>

          {/* Botón Calendario con Icono */}
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1
              ${view === 'calendar'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
              }`}
          >
            <CalendarIcon className="h-5 w-5" /> {/* Icono */}
            <span className="hidden sm:inline">Calendario</span>
          </button>
        </div>

        {/* Botón Cerrar Sesión con Icono */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-semibold bg-red-600 rounded-md hover:bg-red-700 transition flex items-center space-x-1"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" /> {/* Icono */}
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </nav>

      <main className="p-4 max-w-7xl mx-auto">
        {view === 'dashboard' && <DashboardPage token={token} userId={userId} />}
        {view === 'exercises' && <ExerciseListPage token={token} />}
        {view === 'planner' && userId && <WeeklyPlanner token={token} userId={userId} />}
        {view === 'calendar' && userId && <CalendarView token={token} userId={userId} />}
      </main>
    </div>
  );
}