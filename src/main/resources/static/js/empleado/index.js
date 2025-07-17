const tableBody = document.getElementById('empleadosTable');
const emptyState = document.getElementById('emptyState');

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
            tableBody.parentElement.style.display = 'none';
            emptyState.classList.remove('hidden');
            return;
        }
        tableBody.parentElement.style.display = 'table';
        emptyState.classList.add('hidden');
        tableBody.innerHTML = data.map(emp => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 text-sm font-medium text-gray-900">${emp.nombre}</td>
        <td class="px-6 py-4 text-sm text-gray-900">${emp.apellido}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${emp.telefono || 'N/A'}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${emp.rol || 'N/A'}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${emp.salario != null ? emp.salario : 'N/A'}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${emp.fechaContratacion || 'N/A'}</td>
        <td class="px-6 py-4 text-sm text-center">
          <div class="flex justify-center space-x-2">
            <a href="form.html?cedula=${encodeURIComponent(emp.cedula)}"
               class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">
              ✏️ Editar
            </a>
            <button data-cedula="${emp.cedula}"
                    class="delete-btn text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50 transition-colors">
              🗑️ Eliminar
            </button>
          </div>
        </td>
      </tr>
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

    tableBody.addEventListener('click', e => {
        if (e.target.classList.contains('delete-btn')) {
            const ced = e.target.dataset.cedula;
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