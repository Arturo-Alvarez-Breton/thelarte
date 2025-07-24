const table = document.getElementById('usuarioTable');
const emptyState = document.getElementById('emptyState');
const mobileView = document.getElementById('mobileView');
const desktopView = document.getElementById('desktopView');
const loadingOverlay = document.getElementById('loadingOverlay');
const viewToggle = document.getElementById('viewToggle');
const searchInput = document.getElementById('searchInput');
const btnFilter = document.getElementById('btnFilter');

// Modal y filtros
const filterModal = document.getElementById('filterModal');
const closeModal = document.getElementById('closeModal');
const filterRole = document.getElementById('filterRole');
const filterActive = document.getElementById('filterActive');
const btnApplyFilter = document.getElementById('btnApplyFilter');
const btnClearFilter = document.getElementById('btnClearFilter');

// Estado de filtro actual
let usuariosData = [];
let searchTerm = "";
let filterValues = {
    role: "",
    active: ""
};

function renderUsuarios(data) {
    let filtered = data.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro por rol
    if (filterValues.role) {
        filtered = filtered.filter(u => Array.isArray(u.roles)
            ? u.roles.map(r => r.toLowerCase()).includes(filterValues.role.toLowerCase())
            : (u.roles && u.roles.toLowerCase() === filterValues.role.toLowerCase())
        );
    }
    // Filtro por activo
    if (filterValues.active !== "") {
        filtered = filtered.filter(u => String(u.active) === filterValues.active);
    }

    // Decide qué vista mostrar antes de renderizar
    const mode = localStorage.getItem('usuarioView') || (viewToggle ? viewToggle.value : 'table');
    if (filtered.length === 0) {
        desktopView.style.display = 'none';
        mobileView.style.display = 'none';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');
    if (mode === 'card') {
        mobileView.style.display = 'block';
        desktopView.style.display = 'none';
    } else {
        desktopView.style.display = 'block';
        mobileView.style.display = 'none';
    }

    // Desktop table
    table.innerHTML = filtered.map(u => `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="px-4 py-4 text-sm font-medium text-gray-900">${u.username}</td>
      <td class="px-4 py-4 text-sm text-gray-900 font-medium">${Array.isArray(u.roles) ? u.roles.join(', ') : (u.roles || '')}</td>
      <td class="px-4 py-4 text-sm text-center">
        ${u.active ? '<span class="text-green-600 font-semibold">Sí</span>' : '<span class="text-red-600">No</span>'}
      </td>
      <td class="px-4 py-4 text-sm text-center">
        <div class="flex justify-center space-x-2">
          <a href="form.html?usuario=${encodeURIComponent(u.username)}"
             class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-50 transition-colors">
            Editar
          </a>
          <button data-username="${u.username}" 
                  class="delete text-red-600 hover:text-red-800 px-2 py-1 rounded text-xs hover:bg-red-50 transition-colors">
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  `).join('');

    // Mobile cards
    mobileView.innerHTML = filtered.map(u => `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900">${u.username}</h3>
        </div>
        <div class="flex space-x-2">
          <a href="form.html?usuario=${encodeURIComponent(u.username)}"
             class="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </a>
          <button data-username="${u.username}" 
                  class="delete text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-2 text-sm">
        <div>
          <span class="text-gray-500">Roles:</span>
          <span class="text-gray-900 ml-1">${Array.isArray(u.roles) ? u.roles.join(', ') : (u.roles || '')}</span>
        </div>
        <div>
          <span class="text-gray-500">Activo:</span>
          <span class="ml-1">${u.active ? '<span class="text-green-600 font-semibold">Sí</span>' : '<span class="text-red-600">No</span>'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function showLoading() {
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
}
function hideLoading() {
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
}
function updateView() {
    renderUsuarios(usuariosData);
}

async function loadUsuarios() {
    try {
        showLoading();
        const token = localStorage.getItem('authToken');
        const resp = await fetch('/api/usuarios', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const data = await resp.json();
        usuariosData = Array.isArray(data) ? data : [];
        renderUsuarios(usuariosData);
        hideLoading();
    } catch (error) {
        console.error('Error loading usuarios:', error);
        alert('Error al cargar los usuarios. Por favor, intenta de nuevo.');
        hideLoading();
    }
}

async function deleteUsuario(username) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch(`/api/usuarios/${encodeURIComponent(username)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        await loadUsuarios();
        alert('Usuario eliminado exitosamente.');
    } catch (error) {
        console.error('Error deleting usuario:', error);
        alert('Error al eliminar el usuario. Por favor, intenta de nuevo.');
    }
}

async function verifyToken(token) {
    try {
        const resp = await fetch('/api/dashboard/validate', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            window.location.href = '/pages/login.html';
            return false;
        }
        const data = await resp.json();
        return data.authorized;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}

table.addEventListener('click', e => {
    if (e.target.classList.contains('delete')) {
        deleteUsuario(e.target.dataset.username);
    }
});
mobileView.addEventListener('click', e => {
    if (e.target.classList.contains('delete') || e.target.closest('.delete')) {
        const btn = e.target.classList.contains('delete') ? e.target : e.target.closest('.delete');
        const username = btn.dataset.username;
        deleteUsuario(username);
    }
});

searchInput.addEventListener('input', e => {
    searchTerm = e.target.value.trim();
    renderUsuarios(usuariosData);
});

if (viewToggle) {
    viewToggle.addEventListener('change', () => {
        localStorage.setItem('usuarioView', viewToggle.value);
        updateView();
    });
}

btnFilter.addEventListener('click', () => {
    filterModal.classList.remove('hidden');
    filterModal.classList.add('flex');
});

closeModal.addEventListener('click', () => {
    filterModal.classList.remove('flex');
    filterModal.classList.add('hidden');
});

btnApplyFilter.addEventListener('click', () => {
    filterValues.role = filterRole.value;
    filterValues.active = filterActive.value;
    filterModal.classList.remove('flex');
    filterModal.classList.add('hidden');
    renderUsuarios(usuariosData);
});

btnClearFilter.addEventListener('click', () => {
    filterRole.value = "";
    filterActive.value = "";
    filterValues = { role: "", active: "" };
    renderUsuarios(usuariosData);
});

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }
    verifyToken(token);

    const onboardingMsg = document.getElementById('onboardingMsg');
    if (onboardingMsg && !localStorage.getItem('usuariosOnboarded')) {
        onboardingMsg.classList.remove('hidden');
    }

    loadUsuarios();
});

function dismissOnboarding() {
    localStorage.setItem('usuariosOnboarded', '1');
    const msg = document.getElementById('onboardingMsg');
    if (msg) msg.classList.add('hidden');
}