import apiClient from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse, ApiResponse } from '../types/auth';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VALIDATE: '/auth/validate',
} as const;

export class AuthService {
  /**
   * Login user with username and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Convert username to the expected format for the backend
      const loginData = {
        username: credentials.username,
        password: credentials.password
      };
      
      const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, loginData);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Error al iniciar sesión. Verifique sus credenciales.'
      );
    }
  }

  /**
   * Register new user
   */
  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const { confirmPassword, ...registerData } = credentials;
      const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, registerData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Error al registrar usuario. Intente nuevamente.'
      );
    }
  }

  /**
   * Validate current token
   */
  static async validateToken(): Promise<boolean> {
    try {
      await apiClient.get(AUTH_ENDPOINTS.VALIDATE);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Store auth data in localStorage
   */
  static storeAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('authToken', authResponse.token);
    localStorage.setItem('userEmail', authResponse.email);
  }

  /**
   * Get stored auth token
   */
  static getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Get stored user email
   */
  static getStoredUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  /**
   * Clear stored auth data
   */
  static clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
  }
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return !!token;
  }
}

// Export a default instance for easier importing
export const authService = AuthService;
