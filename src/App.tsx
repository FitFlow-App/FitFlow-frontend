import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.tsx';
import DashboardPage from './components/DashboardPage.tsx';
import ExerciseListPage from './components/ExerciseListPage.tsx';

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('authToken')
  );
  // --- NUEVO ESTADO PARA CONTROLAR LA VISTA ---
  const [view, setView] = useState<'dashboard' | 'exercises'>('dashboard');

  useEffect(() => {
    // Si no hay token, siempre muestra el login
    if (!token) {
      // No necesitamos hacer nada aquí, el renderizado condicional se encarga
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setView('dashboard'); // Al iniciar sesión, siempre vamos al dashboard
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  // Renderizado condicional principal
  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Si hay token, mostramos la UI principal con navegación
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
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-semibold bg-red-600 rounded-md hover:bg-red-700 transition"
        >
          Cerrar Sesión
        </button>
      </nav>

      <main className="p-4">
        {view === 'dashboard' && <DashboardPage token={token} />}
        {view === 'exercises' && <ExerciseListPage token={token} />}
      </main>
    </div>
  );
}
