import { UsuarioService } from '../services/usuarioService.js';
import { TableViewManager } from '../components/tableView.js';

class UsuariosManager {
    constructor() {
        this.usuarioService = new UsuarioService();
        this.allUsuarios = []; // Todos los usuarios (activos e inactivos)
        this.usuariosActivos = [];
        this.usuariosInactivos = [];
        this.filteredUsuarios = [];
        this.currentUsuario = null;
        this.currentPage = 0;
        this.usuariosPerPage = 15; // Cambiado para consistencia con clientes
        this.totalPages = 1;
        this.totalUsuarios = 0;
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        this.currentView = 'activos'; // 'activos' o 'inactivos'

        // Initialize table view manager
        this.tableViewManager = new TableViewManager('#usuariosListContainer', {
            columns: this.getResponsiveColumns(),
            actions: [
                {
                    icon: 'fas fa-eye',
                    handler: 'usuariosManager.verUsuario',
                    className: 'text-brand-brown hover:text-brand-light-brown',
                    title: 'Ver detalles'
                },
                {
                    icon: 'fas fa-edit',
                    handler: 'usuariosManager.editUsuario',
                    className: 'text-green-600 hover:text-green-700',
                    title: 'Editar'
                },
                {
                    icon: 'fas fa-user-slash',
                    handler: 'usuariosManager.toggleUsuarioStatus',
                    className: 'text-red-600 hover:text-red-700',
                    title: 'Desactivar/Activar usuario'
                }
            ],
            searchFields: ['username', 'roles'],
            idField: 'username',
            emptyIcon: 'fa-regular fa-user'
        });

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupResponsiveHandlers();
        await this.loadUsuarios();
    }

    setupEventListeners() {
        document.getElementById('nuevoUsuarioBtn')?.addEventListener('click', () => this.newUsuario());
        document.getElementById('usuarioSearchInput')?.addEventListener('input', () => this.filterUsuarios());
        document.getElementById('formUsuario')?.addEventListener('submit', (e) => this.handleSubmitUsuario(e));

        // Filter buttons for active/inactive users
        document.getElementById('btnUsuariosActivos')?.addEventListener('click', () => this.switchToActiveUsers());
        document.getElementById('btnUsuariosInactivos')?.addEventListener('click', () => this.switchToInactiveUsers());

        // Delegación de eventos para los botones de acción en la lista de usuarios
        document.getElementById('usuariosListContainer')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const username = btn.getAttribute('data-username');
            if (btn.classList.contains('ver-btn')) {
                this.verUsuario(username);
            } else if (btn.classList.contains('edit-btn')) {
                this.editUsuario(username);
            } else if (btn.classList.contains('delete-btn')) {
                this.toggleUsuarioStatus(username);
            }
        });
    }

    setupResponsiveHandlers() {
        // Mobile sidebar controls
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const closeSidebarBtn = document.getElementById('closeSidebarBtn');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebar = document.getElementById('sidebar');

        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => this.toggleMobileSidebar());
        }

        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => this.closeMobileSidebar());
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => this.closeMobileSidebar());
        }

        // Handle window resize
        window.addEventListener('resize', () => this.handleWindowResize());

        // Handle escape key for sidebar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !sidebar.classList.contains('-translate-x-full')) {
                this.closeMobileSidebar();
            }
        });
    }

    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');

        // Prevent body scroll when sidebar is open
        document.body.classList.toggle('overflow-hidden', !sidebar.classList.contains('-translate-x-full'));
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }

    handleWindowResize() {
        const wasTablet = this.isTablet;
        const wasMobile = this.isMobile;

        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        // Close mobile sidebar on desktop resize
        if (window.innerWidth >= 1024) {
            this.closeMobileSidebar();
        }

        // Update table columns based on screen orientation
        this.tableViewManager.updateColumns(this.getResponsiveColumns());

        // Re-render usuarios if breakpoint changed significantly
        if ((wasMobile !== this.isMobile) || (wasTablet !== this.isTablet)) {
            this.renderUsuarios();
        }
    }

    async loadUsuarios() {
        this.showLoading();
        try {
            const busqueda = document.getElementById('usuarioSearchInput')?.value || null;
            // Obtener todos los usuarios (activos e inactivos)
            const allUsuarios = await this.usuarioService.getUsuarios();

            // Separar usuarios activos e inactivos basado en el campo 'active'
            this.usuariosActivos = allUsuarios.filter(u => u.active !== false);
            this.usuariosInactivos = allUsuarios.filter(u => u.active === false);

            // Actualizar contadores
            this.updateCounters();

            // Actualizar estilos de los botones según la vista actual
            this.updateFilterButtons();

            // Determinar qué usuarios mostrar según la vista actual
            const currentUsuarios = this.currentView === 'activos' ? this.usuariosActivos : this.usuariosInactivos;

            // Aplicar filtro de búsqueda si existe
            let filtered = currentUsuarios;
            if (busqueda) {
                filtered = currentUsuarios.filter(u =>
                    (u.username && u.username.toLowerCase().includes(busqueda.toLowerCase())) ||
                    (Array.isArray(u.roles) && u.roles.join(', ').toLowerCase().includes(busqueda.toLowerCase())) ||
                    (u.active !== undefined && (u.active ? 'activo' : 'inactivo').includes(busqueda.toLowerCase()))
                );
            }

            // Configurar paginación
            this.totalUsuarios = filtered.length;
            this.totalPages = Math.ceil(this.totalUsuarios / this.usuariosPerPage) || 1;

            // Aplicar paginación
            const start = this.currentPage * this.usuariosPerPage;
            const end = start + this.usuariosPerPage;
            this.filteredUsuarios = filtered.slice(start, end);

            // Guardar referencia a todos los usuarios
            this.allUsuarios = allUsuarios;

            // Update table view with current data
            this.tableViewManager.setData(this.filteredUsuarios);

            this.renderUsuarios();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading users:', error);
            this.usuariosActivos = [];
            this.usuariosInactivos = [];
            this.filteredUsuarios = [];
            this.totalUsuarios = 0;
            this.totalPages = 1;
            this.updateCounters();
            this.updateFilterButtons(); // Also update buttons on error
            this.tableViewManager.setData([]);
            this.renderUsuarios();
            this.renderPagination();
        } finally {
            this.hideLoading();
        }
    }

    getResponsiveColumns() {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            return [
                { header: 'Usuario', field: 'username' },
                {
                    header: 'Rol',
                    field: 'roles',
                    formatter: (value) => Array.isArray(value) ? value.join(', ') : (value || 'N/A')
                }
            ];
        } else {
            return [
                { header: 'Usuario', field: 'username' },
                {
                    header: 'Roles',
                    field: 'roles',
                    formatter: (value) => Array.isArray(value) ? value.join(', ') : (value || 'N/A')
                },
                {
                    header: 'Empleado Relacionado',
                    field: 'empleado.nombre',
                    formatter: (value, item) => {
                        if (item.empleado) {
                            return `${item.empleado.nombre || ''} ${item.empleado.apellido || ''}`.trim() || 'N/A';
                        }
                        return 'N/A';
                    }
                }
            ];
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
                <div class="text-center py-8 md:py-12 col-span-full">
                    <div class="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fa-regular fa-user text-2xl md:text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-base md:text-lg font-medium text-gray-900 mb-2">Sin usuarios</h3>
                    <p class="text-gray-600 mb-4 md:mb-6 text-sm md:text-base px-4">${emptyMessage}</p>
                    ${!searchTerm ? `
                        <button onclick="usuariosManager.newUsuario()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown text-sm md:text-base">
                            <i class="fas fa-plus mr-2"></i>Agregar Primer Usuario
                        </button>
                    ` : `
                        <button onclick="document.getElementById('usuarioSearchInput').value = ''; usuariosManager.filterUsuarios();" class="text-brand-brown hover:text-brand-light-brown text-sm md:text-base">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    `}
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredUsuarios.map(usuario => this.renderUsuarioCard(usuario)).join('');
    }

    renderUsuarioCard(usuario) {
        // Adaptive button rendering based on screen size
        const buttonsHtml = this.isMobile ? this.renderMobileButtons(usuario) :
                           this.isTablet ? this.renderTabletButtons(usuario) :
                           this.renderDesktopButtons(usuario);

        const statusBadge = usuario.active !== undefined ?
            (usuario.active ?
                '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Activo</span>' :
                '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inactivo</span>'
            ) : '';

        return `
            <div class="usuario-card flex flex-col h-full w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-h-[200px] 
                sm:min-h-[220px] md:min-h-[240px] lg:min-h-[260px] xl:min-h-[280px] 
                ${this.isMobile ? 'max-w-full' : 'max-w-[380px] xl:max-w-[450px]'}
                ">
                <div class="flex-1 flex flex-col p-3 sm:p-4 md:p-5">
                    <div class="flex items-start justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-900 truncate max-w-[70%] flex items-center gap-2">
                            <i class="fa-regular fa-user text-brand-brown flex-shrink-0"></i>
                            ${usuario.username}
                        </h3>
                        ${statusBadge ? `<div class="flex-shrink-0">${statusBadge}</div>` : ''}
                    </div>
                    <div class="flex-1 flex flex-col gap-2 mt-1">
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-user-tag text-gray-400"></i>
                            </span>
                            <span class="truncate font-medium">${Array.isArray(usuario.roles) ? usuario.roles.join(', ') : (usuario.roles || 'N/A')}</span>
                        </div>
                        ${!this.isMobile && usuario.empleado ? `
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-briefcase text-gray-400"></i>
                            </span>
                            <span class="truncate text-xs">${usuario.empleado.nombre || ''} ${usuario.empleado.apellido || ''}</span>
                        </div>
                        ` : ''}
                        ${!this.isMobile && usuario.empleado && usuario.empleado.rol ? `
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-id-badge text-gray-400"></i>
                            </span>
                            <span class="truncate text-xs">${usuario.empleado.rol}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="mt-4 pt-3 border-t border-gray-100">
                        ${buttonsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    renderMobileButtons(usuario) {
        const isActive = usuario.active !== false;
        const actionText = isActive ? 'Desactivar' : 'Activar';
        const actionIcon = isActive ? 'fas fa-user-slash' : 'fas fa-user-check';

        return `
            <div class="space-y-2">
                <div class="grid grid-cols-2 gap-2">
                    <button 
                        data-username="${usuario.username}" 
                        class="ver-btn flex items-center justify-center gap-1.5 bg-brand-brown text-white px-3 py-2.5 rounded-lg hover:bg-brand-light-brown transition-colors text-sm font-medium"
                        title="Ver detalles"
                        type="button"
                    >
                        <i class="fas fa-eye text-xs"></i>
                        <span>Ver</span>
                    </button>
                    <button 
                        data-username="${usuario.username}" 
                        class="edit-btn flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        title="Editar usuario"
                        type="button"
                    >
                        <i class="fas fa-edit text-xs"></i>
                        <span>Editar</span>
                    </button>
                </div>
                <div class="grid grid-cols-1 gap-2">
                    <button 
                        data-username="${usuario.username}" 
                        class="delete-btn flex items-center justify-center gap-1.5 bg-red-600 text-white px-3 py-2.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        title="${actionText} usuario"
                        type="button"
                    >
                        <i class="${actionIcon} text-xs"></i>
                        <span>${actionText}</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderTabletButtons(usuario) {
        const isActive = usuario.active !== false;
        const actionText = isActive ? 'Desactivar' : 'Activar';
        const actionIcon = isActive ? 'fas fa-user-slash' : 'fas fa-user-check';

        return `
            <div class="flex flex-wrap gap-1.5 justify-center">
                <button 
                    data-username="${usuario.username}" 
                    class="ver-btn flex items-center gap-1 bg-brand-brown text-white px-2.5 py-1.5 rounded-md hover:bg-brand-light-brown transition-colors text-xs font-medium"
                    title="Ver detalles"
                    type="button"
                >
                    <i class="fas fa-eye"></i>
                    <span>Ver</span>
                </button>
                <button 
                    data-username="${usuario.username}" 
                    class="edit-btn flex items-center gap-1 bg-green-600 text-white px-2.5 py-1.5 rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                    title="Editar usuario"
                    type="button"
                >
                    <i class="fas fa-edit"></i>
                    <span>Edit</span>
                </button>
                <button 
                    data-username="${usuario.username}" 
                    class="delete-btn flex items-center gap-1 bg-red-600 text-white px-2.5 py-1.5 rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                    title="${actionText} usuario"
                    type="button"
                >
                    <i class="${actionIcon}"></i>
                    <span>${isActive ? 'Des.' : 'Act.'}</span>
                </button>
            </div>
        `;
    }

    renderDesktopButtons(usuario) {
        const isActive = usuario.active !== false;
        const actionText = isActive ? 'Desactivar' : 'Activar';
        const actionIcon = isActive ? 'fas fa-user-slash' : 'fas fa-user-check';

        return `
            <div class="flex flex-wrap gap-2">
                <button 
                    data-username="${usuario.username}" 
                    class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-sm font-medium"
                    title="Ver detalles"
                    type="button"
                >
                    <i class="fas fa-eye"></i>
                    <span>Detalles</span>
                </button>
                <button 
                    data-username="${usuario.username}" 
                    class="edit-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
                    title="Editar usuario"
                    type="button"
                >
                    <i class="fas fa-edit"></i>
                    <span>Editar</span>
                </button>
                <button 
                    data-username="${usuario.username}" 
                    class="delete-btn flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm font-medium"
                    title="${actionText} usuario"
                    type="button"
                >
                    <i class="${actionIcon}"></i>
                    <span>${actionText}</span>
                </button>
            </div>
        `;
    }

    renderPagination() {
        let pagContainer = document.getElementById('usuariosPagination');
        if (!pagContainer) {
            pagContainer = document.createElement('div');
            pagContainer.id = 'usuariosPagination';
            pagContainer.className = 'flex justify-center mt-6';
            document.getElementById('usuariosListContainer').after(pagContainer);
        }

        if (this.totalPages <= 1) {
            pagContainer.innerHTML = '';
            return;
        }

        let html = '<nav class="inline-flex rounded-md shadow-sm" aria-label="Pagination">';

        // Previous button
        html += `<button class="px-2 md:px-3 py-1 border border-gray-300 bg-white text-brand-brown rounded-l-lg hover:bg-brand-light-brown hover:text-white font-medium disabled:opacity-50 text-sm" ${this.currentPage === 0 ? 'disabled' : ''} data-page="prev">&laquo;</button>`;

        // Page numbers - responsive display
        if (this.isMobile) {
            // Mobile: only show current page
            html += `<span class="px-3 py-1 border-t border-b border-gray-300 bg-brand-brown text-white font-medium text-sm">${this.currentPage + 1} / ${this.totalPages}</span>`;
        } else if (this.isTablet) {
            // Tablet: show limited page numbers
            const maxPages = 3;
            let startPage = Math.max(0, this.currentPage - 1);
            let endPage = Math.min(this.totalPages - 1, startPage + maxPages - 1);

            if (endPage - startPage < maxPages - 1) {
                startPage = Math.max(0, endPage - maxPages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                html += `<button class="px-2 py-1 border-t border-b border-gray-300 bg-white text-brand-brown hover:bg-brand-light-brown hover:text-white font-medium text-sm ${i === this.currentPage ? 'bg-brand-brown text-white' : ''}" data-page="${i}">${i + 1}</button>`;
            }
        } else {
            // Desktop: show all page numbers (up to reasonable limit)
            const maxDisplayPages = Math.min(this.totalPages, 10);
            for (let i = 0; i < maxDisplayPages; i++) {
                html += `<button class="px-3 py-1 border-t border-b border-gray-300 bg-white text-brand-brown hover:bg-brand-light-brown hover:text-white font-medium text-sm ${i === this.currentPage ? 'bg-brand-brown text-white' : ''}" data-page="${i}">${i + 1}</button>`;
            }
        }

        // Next button
        html += `<button class="px-2 md:px-3 py-1 border border-gray-300 bg-white text-brand-brown rounded-r-lg hover:bg-brand-light-brown hover:text-white font-medium disabled:opacity-50 text-sm" ${this.currentPage === this.totalPages - 1 ? 'disabled' : ''} data-page="next">&raquo;</button>`;
        html += '</nav>';

        pagContainer.innerHTML = html;
        pagContainer.querySelectorAll('button[data-page]').forEach(btn => {
            btn.onclick = (e) => {
                const val = btn.getAttribute('data-page');
                if (val === 'prev' && this.currentPage > 0) {
                    this.currentPage--;
                    this.loadUsuarios();
                } else if (val === 'next' && this.currentPage < this.totalPages - 1) {
                    this.currentPage++;
                    this.loadUsuarios();
                } else if (!isNaN(val)) {
                    const page = parseInt(val);
                    if (page !== this.currentPage) {
                        this.currentPage = page;
                        this.loadUsuarios();
                    }
                }
            };
        });
    }

    filterUsuarios() {
        const searchTerm = document.getElementById('usuarioSearchInput')?.value || '';
        this.tableViewManager.filterData(searchTerm);
        this.currentPage = 0;
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
        const usuario = this.allUsuarios.find(u => u.username === username);
        if (!usuario) {
            window.showToast('Usuario no encontrado.', 'error');
            return;
        }
        // Mostrar datos del usuario y del empleado relacionado (si existe)
        let empleadoHtml = '';
        if (usuario.empleado) {
            const emp = usuario.empleado;
            empleadoHtml = `
                <div class="mt-6 border-t pt-4">
                    <h4 class="text-md font-semibold text-brand-brown mb-2 flex items-center gap-2"><i class="fas fa-briefcase"></i> Empleado Relacionado</h4>
                    <div class="space-y-1 text-sm">
                        <div><span class="font-medium">Cédula:</span> ${emp.cedula || ''}</div>
                        <div><span class="font-medium">Nombre:</span> ${emp.nombre || ''} ${emp.apellido || ''}</div>
                        <div><span class="font-medium">Rol:</span> ${emp.rol || ''}</div>
                        <div><span class="font-medium">Teléfono:</span> ${emp.telefono || ''}</div>
                        <div><span class="font-medium">Email:</span> ${emp.email || ''}</div>
                    </div>
                </div>
            `;
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
                    <label class="block text-sm font-medium text-gray-700">Estado</label>
                    <p class="mt-1 text-sm text-gray-900">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${usuario.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${usuario.active !== false ? 'Activo' : 'Inactivo'}
                        </span>
                    </p>
                </div>
                ${empleadoHtml}
                <!--<div class="flex justify-end mt-6">
                    <button onclick="usuariosManager.editUsuario('${usuario.username}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-edit mr-2"></i>
                        Editar
                    </button>
                </div>-->
            </div>
        `;
        this.currentUsuario = usuario;
        document.getElementById('modalVerUsuario').classList.remove('hidden');
    }

    async editUsuario(username) {
        const usuario = this.allUsuarios.find(u => u.username === username);
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

    async toggleUsuarioStatus(username) {
        const usuario = this.allUsuarios.find(u => u.username === username);
        if (!usuario) {
            window.showToast('Usuario no encontrado.', 'error');
            return;
        }
        try {
            // Toggle status
            const newStatus = usuario.active === false;
            await this.usuarioService.updateUsuario(username, { active: newStatus });

            // Update local data
            usuario.active = newStatus;

            window.showToast(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente.`, 'success');
            this.loadUsuarios();
        } catch (error) {
            window.showToast('Error al cambiar estado del usuario.', 'error');
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

    hideLoading() {
        // Content will replace the loading spinner, no need for explicit hiding
    }

    showError(message) {
        const container = document.getElementById('usuariosListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="usuariosManager.loadUsuarios()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                        <i class="fas fa-refresh mr-2"></i>Reintentar
                    </button>
                </div>
            `;
        }
    }

    switchToActiveUsers() {
        if (this.currentView === 'activos') return;

        this.currentView = 'activos';
        this.currentPage = 0;

        // Actualizar estilos de los botones con transición suave
        this.updateFilterButtons();

        // Cargar usuarios activos
        this.loadUsuarios();
    }

    switchToInactiveUsers() {
        if (this.currentView === 'inactivos') return;

        this.currentView = 'inactivos';
        this.currentPage = 0;

        // Actualizar estilos de los botones con transición suave
        this.updateFilterButtons();

        // Cargar usuarios inactivos
        this.loadUsuarios();
    }

    updateCounters() {
        // Actualizar contadores en los botones con animación
        const countActivos = document.getElementById('countActivos');
        const countInactivos = document.getElementById('countInactivos');

        if (countActivos) {
            // Trigger animation by removing and re-adding the class
            countActivos.classList.remove('count-badge');
            countActivos.textContent = this.usuariosActivos.length;
            // Force reflow
            countActivos.offsetHeight;
            countActivos.classList.add('count-badge');
        }

        if (countInactivos) {
            // Trigger animation by removing and re-adding the class
            countInactivos.classList.remove('count-badge');
            countInactivos.textContent = this.usuariosInactivos.length;
            // Force reflow
            countInactivos.offsetHeight;
            countInactivos.classList.add('count-badge');
        }
    }

    updateFilterButtons() {
        const btnActivos = document.getElementById('btnUsuariosActivos');
        const btnInactivos = document.getElementById('btnUsuariosInactivos');

        if (this.currentView === 'activos') {
            // Activos seleccionado: agregar clase active, quitar de inactivos
            btnActivos.classList.add('active');
            btnInactivos.classList.remove('active');

            // Contadores - activos tiene badge blanco, inactivos gris
            const countActivos = btnActivos.querySelector('#countActivos');
            const countInactivos = btnInactivos.querySelector('#countInactivos');
            if (countActivos) {
                countActivos.className = 'count-badge ml-1 bg-white text-brand-brown px-1.5 py-0.5 rounded text-xs font-bold';
            }
            if (countInactivos) {
                countInactivos.className = 'count-badge ml-1 bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded text-xs font-bold';
            }
        } else {
            // Inactivos seleccionado: agregar clase active, quitar de activos
            btnActivos.classList.remove('active');
            btnInactivos.classList.add('active');

            // Contadores - inactivos tiene badge blanco, activos gris
            const countActivos = btnActivos.querySelector('#countActivos');
            const countInactivos = btnInactivos.querySelector('#countInactivos');
            if (countActivos) {
                countActivos.className = 'count-badge ml-1 bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded text-xs font-bold';
            }
            if (countInactivos) {
                countInactivos.className = 'count-badge ml-1 bg-white text-red-600 px-1.5 py-0.5 rounded text-xs font-bold';
            }
        }
    }
}

const usuariosManager = new UsuariosManager();
window.usuariosManager = usuariosManager;

// Make table view manager available globally
window.tableViewManager = usuariosManager.tableViewManager;

// Funciones globales para los event handlers de los modales
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

function validateFormUsuario(data, isEdit = false) {
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
    } else if (!['ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD'].includes(data.roles[0])) {
        showError('rol', 'Rol inválido');
        valid = false;
    }

    return valid;
}
