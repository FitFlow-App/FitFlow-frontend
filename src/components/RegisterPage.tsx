// src/components/RegisterPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiClient.post('/users', {
        nombre: name,
        email,
        password,
      });

      setMessage('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error desconocido al registrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-white">
          Crear una Cuenta
        </h2>

        {message ? (
          <div className="text-center">
            <p className="text-green-400 bg-gray-700 p-3 rounded-md">
              {message}
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 font-medium text-indigo-400 hover:text-indigo-500"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-300">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 mt-2 text-white bg-gray-700 border border-gray-600 rounded-md"
              />
            </div>
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
              <div className="relative mt-2">
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 pr-10 text-white bg-gray-700 border border-gray-600 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  {isPasswordVisible ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
        )}
        {!message && (
          <p className="text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-400 hover:text-indigo-500"
            >
              Inicia Sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
