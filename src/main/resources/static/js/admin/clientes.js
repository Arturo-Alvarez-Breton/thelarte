// src/main/resources/static/js/contabilidad/clientes.js

import { TransaccionService } from '../services/transaccionService.js';
import { TableViewManager } from '../components/tableView.js';

class ClientesManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.allClientes = []; // Todos los clientes (activos y eliminados)
        this.clientesActivos = [];
        this.clientesEliminados = [];
        this.filteredClientes = [];
        this.currentPage = 0;
        this.clientesPerPage = 15; // Cambiado a 15 por página
        this.totalPages = 1;
        this.totalClientes = 0;
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        this.currentView = 'activos'; // 'activos' o 'eliminados'
        this.displayMode = 'card'; // 'card' or 'table'

        // Initialize table view manager with responsive columns
        this.tableViewManager = new TableViewManager('#transaccionesTableContainer', {
            columns: this.getResponsiveColumns(),
            actions: [
                {
                    icon: 'fas fa-eye',
                    handler: 'clientesManager.verCliente',
                    className: 'text-brand-brown hover:text-brand-light-brown',
                    title: 'Ver detalles'
                },
                {
                    icon: 'fas fa-exchange-alt',
                    handler: 'clientesManager.verTransaccionesCliente',
                    className: 'text-brand-accent hover:text-brand-brown',
                    title: 'Ver transacciones'
                },
                {
                    icon: 'fas fa-edit',
                    handler: 'clientesManager.editCliente',
                    className: 'text-green-600 hover:text-green-700',
                    title: 'Editar'
                },
                {
                    icon: 'fas fa-trash-alt',
                    handler: 'clientesManager.eliminarCliente',
                    className: 'text-red-600 hover:text-red-700',
                    title: 'Eliminar'
                }
            ],
            searchFields: ['cedula', 'nombre', 'apellido', 'telefono', 'email'],
            idField: 'cedula',
            emptyIcon: 'fas fa-users'
        });

        this.init();
    }

    getResponsiveColumns() {
        const isVerticalScreen = window.innerHeight > window.innerWidth;

        if (isVerticalScreen || this.isMobile) {
            // Vertical screen or mobile: only show combined name, no phone
            return [
                {
                    header: 'Nombre Completo',
                    field: 'nombre',
                    formatter: (value, item) => `${item.nombre} ${item.apellido}`
                }
            ];
        } else {
            // Horizontal screen: show all info
            return [
                { header: 'Cédula', field: 'cedula' },
                { header: 'Nombre', field: 'nombre' },
                { header: 'Apellido', field: 'apellido' },
                { header: 'Teléfono', field: 'telefono' },
                { header: 'Email', field: 'email', formatter: (value) => value || 'N/A' },
                { header: 'Provincia', field: 'direccion', formatter: (value) => value || 'N/A' }
            ];
        }
    }

    async init() {
        this.setupEventListeners();
        this.setupResponsiveHandlers();
        await this.loadClientes();
    }

    setupEventListeners() {
        document.getElementById('nuevoClienteBtn')?.addEventListener('click', () => this.newCliente());
        document.getElementById('clientSearchInput')?.addEventListener('keyup', () => this.filterClientes());
        document.getElementById('formCliente')?.addEventListener('submit', (e) => this.handleSubmitCliente(e));

        // View toggle buttons
        document.getElementById('btnCardView')?.addEventListener('click', () => this.switchToCardView());
        document.getElementById('btnTableView')?.addEventListener('click', () => this.switchToTableView());

        // Filter buttons for active/deleted clients
        document.getElementById('btnClientesActivos')?.addEventListener('click', () => this.switchToActiveClients());
        document.getElementById('btnClientesEliminados')?.addEventListener('click', () => this.switchToDeletedClients());

        // Delegación de eventos para los botones de acción en la lista de clientes
        document.getElementById('clientesListContainer')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const cedula = btn.getAttribute('data-cedula');
            if (btn.classList.contains('ver-btn')) {
                this.verCliente(cedula);
            } else if (btn.classList.contains('transacciones-btn')) {
                this.verTransaccionesCliente(cedula);
            } else if (btn.classList.contains('edit-btn')) {
                this.editCliente(cedula);
            } else if (btn.classList.contains('delete-btn')) {
                this.eliminarCliente(cedula);
            } else if (btn.classList.contains('reactivate-btn')) {
                this.reactivarCliente(cedula);
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

        // Re-render clients if breakpoint changed significantly
        if ((wasMobile !== this.isMobile) || (wasTablet !== this.isTablet)) {
            this.renderClientes();
        }
    }

    async loadClientes() {
        this.showLoading();
        try {
            const busqueda = document.getElementById('clientSearchInput')?.value || null;
            // Obtener todos los clientes (activos y eliminados) - usar el método existente
            const allClientes = await this.transaccionService.getClientes(busqueda);

            // Separar clientes activos y eliminados basado en el campo 'deleted'
            this.clientesActivos = allClientes.filter(c => !c.deleted);
            this.clientesEliminados = allClientes.filter(c => c.deleted);

            // Actualizar contadores
            this.updateCounters();

            // Actualizar estilos de los botones según la vista actual
            this.updateFilterButtons();

            // Determinar qué clientes mostrar según la vista actual
            const currentClientes = this.currentView === 'activos' ? this.clientesActivos : this.clientesEliminados;

            // Configurar paginación
            this.totalClientes = currentClientes.length;
            this.totalPages = Math.ceil(this.totalClientes / this.clientesPerPage);

            // Aplicar paginación
            const start = this.currentPage * this.clientesPerPage;
            const end = start + this.clientesPerPage;
            this.filteredClientes = currentClientes.slice(start, end);

            // Update table view with current data
            this.tableViewManager.setData(this.filteredClientes);

            this.renderClientes();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading clients:', error);
            this.clientesActivos = [];
            this.clientesEliminados = [];
            this.filteredClientes = [];
            this.totalClientes = 0;
            this.totalPages = 1;
            this.updateCounters();
            this.updateFilterButtons(); // Also update buttons on error
            this.tableViewManager.setData([]);
            this.renderClientes();
            this.renderPagination();
        } finally {
            this.hideLoading();
        }
    }

    updateCounters() {
        // Actualizar contadores en los botones con animación
        const countActivos = document.getElementById('countActivos');
        const countEliminados = document.getElementById('countEliminados');

        if (countActivos) {
            // Trigger animation by removing and re-adding the class
            countActivos.classList.remove('count-badge');
            countActivos.textContent = this.clientesActivos.length;
            // Force reflow
            countActivos.offsetHeight;
            countActivos.classList.add('count-badge');
        }

        if (countEliminados) {
            // Trigger animation by removing and re-adding the class
            countEliminados.classList.remove('count-badge');
            countEliminados.textContent = this.clientesEliminados.length;
            // Force reflow
            countEliminados.offsetHeight;
            countEliminados.classList.add('count-badge');
        }
    }

    switchToActiveClients() {
        if (this.currentView === 'activos') return;

        this.currentView = 'activos';
        this.currentPage = 0;

        // Actualizar estilos de los botones con transición suave
        this.updateFilterButtons();

        // Cargar clientes activos
        this.loadClientes();
    }

    switchToDeletedClients() {
        if (this.currentView === 'eliminados') return;

        this.currentView = 'eliminados';
        this.currentPage = 0;

        // Actualizar estilos de los botones con transición suave
        this.updateFilterButtons();

        // Cargar clientes eliminados
        this.loadClientes();
    }

    updateFilterButtons() {
        const btnActivos = document.getElementById('btnClientesActivos');
        const btnEliminados = document.getElementById('btnClientesEliminados');

        if (this.currentView === 'activos') {
            // Activos seleccionado: agregar clase active, quitar de eliminados
            btnActivos.classList.add('active');
            btnEliminados.classList.remove('active');

            // Contadores - activos tiene badge blanco, eliminados gris
            const countActivos = btnActivos.querySelector('#countActivos');
            const countEliminados = btnEliminados.querySelector('#countEliminados');
            if (countActivos) {
                countActivos.className = 'count-badge ml-1 bg-white text-brand-brown px-1.5 py-0.5 rounded text-xs font-bold';
            }
            if (countEliminados) {
                countEliminados.className = 'count-badge ml-1 bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded text-xs font-bold';
            }
        } else {
            // Eliminados seleccionado: agregar clase active, quitar de activos
            btnActivos.classList.remove('active');
            btnEliminados.classList.add('active');

            // Contadores - eliminados tiene badge blanco, activos gris
            const countActivos = btnActivos.querySelector('#countActivos');
            const countEliminados = btnEliminados.querySelector('#countEliminados');
            if (countActivos) {
                countActivos.className = 'count-badge ml-1 bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded text-xs font-bold';
            }
            if (countEliminados) {
                countEliminados.className = 'count-badge ml-1 bg-white text-red-600 px-1.5 py-0.5 rounded text-xs font-bold';
            }
        }
    }

    async loadClientes() {
        this.showLoading();
        try {
            const busqueda = document.getElementById('clientSearchInput')?.value || null;
            // Obtener todos los clientes (activos y eliminados) - usar el método existente
            const allClientes = await this.transaccionService.getClientes(busqueda);

            // Separar clientes activos y eliminados basado en el campo 'deleted'
            this.clientesActivos = allClientes.filter(c => !c.deleted);
            this.clientesEliminados = allClientes.filter(c => c.deleted);

            // Actualizar contadores
            this.updateCounters();

            // Actualizar estilos de los botones según la vista actual
            this.updateFilterButtons();

            // Determinar qué clientes mostrar según la vista actual
            const currentClientes = this.currentView === 'activos' ? this.clientesActivos : this.clientesEliminados;

            // Configurar paginación
            this.totalClientes = currentClientes.length;
            this.totalPages = Math.ceil(this.totalClientes / this.clientesPerPage);

            // Aplicar paginación
            const start = this.currentPage * this.clientesPerPage;
            const end = start + this.clientesPerPage;
            this.filteredClientes = currentClientes.slice(start, end);

            // Update table view with current data
            this.tableViewManager.setData(this.filteredClientes);

            this.renderClientes();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading clients:', error);
            this.clientesActivos = [];
            this.clientesEliminados = [];
            this.filteredClientes = [];
            this.totalClientes = 0;
            this.totalPages = 1;
            this.updateCounters();
            this.updateFilterButtons(); // Also update buttons on error
            this.tableViewManager.setData([]);
            this.renderClientes();
            this.renderPagination();
        } finally {
            this.hideLoading();
        }
    }

    renderClientes() {
        const container = document.getElementById('clientesListContainer');
        if (!container) return;

        if (this.filteredClientes.length === 0) {
            const searchTerm = document.getElementById('clientSearchInput')?.value;
            const emptyMessage = searchTerm ?
                `No se encontraron clientes que coincidan con "${searchTerm}".` :
                'No hay clientes registrados.';

            container.innerHTML = `
                <div class="text-center py-8 md:py-12 col-span-full">
                    <div class="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-users text-2xl md:text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-base md:text-lg font-medium text-gray-900 mb-2">Sin clientes</h3>
                    <p class="text-gray-600 mb-4 md:mb-6 text-sm md:text-base px-4">${emptyMessage}</p>
                    ${!searchTerm ? `
                        <button onclick="clientesManager.newCliente()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown text-sm md:text-base">
                            <i class="fas fa-plus mr-2"></i>Agregar Primer Cliente
                        </button>
                    ` : `
                        <button onclick="document.getElementById('clientSearchInput').value = ''; clientesManager.filterClientes();" class="text-brand-brown hover:text-brand-light-brown text-sm md:text-base">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    `}
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredClientes.map(cliente => this.renderClienteCard(cliente)).join('');
    }

    renderClienteCard(cliente) {
        // Adaptive button rendering based on screen size
        const buttonsHtml = this.isMobile ? this.renderMobileButtons(cliente) :
                           this.isTablet ? this.renderTabletButtons(cliente) :
                           this.renderDesktopButtons(cliente);

        return `
            <div class="cliente-card flex flex-col h-full w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-h-[220px] 
                sm:min-h-[240px] md:min-h-[260px] lg:min-h-[280px] xl:min-h-[300px] 
                ${this.isMobile ? 'max-w-full' : 'max-w-[420px] xl:max-w-[480px]'}
                ">
                <div class="flex-1 flex flex-col p-3 sm:p-4 md:p-5">
                    <div class="flex items-start justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-900 truncate max-w-[70%]">
                            ${cliente.nombre} ${cliente.apellido}
                        </h3>
                    </div>
                    <div class="flex-1 flex flex-col gap-2 mt-1">
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-id-card text-gray-400"></i>
                            </span>
                            <span class="truncate font-mono text-xs">${cliente.cedula}</span>
                        </div>
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-phone text-gray-400"></i>
                            </span>
                            <span class="truncate">${cliente.telefono || 'No disponible'}</span>
                        </div>
                        ${!this.isMobile ? `
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-envelope text-gray-400"></i>
                            </span>
                            <span class="truncate text-xs">${cliente.email || 'No disponible'}</span>
                        </div>
                        ${cliente.direccion ? `
                        <div class="flex items-start text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 pt-0.5">
                                <i class="fas fa-map-marker-alt text-gray-400"></i>
                            </span>
                            <span class="text-xs leading-relaxed line-clamp-2">${cliente.direccion}</span>
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

    renderMobileButtons(cliente) {
        if (cliente.deleted) {
            return `
                <div class="space-y-2">
                    <div class="grid grid-cols-2 gap-2">
                        <button 
                            data-cedula="${cliente.cedula}" 
                            class="ver-btn flex items-center justify-center gap-1.5 bg-brand-brown text-white px-3 py-2.5 rounded-lg hover:bg-brand-light-brown transition-colors text-sm font-medium"
                            title="Ver detalles"
                            type="button"
                        >
                            <i class="fas fa-eye text-xs"></i>
                            <span>Ver</span>
                        </button>
                        <button 
                            data-cedula="${cliente.cedula}" 
                            class="reactivate-btn flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            title="Restaurar cliente"
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
                        data-cedula="${cliente.cedula}" 
                        class="ver-btn flex items-center justify-center gap-1.5 bg-brand-brown text-white px-3 py-2.5 rounded-lg hover:bg-brand-light-brown transition-colors text-sm font-medium"
                        title="Ver detalles"
                        type="button"
                    >
                        <i class="fas fa-eye text-xs"></i>
                        <span>Ver</span>
                    </button>
                    <button 
                        data-cedula="${cliente.cedula}"
                        class="transacciones-btn flex items-center justify-center gap-1.5 bg-brand-accent text-brand-brown px-3 py-2.5 rounded-lg hover:bg-brand-brown hover:text-white transition-colors text-sm font-medium"
                        title="Ver transacciones"
                        type="button"
                    >
                        <i class="fas fa-exchange-alt text-xs"></i>
                        <span>Trans.</span>
                    </button>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <button 
                        data-cedula="${cliente.cedula}" 
                        class="edit-btn flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        title="Editar cliente"
                        type="button"
                    >
                        <i class="fas fa-edit text-xs"></i>
                        <span>Editar</span>
                    </button>
                    <button 
                        data-cedula="${cliente.cedula}" 
                        class="delete-btn flex items-center justify-center gap-1.5 bg-red-600 text-white px-3 py-2.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        title="Eliminar cliente"
                        type="button"
                    >
                        <i class="fas fa-trash-alt text-xs"></i>
                        <span>Eliminar</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderTabletButtons(cliente) {
        if (cliente.deleted) {
            return `
                <div class="flex flex-wrap gap-1.5 justify-center">
                    <button 
                        data-cedula="${cliente.cedula}" 
                        class="ver-btn flex items-center gap-1 bg-brand-brown text-white px-2.5 py-1.5 rounded-md hover:bg-brand-light-brown transition-colors text-xs font-medium"
                        title="Ver detalles"
                        type="button"
                    >
                        <i class="fas fa-eye"></i>
                        <span>Ver</span>
                    </button>
                    <button 
                        data-cedula="${cliente.cedula}" 
                        class="reactivate-btn flex items-center gap-1 bg-green-600 text-white px-2.5 py-1.5 rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                        title="Restaurar cliente"
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
                    data-cedula="${cliente.cedula}" 
                    class="ver-btn flex items-center gap-1 bg-brand-brown text-white px-2.5 py-1.5 rounded-md hover:bg-brand-light-brown transition-colors text-xs font-medium"
                    title="Ver detalles"
                    type="button"
                >
                    <i class="fas fa-eye"></i>
                    <span>Ver</span>
                </button>
                <button 
                    data-cedula="${cliente.cedula}"
                    class="transacciones-btn flex items-center gap-1 bg-brand-accent text-brand-brown px-2.5 py-1.5 rounded-md hover:bg-brand-brown hover:text-white transition-colors text-xs font-medium"
                    title="Ver transacciones"
                    type="button"
                >
                    <i class="fas fa-exchange-alt"></i>
                    <span>Trans</span>
                </button>
                <button 
                    data-cedula="${cliente.cedula}" 
                    class="edit-btn flex items-center gap-1 bg-green-600 text-white px-2.5 py-1.5 rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                    title="Editar cliente"
                    type="button"
                >
                    <i class="fas fa-edit"></i>
                    <span>Edit</span>
                </button>
                <button 
                    data-cedula="${cliente.cedula}" 
                    class="delete-btn flex items-center gap-1 bg-red-600 text-white px-2.5 py-1.5 rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                    title="Eliminar cliente"
                    type="button"
                >
                    <i class="fas fa-trash-alt"></i>
                    <span>Del</span>
                </button>
            </div>
        `;
    }

    renderDesktopButtons(cliente) {
        if (cliente.deleted) {
            return `
                <div class="flex flex-wrap gap-2">
                    <button 
                        data-cedula="${cliente.cedula}" 
                        class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-sm font-medium"
                        title="Ver detalles"
                        type="button"
                    >
                        <i class="fas fa-eye"></i>
                        <span>Detalles</span>
                    </button>
                    <button 
                        data-cedula="${cliente.cedula}" 
                        class="reactivate-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
                        title="Restaurar cliente"
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
                    data-cedula="${cliente.cedula}" 
                    class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-sm font-medium"
                    title="Ver detalles"
                    type="button"
                >
                    <i class="fas fa-eye"></i>
                    <span>Detalles</span>
                </button>
                <button 
                    data-cedula="${cliente.cedula}"
                    class="transacciones-btn flex items-center gap-2 bg-brand-accent text-brand-brown px-3 py-2 rounded-lg hover:bg-brand-brown hover:text-white transition-colors shadow-sm text-sm font-medium"
                    title="Ver transacciones"
                    type="button"
                >
                    <i class="fas fa-exchange-alt"></i>
                    <span>Transacciones</span>
                </button>
                <button 
                    data-cedula="${cliente.cedula}" 
                    class="edit-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
                    title="Editar cliente"
                    type="button"
                >
                    <i class="fas fa-edit"></i>
                    <span>Editar</span>
                </button>
                <button 
                    data-cedula="${cliente.cedula}" 
                    class="delete-btn flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm font-medium"
                    title="Eliminar cliente"
                    type="button"
                >
                    <i class="fas fa-trash-alt"></i>
                    <span>Eliminar</span>
                </button>
            </div>
        `;
    }

    renderPagination() {
        let pagContainer = document.getElementById('clientesPagination');
        if (!pagContainer) {
            pagContainer = document.createElement('div');
            pagContainer.id = 'clientesPagination';
            pagContainer.className = 'flex justify-center mt-6';
            document.getElementById('clientesListContainer').after(pagContainer);
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
                    this.loadClientes();
                } else if (val === 'next' && this.currentPage < this.totalPages - 1) {
                    this.currentPage++;
                    this.loadClientes();
                } else if (!isNaN(val)) {
                    const page = parseInt(val);
                    if (page !== this.currentPage) {
                        this.currentPage = page;
                        this.loadClientes();
                    }
                }
            };
        });
    }

    filterClientes() {
        const searchTerm = document.getElementById('clientSearchInput')?.value || '';
        this.tableViewManager.filterData(searchTerm);
        this.currentPage = 0;
        this.loadClientes();
    }

    newCliente() {
        this.currentCliente = null;
        this.clearForm();
        document.getElementById('modalClienteTitle').textContent = 'Nuevo Cliente';
        document.getElementById('btnClienteIcon').className = 'fas fa-plus mr-2';
        document.getElementById('btnClienteText').textContent = 'Crear Cliente';
        document.getElementById('clienteCedula').disabled = false;
        document.getElementById('modalCliente').classList.remove('hidden');
    }

    async verCliente(cedula) {
        try {
            const cliente = this.filteredClientes.find(c => c.cedula === cedula);
            if (!cliente) {
                window.showToast('Cliente no encontrado.', 'error');
                return;
            }

            document.getElementById('detallesCliente').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Nombre</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.nombre}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Apellido</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.apellido}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Cédula</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.cedula}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.telefono || 'N/A'}</p>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.email || 'N/A'}</p>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Dirección</label>
                        <p class="mt-1 text-sm text-gray-900">${cliente.direccion || 'N/A'}</p>
                    </div>
                </div>
            `;

            this.currentCliente = cliente;
            document.getElementById('modalVerCliente').classList.remove('hidden');
        } catch (error) {
            console.error('Error viewing client:', error);
            window.showToast('Error al mostrar los detalles del cliente.', 'error');
        }
    }

    async editCliente(cedula) {
        try {
            const cliente = this.filteredClientes.find(c => c.cedula === cedula);
            if (!cliente) {
                window.showToast('Cliente no encontrado.', 'error');
                return;
            }

            // Fetch complete client data from API to ensure we have all fields
            const clienteCompleto = await this.transaccionService.getClienteByCedula(cedula);

            this.currentCliente = clienteCompleto || cliente;
            this.fillForm(this.currentCliente);
            document.getElementById('modalClienteTitle').textContent = 'Editar Cliente';
            document.getElementById('btnClienteIcon').className = 'fas fa-save mr-2';
            document.getElementById('btnClienteText').textContent = 'Actualizar Cliente';
            document.getElementById('clienteCedula').disabled = true;
            document.getElementById('modalCliente').classList.remove('hidden');
        } catch (error) {
            console.error('Error loading client for edit:', error);
            // Fallback to cached data
            const cliente = this.filteredClientes.find(c => c.cedula === cedula);
            if (cliente) {
                this.currentCliente = cliente;
                this.fillForm(cliente);
                document.getElementById('modalClienteTitle').textContent = 'Editar Cliente';
                document.getElementById('btnClienteIcon').className = 'fas fa-save mr-2';
                document.getElementById('btnClienteText').textContent = 'Actualizar Cliente';
                document.getElementById('clienteCedula').disabled = true;
                document.getElementById('modalCliente').classList.remove('hidden');
            } else {
                window.showToast('Error al cargar los datos del cliente.', 'error');
            }
        }
    }

    async eliminarCliente(cedula) {
        if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;
        try {
            await this.transaccionService.deleteCliente(cedula);
            window.showToast('Cliente eliminado exitosamente.', 'success');
            await this.loadClientes();
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            window.showToast('Error al eliminar el cliente.', 'error');
        }
    }

    async reactivarCliente(cedula) {
        if (!confirm('¿Estás seguro de que deseas reactivar este cliente?')) return;
        try {
            await this.transaccionService.reactivateCliente(cedula);
            window.showToast('Cliente reactivado exitosamente.', 'success');
            await this.loadClientes();
        } catch (error) {
            console.error('Error reactivando cliente:', error);
            window.showToast('Error al reactivar el cliente.', 'error');
        }
    }

    async handleSubmitCliente(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const clienteData = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            cedula: formData.get('cedula'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            direccion: formData.get('direccion')
        };

        try {
            if (this.currentCliente) {
                console.log('Updating client:', this.currentCliente.cedula);
                await this.transaccionService.updateCliente(this.currentCliente.cedula, clienteData);
                window.showToast('Cliente actualizado exitosamente.', 'success');
            } else {
                // Check for duplicate cedula before creating - usar todos los clientes
                const allClientes = [...this.clientesActivos, ...this.clientesEliminados];
                const cedulaExists = allClientes.some(c => c.cedula === clienteData.cedula);
                if (cedulaExists) {
                    window.alert('Ya existe un cliente con este número de cédula. Por favor, verifica los datos e intenta nuevamente.');
                    return;
                }
                await this.transaccionService.createCliente(clienteData);
                window.showToast('Cliente creado exitosamente.', 'success');
            }

            this.cerrarModalCliente();
            this.loadClientes();
        } catch (error) {
            console.error('Error saving client:', error);
            const errorMessage = error.message || 'Error desconocido';
            window.showToast(`Error al guardar el cliente: ${errorMessage}`, 'error');
        }
    }

    async verTransaccionesCliente(cedula) {
        try {
            const cliente = this.filteredClientes.find(c => c.cedula === cedula);
            if (!cliente) {
                window.showToast('Cliente no encontrado.', 'error');
                return;
            }

            // Limpiar la cédula eliminando los guiones para buscar por ID
            const cedulaLimpia = cedula.replace(/[-\s]/g, '');

            // Redirect to transactions page with client filter
            const transaccionesUrl = new URL('/pages/admin/transacciones.html', window.location.origin);
            transaccionesUrl.searchParams.set('cliente', cedulaLimpia); // Usamos cédula limpia sin guiones
            transaccionesUrl.searchParams.set('clienteNombre', `${cliente.nombre} ${cliente.apellido}`);
            window.location.href = transaccionesUrl.toString();
        } catch (error) {
            console.error('Error viewing client transactions:', error);
            window.showToast('Error al ver las transacciones del cliente.', 'error');
        }
    }
    editarClienteDesdeDetalle() {
        if (this.currentCliente) {
            this.cerrarModalVerCliente();
            this.editCliente(this.currentCliente.cedula);
        }
    }

    showLoading() {
        const container = document.getElementById('clientesListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Consultando información de clientes...</p>
                    <p class="text-gray-500 text-sm mt-2">Un momento, por favor</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Content will replace the loading spinner, no need for explicit hiding
    }

    showError(message) {
        const container = document.getElementById('clientesListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="clientesManager.loadClientes()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                        <i class="fas fa-refresh mr-2"></i>Reintentar
                    </button>
                </div>
            `;
        }
    }

    switchToActiveClients() {
        this.currentView = 'activos';
        this.currentPage = 0;
        this.loadClientes();
    }

    switchToDeletedClients() {
        this.currentView = 'eliminados';
        this.currentPage = 0;
        this.loadClientes();
    }

    // View switching methods
    switchToCardView() {
        if (this.displayMode === 'card') return;

        this.displayMode = 'card';
        this.updateViewToggleButtons();

        // Show card container, hide table container
        const cardContainer = document.getElementById('clientesListContainer');
        const tableContainer = document.getElementById('transaccionesTableContainer');
        const pagination = document.getElementById('clientesPagination');

        if (cardContainer) cardContainer.classList.remove('hidden');
        if (tableContainer) this.tableViewManager.switchToCardView();
        if (pagination) pagination.classList.remove('hidden');
    }

    switchToTableView() {
        if (this.displayMode === 'table') return;

        this.displayMode = 'table';
        this.updateViewToggleButtons();

        // Hide card container, show table container
        const cardContainer = document.getElementById('clientesListContainer');
        const pagination = document.getElementById('clientesPagination');

        if (cardContainer) cardContainer.classList.add('hidden');
        if (pagination) pagination.classList.add('hidden');

        // Switch to table view and update data
        this.tableViewManager.switchToTableView();
    }

    updateViewToggleButtons() {
        const btnCardView = document.getElementById('btnCardView');
        const btnTableView = document.getElementById('btnTableView');

        if (this.displayMode === 'card') {
            btnCardView?.classList.add('active');
            btnTableView?.classList.remove('active');
        } else {
            btnCardView?.classList.remove('active');
            btnTableView?.classList.add('active');
        }
    }

    // Modal functions
    cerrarModalCliente() {
        document.getElementById('modalCliente').classList.add('hidden');
        this.clearForm();
    }

    cerrarModalVerCliente() {
        document.getElementById('modalVerCliente').classList.add('hidden');
        this.currentCliente = null;
    }

    clearForm() {
        const form = document.getElementById('formCliente');
        if (form) {
            form.reset();
            // Clear validation errors
            const errorElements = form.querySelectorAll('.text-red-500');
            errorElements.forEach(el => el.classList.add('hidden'));

            // Remove error styles from inputs
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.classList.remove('border-red-500');
            });
        }
    }

    fillForm(cliente) {
        if (!cliente) return;

        document.getElementById('clienteCedula').value = cliente.cedula || '';
        document.getElementById('clienteNombre').value = cliente.nombre || '';
        document.getElementById('clienteApellido').value = cliente.apellido || '';
        document.getElementById('clienteTelefono').value = cliente.telefono || '';
        document.getElementById('clienteEmail').value = cliente.email || '';
        document.getElementById('clienteDireccion').value = cliente.direccion || '';
    }
}

const clientesManager = new ClientesManager();
window.clientesManager = clientesManager;

// Make table view manager available globally
window.tableViewManager = clientesManager.tableViewManager;

// Funciones globales para los event handlers de los modales
window.cerrarModalCliente = () => clientesManager.cerrarModalCliente();
window.cerrarModalVerCliente = () => clientesManager.cerrarModalVerCliente();
window.editarClienteDesdeDetalle = () => clientesManager.editarClienteDesdeDetalle();
window.eliminarCliente = (cedula) => clientesManager.eliminarCliente(cedula);
