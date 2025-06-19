// Real login function to authenticate with backend
const login = async ({ username, password }) => {
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password })
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
        errorData = await response.json();      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Error de comunicación con el servidor.');
      }
      throw new Error(errorData.message || errorData.error || 'Error al iniciar sesión');
    }

    const data = await response.json();
    
    // Validate response data
    if (!data.token) {
      throw new Error('Respuesta del servidor inválida. Por favor, intenta más tarde.');
    }

    return { 
      token: data.token, 
      email: data.email || data.username + '@thelarte.com' 
    };

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
    }
    throw error;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');
  const submitBtn = document.getElementById('submitBtn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  // Show/hide error message
  const showError = (message) => {
    errorMsg.querySelector('span').textContent = message;
    errorMsg.classList.add('show');
  };

  const hideError = () => {
    errorMsg.classList.remove('show');
  };  // Loading state for button
  const setLoadingState = (isLoading) => {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span>Iniciando sesión...';
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Iniciar sesión';
    }
  };

  // Input validation
  const validateInput = (input) => {
    if (input.validity.valid) {
      input.style.borderColor = '#10B981';
    } else {
      input.style.borderColor = '#EF4444';
    }
  };

  // Add event listeners for inputs
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener('blur', () => validateInput(input));
    input.addEventListener('input', () => {
      input.style.borderColor = '#E5E7EB';
      hideError();
    });
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Basic validation
    if (!username || !password) {
      showError('Por favor, completa todos los campos requeridos.');
      return;
    }

    if (username.length < 3) {
      showError('El usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (password.length < 3) {
      showError('La contraseña debe tener al menos 3 caracteres.');
      return;
    }

    setLoadingState(true);

    try {
      const data = await login({ username, password });
      
      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', data.email);      // Success feedback
      submitBtn.innerHTML = '¡Acceso concedido!';
      submitBtn.style.background = '#10B981';      // Redirect after a brief moment
        setTimeout(() => {
          window.location.href = '/pages/structure/home.html';
        }, 800);

    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Error al iniciar sesión. Por favor, intenta nuevamente.';
      
      if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized') || 
          err.message.toLowerCase().includes('credenciales')) {
        errorMessage = 'Usuario o contraseña incorrectos. Por favor, verifica tus credenciales.';
      } else if (err.message.toLowerCase().includes('network') || 
                 err.message.toLowerCase().includes('connection')) {
        errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showError(errorMessage);

    } finally {
      setLoadingState(false);
    }
  });

  // Enter key support
  [usernameInput, passwordInput].forEach((input, index) => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (index === 0) {
          passwordInput.focus();
        } else {
          form.dispatchEvent(new Event('submit'));
        }
      }
    });
  });

  // Auto-focus username input
  usernameInput.focus();
  // Check if user is already logged in
  const token = localStorage.getItem('authToken');
  if (token) {
    console.log('User already has a token');
    // Redirigir al inicio automáticamente si hay un token
    window.location.href = '/pages/structure/home.html';
  }
});
