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
                    this.showError('Error en la respuesta del servidor');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                this.showError(errorData.message || 'Credenciales inválidas');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Error de conexión. Intente nuevamente.');
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

    showLoading(isLoading) {
        const submitButton = this.loginForm ? this.loginForm.querySelector('button[type="submit"]') : null;

        if (submitButton) {
            if (isLoading) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Iniciando sesión...';
            } else {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Iniciar Sesión';
            }
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
