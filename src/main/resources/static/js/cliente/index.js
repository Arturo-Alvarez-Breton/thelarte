// /js/cliente/index.js
const tableBody = document.getElementById('clientesTable');
const emptyState = document.getElementById('emptyState');

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
            tableBody.parentElement.style.display = 'none';
            emptyState.classList.remove('hidden');
            return;
        }
        tableBody.parentElement.style.display = 'block';
        emptyState.classList.add('hidden');
        tableBody.innerHTML = data.map(c => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 text-sm font-medium text-gray-900">${c.cedula}</td>
        <td class="px-6 py-4 text-sm text-gray-900">${c.nombre}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${c.apellido}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${c.telefono || 'N/A'}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${c.email || 'N/A'}</td>
        <td class="px-6 py-4 text-sm text-center">
          <div class="flex justify-center space-x-2">
            <a href="form.html?cedula=${encodeURIComponent(c.cedula)}"
               class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">
              ✏️ Editar
            </a>
            <button data-cedula="${c.cedula}"
                    class="delete-btn text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50 transition-colors">
              🗑️ Eliminar
            </button>
          </div>
        </td>
      </tr>
    `).join('');
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

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }
    verifyToken(token);

    // Opcional: bienvenida
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

    tableBody.addEventListener('click', e => {
        if (e.target.classList.contains('delete-btn')) {
            const ced = e.target.dataset.cedula;
            deleteCliente(ced);
        }
    });

    loadClientes();
});
