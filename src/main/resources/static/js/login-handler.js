/**
 * Enhanced Login Handler with JWT and Role-based Redirection
 */
class LoginHandler {
    constructor() {
        this.loginForm = null;
        this.initializeLoginForm();
    }

    initializeLoginForm() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loginForm = document.getElementById('loginForm') || document.querySelector('form');
            if (this.loginForm) {
                this.setupLoginForm();
            }

            // Check if user is already authenticated
            this.checkExistingAuth();
        });
    }

    setupLoginForm() {
        this.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e);
        });
    }

    async checkExistingAuth() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            // User is already logged in, redirect to appropriate dashboard
            window.location.href = window.authManager.getDashboardUrl();
        }
    }

    async handleLogin(event) {
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const password = formData.get('password');

        if (!username || !password) {
            this.showError('Por favor, ingrese usuario y contraseña');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();

                if (data.token) {
                    // Store token
                    localStorage.setItem('jwt_token', data.token);

                    // Set token in cookie for server-side validation - 30 minutes
                    document.cookie = `jwt_token=${data.token}; path=/; max-age=1800; secure; samesite=strict`;

                    // Update auth manager
                    if (window.authManager) {
                        window.authManager.setToken(data.token);
                        await window.authManager.validateToken();
                    }

                    // Redirect to appropriate dashboard based on user role
                    this.redirectToDashboard();
                } else {
                    this.showError('Error en la respuesta del servidor. No se recibió el token de autenticación.');
                }
            } else {
                // Handle specific error status codes
                let errorMessage = 'Error al iniciar sesión';
                
                if (response.status === 401) {
                    errorMessage = 'Credenciales incorrectas. El usuario o contraseña ingresados no son válidos.';
                } else if (response.status === 403) {
                    errorMessage = 'Acceso denegado. Tu cuenta puede estar deshabilitada o no tienes permisos.';
                } else if (response.status === 404) {
                    errorMessage = 'Usuario no encontrado. Verifica que el nombre de usuario sea correcto.';
                } else if (response.status === 422) {
                    errorMessage = 'Datos de inicio de sesión inválidos. Revisa el formato de tus credenciales.';
                } else if (response.status === 429) {
                    errorMessage = 'Demasiados intentos de inicio de sesión. Por favor, espera unos minutos.';
                } else if (response.status >= 500) {
                    errorMessage = 'Error en el servidor. Por favor, intenta más tarde o contacta al administrador.';
                } else {
                    // Try to get error message from response
                    try {
                        const errorData = await response.json();
                        const serverMessage = errorData.message || errorData.error || '';
                        
                        // Check if the server message indicates invalid credentials
                        if (serverMessage.toLowerCase().includes('invalid') || 
                            serverMessage.toLowerCase().includes('incorrect') || 
                            serverMessage.toLowerCase().includes('wrong') ||
                            serverMessage.toLowerCase().includes('inválid') ||
                            serverMessage.toLowerCase().includes('incorrecto') ||
                            serverMessage.toLowerCase().includes('credencial')) {
                            errorMessage = 'Credenciales incorrectas. El usuario o contraseña ingresados no son válidos.';
                        } else if (serverMessage) {
                            errorMessage = serverMessage;
                        } else {
                            errorMessage = 'Credenciales incorrectas. Verifica tu usuario y contraseña.';
                        }
                    } catch (parseError) {
                        console.error('Error parsing error response:', parseError);
                        errorMessage = 'Credenciales incorrectas. Verifica tu usuario y contraseña.';
                    }
                }
                
                this.showError(errorMessage);
            }
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Error de conexión. Intente nuevamente.';
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Error de conexión. Verifica tu conexión a internet y que el servidor esté disponible.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.showError(errorMessage);
        } finally {
            this.showLoading(false);
        }
    }

    redirectToDashboard() {
        if (window.authManager) {
            const dashboardUrl = window.authManager.getDashboardUrl();
            window.location.href = dashboardUrl;
        } else {
            // Fallback redirect
            window.location.href = '/pages/admin/index.html';
        }
    }

    showError(message) {
        // Check if popup elements exist (for pages that have the popup modal)
        const popupOverlay = document.getElementById('popupOverlay');
        const popupIcon = document.getElementById('popupIcon');
        const popupTitle = document.getElementById('popupTitle');
        const popupMessage = document.getElementById('popupMessage');
        const popupCloseBtn = document.getElementById('popupCloseBtn');

        if (popupOverlay && popupIcon && popupTitle && popupMessage && popupCloseBtn) {
            // Use popup modal
            this.showPopup('Error de Autenticación', message, 'error');
        } else {
            // Fallback to creating inline error message
            // Remove existing error messages
            const existingErrors = document.querySelectorAll('.error-message');
            existingErrors.forEach(error => error.remove());

            // Create new error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message alert alert-danger';
            errorDiv.style.cssText = `
                color: #721c24;
                background-color: #f8d7da;
                border-color: #f5c6cb;
                padding: 0.75rem 1.25rem;
                margin-bottom: 1rem;
                border: 1px solid transparent;
                border-radius: 0.25rem;
            `;
            errorDiv.textContent = message;

            // Insert error message before the form
            if (this.loginForm) {
                this.loginForm.parentNode.insertBefore(errorDiv, this.loginForm);
            }

            // Auto-remove error after 5 seconds
            setTimeout(() => {
                if (errorDiv && errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 5000);
        }
    }

    showPopup(title, message, type = 'error') {
        const popupOverlay = document.getElementById('popupOverlay');
        const popupIcon = document.getElementById('popupIcon');
        const popupTitle = document.getElementById('popupTitle');
        const popupMessage = document.getElementById('popupMessage');
        const popupCloseBtn = document.getElementById('popupCloseBtn');

        if (!popupOverlay) return;

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
            const modal = popupOverlay.querySelector('.popup-modal');
            if (modal) {
                modal.classList.add('shake');
                setTimeout(() => {
                    modal.classList.remove('shake');
                }, 500);
            }
        }

        // Show popup
        popupOverlay.classList.add('show');

        // Setup close handlers if not already done
        if (!popupCloseBtn.hasAttribute('data-handler-added')) {
            popupCloseBtn.setAttribute('data-handler-added', 'true');

            // Close popup when clicking close button
            popupCloseBtn.addEventListener('click', () => {
                popupOverlay.classList.remove('show');
            });

            // Close popup when clicking overlay
            popupOverlay.addEventListener('click', (e) => {
                if (e.target === popupOverlay) {
                    popupOverlay.classList.remove('show');
                }
            });

            // ESC key to close popup
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && popupOverlay.classList.contains('show')) {
                    popupOverlay.classList.remove('show');
                }
            });
        }
    }
}

// Logout function for global use
async function logout() {
    try {
        // Llamar al backend para eliminar la cookie httpOnly
        await fetch('/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.warn('Error during server logout:', error);
        // Continue with client-side cleanup even if server request fails
    } finally {
        // Limpiar localStorage y sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // Función más agresiva para eliminar cookies
        function deleteCookie(name, path = '/', domain = null) {
            const domainPart = domain ? `domain=${domain};` : '';
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};${domainPart}`;
        }

        // Lista de cookies a eliminar
        const cookiesToClear = ['jwt_token', 'JSESSIONID', 'session_id'];

        cookiesToClear.forEach(cookieName => {
            // Clear for current domain and various paths
            deleteCookie(cookieName, '/');
            deleteCookie(cookieName, '/pages/');
            deleteCookie(cookieName, '');

            // Clear with domain variations
            const hostname = window.location.hostname;
            deleteCookie(cookieName, '/', hostname);
            deleteCookie(cookieName, '/', `.${hostname}`);

            // Clear for localhost scenarios
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                deleteCookie(cookieName, '/', 'localhost');
                deleteCookie(cookieName, '/', '127.0.0.1');
            }

            // Clear for parent domains
            const domainParts = hostname.split('.');
            while (domainParts.length > 1) {
                const domain = domainParts.join('.');
                deleteCookie(cookieName, '/', domain);
                deleteCookie(cookieName, '/', `.${domain}`);
                domainParts.shift();
            }
        });

        // Forzar recarga de la página después de limpiar cookies
        setTimeout(() => {
            // Limpiar auth manager
            if (window.authManager) {
                window.authManager.logout();
            } else {
                // Forzar redirección si no hay authManager
                window.location.href = '/pages/login.html';
            }
        }, 100);
    }
}

// Safe logout function for login page
function safeLogout() {
    // Only perform logout if we're not already on login page and there's actually a session
    if (window.location.pathname !== '/pages/login.html' ||
        localStorage.getItem('jwt_token') ||
        document.cookie.includes('jwt_token')) {
        logout();
    }
}

// Initialize login handler
const loginHandler = new LoginHandler();

// Export for global use
window.loginHandler = loginHandler;
window.logout = logout;
window.safeLogout = safeLogout;
