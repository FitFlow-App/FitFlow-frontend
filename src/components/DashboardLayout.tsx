// src/components/DashboardLayout.tsx
import {
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CalendarIcon,
  HomeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom'; // NavLink resalta la ruta activa

interface DashboardLayoutProps {
  onLogout: () => void;
  children: React.ReactNode; // Para renderizar las sub-rutas
}

export default function DashboardLayout({
  onLogout,
  children,
}: DashboardLayoutProps) {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center flex-grow p-2 rounded-md text-xs sm:flex-row sm:text-sm sm:space-x-2 ${
      isActive ? 'text-indigo-400' : 'text-gray-400 hover:bg-gray-700'
    }`;

  const NavButtons = () => (
    <>
      <NavLink to="/dashboard/calendar" className={navLinkClass}>
        <CalendarIcon className="h-5 w-5" />
        <span className="mt-1 sm:mt-0">Calendario</span>
      </NavLink>
      <NavLink to="/dashboard/routines" className={navLinkClass}>
        <HomeIcon className="h-5 w-5" />
        <span className="mt-1 sm:mt-0">Rutinas</span>
      </NavLink>
      <NavLink to="/dashboard/exercises" className={navLinkClass}>
        <BookOpenIcon className="h-5 w-5" />
        <span className="mt-1 sm:mt-0">Ejercicios</span>
      </NavLink>
      <NavLink to="/dashboard/planner" className={navLinkClass}>
        <CalendarDaysIcon className="h-5 w-5" />
        <span className="mt-1 sm:mt-0">Planificador</span>
      </NavLink>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header className="bg-gray-800 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <img
            src="/logoFitFlow.svg"
            alt="FitFlow Logo"
            className="h-8 w-auto"
          />
        </div>
        <div className="hidden sm:flex items-center space-x-2">
          <NavButtons />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `p-2 rounded-full ${
                isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'
              }`
            }
            title="Mi Perfil"
          >
            <UserCircleIcon className="h-6 w-6" />
          </NavLink>
          <button
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-red-600"
            title="Cerrar Sesión"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 max-w-7xl mx-auto w-full pb-24 sm:pb-4">
        {children}{' '}
        {/* Aquí se renderizará el componente de la ruta activa (Calendar, Exercises, etc) */}
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around">
        <NavButtons />
      </nav>
    </div>
  );
}
