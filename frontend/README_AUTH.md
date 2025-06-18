# Sistema de Autenticación - Frontend

Esta versión del frontend utiliza **HTML**, **JavaScript** y **Tailwind CSS** sin frameworks.

## Estructura

```
frontend/
└── src/
    ├── css/
    │   └── tailwind.css      # Archivo base para Tailwind
    ├── js/
    │   ├── services/
    │   │   └── authService.js  # Comunicación con la API de autenticación
    │   └── pages/
    │       └── login.js       # Lógica de la página de login
    └── pages/
        └── login.html        # Interfaz de inicio de sesión
```

Para generar los estilos ejecuta:

```bash
npm run build:css
```

Abre `src/pages/login.html` en tu navegador para probar el formulario. El archivo utiliza `fetch` para realizar la solicitud POST a `/login` en el backend de Spring Boot.
