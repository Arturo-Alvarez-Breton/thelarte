/**
 * JWT Authentication and Role-based Access Control Utility
 * Handles client-side authentication validation and role-based page access
 */
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('jwt_token');
        this.userInfo = null;
        this.initializeAuth();
    }

    /**
     * Initialize authentication on page load
     */
    async initializeAuth() {
        if (this.token) {
            try {
                await this.validateToken();
            } catch (error) {
                console.error('Token validation failed:', error);
                this.logout();
            }
        }
    }

    /**
     * Validate JWT token with the server
     */
    async validateToken() {
        if (!this.token) {
            throw new Error('No token found');
        }

        try {
            const response = await fetch('/api/auth/user-info', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.userInfo = await response.json();
                if (!this.userInfo.authenticated) {
                    throw new Error('User not authenticated');
                }
                return true;
            } else {
                throw new Error('Token validation failed');
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if user has required role for current page
     */
    checkPageAccess() {
        const currentPath = window.location.pathname;

        // Allow access to login and public pages
        if (currentPath === '/pages/login.html' ||
            currentPath === '/pages/payment-success.html' ||
            currentPath === '/' ||
            currentPath.startsWith('/static/') ||
            currentPath.startsWith('/css/') ||
            currentPath.startsWith('/js/') ||
            currentPath.startsWith('/images/')) {
            return true;
        }

        // Check if user is authenticated
        if (!this.isAuthenticated()) {
            // Don't redirect immediately, let the page load and handle auth errors
            console.warn('User not authenticated, but allowing page to load');
            return false;
        }

        // Define role-based page access rules
        const rolePageMapping = {
            'ADMINISTRADOR': ['/pages/admin/'],
            'TI': ['/pages/ti/'],
            'VENDEDOR': ['/pages/vendedor/'],
            'CAJERO': ['/pages/cajero/'],
            'CONTABILIDAD': ['/pages/contabilidad/']
        };

        // Check if current page requires role-based access
        for (const [role, allowedPaths] of Object.entries(rolePageMapping)) {
            for (const path of allowedPaths) {
                if (currentPath.startsWith(path)) {
                    if (!this.hasRole(role)) {
                        console.warn('User does not have required role, but allowing page to load');
                        return false;
                    }
                    return true;
                }
            }
        }

        // For any other protected pages, require authentication
        if (currentPath.startsWith('/pages/')) {
            if (!this.isAuthenticated()) {
                this.redirectToLogin();
                return false;
            }
        }

        return true;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.token && this.userInfo && this.userInfo.authenticated;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        if (!this.userInfo || !this.userInfo.roles) {
            return false;
        }
        return this.userInfo.roles.includes(role);
    }

    /**
     * Get user roles
     */
    getUserRoles() {
        return this.userInfo ? this.userInfo.roles : [];
    }

    /**
     * Get username
     */
    getUsername() {
        return this.userInfo ? this.userInfo.username : null;
    }

    /**
     * Set JWT token after successful login
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('jwt_token', token);
    }

    /**
     * Logout user and clear session
     */
    logout() {
        this.token = null;
        this.userInfo = null;
        localStorage.removeItem('jwt_token');
        this.redirectToLogin();
    }

    /**
     * Safe logout function that avoids unnecessary server calls
     */
    async safeLogout() {
        // Only perform logout if we're not already on login page and there's actually a session
        if (window.location.pathname !== '/pages/login.html' ||
            this.token ||
            localStorage.getItem('jwt_token') ||
            document.cookie.includes('jwt_token')) {

            try {
                // Call server logout to clear httpOnly cookies
                await fetch('/logout', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.warn('Error during server logout:', error);
            } finally {
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
                });

                // Clear client-side session data
                this.logout();
            }
        }
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        if (window.location.pathname !== '/pages/login.html') {
            window.location.href = '/pages/login.html';
        }
    }

    /**
     * Make authenticated API requests
     */
    async apiRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, mergedOptions);

            if (response.status === 401) {
                this.logout();
                throw new Error('Authentication required');
            }

            if (response.status === 403) {
                this.redirectToLogin();
                throw new Error('Access denied');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get appropriate dashboard URL based on user role
     */
    getDashboardUrl() {
        if (!this.isAuthenticated()) {
            return '/pages/login.html';
        }

        const roles = this.getUserRoles();

        // Priority order for roles (in case user has multiple roles)
        if (roles.includes('ADMINISTRADOR')) {
            return '/pages/admin/index.html';
        } else if (roles.includes('TI')) {
            return '/pages/ti/usuarios.html';
        } else if (roles.includes('CONTABILIDAD')) {
            return '/pages/contabilidad/transacciones.html';
        } else if (roles.includes('CAJERO')) {
            return '/pages/cajero/transacciones.html';
        } else if (roles.includes('VENDEDOR')) {
            return '/pages/vendedor/productos.html';
        }

        return '/pages/login.html';
    }
}

// Initialize global auth manager
const authManager = new AuthManager();

// Auto-check page access when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        if (authManager.token) {
            await authManager.validateToken();
        }
        // Only check page access if we're not on login page
        if (window.location.pathname !== '/pages/login.html') {
            authManager.checkPageAccess();
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/pages/login.html') {
            authManager.redirectToLogin();
        }
    }
});

// Export for global use
window.authManager = authManager;
