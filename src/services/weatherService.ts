// src/services/weatherService.ts
import apiClient from '../api/axiosConfig'; // <-- ¡Importamos nuestro cliente configurado!

// Definimos un tipo para la estructura de la respuesta de nuestra API
export interface WeatherApiResponse {
  status: string;
  data: WeatherData;
}

// Definimos un tipo para los datos del clima, incluyendo los campos que faltaban
export interface WeatherData {
  location: string;
  date: string;
  weathercode: number;
  tmax: number;
  tmin: number;
  precipitation: number;
}

// Tipo para las coordenadas
interface Coordinates {
  latitude: number;
  longitude: number;
}

// 1. Función para obtener la geolocalización del navegador (se mantiene igual)
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error('La geolocalización no está soportada por este navegador.')
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          reject(new Error('No se pudo obtener la ubicación.'));
        }
      );
    }
  });
};

// 2. Función para llamar a nuestra API del backend (AHORA MUCHO MÁS LIMPIA)
export const fetchWeather = async (
  lat: number,
  lon: number,
  date: Date
): Promise<WeatherData> => {
  const dateString = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD

  // Usamos apiClient. La URL es relativa y el token se añade automáticamente.
  // Nota: Asegúrate que tu ruta en el backend es /api/clima, no /api/weather
  const response = await apiClient.get<WeatherApiResponse>(
    `/weather?lat=${lat}&lon=${lon}&date=${dateString}`
  );

  return response.data.data;
};
