# FitFlow - Frontend

## Descripción

Interfaz de usuario (Frontend) de FitFlow. Aplicación web con la que los usuarios gestionan sus rutinas de ejercicio.

## Integración Front-Back

Para probar la integración con el frontend:

1. Asegúrate de que el backend esté ejecutándose en el puerto 3000

2. Configura la variable de entorno en el frontend: VITE_API_BASE_URL=http://localhost:3000/api

3. Las peticiones del frontend deben incluir el token JWT en los headers para rutas protegidas

## Estructura del Proyecto
```text
.
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── services/
│   └── types.ts
├── package.json
└── vite.config.ts
```
## Configuración del Entorno
Variables de entorno: Crea un archivo .env en la raíz del proyecto:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```
## Instalación y Ejecución

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar en modo desarrollo:

```bash
npm run dev
```

3. Compilar para producción:

```bash
npm run build
```

## Componentes Principales
- LoginPage: Autenticación de usuarios

- DashboardPage: Panel principal de la aplicación

- ExerciseCRUDform: Formulario para crear/editar ejercicios

- ExerciseListPage: Lista de ejercicios disponibles

- RoutineForm: Formulario para crear/editar rutinas

- RoutineDetail: Detalles de una rutina específica

- WeeklyPlanner: Planificador semanal de entrenamientos

- CalendarView: Vista de calendario para planificaciones

- ProfilePage: Perfil de usuario

## Integración con Backend

El frontend se comunica con el backend mediante:

1. Configuración de Axios: El archivo src/api/axiosConfig.ts configura las peticiones HTTP

2. Servicios: Los servicios en src/services/ manejan la lógica de comunicación con la API

3. Autenticación JWT: Las rutas protegidas incluyen automáticamente el token en los headers

## Pruebas de Integración
Para probar la integración completa:

1. Inicia el backend en el puerto 3000

2. Inicia el frontend (normalmente en el puerto 5173)

3. Accede a http://localhost:5173

4. Inicia sesión con las credenciales de prueba

5. Verifica que puedas:

   - Crear y gestionar ejercicios

   - Crear y gestionar rutinas

   - Planificar entrenamientos

   - Ver datos del clima

## Características PWA
La aplicación es una Progressive Web App (PWA) que puede ser instalada en dispositivos y funciona offline para algunas funcionalidades.

## Notas Importantes
- Base de datos: Asegúrate de que PostgreSQL esté ejecutándose via Docker antes de iniciar el backend

- Variables de entorno: Ambos proyectos requieren configurar correctamente las variables de entorno

- CORS: El backend está configurado para aceptar peticiones del frontend en desarrollo

- Tokens JWT: Las sesiones se mantienen mediante tokens JWT que se almacenan localmente

