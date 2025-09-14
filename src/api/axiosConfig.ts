// src/api/axiosConfig.ts
import axios from 'axios';

// 1. Creamos una instancia de Axios con la configuración base
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ¡Usa la variable de entorno!
});

// 2. Configuramos un interceptor para las peticiones
//    Esto añade el token de autorización a cada llamada automáticamente
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

// 3. Configuramos un interceptor para las respuestas (¡ESTA ES LA MAGIA!)
//    Esto revisa cada respuesta del servidor.
apiClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la devolvemos
    return response;
  },
  (error) => {
    // Si hay un error en la respuesta...
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Si es un error de "No Autorizado" o "Prohibido"...
      console.error('Error de autenticación, redirigiendo al login...');

      // Borramos el token inválido del almacenamiento
      localStorage.removeItem('token');

      // Redirigimos a la página de login
      // Usamos `window.location.href` para forzar una recarga completa de la página
      window.location.href = '/login';
    }

    // Devolvemos el error para que pueda ser manejado por la llamada original si es necesario
    return Promise.reject(error);
  }
);

export default apiClient;
