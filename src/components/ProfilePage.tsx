import React, { useState } from 'react';
import Modal from './Modal'; // Usaremos un modal de confirmación

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ProfilePageProps {
  token: string;
  userId: number;
  onLogout: () => void; // Para cerrar sesión si se borra la cuenta
}

export default function ProfilePage({
  token,
  userId,
  onLogout,
}: ProfilePageProps) {
  const [nombre, setNombre] = useState('Usuario FitFlow'); // Deberías cargar esto desde la API
  const [email, setEmail] = useState('usuario@email.com'); // Deberías cargar esto desde la API
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    // Aquí iría la lógica fetch para hacer PUT a /api/users/{userId}
    setTimeout(() => {
      // Simulación de llamada a la API
      setMessage({
        type: 'success',
        text: 'Perfil actualizado correctamente.',
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Las nuevas contraseñas no coinciden.',
      });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    // Aquí iría la lógica fetch para hacer PUT a /api/users/{userId}/password
    setTimeout(() => {
      // Simulación de llamada a la API
      setMessage({ type: 'success', text: 'Contraseña cambiada con éxito.' });
      setIsLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('No se pudo eliminar la cuenta.');
      alert('Tu cuenta ha sido eliminada con éxito.');
      onLogout(); // Cierra la sesión del usuario
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
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
          ¿Estás absolutamente seguro? Esta acción es irreversible y eliminará
          todos tus datos.
        </p>
      </Modal>

      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
        {message && (
          <div
            className={`p-4 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-300'
                : 'bg-red-500/20 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Datos Personales</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md"
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
                className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md"
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
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Contraseña Actual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md"
              />
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
