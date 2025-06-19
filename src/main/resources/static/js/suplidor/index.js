const table = document.getElementById('supplierTable');
const emptyState = document.getElementById('emptyState');

async function loadSuppliers() {
  try {
    const token = localStorage.getItem('authToken');
    const resp = await fetch('/api/suplidores', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    const data = await resp.json();
    
    if (data.length === 0) {
      table.parentElement.style.display = 'none';
      emptyState.classList.remove('hidden');
      return;
    }
    
    table.parentElement.style.display = 'block';
    emptyState.classList.add('hidden');
    
    table.innerHTML = data.map(s => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 text-sm font-medium text-gray-900">${s.id}</td>
        <td class="px-6 py-4 text-sm text-gray-900">${s.nombre}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${s.ciudad}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${s.email || 'N/A'}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${s.rNC || 'N/A'}</td>
        <td class="px-6 py-4 text-sm text-center">
          <div class="flex justify-center space-x-2">
            <a href="form.html?id=${s.id}"
               class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">
              ✏️ Editar
            </a>
            <button data-id="${s.id}" 
                    class="delete text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50 transition-colors">
              🗑️ Eliminar
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading suppliers:', error);
    alert('Error al cargar los suplidores. Por favor, intenta de nuevo.');
  }
}

async function deleteSupplier(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este suplidor?')) return;
  
  try {
    const token = localStorage.getItem('authToken');
    const resp = await fetch(`/api/suplidores/${id}`, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    loadSuppliers();
    alert('Suplidor eliminado exitosamente.');
  } catch (error) {
    console.error('Error deleting supplier:', error);
    alert('Error al eliminar el suplidor. Por favor, intenta de nuevo.');
  }
}

/**
 * Verifica si el token es válido haciendo una petición al endpoint de validación
 * @param {string} token Token JWT a verificar
 */
async function verifyToken(token) {
  try {
    const resp = await fetch('/api/dashboard/validate', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!resp.ok) {
      console.log('Token validation failed');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      window.location.href = '/pages/login.html';
      return false;
    }
    
    const data = await resp.json();
    console.log('Token validation successful:', data);
    return data.authorized;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

table.addEventListener('click', e => {
  if (e.target.classList.contains('delete')) {
    deleteSupplier(e.target.dataset.id);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('Suplidor index loading...');
  
  // Check if user is authenticated using local storage
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log('No valid token found, redirecting to login');
    window.location.href = '/pages/login.html';
    return;
  }
  console.log('Token found, loading page...');
  
  // Verificación adicional: Comprobar validez del token con el servidor
  verifyToken(token);


  // Display welcome message
  const welcomeMessage = document.getElementById('welcomeMessage');
  const userEmail = localStorage.getItem('userEmail') || 'Usuario';
  
  if (welcomeMessage) {
    welcomeMessage.textContent = `Bienvenido, ${userEmail}`;
  }
  
  // Add role information if element exists
  const roleInfo = document.getElementById('roleInfo');
  if (roleInfo) {
    roleInfo.textContent = 'Usuario';
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        
        // Redirect to login
        window.location.href = '/pages/login.html';
      }
    });
  }

  // Iniciar la carga de los suplidores
  loadSuppliers();
});
