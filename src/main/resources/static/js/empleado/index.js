// Elementos principales
const tableBody   = document.getElementById('empleadosTable');
const emptyState  = document.getElementById('emptyState');
const mobileView  = document.getElementById('mobileView');
const desktopView = document.getElementById('desktopView');
const viewToggle  = document.getElementById('viewToggle');

// Elementos de búsqueda y filtros
const searchInput = document.getElementById('searchInput');
const btnFilter   = document.getElementById('btnFilter');
const filterModal = document.getElementById('filterModal');
const closeModal  = document.getElementById('closeModal');
const filterRol   = document.getElementById('filterRol');
const filterFecha = document.getElementById('filterFecha');
const filterComision = document.getElementById('filterComision');
const btnApplyFilter = document.getElementById('btnApplyFilter');
const btnClearFilter = document.getElementById('btnClearFilter');

// Estado
let empleadosData = [];
let searchTerm = "";
let filterValues = {
    rol: "",
    fecha: "",
    soloComision: ""
};

// --- Renderizado principal ---
function renderEmpleados(data) {
    let filtered = data;

    // Filtro por término de búsqueda (nombre, apellido, cédula, email)
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(e =>
            (e.nombre && e.nombre.toLowerCase().includes(term)) ||
            (e.apellido && e.apellido.toLowerCase().includes(term)) ||
            (e.cedula && e.cedula.toLowerCase().includes(term)) ||
            (e.email && e.email.toLowerCase().includes(term))
        );
    }

    // Filtro por rol
    if (filterValues.rol) {
        filtered = filtered.filter(e => e.rol && e.rol.toLowerCase() === filterValues.rol.toLowerCase());
    }

    // Filtro por fecha de contratación (YYYY-MM)
    if (filterValues.fecha) {
        filtered = filtered.filter(e =>
            e.fechaContratacion && e.fechaContratacion.startsWith(filterValues.fecha)
        );
    }

    // Filtro por "solo con comisión"
    if (filterValues.soloComision === "true") {
        filtered = filtered.filter(e => e.comision !== null && typeof e.comision === "number" && e.comision > 0);
    }

    // Mostrar/ocultar vistas según modo y resultado
    const mode = localStorage.getItem('empleadosView') || (viewToggle ? viewToggle.value : 'table');
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

    // Render tabla escritorio
    tableBody.innerHTML = filtered.map(emp => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-4 text-sm font-medium text-gray-900">${emp.cedula}</td>
        <td class="px-4 py-4 text-sm text-gray-900 font-medium">${emp.nombre}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${emp.apellido}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${emp.telefono || 'N/A'}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${emp.rol || 'N/A'}</td>
        <td class="px-4 py-4 text-sm text-gray-600">$${emp.salario != null ? emp.salario.toLocaleString() : 'N/A'}</td>
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

    // Render tarjetas móviles
    mobileView.innerHTML = filtered.map(emp => `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">${emp.nombre} ${emp.apellido}</h3>
            <p class="text-sm text-gray-600">Cédula: ${emp.cedula}</p>
          </div>
          <div class="flex space-x-2">
            <a href="form.html?cedula=${encodeURIComponent(emp.cedula)}"
               class="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 
                         2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 
                         0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                </path>
              </svg>
            </a>
            <button data-cedula="${emp.cedula}"
                    class="delete-btn text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors">
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
            <span class="text-gray-900 ml-1">$${emp.salario != null ? emp.salario.toLocaleString() : 'N/A'}</span>
          </div>
          <div>
            <span class="text-gray-500">Fecha:</span>
            <span class="text-gray-900 ml-1">${emp.fechaContratacion || 'N/A'}</span>
          </div>
        </div>
      </div>
  `).join('');
}

// --- Utilidades y lógica de carga ---
function updateView() {
    const mode = localStorage.getItem('empleadosView') || viewToggle.value;
    if (viewToggle) viewToggle.value = mode;
    renderEmpleados(empleadosData);
}

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

        empleadosData = Array.isArray(data) ? data : [];
        renderEmpleados(empleadosData);
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

// --- Eventos de UI y Filtros ---
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Tabla de acciones
    tableBody.addEventListener('click', e => {
        if (e.target.classList.contains('delete-btn')) {
            deleteEmpleado(e.target.dataset.cedula);
        }
    });
    mobileView.addEventListener('click', e => {
        const btn = e.target.closest('.delete-btn');
        if (btn) {
            deleteEmpleado(btn.dataset.cedula);
        }
    });

    // Cambio de vista
    if (viewToggle) {
        viewToggle.addEventListener('change', () => {
            localStorage.setItem('empleadosView', viewToggle.value);
            updateView();
        });
    }

    // Motor de búsqueda (nombre, apellido, cédula, email)
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            searchTerm = e.target.value.trim();
            renderEmpleados(empleadosData);
        });
    }

    // Modal de filtros
    if (btnFilter) {
        btnFilter.addEventListener('click', () => {
            filterModal.classList.remove('hidden');
            filterModal.classList.add('flex');
        });
    }
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            filterModal.classList.remove('flex');
            filterModal.classList.add('hidden');
        });
    }
    if (btnApplyFilter) {
        btnApplyFilter.addEventListener('click', () => {
            filterValues.rol = filterRol ? filterRol.value : "";
            filterValues.fecha = filterFecha ? filterFecha.value : "";
            filterValues.soloComision = filterComision ? filterComision.value : "";
            filterModal.classList.remove('flex');
            filterModal.classList.add('hidden');
            renderEmpleados(empleadosData);
        });
    }
    if (btnClearFilter) {
        btnClearFilter.addEventListener('click', () => {
            if (filterRol) filterRol.value = "";
            if (filterFecha) filterFecha.value = "";
            if (filterComision) filterComision.value = "";
            filterValues = { rol: "", fecha: "", soloComision: "" };
            renderEmpleados(empleadosData);
        });
    }

    loadEmpleados();
});