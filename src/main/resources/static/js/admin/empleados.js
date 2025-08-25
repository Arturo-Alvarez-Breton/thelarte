import { EmpleadoService } from '../services/empleadoService.js';
import { TableViewManager } from '../components/tableView.js';

class EmpleadosManager {
    constructor() {
        this.empleadoService = new EmpleadoService();
        this.allEmpleados = []; // Todos los empleados (activos y eliminados)
        this.empleadosActivos = [];
        this.empleadosEliminados = [];
        this.filteredEmpleados = [];
        this.currentPage = 0;
        this.empleadosPerPage = 15;
        this.totalPages = 1;
        this.totalEmpleados = 0;
        this.currentEmpleado = null;
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        this.currentView = 'activos'; // 'activos' o 'eliminados'

        // Initialize table view manager with responsive columns
        this.tableViewManager = new TableViewManager('#empleadosListContainer', {
            columns: this.getResponsiveColumns(),
            actions: [
                {
                    icon: 'fas fa-eye',
                    handler: 'empleadosManager.verEmpleado',
                    className: 'text-brand-brown hover:text-brand-light-brown',
                    title: 'Ver detalles'
                },
                {
                    icon: 'fas fa-edit',
                    handler: 'empleadosManager.editEmpleado',
                    className: 'text-green-600 hover:text-green-700',
                    title: 'Editar'
                },
                {
                    icon: 'fas fa-trash-alt',
                    handler: 'empleadosManager.deleteEmpleado',
                    className: 'text-red-600 hover:text-red-700',
                    title: 'Eliminar'
                }
            ],
            searchFields: ['cedula', 'nombre', 'apellido', 'telefono', 'rol', 'email'],
            idField: 'cedula',
            emptyIcon: 'fas fa-briefcase'
        });

        this.init();
    }

    getResponsiveColumns() {
        const isVerticalScreen = window.innerHeight > window.innerWidth;

        if (isVerticalScreen || this.isMobile) {
            // Vertical screen or mobile: only show combined name and role
            return [
                {
                    header: 'Empleado',
                    field: 'nombre',
                    formatter: (value, item) => `${item.nombre} ${item.apellido} - ${item.rol || 'N/A'}`
                }
            ];
        } else {
            // Horizontal screen: show all info
            return [
                { header: 'Cédula', field: 'cedula' },
                { header: 'Nombre', field: 'nombre' },
                { header: 'Apellido', field: 'apellido' },
                { header: 'Teléfono', field: 'telefono' },
                { header: 'Rol', field: 'rol' },
                {
                    header: 'Salario',
                    field: 'salario',
                    formatter: (value) => value != null ? `$${Number(value).toLocaleString('es-DO')}` : 'N/A'
                },
                {
                    header: 'Comisión',
                    field: 'comision',
                    formatter: (value) => value != null ? `${value}%` : 'N/A'
                }
            ];
        }
    }

    async init() {
        this.setupEventListeners();
        this.setupResponsiveHandlers();
        await this.loadEmpleados();
    }

    setupEventListeners() {
        document.getElementById('nuevoEmpleadoBtn')?.addEventListener('click', () => this.newEmpleado());
        document.getElementById('empleadoSearchInput')?.addEventListener('input', () => this.filterEmpleados());
        document.getElementById('formEmpleado')?.addEventListener('submit', (e) => this.handleSubmitEmpleado(e));

        // Filter buttons for active/deleted employees
        document.getElementById('btnEmpleadosActivos')?.addEventListener('click', () => this.switchToActiveEmpleados());
        document.getElementById('btnEmpleadosEliminados')?.addEventListener('click', () => this.switchToDeletedEmpleados());

        // Event delegation for action buttons
        document.getElementById('empleadosListContainer')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const cedula = btn.getAttribute('data-cedula');
            if (btn.classList.contains('ver-btn')) {
                this.verEmpleado(cedula);
            } else if (btn.classList.contains('edit-btn')) {
                this.editEmpleado(cedula);
            } else if (btn.classList.contains('delete-btn')) {
                this.deleteEmpleado(cedula);
            } else if (btn.classList.contains('reactivate-btn')) {
                this.reactivarEmpleado(cedula);
            }
        });

        // Arreglo: Añade el event listener al botón del modal de detalles aquí (mejor que usar onclick)
        document.getElementById('btnEditarDesdeDetalle')?.addEventListener('click', () => this.editarEmpleadoDesdeDetalle());
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
            if (e.key === 'Escape' && sidebar && !sidebar.classList.contains('-translate-x-full')) {
                this.closeMobileSidebar();
            }
        });
    }

    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (sidebar && overlay) {
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');

            // Prevent body scroll when sidebar is open
            document.body.classList.toggle('overflow-hidden', !sidebar.classList.contains('-translate-x-full'));
        }
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (sidebar && overlay) {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
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

        // Re-render empleados if breakpoint changed significantly
        if ((wasMobile !== this.isMobile) || (wasTablet !== this.isTablet)) {
            this.renderEmpleados();
        }
    }

    async loadEmpleados() {
        this.showLoading();
        try {
            const busqueda = document.getElementById('empleadoSearchInput')?.value || null;
            // Obtener todos los empleados (activos y eliminados)
            const allEmpleados = await this.empleadoService.getTodosLosEmpleados(busqueda);

            // Separar empleados activos y eliminados basado en el campo 'deleted'
            this.empleadosActivos = allEmpleados.filter(e => !e.deleted);
            this.empleadosEliminados = allEmpleados.filter(e => e.deleted);

            // Actualizar contadores
            this.updateCounters();

            // Actualizar estilos de los botones según la vista actual
            this.updateFilterButtons();

            // Determinar qué empleados mostrar según la vista actual
            const currentEmpleados = this.currentView === 'activos' ? this.empleadosActivos : this.empleadosEliminados;

            // Configurar paginación
            this.totalEmpleados = currentEmpleados.length;
            this.totalPages = Math.ceil(this.totalEmpleados / this.empleadosPerPage);

            // Aplicar paginación
            const start = this.currentPage * this.empleadosPerPage;
            const end = start + this.empleadosPerPage;
            this.filteredEmpleados = currentEmpleados.slice(start, end);

            // Update table view with current data
            this.tableViewManager.setData(this.filteredEmpleados);

            this.renderEmpleados();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading empleados:', error);
            this.empleadosActivos = [];
            this.empleadosEliminados = [];
            this.filteredEmpleados = [];
            this.totalEmpleados = 0;
            this.totalPages = 1;
            this.updateCounters();
            this.updateFilterButtons();
            this.tableViewManager.setData([]);
            this.renderEmpleados();
            this.renderPagination();
        } finally {
            this.hideLoading();
        }
    }

    updateCounters() {
        // Actualizar contadores en los botones con animación
        const countActivos = document.getElementById('countActivosEmpleados');
        const countEliminados = document.getElementById('countEliminadosEmpleados');

        if (countActivos) {
            // Trigger animation by removing and re-adding the class
            countActivos.classList.remove('count-badge');
            countActivos.textContent = this.empleadosActivos.length;
            // Force reflow
            countActivos.offsetHeight;
            countActivos.classList.add('count-badge');
        }

        if (countEliminados) {
            // Trigger animation by removing and re-adding the class
            countEliminados.classList.remove('count-badge');
            countEliminados.textContent = this.empleadosEliminados.length;
            // Force reflow
            countEliminados.offsetHeight;
            countEliminados.classList.add('count-badge');
        }
    }

    switchToActiveEmpleados() {
        if (this.currentView === 'activos') return;

        this.currentView = 'activos';
        this.currentPage = 0;

        // Actualizar estilos de los botones con transición suave
        this.updateFilterButtons();

        // Cargar empleados activos
        this.loadEmpleados();
    }

    switchToDeletedEmpleados() {
        if (this.currentView === 'eliminados') return;

        this.currentView = 'eliminados';
        this.currentPage = 0;

        // Actualizar estilos de los botones con transición suave
        this.updateFilterButtons();

        // Cargar empleados eliminados
        this.loadEmpleados();
    }

    updateFilterButtons() {
        const btnActivos = document.getElementById('btnEmpleadosActivos');
        const btnEliminados = document.getElementById('btnEmpleadosEliminados');

        if (this.currentView === 'activos') {
            // Activos seleccionado: agregar clase active, quitar de eliminados
            btnActivos?.classList.add('active');
            btnEliminados?.classList.remove('active');

            // Contadores - activos tiene badge blanco, eliminados gris
            const countActivos = btnActivos?.querySelector('#countActivosEmpleados');
            const countEliminados = btnEliminados?.querySelector('#countEliminadosEmpleados');
            if (countActivos) {
                countActivos.className = 'count-badge ml-1 bg-white text-brand-brown px-1.5 py-0.5 rounded text-xs font-bold';
            }
            if (countEliminados) {
                countEliminados.className = 'count-badge ml-1 bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded text-xs font-bold';
            }
        } else {
            // Eliminados seleccionado: agregar clase active, quitar de activos
            btnActivos?.classList.remove('active');
            btnEliminados?.classList.add('active');

            // Contadores - eliminados tiene badge blanco, activos gris
            const countActivos = btnActivos?.querySelector('#countActivosEmpleados');
            const countEliminados = btnEliminados?.querySelector('#countEliminadosEmpleados');
            if (countActivos) {
                countActivos.className = 'count-badge ml-1 bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded text-xs font-bold';
            }
            if (countEliminados) {
                countEliminados.className = 'count-badge ml-1 bg-white text-red-600 px-1.5 py-0.5 rounded text-xs font-bold';
            }
        }
    }

    renderEmpleados() {
        const container = document.getElementById('empleadosListContainer');
        if (!container) return;

        if (this.filteredEmpleados.length === 0) {
            const searchTerm = document.getElementById('empleadoSearchInput')?.value;
            const emptyMessage = searchTerm ?
                `No se encontraron empleados que coincidan con "${searchTerm}".` :
                'No hay empleados registrados.';

            container.innerHTML = `
                <div class="text-center py-8 md:py-12 col-span-full">
                    <div class="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-briefcase text-2xl md:text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-base md:text-lg font-medium text-gray-900 mb-2">Sin empleados</h3>
                    <p class="text-gray-600 mb-4 md:mb-6 text-sm md:text-base px-4">${emptyMessage}</p>
                    ${!searchTerm ? `
                        <button onclick="empleadosManager.newEmpleado()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown text-sm md:text-base">
                            <i class="fas fa-plus mr-2"></i>Agregar Primer Empleado
                        </button>
                    ` : `
                        <button onclick="document.getElementById('empleadoSearchInput').value = ''; empleadosManager.filterEmpleados();" class="text-brand-brown hover:text-brand-light-brown text-sm md:text-base">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    `}
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredEmpleados.map(emp => this.renderEmpleadoCard(emp)).join('');
    }

    renderEmpleadoCard(empleado) {
        // Adaptive button rendering based on screen size
        const buttonsHtml = this.isMobile ? this.renderMobileButtons(empleado) :
                           this.isTablet ? this.renderTabletButtons(empleado) :
                           this.renderDesktopButtons(empleado);

        return `
            <div class="empleado-card flex flex-col h-full w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-h-[220px] 
                sm:min-h-[240px] md:min-h-[260px] lg:min-h-[280px] xl:min-h-[300px] 
                ${this.isMobile ? 'max-w-full' : 'max-w-[420px] xl:max-w-[480px]'}
                ">
                <div class="flex-1 flex flex-col p-3 sm:p-4 md:p-5">
                    <div class="flex items-start justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-900 truncate max-w-[70%]">
                            ${empleado.nombre} ${empleado.apellido}
                        </h3>
                        <div class="px-2 py-1 bg-brand-accent text-brand-brown rounded-full text-xs font-medium">
                            ${empleado.rol || 'N/A'}
                        </div>
                    </div>
                    <div class="flex-1 flex flex-col gap-2 mt-1">
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-id-card text-gray-400"></i>
                            </span>
                            <span class="truncate font-mono text-xs">${empleado.cedula}</span>
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-phone text-gray-400"></i>
                            </span>
                            <span class="truncate">${empleado.telefono || 'No disponible'}</span>
                        </div>
                        ${!this.isMobile ? `
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-envelope text-gray-400"></i>
                            </span>
                            <span class="truncate text-xs">${empleado.email || 'No disponible'}</span>
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-dollar-sign text-gray-400"></i>
                            </span>
                            <span class="text-xs">${empleado.salario != null ? '$' + empleado.salario.toLocaleString() : 'N/A'}</span>
                        </div>
                        ${empleado.comision != null ? `
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-percentage text-gray-400"></i>
                            </span>
                            <span class="text-xs">${empleado.comision}% comisión</span>
                        </div>
                        ` : ''}
                        ` : ''}
                    </div>
                    <div class="mt-4 pt-3 border-t border-gray-100">
                        ${buttonsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    renderMobileButtons(empleado) {
        if (empleado.deleted) {
            return `
                <div class="space-y-2">
                    <div class="grid grid-cols-2 gap-2">
                        <button 
                            data-cedula="${empleado.cedula}" 
                            class="ver-btn flex items-center justify-center gap-1.5 bg-brand-brown text-white px-3 py-2.5 rounded-lg hover:bg-brand-light-brown transition-colors text-sm font-medium"
                            title="Ver detalles"
                            type="button"
                        >
                            <i class="fas fa-eye text-xs"></i>
                            <span>Ver</span>
                        </button>
                        <button 
                            data-cedula="${empleado.cedula}" 
                            class="reactivate-btn flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            title="Restaurar empleado"
                            type="button"
                        >
                            <i class="fas fa-undo text-xs"></i>
                            <span>Restaurar</span>
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="space-y-2">
                <div class="grid grid-cols-2 gap-2">
                    <button 
                        data-cedula="${empleado.cedula}" 
                        class="ver-btn flex items-center justify-center gap-1.5 bg-brand-brown text-white px-3 py-2.5 rounded-lg hover:bg-brand-light-brown transition-colors text-sm font-medium"
                        title="Ver detalles"
                        type="button"
                    >
                        <i class="fas fa-eye text-xs"></i>
                        <span>Ver</span>
                    </button>
                    <button 
                        data-cedula="${empleado.cedula}" 
                        class="edit-btn flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        title="Editar empleado"
                        type="button"
                    >
                        <i class="fas fa-edit text-xs"></i>
                        <span>Editar</span>
                    </button>
                </div>
                <div class="grid grid-cols-1 gap-2">
                    <button 
                        data-cedula="${empleado.cedula}" 
                        class="delete-btn flex items-center justify-center gap-1.5 bg-red-600 text-white px-3 py-2.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        title="Eliminar empleado"
                        type="button"
                    >
                        <i class="fas fa-trash-alt text-xs"></i>
                        <span>Eliminar</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderTabletButtons(empleado) {
        if (empleado.deleted) {
            return `
                <div class="flex flex-wrap gap-1.5 justify-center">
                    <button 
                        data-cedula="${empleado.cedula}" 
                        class="ver-btn flex items-center gap-1 bg-brand-brown text-white px-2.5 py-1.5 rounded-md hover:bg-brand-light-brown transition-colors text-xs font-medium"
                        title="Ver detalles"
                        type="button"
                    >
                        <i class="fas fa-eye"></i>
                        <span>Ver</span>
                    </button>
                    <button 
                        data-cedula="${empleado.cedula}" 
                        class="reactivate-btn flex items-center gap-1 bg-green-600 text-white px-2.5 py-1.5 rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                        title="Restaurar empleado"
                        type="button"
                    >
                        <i class="fas fa-undo"></i>
                        <span>Restaurar</span>
                    </button>
                </div>
            `;
        }

        return `
            <div class="flex flex-wrap gap-1.5 justify-center">
                <button 
                    data-cedula="${empleado.cedula}" 
                    class="ver-btn flex items-center gap-1 bg-brand-brown text-white px-2.5 py-1.5 rounded-md hover:bg-brand-light-brown transition-colors text-xs font-medium"
                    title="Ver detalles"
                    type="button"
                >
                    <i class="fas fa-eye"></i>
                    <span>Ver</span>
                </button>
                <button 
                    data-cedula="${empleado.cedula}" 
                    class="edit-btn flex items-center gap-1 bg-green-600 text-white px-2.5 py-1.5 rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                    title="Editar empleado"
                    type="button"
                >
                    <i class="fas fa-edit"></i>
                    <span>Edit</span>
                </button>
                <button 
                    data-cedula="${empleado.cedula}" 
                    class="delete-btn flex items-center gap-1 bg-red-600 text-white px-2.5 py-1.5 rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                    title="Eliminar empleado"
                    type="button"
                >
                    <i class="fas fa-trash-alt"></i>
                    <span>Del</span>
                </button>
            </div>
        `;
    }

    renderDesktopButtons(empleado) {
        if (empleado.deleted) {
            return `
                <div class="flex flex-wrap gap-2">
                    <button 
                        data-cedula="${empleado.cedula}" 
                        class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-sm font-medium"
                        title="Ver detalles"
                        type="button"
                    >
                        <i class="fas fa-eye"></i>
                        <span>Detalles</span>
                    </button>
                    <button 
                        data-cedula="${empleado.cedula}" 
                        class="reactivate-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
                        title="Restaurar empleado"
                        type="button"
                    >
                        <i class="fas fa-undo"></i>
                        <span>Restaurar</span>
                    </button>
                </div>
            `;
        }

        return `
            <div class="flex flex-wrap gap-2">
                <button 
                    data-cedula="${empleado.cedula}" 
                    class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-sm font-medium"
                    title="Ver detalles"
                    type="button"
                >
                    <i class="fas fa-eye"></i>
                    <span>Detalles</span>
                </button>
                <button 
                    data-cedula="${empleado.cedula}" 
                    class="edit-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
                    title="Editar empleado"
                    type="button"
                >
                    <i class="fas fa-edit"></i>
                    <span>Editar</span>
                </button>
                <button 
                    data-cedula="${empleado.cedula}" 
                    class="delete-btn flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm font-medium"
                    title="Eliminar empleado"
                    type="button"
                >
                    <i class="fas fa-trash-alt"></i>
                    <span>Eliminar</span>
                </button>
            </div>
        `;
    }

    renderPagination() {
        let pagContainer = document.getElementById('empleadosPagination');
        if (!pagContainer) {
            pagContainer = document.createElement('div');
            pagContainer.id = 'empleadosPagination';
            pagContainer.className = 'flex justify-center mt-6';
            document.getElementById('empleadosListContainer').after(pagContainer);
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
                    this.loadEmpleados();
                } else if (val === 'next' && this.currentPage < this.totalPages - 1) {
                    this.currentPage++;
                    this.loadEmpleados();
                } else if (!isNaN(val)) {
                    const page = parseInt(val);
                    if (page !== this.currentPage) {
                        this.currentPage = page;
                        this.loadEmpleados();
                    }
                }
            };
        });
    }

    filterEmpleados() {
        const searchTerm = document.getElementById('empleadoSearchInput')?.value || '';
        this.tableViewManager.filterData(searchTerm);
        this.currentPage = 0;
        this.loadEmpleados();
    }

    newEmpleado() {
        this.currentEmpleado = null;
        this.clearForm();
        document.getElementById('modalEmpleadoTitle').textContent = 'Nuevo Empleado';
        document.getElementById('btnEmpleadoIcon').className = 'fas fa-plus mr-2';
        document.getElementById('btnEmpleadoText').textContent = 'Crear Empleado';
        document.getElementById('empleadoCedula').disabled = false;
        // Mostrar campo de contraseña
        document.getElementById('empleadoPasswordContainer').classList.remove('hidden');
        document.getElementById('empleadoPassword').value = '';
        document.getElementById('modalEmpleado').classList.remove('hidden');
    }

    verEmpleado(cedula) {
        const empleado = this.filteredEmpleados.find(e => e.cedula === cedula);
        if (!empleado) {
            window.showToast('Empleado no encontrado.', 'error');
            return;
        }
        document.getElementById('detallesEmpleado').innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Nombre</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.nombre}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Apellido</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.apellido}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Cédula</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.cedula}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.telefono || 'N/A'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.email || 'N/A'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Rol</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.rol || 'N/A'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Salario</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.salario != null ? '$' + empleado.salario.toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Comisión</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.comision != null ? empleado.comision + '%' : 'N/A'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Fecha de Contratación</label>
                    <p class="mt-1 text-sm text-gray-900">${empleado.fechaContratacion || 'N/A'}</p>
                </div>
            </div>
        `;
        this.currentEmpleado = empleado;
        document.getElementById('modalVerEmpleado').classList.remove('hidden');
    }

    editEmpleado(cedula) {
        const empleado = this.filteredEmpleados.find(e => e.cedula === cedula);
        if (!empleado) {
            window.showToast('Empleado no encontrado.', 'error');
            return;
        }
        this.currentEmpleado = empleado;
        this.fillForm(this.currentEmpleado);
        document.getElementById('modalEmpleadoTitle').textContent = 'Editar Empleado';
        document.getElementById('btnEmpleadoIcon').className = 'fas fa-save mr-2';
        document.getElementById('btnEmpleadoText').textContent = 'Actualizar Empleado';
        document.getElementById('empleadoCedula').disabled = true;
        // Ocultar campo de contraseña
        document.getElementById('empleadoPasswordContainer').classList.add('hidden');
        document.getElementById('empleadoPassword').value = '';
        document.getElementById('modalEmpleado').classList.remove('hidden');
    }

    async handleSubmitEmpleado(e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        // Si estamos editando y la cédula está deshabilitada, obtenerla del empleado actual
        let cedula = formData.get('cedula');
        if (!cedula && this.currentEmpleado) {
            cedula = this.currentEmpleado.cedula;
        }

        const empleadoData = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            cedula: cedula, // Usar la cédula obtenida correctamente
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            rol: formData.get('rol'),
            salario: formData.get('salario') ? parseFloat(formData.get('salario')) : null,
            comision: formData.get('comision') !== '' ? parseFloat(formData.get('comision')) : null,
            fechaContratacion: formData.get('fechaContratacion')
        };
        const password = formData.get('password');

        if (typeof validateFormEmpleado === "function" && !validateFormEmpleado(empleadoData)) {
            return;
        }

        // Validación de contraseña solo al crear
        if (!this.currentEmpleado) {
            if (!password || password.length < 8) {
                const errorEl = document.getElementById('empleadoPasswordError');
                errorEl.textContent = 'La contraseña es obligatoria y debe tener al menos 8 caracteres';
                errorEl.classList.remove('hidden');
                return;
            } else {
                document.getElementById('empleadoPasswordError').classList.add('hidden');
            }
        }

        // Mapeo de rol empleado → userRole para crear usuario
        function mapEmpleadoRolToUserRole(rol) {
            switch (rol) {
                case "ADMIN": return "GERENTE";
                case "USER": return "TI";
                case "COMERCIAL": return "VENDEDOR";
                case "CAJERO": return "CONTABILIDAD";
                default: return "VENDEDOR";
            }
        }

        try {
            if (this.currentEmpleado) {
                await this.empleadoService.updateEmpleado(this.currentEmpleado.cedula, empleadoData);
                window.showToast('Empleado actualizado exitosamente.', 'success');
            } else {
                // Validación: no permitir empleados con cédula duplicada - usar todos los empleados
                const allEmpleados = [...this.empleadosActivos, ...this.empleadosEliminados];
                const cedulaExists = allEmpleados.some(e => e.cedula === empleadoData.cedula);
                if (cedulaExists) {
                    window.alert('Ya existe un Empleado con este número de cédula. Por favor, verifica los datos e intenta nuevamente.');
                    return;
                }
                // Crear empleado
                await this.empleadoService.createEmpleado(empleadoData);
                // Crear usuario asociado (username = nombre+apellido sin espacios y minúsculas, rol mapeado, password)
                const usuarioNombre = (empleadoData.nombre + empleadoData.apellido).replace(/\s+/g, '').toLowerCase();
                const usuarioData = {
                    username: usuarioNombre,
                    password: password,
                    roles: [mapEmpleadoRolToUserRole(empleadoData.rol)],
                    empleadoCedula: empleadoData.cedula // <-- Enviar la cédula del empleado
                };
                // Intentar crear usuario
                try {
                    await fetch('/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(usuarioData)
                    });
                } catch (err) {
                    window.alert('Empleado creado, pero hubo un problema creando el usuario. Puedes crearlo manualmente.');
                }
                window.showToast('Empleado creado exitosamente.', 'success');
            }
            this.cerrarModalEmpleado();
            await this.loadEmpleados();
        } catch (error) {
            console.error('Error saving empleado:', error);
            const errorMessage = error.message || 'Error desconocido';
            window.showToast(`Error al guardar el empleado: ${errorMessage}`, 'error');
        }
    }

    clearForm() {
        document.getElementById('formEmpleado').reset();
        document.getElementById('empleadoComisionContainer').classList.add('hidden');
    }

    fillForm(empleado) {
        document.getElementById('empleadoNombre').value = empleado.nombre || '';
        document.getElementById('empleadoApellido').value = empleado.apellido || '';
        document.getElementById('empleadoCedula').value = empleado.cedula || '';
        document.getElementById('empleadoTelefono').value = empleado.telefono || '';
        document.getElementById('empleadoEmail').value = empleado.email || '';
        document.getElementById('empleadoRol').value = empleado.rol || '';
        document.getElementById('empleadoSalario').value = empleado.salario || '';
        document.getElementById('empleadoComision').value = empleado.comision != null ? empleado.comision : '';
        document.getElementById('empleadoFechaContratacion').value = empleado.fechaContratacion || '';
        if (empleado.rol === 'COMERCIAL') {
            document.getElementById('empleadoComisionContainer').classList.remove('hidden');
        } else {
            document.getElementById('empleadoComisionContainer').classList.add('hidden');
        }
    }

    cerrarModalEmpleado() {
        document.getElementById('modalEmpleado').classList.add('hidden');
        this.clearForm();
        this.currentEmpleado = null;
    }

    cerrarModalVerEmpleado() {
        document.getElementById('modalVerEmpleado').classList.add('hidden');
        this.currentEmpleado = null;
    }

    editarEmpleadoDesdeDetalle() {
        if (this.currentEmpleado) {
            this.cerrarModalVerEmpleado();
            setTimeout(() => {
                this.editEmpleado(this.currentEmpleado.cedula);
            }, 250); // Espera a que el modal de detalles se cierre antes de abrir el de edición
        }
    }

    showLoading() {
        const container = document.getElementById('empleadosListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Consultando información de empleados...</p>
                    <p class="text-gray-500 text-sm mt-2">Un momento, por favor</p>
                </div>
            `;
        }
    }

    hideLoading() {}
    showError(message) {
        const container = document.getElementById('empleadosListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="empleadosManager.loadEmpleados()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                        <i class="fas fa-refresh mr-2"></i>Reintentar
                    </button>
                </div>
            `;
        }
    }

    async deleteEmpleado(cedula) {
        if (!confirm('¿Estás seguro de que deseas eliminar este empleado?')) return;
        try {
            await this.empleadoService.deleteEmpleado(cedula);
            window.showToast('Empleado eliminado exitosamente.', 'success');
            await this.loadEmpleados();
        } catch (error) {
            window.showToast('Error al eliminar el empleado.', 'error');
        }
    }

    async reactivarEmpleado(cedula) {
        if (!confirm('¿Estás seguro de que deseas reactivar este empleado?')) return;
        try {
            await this.empleadoService.restaurarEmpleado(cedula);
            window.showToast('Empleado reactivado exitosamente.', 'success');
            await this.loadEmpleados();
        } catch (error) {
            console.error('Error reactivando empleado:', error);
            window.showToast('Error al reactivar el empleado.', 'error');
        }
    }
}

const empleadosManager = new EmpleadosManager();
window.empleadosManager = empleadosManager;

// Make table view manager available globally
window.tableViewManager = empleadosManager.tableViewManager;

window.cerrarModalEmpleado = () => empleadosManager.cerrarModalEmpleado();
window.cerrarModalVerEmpleado = () => empleadosManager.cerrarModalVerEmpleado();

// No es necesario window.editarEmpleadoDesdeDetalle ya que se usa addEventListener ahora

// Formateo en tiempo real y comisión según rol
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('empleadoCedula')?.addEventListener('input', formatCedula);
    document.getElementById('empleadoTelefono')?.addEventListener('input', formatTelefono);
    document.getElementById('empleadoRol')?.addEventListener('change', function () {
        const rol = this.value;
        const comisionContainer = document.getElementById('empleadoComisionContainer');
        if (rol === 'COMERCIAL') {
            comisionContainer.classList.remove('hidden');
        } else {
            comisionContainer.classList.add('hidden');
            document.getElementById('empleadoComision').value = '';
            const errorEl = document.getElementById('empleadoComisionError');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.add('hidden');
            }
        }
    });
});

function formatCedula(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '').slice(0, 11);
    let part1 = digits.slice(0, 3);
    let part2 = digits.slice(3, 10);
    let part3 = digits.slice(10, 11);
    let formatted = part1;
    if (part2) formatted += '-' + part2;
    if (part3) formatted += '-' + part3;
    input.value = formatted;
}
function formatTelefono(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '').slice(0, 10);
    let part1 = digits.slice(0, 3);
    let part2 = digits.slice(3, 6);
    let part3 = digits.slice(6, 10);
    let formatted = part1;
    if (part2) formatted += '-' + part2;
    if (part3) formatted += '-' + part3;
    input.value = formatted;
}
