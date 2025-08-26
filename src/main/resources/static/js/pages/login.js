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

    // Handle different response statuses with specific error messages
    if (response.status === 401) {
      throw new Error('Credenciales incorrectas. El usuario o contraseña ingresados no son válidos.');
    }
    
    if (response.status === 403) {
      throw new Error('Acceso denegado. Tu cuenta puede estar deshabilitada o no tienes permisos.');
    }
    
    if (response.status === 404) {
      throw new Error('Usuario no encontrado. Verifica que el nombre de usuario sea correcto.');
    }
    
    if (response.status === 422) {
      throw new Error('Datos de inicio de sesión inválidos. Revisa el formato de tus credenciales.');
    }
    
    if (response.status === 429) {
      throw new Error('Demasiados intentos de inicio de sesión. Por favor, espera unos minutos antes de intentar nuevamente.');
    }
    
    if (response.status >= 500) {
      throw new Error('Error en el servidor. Por favor, intenta más tarde o contacta al administrador.');
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Error de comunicación con el servidor. Intenta nuevamente.');
      }
      
      // Check if the error message indicates invalid credentials
      const errorMessage = errorData.message || errorData.error || '';
      if (errorMessage.toLowerCase().includes('invalid') || 
          errorMessage.toLowerCase().includes('incorrect') || 
          errorMessage.toLowerCase().includes('wrong') ||
          errorMessage.toLowerCase().includes('inválid') ||
          errorMessage.toLowerCase().includes('incorrecto')) {
        throw new Error('Credenciales incorrectas. El usuario o contraseña ingresados no son válidos.');
      }
      
      throw new Error(errorMessage || 'Error al iniciar sesión. Verifica tus credenciales.');
    }

    const data = await response.json();
    
    // Validate response data
    if (!data.token) {
      throw new Error('Respuesta del servidor inválida. No se recibió el token de autenticación.');
    }

    return { 
      token: data.token, 
      email: data.email || data.username + '@thelarte.com',
      role: data.role // Assuming the backend provides the role
    };

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet y que el servidor esté disponible.');
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
  
  // Popup elements
  const popupOverlay = document.getElementById('popupOverlay');
  const popupIcon = document.getElementById('popupIcon');
  const popupTitle = document.getElementById('popupTitle');
  const popupMessage = document.getElementById('popupMessage');
  const popupCloseBtn = document.getElementById('popupCloseBtn');

  // Popup function to show messages
  const showPopup = (title, message, type = 'error') => {
    popupTitle.textContent = title;
    popupMessage.textContent = message;

    // Update icon based on type
    popupIcon.className = `popup-icon ${type}`;

    // Different icons for different types
    let iconSVG = '';
    switch(type) {
      case 'success':
        iconSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>`;
        break;
      case 'warning':
        iconSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>`;
        break;
      case 'error':
      default:
        iconSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
        </svg>`;
        break;
    }

    popupIcon.innerHTML = iconSVG;

    // Add shake animation for errors
    if (type === 'error') {
      popupOverlay.querySelector('.popup-modal').classList.add('shake');
      setTimeout(() => {
        popupOverlay.querySelector('.popup-modal').classList.remove('shake');
      }, 500);
    }

    // Show popup
    popupOverlay.classList.add('show');
  };

  // Hide popup
  const hidePopup = () => {
    popupOverlay.classList.remove('show');
  };

  // Close popup when clicking close button or overlay
  popupCloseBtn.addEventListener('click', hidePopup);
  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) {
      hidePopup();
    }
  });

  // ESC key to close popup
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupOverlay.classList.contains('show')) {
      hidePopup();
    }
  });

  // Show/hide error message (now using popup)
  const showError = (message) => {
    showPopup('Error de Autenticación', message, 'error');
  };

  const hideError = () => {
    hidePopup();
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
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userRole', data.role); // Store user role

      // Success feedback with popup
      showPopup('¡Inicio de Sesión Exitoso!', 'Redirigiendo al panel de control...', 'success');

      // Success feedback on button
      submitBtn.innerHTML = '¡Acceso concedido!';
      submitBtn.style.background = '#10B981';

      // Redirect based on role
      setTimeout(() => {
        const role = data.role;
        switch(role) {
          case 'ADMINISTRADOR':
            window.location.href = '/pages/admin/index.html';
            break;
          case 'CAJERO':
            window.location.href = '/pages/cajero/transacciones.html';
            break;
          case 'CONTABILIDAD':
            window.location.href = '/pages/contabilidad/reportes.html';
            break;
          case 'TI':
            window.location.href = '/pages/ti/clientes.html';
            break;
          case 'VENDEDOR':
            window.location.href = '/pages/vendedor/productos.html';
            break;
          default:
            // Fallback to vendedor if role is not recognized
            window.location.href = '/pages/vendedor/productos.html';
            break;
        }
      }, 1500);

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
  const role = localStorage.getItem('userRole');
  if (token && role) {
    console.log('User already has a token, redirecting based on role:', role);
    // Redirect based on stored role
    switch(role) {
      case 'ADMINISTRADOR':
        window.location.href = '/pages/admin/index.html';
        break;
      case 'CAJERO':
        window.location.href = '/pages/cajero/transacciones.html';
        break;
      case 'CONTABILIDAD':
        window.location.href = '/pages/contabilidad/reportes.html';
        break;
      case 'TI':
        window.location.href = '/pages/ti/clientes.html';
        break;
      case 'VENDEDOR':
        window.location.href = '/pages/vendedor/productos.html';
        break;
      default:
        // Fallback to vendedor if role is not recognized
        window.location.href = '/pages/vendedor/productos.html';
        break;
    }
  }
});

