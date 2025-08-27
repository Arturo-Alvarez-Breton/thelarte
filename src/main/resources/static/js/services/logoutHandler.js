/**
 * Common logout handler for consistent logout behavior across the application
 * Integrates with JWT-based authentication system
 *
 * Usage: Include this script and add the following to your page
 * <script>
 *   document.addEventListener('DOMContentLoaded', function() {
 *     initLogoutHandlers();
 *   });
 * </script>
 */

function initLogoutHandlers() {
  // Handle both main logout button and sidebar logout button
  const logoutButtons = document.querySelectorAll('#logoutBtn, #sidebarLogoutBtn, [data-action="logout"]');
  
  logoutButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', performLogout);
    }
  });

  // Also support direct call for programmatic logout
  window.performLogout = performLogout;
}

async function performLogout(e) {
  if (e) {
    e.preventDefault();
  }
  
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    try {
      // Call server logout endpoint to invalidate session
      const token = localStorage.getItem('jwt_token');
      if (token) {
        await fetch('/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {
          // Continue with logout even if server call fails
        });
      }
    } catch (error) {
      console.warn('Error during server logout:', error);
    }

    // Clear all authentication data from localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('authToken'); // Legacy token
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('userInfo');

    // Clear JWT cookie by setting it to expire
    document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';

    // Clear auth manager if available
    if (window.authManager) {
      window.authManager.token = null;
      window.authManager.userInfo = null;
    }

    // Redirect to login page
    window.location.href = '/pages/login.html';
  }
}

// Auto-initialize if the DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initLogoutHandlers();
} else {
  document.addEventListener('DOMContentLoaded', initLogoutHandlers);
}
