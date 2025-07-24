// Elementos principales
const tableBody   = document.getElementById('clientesTable');
const emptyState  = document.getElementById('emptyState');
const mobileView  = document.getElementById('mobileView');
const desktopView = document.getElementById('desktopView');
const viewToggle  = document.getElementById('viewToggle');

// Elementos de búsqueda y filtros
const searchInput      = document.getElementById('searchInput');
const btnFilter        = document.getElementById('btnFilter');
const filterModal      = document.getElementById('filterModal');
const closeModal       = document.getElementById('closeModal');
const filterFecha      = document.getElementById('filterFecha');
const filterProvincia  = document.getElementById('filterProvincia');
const provinciaAutocomplete = document.getElementById('provinciaAutocomplete');
const btnApplyFilter   = document.getElementById('btnApplyFilter');
const btnClearFilter   = document.getElementById('btnClearFilter');

// Estado
let clientesData = [];
let searchTerm = "";
let filterValues = {
    fecha: "",
    provincia: ""
};
let provinciasList = [];

// --- Provincias: cargar de API como en form ---
async function cargarProvincias() {
    try {
        const resp = await fetch('https://api.digital.gob.do/v1/territories/provinces');
        if (!resp.ok) throw new Error('Error al obtener provincias');
        const json = await resp.json();
        provinciasList = Array.isArray(json.data) ? json.data.map(p => p.name) : [];
    } catch (err) {
        provinciasList = [];
        console.error("Error cargando provincias para autocomplete:", err);
    }
}

// --- Autocompletado para provincia ---
function mostrarSugerenciasProvincia(valor) {
    if (!provinciaAutocomplete) return;
    provinciaAutocomplete.innerHTML = "";
    const val = valor.trim().toLowerCase();
    if (!val || provinciasList.length === 0) {
        provinciaAutocomplete.classList.add('hidden');
        return;
    }
    const sugerencias = provinciasList.filter(p => p.toLowerCase().includes(val));
    if (sugerencias.length === 0) {
        provinciaAutocomplete.classList.add('hidden');
        return;
    }
    provinciaAutocomplete.innerHTML = sugerencias.map(p =>
        `<li class="px-3 py-2 hover:bg-gray-100 cursor-pointer" data-provincia="${p}">${p}</li>`
    ).join('');
    provinciaAutocomplete.classList.remove('hidden');
}

// --- Valida si la provincia ingresada es válida ---
function provinciaValida(valor) {
    // Vacío (todas) es válido
    if (!valor) return true;
    return provinciasList.some(p => p.toLowerCase() === valor.trim().toLowerCase());
}

// --- Renderizado principal ---
function renderClientes(data) {
    let filtered = data;

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(c =>
            (c.nombre && c.nombre.toLowerCase().includes(term)) ||
            (c.apellido && c.apellido.toLowerCase().includes(term)) ||
            (c.cedula && c.cedula.toLowerCase().includes(term)) ||
            (c.email && c.email.toLowerCase().includes(term)) ||
            (c.direccion && c.direccion.toLowerCase().includes(term))
        );
    }

    if (filterValues.fecha) {
        filtered = filtered.filter(c =>
            c.fechaRegistro && c.fechaRegistro.startsWith(filterValues.fecha)
        );
    }

    // Filtrar por provincia
    if (filterValues.provincia) {
        filtered = filtered.filter(c => {
            if (!c.direccion) return false;
            const dir = c.direccion;
            let provincia = '';
            if (dir.includes(':')) {
                provincia = dir.split(':')[0].trim();
            }
            return provincia.toLowerCase() === filterValues.provincia.toLowerCase();
        });
    }

    const mode = localStorage.getItem('clientesView') || (viewToggle ? viewToggle.value : 'table');
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

    tableBody.innerHTML = filtered.map(c => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-4 text-sm font-medium text-gray-900">${c.cedula}</td>
        <td class="px-4 py-4 text-sm text-gray-900 font-medium">${c.nombre}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${c.apellido}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${c.telefono || 'N/A'}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${c.email || 'N/A'}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${c.direccion || 'N/A'}</td>
        <td class="px-4 py-4 text-sm text-gray-600">${c.fechaRegistro || 'N/A'}</td>
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

    mobileView.innerHTML = filtered.map(c => `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">${c.nombre} ${c.apellido}</h3>
            <p class="text-sm text-gray-600">Cédula: ${c.cedula}</p>
          </div>
          <div class="flex space-x-2">
            <a href="form.html?cedula=${encodeURIComponent(c.cedula)}"
               class="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors">
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
            <span class="text-gray-900 ml-1">${c.telefono || 'N/A'}</span>
          </div>
          <div>
            <span class="text-gray-500">Email:</span>
            <span class="text-gray-900 ml-1">${c.email || 'N/A'}</span>
          </div>
          <div>
            <span class="text-gray-500">Dirección:</span>
            <span class="text-gray-900 ml-1">${c.direccion || 'N/A'}</span>
          </div>
          <div>
            <span class="text-gray-500">Registro:</span>
            <span class="text-gray-900 ml-1">${c.fechaRegistro || 'N/A'}</span>
          </div>
        </div>
      </div>
  `).join('');
}

function updateView() {
    const mode = localStorage.getItem('clientesView') || (viewToggle ? viewToggle.value : 'table');
    if (viewToggle) viewToggle.value = mode;
    renderClientes(clientesData);
}

async function loadClientes() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }
        const resp = await fetch('/api/clientes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const data = await resp.json();
        clientesData = Array.isArray(data) ? data : [];
        renderClientes(clientesData);

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

    cargarProvincias();

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

    if (searchInput) {
        searchInput.addEventListener('input', e => {
            searchTerm = e.target.value.trim();
            renderClientes(clientesData);
        });
    }

    // --- Autocompletado para provincia ---
    if (filterProvincia) {
        filterProvincia.addEventListener('input', (e) => {
            mostrarSugerenciasProvincia(e.target.value);
            filterValues.provincia = e.target.value.trim();
            // Desactivar botón si no es válido
            if (!provinciaValida(filterProvincia.value)) {
                btnApplyFilter.disabled = true;
                filterProvincia.classList.add("border-red-400", "ring-2", "ring-red-200");
            } else {
                btnApplyFilter.disabled = false;
                filterProvincia.classList.remove("border-red-400", "ring-2", "ring-red-200");
            }
        });
        filterProvincia.addEventListener('focus', (e) => {
            mostrarSugerenciasProvincia(e.target.value);
        });
        filterProvincia.addEventListener('blur', () => {
            setTimeout(() => provinciaAutocomplete.classList.add('hidden'), 200);
        });
    }
    if (provinciaAutocomplete) {
        provinciaAutocomplete.addEventListener('mousedown', (e) => {
            if (e.target && e.target.dataset && e.target.dataset.provincia) {
                filterProvincia.value = e.target.dataset.provincia;
                filterValues.provincia = e.target.dataset.provincia;
                provinciaAutocomplete.classList.add('hidden');
                btnApplyFilter.disabled = false;
                filterProvincia.classList.remove("border-red-400", "ring-2", "ring-red-200");
            }
        });
    }

    if (btnFilter) {
        btnFilter.addEventListener('click', () => {
            filterModal.classList.remove('hidden');
            filterModal.classList.add('flex');
            // Validar inmediatamente al abrir por si hay valor no válido
            if (!provinciaValida(filterProvincia.value)) {
                btnApplyFilter.disabled = true;
                filterProvincia.classList.add("border-red-400", "ring-2", "ring-red-200");
            } else {
                btnApplyFilter.disabled = false;
                filterProvincia.classList.remove("border-red-400", "ring-2", "ring-red-200");
            }
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
            // No aplicar si la provincia no es válida
            if (!provinciaValida(filterProvincia.value)) return;
            filterValues.fecha = filterFecha ? filterFecha.value : "";
            filterValues.provincia = filterProvincia ? filterProvincia.value.trim() : "";
            filterModal.classList.remove('flex');
            filterModal.classList.add('hidden');
            renderClientes(clientesData);
        });
    }
    if (btnClearFilter) {
        btnClearFilter.addEventListener('click', () => {
            if (filterFecha) filterFecha.value = "";
            if (filterProvincia) filterProvincia.value = "";
            filterValues = { fecha: "", provincia: "" };
            btnApplyFilter.disabled = false;
            filterProvincia.classList.remove("border-red-400", "ring-2", "ring-red-200");
            renderClientes(clientesData);
        });
    }

    loadClientes();
});