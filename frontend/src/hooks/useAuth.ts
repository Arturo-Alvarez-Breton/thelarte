import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { LoginRequest } from '../types/auth';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      // Convert the form data to the correct format for the API
      const loginCredentials = {
        username: data.username,
        password: data.password
      };
      
      const response = await AuthService.login(loginCredentials);
      AuthService.storeAuthData(response);
      toast.success('¡Bienvenido de vuelta!');
      navigate('/dashboard');
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    AuthService.clearAuthData();
    navigate('/auth/login');
  }, [navigate]);

  const isAuthenticated = useCallback(() => {
    return AuthService.isAuthenticated();
  }, []);

  return { 
    login, 
    logout, 
    isAuthenticated,
    isLoading 
  };
}
