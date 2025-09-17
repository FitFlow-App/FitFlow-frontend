import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import apiClient from '../api/axiosConfig';
// AÑADIDO: Importar los iconos
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ProfilePageProps {
  token: string;
  userId: number;
  onLogout: () => void;
}

export default function ProfilePage({ userId, onLogout }: ProfilePageProps) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // AÑADIDO: Estados de visibilidad para cada campo de contraseña
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchUserData = async () => {
      try {
        // Especificar el tipo de dato esperado en la respuesta
        const response = await apiClient.get<{ nombre: string; email: string }>(
          `/users/${userId}`
        );
        setNombre(response.data.nombre);
        setEmail(response.data.email);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setProfileMessage({
          type: 'error',
          text: 'No se pudieron cargar los datos del perfil.',
        });
      }
    };
    fetchUserData();
  }, [userId]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProfileMessage(null);
    setPasswordMessage(null);
    try {
      await apiClient.put(`/users/${userId}`, { nombre, email });
      setProfileMessage({
        type: 'success',
        text: 'Perfil actualizado correctamente.',
      });
    } catch (err: any) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al actualizar perfil.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'Las nuevas contraseñas no coinciden.',
      });
      return;
    }
    setIsLoading(true);
    setProfileMessage(null);
    setPasswordMessage(null);
    try {
      await apiClient.put(`/users/${userId}/password`, {
        currentPassword,
        newPassword,
      });
      setPasswordMessage({
        type: 'success',
        text: 'Contraseña cambiada con éxito.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al cambiar la contraseña.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await apiClient.delete(`/users/${userId}`);
      alert('Tu cuenta ha sido eliminada con éxito.');
      onLogout();
    } catch (err: any) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'No se pudo eliminar la cuenta.',
      });
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Confirmar Eliminación de Cuenta"
        confirmText="Sí, eliminar mi cuenta"
        isDestructive
      >
        <p className="text-sm text-gray-300">
          ¿Estás absolutamente seguro? Esta acción es irreversible.
        </p>
      </Modal>

      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Datos Personales</h2>
          {profileMessage && (
            <div
              className={`p-4 rounded-md text-sm mb-4 ${
                profileMessage.type === 'success'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}
            >
              {profileMessage.text}
            </div>
          )}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div className="text-right">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
          {passwordMessage && (
            <div
              className={`p-4 rounded-md text-sm mb-4 ${
                passwordMessage.type === 'success'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* --- CONTRASEÑA ACTUAL MODIFICADA --- */}
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Contraseña Actual
              </label>
              <div className="relative mt-1">
                <input
                  type={isCurrentPasswordVisible ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 bg-gray-700 text-white rounded-md"
                />
                <button
                  type="button"
                  onClick={() =>
                    setIsCurrentPasswordVisible(!isCurrentPasswordVisible)
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  {isCurrentPasswordVisible ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {/* --- NUEVA CONTRASEÑA MODIFICADA --- */}
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Nueva Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  type={isNewPasswordVisible ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 bg-gray-700 text-white rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  {isNewPasswordVisible ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {/* --- CONFIRMAR CONTRASEÑA MODIFICADA --- */}
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  type={isConfirmPasswordVisible ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 bg-gray-700 text-white rounded-md"
                />
                <button
                  type="button"
                  onClick={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  {isConfirmPasswordVisible ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="text-right">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-red-500/30">
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            Zona de Peligro
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Una vez que elimines tu cuenta, no hay vuelta atrás.
          </p>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
          >
            Eliminar mi cuenta
          </button>
        </div>
      </div>
    </>
  );
}
