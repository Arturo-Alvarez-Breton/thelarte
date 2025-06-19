import { logout, getUserEmail, isAuthenticated, getAuthToken } from '../services/authService.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Dashboard loading...');
  
  // Check if user is authenticated locally first
  if (!isAuthenticated()) {
    console.log('No valid token found, redirecting to login');
    window.location.href = '/login.html';
    return;
  }

  console.log('Token found, validating with server...');

  // Validate authentication with server
  try {
    const token = getAuthToken();
    console.log('Making request to validate endpoint');
    
    const response = await fetch('/api/dashboard/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Validation response status:', response.status);

    if (!response.ok) {
      console.log('Validation failed with status:', response.status);
      // Token is invalid or user doesn't have proper role
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      window.location.href = '/login.html';
      return;
    }

    const data = await response.json();
    console.log('Validation response data:', data);
    
    if (!data.authorized) {
      console.log('User not authorized');
      window.location.href = '/login.html';
      return;
    }

    console.log('User authenticated successfully');

    // Display welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    const username = data.username || getUserEmail() || 'Usuario';
    
    // Extract role information
    const roles = data.roles || [];
    const roleNames = roles.map(role => role.authority.replace('ROLE_', '')).join(', ');
    
    welcomeMessage.textContent = `Bienvenido, ${username}`;
    
    // Add role information if element exists
    const roleInfo = document.getElementById('roleInfo');
    if (roleInfo && roleNames) {
      roleInfo.textContent = `Rol(es): ${roleNames}`;
    }

    console.log('Dashboard initialized successfully for user:', username, 'with roles:', roleNames);

  } catch (error) {
    console.error('Error validating authentication:', error);
    // On error, redirect to login
    window.location.href = '/login.html';
    return;
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        logout();
      }
    });
  }

  // Handle module access based on user role
  const checkUserAccess = () => {
    // For now, all authenticated users can access suplidores
    // This can be enhanced with role-based access control
    console.log('User has access to dashboard modules');
  };

  checkUserAccess();
});
