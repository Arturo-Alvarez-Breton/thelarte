import { UsuarioService } from '../services/usuarioService.js';

class UsuariosManager {
    constructor() {
        this.usuarioService = new UsuarioService();
        this.usuarios = [];
        this.filteredUsuarios = [];
        this.currentUsuario = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadUsuarios();
    }

    setupEventListeners() {
        document.getElementById('nuevoUsuarioBtn')?.addEventListener('click', () => this.newUsuario());
        document.getElementById('usuarioSearchInput')?.addEventListener('input', () => this.filterUsuarios());
        document.getElementById('formUsuario')?.addEventListener('submit', (e) => this.handleSubmitUsuario(e));
        document.getElementById('usuariosListContainer')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('ver-btn')) {
                const username = e.target.dataset.username;
                this.verUsuario(username);
            }
            if (e.target.classList.contains('edit-btn')) {
                const username = e.target.dataset.username;
                this.editUsuario(username);
            }
            if (e.target.classList.contains('delete-btn')) {
                const username = e.target.dataset.username;
                this.deleteUsuario(username);
            }
        });
    }

    async loadUsuarios() {
        this.showLoading();
        try {
            const allUsuarios = await this.usuarioService.getUsuarios();
            const searchValue = (document.getElementById('usuarioSearchInput')?.value || '').trim().toLowerCase();
            if (searchValue) {
                this.filteredUsuarios = allUsuarios.filter(u =>
                    (u.username && u.username.toLowerCase().includes(searchValue)) ||
                    (Array.isArray(u.roles) && u.roles.join(', ').toLowerCase().includes(searchValue)) ||
                    (u.active !== undefined && (u.active ? 'sí' : 'no').includes(searchValue))
                );
            } else {
                this.filteredUsuarios = allUsuarios;
            }
            this.usuarios = allUsuarios;
            this.renderUsuarios();
        } catch (error) {
            this.usuarios = [];
            this.filteredUsuarios = [];
            this.renderUsuarios();
        } finally {
            this.hideLoading();
        }
    }

    renderUsuarios() {
        const container = document.getElementById('usuariosListContainer');
        if (!container) return;
        if (this.filteredUsuarios.length === 0) {
            const searchTerm = document.getElementById('usuarioSearchInput')?.value;
            const emptyMessage = searchTerm ?
                `No se encontraron usuarios que coincidan con "${searchTerm}".` :
                'No hay usuarios registrados.';
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fa-regular fa-user text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Sin usuarios</h3>
                    <p class="text-gray-600 mb-6">${emptyMessage}</p>
                    ${!searchTerm ? `
                        <button onclick="usuariosManager.newUsuario()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                            <i class="fas fa-plus mr-2"></i>Agregar Primer Usuario
                        </button>
                    ` : `
                        <button onclick="document.getElementById('usuarioSearchInput').value = ''; usuariosManager.filterUsuarios();" class="text-brand-brown hover:text-brand-light-brown">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    `}
                </div>
            `;
            return;
        }
        container.innerHTML = this.filteredUsuarios.map(u => `
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold flex items-center gap-2"><i class='fa-regular fa-user text-brand-brown'></i> ${u.username}</h3>
                <p class="text-gray-600">Rol: ${Array.isArray(u.roles) ? u.roles.join(', ') : (u.roles || 'N/A')}</p>
                <p class="text-gray-600">Activo: ${u.active ? '<span class=\"text-green-600 font-semibold\">Sí</span>' : '<span class=\"text-red-600\">No</span>'}</p>
                <div class="mt-4 flex flex-wrap gap-2">
                    <button data-username="${u.username}" class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm" title="Ver detalles">
                        <i class="fas fa-eye"></i> Detalles
                    </button>
                    <button data-username="${u.username}" class="edit-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm" title="Editar usuario">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button data-username="${u.username}" class="delete-btn flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm" title="Eliminar usuario">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterUsuarios() {
        this.loadUsuarios();
    }

    newUsuario() {
        this.currentUsuario = null;
        this.clearForm();
        document.getElementById('modalUsuarioTitle').textContent = 'Nuevo Usuario';
        document.getElementById('btnUsuarioIcon').className = 'fas fa-plus mr-2';
        document.getElementById('btnUsuarioText').textContent = 'Crear Usuario';
        document.getElementById('usuario').disabled = false;
        document.getElementById('contrasena').required = true;
        document.getElementById('modalUsuario').classList.remove('hidden');
    }

    async verUsuario(username) {
        const usuario = this.usuarios.find(u => u.username === username);
        if (!usuario) {
            window.showToast('Usuario no encontrado.', 'error');
            return;
        }
        document.getElementById('detallesUsuario').innerHTML = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Usuario</label>
                    <p class="mt-1 text-sm text-gray-900">${usuario.username}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Rol</label>
                    <p class="mt-1 text-sm text-gray-900">${Array.isArray(usuario.roles) ? usuario.roles.join(', ') : (usuario.roles || 'N/A')}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Activo</label>
                    <p class="mt-1 text-sm text-gray-900">${usuario.active ? '<span class="text-green-600 font-semibold">Sí</span>' : '<span class="text-red-600">No</span>'}</p>
                </div>
                <div class="flex justify-end mt-6">
                    <button onclick="usuariosManager.editUsuario('${usuario.username}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-edit mr-2"></i>
                        Editar
                    </button>
                </div>
            </div>
        `;
        this.currentUsuario = usuario;
        document.getElementById('modalVerUsuario').classList.remove('hidden');
    }

    async editUsuario(username) {
        const usuario = this.usuarios.find(u => u.username === username);
        if (!usuario) {
            window.showToast('Usuario no encontrado.', 'error');
            return;
        }
        this.currentUsuario = usuario;
        this.fillForm(usuario);
        document.getElementById('modalUsuarioTitle').textContent = 'Editar Usuario';
        document.getElementById('btnUsuarioIcon').className = 'fas fa-save mr-2';
        document.getElementById('btnUsuarioText').textContent = 'Actualizar Usuario';
        document.getElementById('usuario').disabled = true;
        document.getElementById('contrasena').required = false;
        document.getElementById('modalUsuario').classList.remove('hidden');
    }

    async deleteUsuario(username) {
        if (!confirm(`¿Estás seguro de que deseas eliminar el usuario "${username}"?`)) return;
        try {
            await this.usuarioService.deleteUsuario(username);
            window.showToast('Usuario eliminado exitosamente.', 'success');
            await this.loadUsuarios();
        } catch (error) {
            window.showToast('Error al eliminar el usuario.', 'error');
        }
    }

    async handleSubmitUsuario(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const usuarioData = {
            username: formData.get('usuario'),
            password: formData.get('contrasena'),
            roles: [formData.get('rol')]
        };
        if (!validateFormUsuario(usuarioData, !!this.currentUsuario)) {
            return;
        }
        try {
            if (this.currentUsuario) {
                if (!usuarioData.password) delete usuarioData.password;
                await this.usuarioService.updateUsuario(this.currentUsuario.username, usuarioData);
                window.showToast('Usuario actualizado exitosamente.', 'success');
            } else {
                await this.usuarioService.createUsuario(usuarioData);
                window.showToast('Usuario creado exitosamente.', 'success');
            }
            this.cerrarModalUsuario();
            await this.loadUsuarios();
        } catch (error) {
            window.showToast('Error al guardar el usuario.', 'error');
        }
    }

    clearForm() {
        document.getElementById('formUsuario').reset();
        ['usuarioError', 'contrasenaError', 'rolError'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = '';
                el.classList.add('hidden');
            }
        });
    }

    fillForm(usuario) {
        document.getElementById('usuario').value = usuario.username || '';
        document.getElementById('contrasena').value = '';
        document.getElementById('rol').value = Array.isArray(usuario.roles) && usuario.roles.length ? usuario.roles[0] : '';
    }

    cerrarModalUsuario() {
        document.getElementById('modalUsuario').classList.add('hidden');
        this.clearForm();
        this.currentUsuario = null;
    }

    cerrarModalVerUsuario() {
        document.getElementById('modalVerUsuario').classList.add('hidden');
        this.currentUsuario = null;
    }

    editarUsuarioDesdeDetalle() {
        if (this.currentUsuario) {
            this.cerrarModalVerUsuario();
            this.editUsuario(this.currentUsuario.username);
        }
    }

    showLoading() {
        const container = document.getElementById('usuariosListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Consultando información de usuarios...</p>
                    <p class="text-gray-500 text-sm mt-2">Un momento, por favor</p>
                </div>
            `;
        }
    }

    hideLoading() {}
}
const usuariosManager = new UsuariosManager();
window.usuariosManager = usuariosManager;
window.cerrarModalUsuario = () => usuariosManager.cerrarModalUsuario();
window.cerrarModalVerUsuario = () => usuariosManager.cerrarModalVerUsuario();
window.editarUsuarioDesdeDetalle = () => usuariosManager.editarUsuarioDesdeDetalle();

function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}
function clearError(fieldId) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
    }
}
function validateFormUsuario(data, isEdit=false) {
    let valid = true;
    ['usuario', 'contrasena', 'rol'].forEach(field => clearError(field));
    if (!data.username) {
        showError('usuario', 'El nombre de usuario es obligatorio');
        valid = false;
    }
    if (!isEdit && (!data.password || data.password.length < 8)) {
        showError('contrasena', 'La contraseña es obligatoria y debe tener al menos 8 caracteres');
        valid = false;
    }
    if (isEdit && data.password && data.password.length < 8) {
        showError('contrasena', 'Si se proporciona, la contraseña debe tener al menos 8 caracteres');
        valid = false;
    }
    if (!data.roles || !data.roles[0]) {
        showError('rol', 'El rol es obligatorio');
        valid = false;
    }
    return valid;
}