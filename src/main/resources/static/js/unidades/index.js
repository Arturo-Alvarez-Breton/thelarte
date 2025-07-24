const unidadList = document.getElementById('unidadList');
const emptyState = document.getElementById('emptyState');
const addUnidadBtn = document.getElementById('addUnidadBtn');
const params = new URLSearchParams(window.location.search);
const productoId = params.get('productoId');
const tituloUnidades = document.getElementById('tituloUnidades');
const estadoFilter = document.getElementById('estadoFilter');

// Mapeo de valores del select a Enum de backend
const estadoMap = {
    vendido: "VENDIDO",
    disponible: "DISPONIBLE",
    danado: "DAÑADO",
    devueltoCompra: "DEVUELTO_COMPRA",
    devueltoVenta: "DEVUELTO_VENTA"
};

estadoFilter.addEventListener('change', function() {
    if (!this.value) {
        loadUnidades();
    } else {
        let estadoBackend = estadoMap[this.value] || this.value;
        loadUnidadesPorEstado(estadoBackend);
    }
});

async function loadUnidadesPorEstado(estadoUnidad) {
    const token = localStorage.getItem('authToken');
    try {
        const resp = await fetch(`/api/unidades/producto/${productoId}/estado/${estadoUnidad}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const unidades = await resp.json();

        if (unidades.length === 0) {
            unidadList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');
        renderUnidadesTable(unidades);
    } catch (error) {
        alert('Error al cargar las unidades.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }
    if (!productoId) {
        alert('Falta el id del producto');
        window.location.href = '/pages/producto/index.html';
        return;
    }
    addUnidadBtn.classList.remove('hidden');
    addUnidadBtn.href = `form.html?productoId=${productoId}`;
    if (!estadoFilter.value) {
        loadUnidades();
    } else {
        let estadoBackend = estadoMap[estadoFilter.value] || estadoFilter.value;
        loadUnidadesPorEstado(estadoBackend);
    }
});

async function loadUnidades() {
    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch(`/api/unidades/producto/${productoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        let unidades = await resp.json();

        if (unidades.length === 0) {
            unidadList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');
        renderUnidadesTable(unidades);
    } catch (error) {
        console.error('Error loading unidades:', error);
        alert('Error al cargar las unidades. Por favor, intenta de nuevo.');
    }
}

function renderUnidadesTable(unidades) {
    let table = `
      <table class="w-full bg-white rounded-xl shadow border border-gray-200">
        <thead>
          <tr class="bg-[#e8f7f2] text-[#59391B] font-bold">
            <th class="px-4 py-2">ID</th>
            <th class="px-4 py-2">Fecha Ingreso</th>
            <th class="px-4 py-2">Estado</th>
            <th class="px-4 py-2">Stock</th>
            <th class="px-4 py-2">Acción</th>
          </tr>
        </thead>
        <tbody>
    `;
    table += unidades.map(u => `
        <tr>
          <td class="px-4 py-2 text-center">${u.idUnidad}</td>
          <td class="px-4 py-2 text-center">${u.fechaIngreso ? new Date(u.fechaIngreso).toLocaleDateString() : '-'}</td>
          <td class="px-4 py-2 text-center">${u.estado || '-'}</td>
          <td class="px-4 py-2 text-center">${u.stock ? 'En tienda' : 'Almacén'}</td>
          <td class="px-4 py-2 text-center">
            <a href="form.html?productoId=${productoId}&idUnidad=${u.idUnidad}" class="px-2 text-blue-600 hover:underline">Editar</a>
            <button type="button" class="px-2 text-red-600 hover:underline" data-id="${u.idUnidad}">Eliminar</button>
          </td>
        </tr>
    `).join('');
    table += '</tbody></table>';
    unidadList.innerHTML = table;

    unidadList.querySelectorAll('button[data-id]').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteUnidad(this.getAttribute('data-id'));
        });
    });
}

async function deleteUnidad(idUnidad) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta unidad?')) return;
    const token = localStorage.getItem('authToken');
    try {
        const resp = await fetch(`/api/unidades/${idUnidad}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) throw new Error('No se pudo eliminar la unidad');
        alert('Unidad eliminada correctamente');
        // Recarga según el estado actual del filtro
        if (!estadoFilter.value) {
            loadUnidades();
        } else {
            let estadoBackend = estadoMap[estadoFilter.value] || estadoFilter.value;
            loadUnidadesPorEstado(estadoBackend);
        }
    } catch (error) {
        console.error('Error deleting unidad:', error);
        alert('Error al eliminar la unidad. Por favor, intenta de nuevo.');
    }
}