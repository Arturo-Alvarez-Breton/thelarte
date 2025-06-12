// Auth related types
export interface LoginCredentials {
  username: string; // Cambiado de email a username según el diseño
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  username?: string; // For backward compatibility
}

export interface User {
  id: string;
  email: string;
  roles: string[];
  active: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}
