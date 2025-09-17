// src/api/axiosConfig.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Interceptor para añadir el token a cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers!.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores 401 (sesión expirada) en las respuestas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.error('Error de autenticación, cerrando sesión...');

      // Limpia el almacenamiento local de forma consistente con tu función handleLogout
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');

      // Redirige a la página de login para forzar una nueva sesión
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
