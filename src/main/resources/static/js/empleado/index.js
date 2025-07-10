// /js/empleado/index.js
const tableBody = document.getElementById('empleadosTable');
const emptyState = document.getElementById('emptyState');
const mobileView = document.getElementById('mobileView');
const desktopView = document.getElementById('desktopView');

async function verifyToken(token) {
    try {
        const resp = await fetch('/api/dashboard/validate', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            window.location.href = '/pages/login.html';
            return false;
        }
        const data = await resp.json();
        return data.authorized;
    } catch (err) {
        console.error('Error validating token:', err);
        return false;
    }
}

async function loadEmpleados() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }
        await verifyToken(token);

        const resp = await fetch('/api/empleados', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const data = await resp.json();
        if (!Array.isArray(data) || data.length === 0) {
            desktopView.style.display = 'none';
            mobileView.style.display = 'none';
            emptyState.classList.remove('hidden');
            return;
        }
        desktopView.style.display = 'block';
        mobileView.style.display = 'block';
        emptyState.classList.add('hidden');
        
        // Render desktop table
        tableBody.innerHTML = data.map(emp => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-4 text-sm font-medium text-gray-900">${emp.cedula}</td>
        <td class="px-4 py-4 text-sm text-gray-900 font-medium">${emp.nombre}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${emp.apellido}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${emp.telefono || 'N/A'}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${emp.rol || 'N/A'}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${emp.salario != null ? '$' + emp.salario.toLocaleString() : 'N/A'}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${emp.fechaContratacion || 'N/A'}</td>
        <td class="px-4 py-4 text-sm text-center">
          <div class="flex justify-center space-x-2">
            <a href="form.html?cedula=${encodeURIComponent(emp.cedula)}"
               class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-50 transition-colors">
              Editar
            </a>
            <button data-cedula="${emp.cedula}"
                    class="delete-btn text-red-600 hover:text-red-800 px-2 py-1 rounded text-xs hover:bg-red-50 transition-colors">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    // Render mobile cards
    mobileView.innerHTML = data.map(emp => `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">${emp.nombre} ${emp.apellido}</h3>
            <p class="text-sm text-gray-600">Cédula: ${emp.cedula}</p>
          </div>
          <div class="flex space-x-2">
            <a href="form.html?cedula=${encodeURIComponent(emp.cedula)}"
               class="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </a>
            <button data-cedula="${emp.cedula}"
                    class="delete-btn text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-gray-500">Teléfono:</span>
            <span class="text-gray-900 ml-1">${emp.telefono || 'N/A'}</span>
          </div>
          <div>
            <span class="text-gray-500">Rol:</span>
            <span class="text-gray-900 ml-1">${emp.rol || 'N/A'}</span>
          </div>
          <div>
            <span class="text-gray-500">Salario:</span>
            <span class="text-gray-900 ml-1">${emp.salario != null ? '$' + emp.salario.toLocaleString() : 'N/A'}</span>
          </div>
          <div>
            <span class="text-gray-500">Fecha:</span>
            <span class="text-gray-900 ml-1">${emp.fechaContratacion || 'N/A'}</span>
          </div>
        </div>
      </div>
    `).join('');
    } catch (error) {
        console.error('Error loading empleados:', error);
        alert('Error al cargar los empleados. Por favor, intenta de nuevo.');
    }
}

async function deleteEmpleado(cedula) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el empleado con cédula ${cedula}?`)) return;
    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch(`/api/empleados/${encodeURIComponent(cedula)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (resp.status === 404) {
            alert('Empleado no encontrado.');
            loadEmpleados();
            return;
        }
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        alert('Empleado eliminado exitosamente.');
        loadEmpleados();
    } catch (error) {
        console.error('Error deleting empleado:', error);
        alert('Error al eliminar el empleado. Por favor, intenta de nuevo.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }
    const welcomeMessage = document.getElementById('welcomeMessage');
    const userEmail = localStorage.getItem('userEmail') || 'Usuario';
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

    // Event listeners for both desktop and mobile views
    tableBody.addEventListener('click', e => {
        if (e.target.classList.contains('delete-btn')) {
            const ced = e.target.dataset.cedula;
            deleteEmpleado(ced);
        }
    });
    
    mobileView.addEventListener('click', e => {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const btn = e.target.classList.contains('delete-btn') ? e.target : e.target.closest('.delete-btn');
            const ced = btn.dataset.cedula;
            deleteEmpleado(ced);
        }
    });

    loadEmpleados();

    const btnNuevo = document.getElementById('btnNuevoEmpleado');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', () => {
            window.location.href = 'form.html';
        });
    }
});
