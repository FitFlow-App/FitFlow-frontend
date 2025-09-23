import { useState, useEffect, useCallback, JSX } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import CalendarView from './components/CalendarView';
import DashboardPage from './components/DashboardPage';
import ExerciseListPage from './components/ExerciseListPage';
import WeeklyPlanner from './components/WeeklyPlanner';
import ProfilePage from './components/ProfilePage';
import PwaPrompt from './components/PwaPrompt';
import type { PlanificacionSemanal } from './types';
import apiClient from './api/axiosConfig';

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
  const userId = localStorage.getItem('userId')
    ? parseInt(localStorage.getItem('userId')!, 10)
    : null;

  const [planificaciones, setPlanificaciones] = useState<
    PlanificacionSemanal[]
  >([]);
  const [isLoadingPlanificaciones, setIsLoadingPlanificaciones] =
    useState(true);

  const fetchPlanificaciones = useCallback(async () => {
    if (!userId) {
      setIsLoadingPlanificaciones(false);
      return;
    }
    setIsLoadingPlanificaciones(true);
    try {
      const response = await apiClient.get(
        `/planificaciones/usuario/${userId}`
      );
      setPlanificaciones(response.data as PlanificacionSemanal[]);
    } catch (error) {
      console.error('Error al cargar planificaciones en App.tsx', error);
    } finally {
      setIsLoadingPlanificaciones(false);
    }
  }, [userId]);

  useEffect(() => {
    if (token && userId) {
      fetchPlanificaciones();
    }
  }, [token, userId, fetchPlanificaciones]);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setToken(null);
    setPlanificaciones([]);
    navigate('/login');
  };

  return (
    <>
      <PwaPrompt />
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute token={token}>
              <DashboardLayout onLogout={handleLogout}>
                <Routes>
                  <Route
                    path="calendar"
                    element={
                      <CalendarView
                        planificaciones={planificaciones}
                        isLoading={isLoadingPlanificaciones}
                      />
                    }
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
                      <WeeklyPlanner
                        userId={userId!}
                        planificaciones={planificaciones}
                        onDataChange={fetchPlanificaciones}
                      />
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <ProfilePage
                        token={token!}
                        userId={userId!}
                        onLogout={handleLogout}
                      />
                    }
                  />
                  <Route index element={<Navigate to="calendar" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </>
  );
}
