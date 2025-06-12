import * as yup from 'yup';

// Schema de validación para el formulario de login
export const loginSchema = yup.object({
  username: yup
    .string()
    .required('El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'El nombre de usuario solo puede contener letras, números y guiones bajos'
    ),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
});

// Schema de validación para el formulario de registro
export const registerSchema = yup.object({
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: yup
    .string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir'),
});

// Schema para cambio de contraseña
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('La contraseña actual es requerida'),
  newPassword: yup
    .string()
    .required('La nueva contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmNewPassword: yup
    .string()
    .required('Confirma tu nueva contraseña')
    .oneOf([yup.ref('newPassword')], 'Las contraseñas deben coincidir'),
});

// Schema para recuperación de contraseña
export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido'),
});
