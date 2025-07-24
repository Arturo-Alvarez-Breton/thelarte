/**
 * Common logout handler for consistent logout behavior across the application
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

function performLogout(e) {
  if (e) {
    e.preventDefault();
  }
  
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    
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
