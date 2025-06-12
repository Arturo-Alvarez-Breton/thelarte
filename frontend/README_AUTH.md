# Sistema de Autenticación - Frontend

Este proyecto contiene el sistema de autenticación completo para Thelarte, desarrollado con React + TypeScript + Tailwind CSS.

## 📁 Estructura del Proyecto

```
src/
├── components/auth/          # Componentes reutilizables para autenticación
│   ├── Input.tsx            # Input personalizado con validaciones
│   ├── Button.tsx           # Botón personalizado con estados
│   └── LoginForm.tsx        # Formulario de login modular
├── pages/auth/              # Páginas de autenticación
│   └── LoginPage.tsx        # Página principal de login
├── layouts/                 # Layouts de la aplicación
│   └── AuthLayout.tsx       # Layout para páginas de autenticación
├── hooks/                   # Custom hooks
│   └── useLogin.ts          # Hook para manejar la lógica de login
├── schemas/                 # Esquemas de validación
│   └── authSchemas.ts       # Validaciones con Yup
├── types/                   # Tipos TypeScript
│   └── auth.ts              # Tipos relacionados con autenticación
├── services/                # Servicios API
│   └── authService.ts       # Servicio de autenticación
└── utils/                   # Utilidades generales
```

## 🎨 Diseño

El diseño sigue las especificaciones de Figma:
- **Colores principales**: 
  - Verde principal: `#009963`
  - Verde claro: `#45A180`
  - Verde fondo: `#E5F5F0`
  - Texto principal: `#0D1C17`
  - Fondo claro: `#F7FCFA`
- **Tipografía**: Inter
- **Componentes**: Inputs con fondo verde claro, botones con estados, layout responsive

## 🚀 Características

### ✅ Implementado

1. **Componentes Reutilizables**
   - Input con validación visual
   - Button con estados de carga
   - Layout responsive para auth

2. **Validaciones**
   - Schema con Yup para username y password
   - Validación en tiempo real
   - Mensajes de error personalizados

3. **Funcionalidad**
   - Hook personalizado `useLogin`
   - Integración con React Hook Form
   - Servicio de autenticación
   - Manejo de estados de carga

4. **Rutas**
   - Sistema de rutas con React Router
   - Layout específico para autenticación
   - Redirecciones automáticas

### 🔄 Próximos Pasos

1. **Registro de Usuario**
   - Crear `RegisterPage.tsx`
   - Hook `useRegister`
   - Validaciones adicionales

2. **Recuperación de Contraseña**
   - `ForgotPasswordPage.tsx`
   - `ResetPasswordPage.tsx`

3. **Autenticación Persistente**
   - Context de autenticación
   - Rutas protegidas
   - Middleware de tokens

## 🛠️ Uso

### Ejecutar el proyecto

```bash
npm start
```

### Estructura de archivos seguida

- **Componentes**: En carpetas específicas por funcionalidad
- **Hooks**: Lógica reutilizable separada de la UI
- **Tipos**: TypeScript estricto para mejor desarrollo
- **Servicios**: Separación clara entre lógica de negocio y UI

### Convenciones de nomenclatura

- Componentes: PascalCase (ej: `LoginForm.tsx`)
- Hooks: camelCase con prefijo 'use' (ej: `useLogin.ts`)
- Tipos: PascalCase para interfaces (ej: `LoginFormData`)
- Archivos de servicio: camelCase (ej: `authService.ts`)

## 📦 Dependencias Principales

- **React 18** + **TypeScript**: Base del proyecto
- **React Router DOM**: Navegación
- **React Hook Form**: Manejo de formularios
- **Yup**: Validación de esquemas
- **Tailwind CSS**: Estilos
- **React Hot Toast**: Notificaciones
- **Axios**: Cliente HTTP

## 🎯 Casos de Uso

### Login Exitoso
1. Usuario ingresa credenciales válidas
2. Validación en frontend
3. Llamada al servicio de autenticación
4. Guardado de token en localStorage
5. Notificación de éxito
6. Redirección al dashboard

### Login Fallido
1. Usuario ingresa credenciales inválidas
2. Validación en frontend (si hay errores de formato)
3. Llamada al servicio de autenticación
4. Manejo de errores del servidor
5. Mostrar mensajes de error específicos
6. Mantener al usuario en la página de login

Esta estructura está diseñada para ser escalable y mantenible, siguiendo las mejores prácticas de React y TypeScript.
