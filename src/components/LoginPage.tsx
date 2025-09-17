import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginPageProps {
  onLoginSuccess: (token: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/login', { email, password });
      const { token, userId } = response.data as {
        token: string;
        userId: number;
      };

      if (userId) {
        localStorage.setItem('userId', userId.toString());
      }

      // Llama a la función que le pasó el componente App.tsx
      onLoginSuccess(token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl">
        <img
          src="/logoFitFlow-1.png"
          className="w-80 mx-auto rounded-2xl"
          alt="Logo de FitFlow"
        />
        <h6 className="text-1xl font-bold text-center text-indigo-400">
          Tu gestor de rutinas de entrenamiento de gimnasio
        </h6>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 text-white bg-gray-700 border border-gray-600 rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">
              Contraseña
            </label>
            {/* Contenedor relativo para posicionar el icono dentro del input */}
            <div className="relative mt-2">
              <input
                // Cambia el tipo de input dinámicamente entre 'password' y 'text'
                type={isPasswordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                // Se añade padding a la derecha (pr-10) para que el texto no se solape con el icono
                className="w-full px-4 py-2 pr-10 text-white bg-gray-700 border border-gray-600 rounded-md"
              />
              {/* Botón para alternar la visibilidad */}
              <button
                type="button" // Importante para que no envíe el formulario
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
              >
                {/* Muestra un icono u otro según el estado de visibilidad */}
                {isPasswordVisible ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
          <p className="text-center text-sm text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-400 hover:text-indigo-500"
            >
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
