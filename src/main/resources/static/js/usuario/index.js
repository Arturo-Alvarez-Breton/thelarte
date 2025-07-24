// /js/usuario/index.js

const tableBody = document.getElementById('usuariosTable');
const emptyState = document.getElementById('emptyState');
const tableWrapper = document.getElementById('usuariosTableWrapper');

// Verifica el JWT como en cliente
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

// Cargar usuarios
async function loadUsuarios() {
    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch('/api/usuarios', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (resp.status === 403) {
            tableWrapper.style.display = 'none';
            emptyState.classList.add('hidden');
            alert('No tienes permisos para ver los usuarios.');
            return;
        }
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const data = await resp.json();
        if (!Array.isArray(data) || data.length === 0) {
            tableWrapper.style.display = 'none';
            emptyState.classList.remove('hidden');
            return;
        }
        tableWrapper.style.display = 'block';
        emptyState.classList.add('hidden');
        // Render tabla (id, username, roles, activo)
        tableBody.innerHTML = data.map(u => `
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">${u.username}</td>
            <td class="px-6 py-4 text-sm text-gray-900">
                ${Array.isArray(u.roles) ? u.roles.join(', ') : (u.roles || '')}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
                ${u.active ? '<span class="text-green-600 font-semibold">Sí</span>' : '<span class="text-red-600">No</span>'}
            </td>
            <td class="px-6 py-4 text-sm text-center">
              <div class="flex justify-center space-x-2">
                <a href="form.html?usuario=${encodeURIComponent(u.username)}"
                   class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">
                  ✏️ Editar
                </a>
                <button data-username="${u.username}"
                        class="delete-btn text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50 transition-colors">
                  🗑️ Eliminar
                </button>
              </div>
            </td>
          </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading usuarios:', error);
        alert('Error al cargar los usuarios. Por favor, intenta de nuevo.');
    }
}

async function deleteUsuario(username) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el usuario "${username}"?`)) return;
    try {
        const token = localStorage.getItem('authToken');
        // Ajusta endpoint si tu backend usa otro identificador
        const resp = await fetch(`/api/usuarios/${encodeURIComponent(username)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (resp.status === 404) {
            alert('Usuario no encontrado.');
            loadUsuarios();
            return;
        }
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        alert('Usuario eliminado exitosamente.');
        loadUsuarios();
    } catch (error) {
        console.error('Error deleting usuario:', error);
        alert('Error al eliminar el usuario. Por favor, intenta de nuevo.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }
    verifyToken(token);

    // Eventos de borrar
    tableBody.addEventListener('click', e => {
        if (e.target.classList.contains('delete-btn')) {
            const username = e.target.dataset.username;
            deleteUsuario(username);
        }
    });

    loadUsuarios();
});