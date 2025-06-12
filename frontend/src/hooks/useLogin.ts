import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { loginSchema } from '../schemas/authSchemas';
import { LoginFormData } from '../types/auth';
import { authService } from '../services/authService';
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
      const response = await authService.login({
        username: data.username,
        password: data.password
      });
      
      // Store auth data using the service method
      authService.storeAuthData(response);
      
      toast.success('¡Bienvenido de vuelta!');
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        setError('username', { 
          type: 'manual', 
          message: 'Usuario o contraseña incorrectos' 
        });
        setError('password', { 
          type: 'manual', 
          message: 'Usuario o contraseña incorrectos' 
        });
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
        toast.error(
          error.response?.data?.message ?? 
          'Error al iniciar sesión. Inténtalo de nuevo.'
        );
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
