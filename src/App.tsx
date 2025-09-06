// src/App.tsx
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.tsx';
import DashboardPage from './components/DashboardPage.tsx';
import ExerciseListPage from './components/ExerciseListPage.tsx';
import WeeklyPlanner from './components/WeeklyPlanner.tsx';
import CalendarView from './components/CalendarView.tsx'; // Añadir esta importación

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
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setView('dashboard')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              view === 'dashboard'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Mis Rutinas
          </button>
          <button
            onClick={() => setView('exercises')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              view === 'exercises'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Biblioteca de Ejercicios
          </button>
          <button
            onClick={() => setView('planner')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              view === 'planner'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Planificador Semanal
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              view === 'calendar'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Calendario
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-semibold bg-red-600 rounded-md hover:bg-red-700 transition"
        >
          Cerrar Sesión
        </button>
      </nav>

      <main className="p-4">
        {view === 'dashboard' && <DashboardPage token={token} userId={userId} />}
        {view === 'exercises' && <ExerciseListPage token={token} />}
        {view === 'planner' && userId && <WeeklyPlanner token={token} userId={userId} />}
        {view === 'calendar' && userId && <CalendarView token={token} userId={userId} />} {/* Añadir esta línea */}
      </main>
    </div>
  );
}