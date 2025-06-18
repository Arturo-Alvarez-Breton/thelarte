const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080';

export async function login(credentials) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch (_) {
      throw new Error('Error al iniciar sesión');
    }
    throw new Error(data.message || 'Error al iniciar sesión');
  }

  return response.json();
}
