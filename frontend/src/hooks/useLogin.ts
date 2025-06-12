import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { loginSchema } from '../schemas/authSchemas';
import { LoginFormData } from '../types/auth';
import { AuthService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const response = await AuthService.login({
        username: data.username,
        password: data.password
      });
      
      // Store auth data using the service method
      AuthService.storeAuthData(response);
      
      toast.success('¡Bienvenido de vuelta!');
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        // Set error only once for both fields
        const errorMessage = 'Usuario o contraseña incorrectos';
        setError('username', { 
          type: 'manual', 
          message: errorMessage 
        });
        // Don't set password error to avoid duplication
      } else if (error.response?.status === 422) {
        // Server validation errors
        const serverErrors = error.response.data.errors;
        Object.keys(serverErrors).forEach((field) => {
          setError(field as keyof LoginFormData, {
            type: 'manual',
            message: serverErrors[field][0]
          });
        });
      } else {
        // For other errors, show a toast instead of field errors
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Error al iniciar sesión. Inténtalo de nuevo.';
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
    reset
  };
};
