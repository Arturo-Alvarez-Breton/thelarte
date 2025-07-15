const table = document.getElementById('supplierTable');
const emptyState = document.getElementById('emptyState');
const mobileView = document.getElementById('mobileView');
const desktopView = document.getElementById('desktopView');
const loadingOverlay = document.getElementById('loadingOverlay');
const viewToggle = document.getElementById('viewToggle');

function showLoading() {
  if (loadingOverlay) loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  if (loadingOverlay) loadingOverlay.classList.add('hidden');
}

function updateView() {
  const mode = localStorage.getItem('supplierView') || viewToggle.value;
  if (viewToggle) viewToggle.value = mode;
  if (mode === 'card') {
    mobileView.style.display = 'block';
    desktopView.style.display = 'none';
  } else {
    desktopView.style.display = 'block';
    mobileView.style.display = 'none';
  }
}

async function loadSuppliers() {
  try {
    showLoading();
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
      desktopView.style.display = 'none';
      mobileView.style.display = 'none';
      emptyState.classList.remove('hidden');
      hideLoading();
      return;
    }
    
    desktopView.style.display = 'block';
    mobileView.style.display = 'block';
    emptyState.classList.add('hidden');
    
    // Render desktop table
    table.innerHTML = data.map(s => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-4 text-sm font-medium text-gray-900">${s.id}</td>
        <td class="px-4 py-4 text-sm text-gray-900 font-medium">${s.nombre}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${s.ciudad}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${s.email || 'N/A'}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${s.rNC || 'N/A'}</td>
        <td class="px-4 py-4 text-sm text-center">
          <div class="flex justify-center space-x-2">
            <a href="form.html?id=${s.id}"
               class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-50 transition-colors">
              Editar
            </a>
            <button data-id="${s.id}" 
                    class="delete text-red-600 hover:text-red-800 px-2 py-1 rounded text-xs hover:bg-red-50 transition-colors">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    // Render mobile cards
    mobileView.innerHTML = data.map(s => `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">${s.nombre}</h3>
            <p class="text-sm text-gray-600">ID: ${s.id}</p>
          </div>
          <div class="flex space-x-2">
            <a href="form.html?id=${s.id}"
               class="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </a>
            <button data-id="${s.id}" 
                    class="delete text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-2 text-sm">
          <div>
            <span class="text-gray-500">Provincia:</span>
            <span class="text-gray-900 ml-1">${s.ciudad}</span>
          </div>
          <div>
            <span class="text-gray-500">Email:</span>
            <span class="text-gray-900 ml-1">${s.email || 'N/A'}</span>
          </div>
          <div>
            <span class="text-gray-500">RNC:</span>
            <span class="text-gray-900 ml-1">${s.rNC || 'N/A'}</span>
          </div>
        </div>
      </div>
    `).join('');
    updateView();
    hideLoading();
  } catch (error) {
    console.error('Error loading suppliers:', error);
    alert('Error al cargar los suplidores. Por favor, intenta de nuevo.');
    hideLoading();
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

// Event listeners for both desktop and mobile views
table.addEventListener('click', e => {
  if (e.target.classList.contains('delete')) {
    deleteSupplier(e.target.dataset.id);
  }
});

mobileView.addEventListener('click', e => {
  if (e.target.classList.contains('delete') || e.target.closest('.delete')) {
    const btn = e.target.classList.contains('delete') ? e.target : e.target.closest('.delete');
    const id = btn.dataset.id;
    deleteSupplier(id);
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

  // Preferencia de vista
  if (viewToggle) {
    viewToggle.addEventListener('change', () => {
      localStorage.setItem('supplierView', viewToggle.value);
      updateView();
    });
  }

  // Onboarding
  const onboardingMsg = document.getElementById('onboardingMsg');
  if (onboardingMsg && !localStorage.getItem('suppliersOnboarded')) {
    onboardingMsg.classList.remove('hidden');
  }

  // Iniciar la carga de los suplidores
  loadSuppliers();
});

function dismissOnboarding() {
  localStorage.setItem('suppliersOnboarded', '1');
  const msg = document.getElementById('onboardingMsg');
  if (msg) msg.classList.add('hidden');
}
