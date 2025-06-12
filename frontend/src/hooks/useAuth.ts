import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { LoginRequest } from '../types/auth';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      authService.storeAuthData(response);
      toast.success('¡Bienvenido de vuelta!');
      navigate('/dashboard');
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authService.clearAuthData();
    navigate('/auth/login');
  }, [navigate]);

  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  return { 
    login, 
    logout, 
    isAuthenticated,
    isLoading 
  };
}
