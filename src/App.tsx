import { JSX, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardLayout from './components/DashboardLayout';

// Importa TODOS los componentes de las páginas del dashboard
import CalendarView from './components/CalendarView';
import DashboardPage from './components/DashboardPage';
import ExerciseListPage from './components/ExerciseListPage';
import WeeklyPlanner from './components/WeeklyPlanner';
import ProfilePage from './components/ProfilePage';
import PwaPrompt from './components/PwaPrompt';

function ProtectedRoute({
  token,
  children,
}: {
  token: string | null;
  children: JSX.Element;
}) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('authToken')
  );
  const navigate = useNavigate();

  // Obtenemos el userId de forma segura desde localStorage
  const userId = localStorage.getItem('userId')
    ? parseInt(localStorage.getItem('userId')!)
    : null;

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setToken(null);
    navigate('/login');
  };

  return (
    <>
      <PwaPrompt />
      <Routes>
        {/* Rutas Públicas */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas Protegidas */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute token={token}>
              <DashboardLayout onLogout={handleLogout}>
                {/* --- RUTAS AÑADIDAS DENTRO DEL DASHBOARD --- */}
                {/* Esto le dice a la aplicación qué componente mostrar según la URL */}
                <Routes>
                  <Route
                    path="calendar"
                    element={<CalendarView planificaciones={[]} />}
                  />
                  <Route
                    path="routines"
                    element={<DashboardPage token={token!} />}
                  />
                  <Route
                    path="exercises"
                    element={<ExerciseListPage token={token!} />}
                  />
                  <Route
                    path="planner"
                    element={
                      // Se pasa el userId real en lugar de 0
                      <WeeklyPlanner
                        token={token!}
                        userId={userId!}
                        planificaciones={[]}
                        onPlanificacionChange={() => {}}
                      />
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      // Se pasa el userId real en lugar de 0
                      <ProfilePage
                        token={token!}
                        userId={userId!}
                        onLogout={handleLogout}
                      />
                    }
                  />
                  {/* Ruta por defecto dentro del dashboard: redirige a /dashboard/calendar */}
                  <Route index element={<Navigate to="calendar" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirección por defecto */}
        <Route
          path="*"
          element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </>
  );
}
