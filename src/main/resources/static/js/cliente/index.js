const tableBody   = document.getElementById('clientesTable');
const emptyState  = document.getElementById('emptyState');
const mobileView  = document.getElementById('mobileView');
const desktopView = document.getElementById('desktopView');
const viewToggle  = document.getElementById('viewToggle');

function updateView() {
    const mode = localStorage.getItem('clientesView') || viewToggle.value;
    if (viewToggle) viewToggle.value = mode;
    if (mode === 'card') {
        mobileView.style.display = 'block';
        desktopView.style.display = 'none';
    } else {
        desktopView.style.display = 'block';
        mobileView.style.display = 'none';
    }
}

async function loadClientes() {
    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch('/api/clientes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const data = await resp.json();

        if (!Array.isArray(data) || data.length === 0) {
            desktopView.style.display = 'none';
            mobileView.style.display  = 'none';
            emptyState.classList.remove('hidden');
            return;
        }

        desktopView.style.display = 'block';
        mobileView.style.display  = 'block';
        emptyState.classList.add('hidden');

        // Render desktop table rows
        tableBody.innerHTML = data.map(c => `
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-4 text-sm font-medium text-gray-900">${c.cedula}</td>
              <td class="px-4 py-4 text-sm text-gray-900 font-medium">${c.nombre}</td>
              <td class="px-4 py-4 text-sm text-gray-600">${c.apellido}</td>
              <td class="px-4 py-4 text-sm text-gray-600">${c.telefono || 'N/A'}</td>
              <td class="px-4 py-4 text-sm text-gray-600">${c.email || 'N/A'}</td>
              <td class="px-4 py-4 text-sm text-center">
                <div class="flex justify-center space-x-2">
                  <a href="form.html?cedula=${encodeURIComponent(c.cedula)}"
                     class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-50 transition-colors">
                    Editar
                  </a>
                  <button data-cedula="${c.cedula}"
                          class="delete-btn text-red-600 hover:text-red-800 px-2 py-1 rounded text-xs hover:bg-red-50 transition-colors">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
        `).join('');

        // Render mobile cards
        mobileView.innerHTML = data.map(c => `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">${c.nombre} ${c.apellido}</h3>
                  <p class="text-sm text-gray-600">Cédula: ${c.cedula}</p>
                </div>
                <div class="flex space-x-2">
                  <a href="form.html?cedula=${encodeURIComponent(c.cedula)}"
                     class="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors">
                    <!-- icono editar -->
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 
                               2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 
                               0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                      </path>
                    </svg>
                  </a>
                  <button data-cedula="${c.cedula}"
                          class="delete-btn text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors">
                    <!-- icono eliminar -->
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 
                               21H7.862a2 2 0 01-1.995-1.858L5 7m5 
                               4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 
                               1 0 00-1 1v3M4 7h16">
                      </path>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span class="text-gray-500">Teléfono:</span>
                  <span class="text-gray-900 ml-1">${c.telefono || 'N/A'}</span>
                </div>
                <div>
                  <span class="text-gray-500">Email:</span>
                  <span class="text-gray-900 ml-1">${c.email || 'N/A'}</span>
                </div>
              </div>
            </div>
        `).join('');

        updateView();

    } catch (error) {
        console.error('Error loading clientes:', error);
        alert('Error al cargar los clientes. Por favor, intenta de nuevo.');
    }
}

async function deleteCliente(cedula) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el cliente con cédula ${cedula}?`)) return;
    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch(`/api/clientes/${encodeURIComponent(cedula)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (resp.status === 404) {
            alert('Cliente no encontrado.');
            loadClientes();
            return;
        }
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        alert('Cliente eliminado exitosamente.');
        loadClientes();
    } catch (error) {
        console.error('Error deleting cliente:', error);
        alert('Error al eliminar el cliente. Por favor, intenta de nuevo.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }

    const welcomeMessage = document.getElementById('welcomeMessage');
    const userEmail      = localStorage.getItem('userEmail') || 'Usuario';
    if (welcomeMessage) welcomeMessage.textContent = `Bienvenido, ${userEmail}`;
    const roleInfo = document.getElementById('roleInfo');
    if (roleInfo) roleInfo.textContent = 'Usuario';

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userEmail');
                window.location.href = '/pages/login.html';
            }
        });
    }

    tableBody.addEventListener('click', e => {
        if (e.target.classList.contains('delete-btn')) {
            deleteCliente(e.target.dataset.cedula);
        }
    });
    mobileView.addEventListener('click', e => {
        const btn = e.target.closest('.delete-btn');
        if (btn) {
            deleteCliente(btn.dataset.cedula);
        }
    });

    if (viewToggle) {
        viewToggle.addEventListener('change', () => {
            localStorage.setItem('clientesView', viewToggle.value);
            updateView();
        });
    }

    loadClientes();
});