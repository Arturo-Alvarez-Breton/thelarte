const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080';

// Utility function for making authenticated API calls
export async function makeAuthenticatedRequest(url, options = {}) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    
    if (response.status === 401) {
      // Token is invalid, clear storage and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      window.location.href = '/login.html';
      throw new Error('Session expired. Please log in again.');
    }
    
    return response;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
    }
    throw error;
  }
}

export async function login(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    // Handle different response statuses
    if (response.status === 401) {
      throw new Error('Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.');
    }
    
    if (response.status === 403) {
      throw new Error('Acceso denegado. Tu cuenta puede estar deshabilitada.');
    }
    
    if (response.status === 429) {
      throw new Error('Demasiados intentos de inicio de sesión. Por favor, espera unos minutos.');
    }
    
    if (response.status >= 500) {
      throw new Error('Error en el servidor. Por favor, intenta más tarde.');
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (_) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      throw new Error(errorData.message || errorData.error || 'Error al iniciar sesión');
    }

    const data = await response.json();
    
    // Validate response data
    if (!data.token) {
      throw new Error('Respuesta del servidor inválida: token faltante');
    }
    
    return data;

  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
    }
    
    // Re-throw custom errors
    throw error;
  }
}

export async function logout() {
  try {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    
    // Optional: call logout endpoint if it exists
    const token = localStorage.getItem('authToken');
    if (token) {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Redirect to login
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect even if logout endpoint fails
    window.location.href = '/login.html';
  }
}

export function getAuthToken() {
  return localStorage.getItem('authToken');
}

export function isAuthenticated() {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Basic JWT token validation (check if it's expired)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

export function getUserEmail() {
  return localStorage.getItem('userEmail');
}
