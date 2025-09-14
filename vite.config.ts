import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Mantenemos tu plugin de tailwind
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FitFlow',
        short_name: 'FitFlow',
        description: 'Tu gestor de rutinas de entrenamiento de gimnasio',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          // Icono general para Android
          {
            src: 'logo-192.png', // Usaremos un tamaño específico
            sizes: '192x192',
            type: 'image/png',
          },
          // Icono grande para Windows y la pantalla de carga (Splash Screen)
          {
            src: 'logo-512.png', // Usaremos un tamaño específico
            sizes: '512x512',
            type: 'image/png',
          },
          // Icono "enmascarable" - EL MÁS IMPORTANTE PARA ANDROID
          {
            src: 'logo-maskable-512.png', // Necesitamos un icono especial para esto
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable', // Le decimos que este es el icono adaptable
          },
          // Icono para Apple (iPhone/iPad)
          {
            src: 'apple-touch-icon.png', // Apple busca este nombre por defecto
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple touch icon',
          },
        ],
      },
    }),
  ],
});
