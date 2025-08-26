import { ProductoService } from '../services/productoService.js';
import { TableViewManager } from '../components/tableView.js';

class ProductosManager {
    constructor() {
        this.productoService = new ProductoService();
        this.allProductos = []; // Todos los productos (activos y eliminados)
        this.productosActivos = [];
        this.productosEliminados = [];
        this.filteredProductos = [];
        this.currentProducto = null;
        this.currentPage = 0;
        this.productosPerPage = 12; // Productos por página
        this.totalPages = 1;
        this.totalProductos = 0;
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        this.currentView = 'activos'; // 'activos' o 'eliminados'
        this.tiposProductos = []; // Array para almacenar los tipos únicos

        // Initialize table view manager with responsive columns
        this.tableViewManager = new TableViewManager('#productosListContainer', {
            columns: this.getResponsiveColumns(),
            actions: [
                {
                    icon: 'fas fa-eye',
                    handler: 'productosManager.verProducto',
                    className: 'text-brand-brown hover:text-brand-light-brown',
                    title: 'Ver detalles'
                }
            ],
            searchFields: ['nombre', 'tipo', 'descripcion', 'codigo'],
            idField: 'id',
            emptyIcon: 'fas fa-box-open'
        });

        this.init();
    }

    getResponsiveColumns() {
        const isVerticalScreen = window.innerHeight > window.innerWidth;

        if (isVerticalScreen || this.isMobile) {
            // Vertical screen or mobile: only show name and price
            return [
                { header: 'Nombre', field: 'nombre' },
                {
                    header: 'Precio',
                    field: 'precioVenta',
                    formatter: (value) => value ? `$${Number(value).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : '$0.00'
                }
            ];
        } else {
            // Horizontal screen: show all info
            return [
                { header: 'Código', field: 'codigo' },
                { header: 'Nombre', field: 'nombre' },
                { header: 'Tipo', field: 'tipo' },
                {
                    header: 'Precio Venta',
                    field: 'precioVenta',
                    formatter: (value) => value ? `$${Number(value).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : '$0.00'
                },
                {
                    header: 'Precio Compra',
                    field: 'precioCompra',
                    formatter: (value) => value ? `$${Number(value).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : '$0.00'
                }
            ];
        }
    }

    async init() {
        this.setupEventListeners();
        this.setupResponsiveHandlers();
        await this.loadTiposProductos();
        await this.loadProductos();
    }

    // Nuevo método para cargar tipos de productos dinámicamente
    async loadTiposProductos() {
        try {
            this.tiposProductos = await this.productoService.getTiposProductos();
            this.populateTipoSelects();
        } catch (error) {
            console.error('Error loading tipos productos:', error);
            // Usar tipos por defecto en caso de error
            this.tiposProductos = ['silla', 'mueble', 'mesa', 'otoman'];
            this.populateTipoSelects();
        }
    }

    // Método para poblar los selects de tipo con los tipos únicos
    populateTipoSelects() {
        // Poblar select del modal
        const productoTipoSelect = document.getElementById('productoTipo');
        if (productoTipoSelect) {
            // Limpiar opciones existentes excepto la primera
            productoTipoSelect.innerHTML = '<option value="">Seleccione un tipo</option>';

            // Agregar tipos únicos ordenados alfabéticamente
            const tiposOrdenados = [...new Set(this.tiposProductos)].sort();
            tiposOrdenados.forEach(tipo => {
                if (tipo && tipo.trim()) {
                    const option = document.createElement('option');
                    option.value = tipo.toLowerCase();
                    option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                    productoTipoSelect.appendChild(option);
                }
            });

            // Agregar opción "Otro"
            const otroOption = document.createElement('option');
            otroOption.value = 'otro';
            otroOption.textContent = 'Otro (especificar)';
            productoTipoSelect.appendChild(otroOption);
        }

        // Poblar filtro de búsqueda
        const productoTipoFilter = document.getElementById('productoTipoFilter');
        if (productoTipoFilter) {
            // Guardar el valor actual
            const currentValue = productoTipoFilter.value;

            // Limpiar opciones existentes excepto la primera
            productoTipoFilter.innerHTML = '<option value="">Todos los tipos</option>';

            // Agregar tipos únicos ordenados alfabéticamente
            const tiposOrdenados = [...new Set(this.tiposProductos)].sort();
            tiposOrdenados.forEach(tipo => {
                if (tipo && tipo.trim()) {
                    const option = document.createElement('option');
                    option.value = tipo.toLowerCase();
                    option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                    productoTipoFilter.appendChild(option);
                }
            });

            // Restaurar valor si aún existe
            if (currentValue && [...productoTipoFilter.options].some(opt => opt.value === currentValue)) {
                productoTipoFilter.value = currentValue;
            }
        }
    }

    setupEventListeners() {
        // document.getElementById('nuevoProductoBtn')?.addEventListener('click', () => this.newProducto());
        document.getElementById('productoSearchInput')?.addEventListener('input', () => this.filterProductos());
        document.getElementById('productoTipoFilter')?.addEventListener('change', () => this.filterProductos());
        document.getElementById('formProducto')?.addEventListener('submit', (e) => this.handleSubmitProducto(e));

        // Event listener para el campo tipo de producto
        document.getElementById('productoTipo')?.addEventListener('change', (e) => this.handleTipoChange(e));

        // Filter buttons for active/deleted products
        document.getElementById('btnProductosActivos')?.addEventListener('click', () => this.switchToActiveProducts());
        document.getElementById('btnProductosEliminados')?.addEventListener('click', () => this.switchToDeletedProducts());

        // Event delegation for action buttons
        document.getElementById('productosListContainer')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.getAttribute('data-id');

            if (btn.classList.contains('ver-btn')) {
                this.verProducto(id);
            } else if (btn.classList.contains('edit-btn')) {
                this.editProducto(id);
            } else if (btn.classList.contains('delete-btn')) {
                this.deleteProducto(id);
            } else if (btn.classList.contains('reactivate-btn')) {
                this.reactivateProducto(id);
            }
        });

        document.getElementById('productoFoto')?.addEventListener('change', (e) => this.previewFoto(e));
    }

    // Nuevo método para manejar el cambio en el select de tipo
    handleTipoChange(e) {
        const otroTipoContainer = document.getElementById('otroTipoContainer');
        const otroTipoInput = document.getElementById('otroTipoInput');

        if (e.target.value === 'otro') {
            otroTipoContainer.classList.remove('hidden');
            otroTipoInput.required = true;
            otroTipoInput.focus();
        } else {
            otroTipoContainer.classList.add('hidden');
            otroTipoInput.required = false;
            otroTipoInput.value = '';
        }
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

        // Re-render products if breakpoint changed significantly
        if ((wasMobile !== this.isMobile) || (wasTablet !== this.isTablet)) {
            this.renderProductos();
        }
    }

    async loadProductos() {
        this.showLoading();
        try {
            // Obtener todos los productos (incluyendo eliminados)
            const allProductos = await this.productoService.getAllProductosIncludeDeleted();

            // Separar productos activos y eliminados
            this.productosActivos = allProductos.filter(p => !p.eliminado);
            this.productosEliminados = allProductos.filter(p => p.eliminado);

            // Actualizar contadores
            this.updateCounters();

            // Actualizar estilos de los botones según la vista actual
            this.updateFilterButtons();

            // Determinar qué productos mostrar según la vista actual
            const currentProductos = this.currentView === 'activos' ? this.productosActivos : this.productosEliminados;

            // Aplicar filtros de búsqueda
            const searchValue = (document.getElementById('productoSearchInput')?.value || '').trim().toLowerCase();
            const tipoValue = (document.getElementById('productoTipoFilter')?.value || '').trim().toLowerCase();

            let filtered = currentProductos;
            if (tipoValue) {
                filtered = filtered.filter(p => p.tipo && p.tipo.toLowerCase() === tipoValue);
            }
            if (searchValue) {
                filtered = filtered.filter(p =>
                    (p.nombre && p.nombre.toLowerCase().includes(searchValue)) ||
                    (p.descripcion && p.descripcion.toLowerCase().includes(searchValue)) ||
                    (p.codigo && p.codigo.toLowerCase().includes(searchValue))
                );
            }

            // Configurar paginación
            this.totalProductos = filtered.length;
            this.totalPages = Math.ceil(this.totalProductos / this.productosPerPage);

            // Aplicar paginación
            const start = this.currentPage * this.productosPerPage;
            const end = start + this.productosPerPage;
            this.filteredProductos = filtered.slice(start, end);

            // Update table view with current data
            this.tableViewManager.setData(this.filteredProductos);

            this.renderProductos();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading products:', error);
            this.productosActivos = [];
            this.productosEliminados = [];
            this.filteredProductos = [];
            this.totalProductos = 0;
            this.totalPages = 1;
            this.updateCounters();
            this.updateFilterButtons();
            this.tableViewManager.setData([]);
            this.renderProductos();
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
            countActivos.classList.remove('count-badge');
            countActivos.textContent = this.productosActivos.length;
            countActivos.offsetHeight; // Force reflow
            countActivos.classList.add('count-badge');
        }

        if (countEliminados) {
            countEliminados.classList.remove('count-badge');
            countEliminados.textContent = this.productosEliminados.length;
            countEliminados.offsetHeight; // Force reflow
            countEliminados.classList.add('count-badge');
        }
    }

    switchToActiveProducts() {
        if (this.currentView === 'activos') return;

        this.currentView = 'activos';
        this.currentPage = 0;
        this.updateFilterButtons();
        this.loadProductos();
    }

    switchToDeletedProducts() {
        if (this.currentView === 'eliminados') return;

        this.currentView = 'eliminados';
        this.currentPage = 0;
        this.updateFilterButtons();
        this.loadProductos();
    }

    updateFilterButtons() {
        const btnActivos = document.getElementById('btnProductosActivos');
        const btnEliminados = document.getElementById('btnProductosEliminados');

        if (this.currentView === 'activos') {
            btnActivos.classList.add('active');
            btnEliminados.classList.remove('active');

            const countActivos = btnActivos.querySelector('#countActivos');
            const countEliminados = btnEliminados.querySelector('#countEliminados');
            if (countActivos) {
                countActivos.className = 'count-badge ml-1 bg-white text-brand-brown px-1.5 py-0.5 rounded text-xs font-bold';
            }
            if (countEliminados) {
                countEliminados.className = 'count-badge ml-1 bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded text-xs font-bold';
            }
        } else {
            btnActivos.classList.remove('active');
            btnEliminados.classList.add('active');

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

    renderProductos() {
        const container = document.getElementById('productosListContainer');
        if (!container) return;

        if (this.filteredProductos.length === 0) {
            const searchTerm = document.getElementById('productoSearchInput')?.value;
            const emptyMessage = searchTerm ?
                `No se encontraron productos que coincidan con "${searchTerm}".` :
                `No hay productos ${this.currentView === 'eliminados' ? 'eliminados' : 'registrados'}.`;

            container.innerHTML = `
                <div class="text-center py-8 md:py-12 col-span-full">
                    <div class="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-box-open text-2xl md:text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-base md:text-lg font-medium text-gray-900 mb-2">Sin productos</h3>
                    <p class="text-gray-600 mb-4 md:mb-6 text-sm md:text-base px-4">${emptyMessage}</p>
                    ${!searchTerm && this.currentView === 'activos' ? `
<!--                        <button onclick="productosManager.newProducto()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown text-sm md:text-base">-->
<!--                            <i class="fas fa-plus mr-2"></i>Agregar Primer Producto-->
<!--                        </button>-->
                    ` : searchTerm ? `
                        <button onclick="document.getElementById('productoSearchInput').value = ''; productosManager.filterProductos();" class="text-brand-brown hover:text-brand-light-brown text-sm md:text-base">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    ` : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredProductos.map(producto => this.renderProductoCard(producto)).join('');
    }

    renderProductoCard(producto) {
        // Adaptive button rendering based on screen size and product status
        const buttonsHtml = this.isMobile ? this.renderMobileButtons(producto) :
                           this.isTablet ? this.renderTabletButtons(producto) :
                           this.renderDesktopButtons(producto);

        // Manejar la imagen del producto
        const hasImage = producto.fotoUrl && producto.fotoUrl.trim() && producto.fotoUrl !== 'null';
        const imageHtml = hasImage ?
            `<img src="${producto.fotoUrl}" 
                 class="object-cover w-full h-full" 
                 alt="${producto.nombre || 'Producto'}"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="hidden absolute inset-0 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                 <i class="fas fa-image text-3xl mb-2"></i>
                 <span class="text-sm">Sin imagen</span>
             </div>` :
            `<div class="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                 <i class="fas fa-image text-3xl mb-2"></i>
                 <span class="text-sm">Sin imagen</span>
             </div>`;

        return `
            <div class="producto-card flex flex-col h-full w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-h-[280px] 
                sm:min-h-[300px] md:min-h-[320px] lg:min-h-[340px] xl:min-h-[360px] 
                ${this.isMobile ? 'max-w-full' : 'max-w-[420px] xl:max-w-[480px]'}
                ${producto.eliminado ? 'opacity-75 border-red-200' : ''}
                ">
                <div class="flex-1 flex flex-col">
                    <!-- Imagen del producto -->
                    <div class="w-full aspect-[16/9] bg-gray-100 rounded-t-xl border-b border-gray-200 overflow-hidden flex items-center justify-center relative">
                        ${imageHtml}
                        ${producto.eliminado ? `
                            <div class="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                                <span class="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">ELIMINADO</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Información del producto -->
                    <div class="flex-1 flex flex-col p-3 sm:p-4 md:p-4">
                        <div class="flex items-start justify-between mb-2">
                            <h3 class="text-base md:text-lg font-semibold text-gray-900 truncate max-w-[70%]">
                                ${producto.nombre || 'Sin nombre'}
                            </h3>
                        </div>
                        
                        <div class="flex-1 flex flex-col gap-1 mt-1">
                            <div class="flex items-center text-sm text-gray-600">
                                <span class="w-4 h-4 flex items-center justify-center mr-2 flex-shrink-0">
                                    <i class="fas fa-tag text-gray-400 text-xs"></i>
                                </span>
                                <span class="truncate">${producto.tipo || 'N/A'}</span>
                            </div>
                            
                            ${!this.isMobile && producto.descripcion ? `
                            <div class="flex items-start text-sm text-gray-600">
                                <span class="w-4 h-4 flex items-center justify-center mr-2 flex-shrink-0 pt-0.5">
                                    <i class="fas fa-align-left text-gray-400 text-xs"></i>
                                </span>
                                <span class="text-xs leading-relaxed line-clamp-2">${producto.descripcion}</span>
                            </div>
                            ` : ''}
                            
                            <div class="flex items-center justify-between mt-2">
                                <div class="text-brand-brown font-bold text-lg">
                                    $${producto.precioVenta ? Number(producto.precioVenta).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : '0.00'}
                                </div>
                                ${!this.isMobile ? `
                                <div class="text-xs text-gray-500">
                                    Costo: $${producto.precioCompra ? Number(producto.precioCompra).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : '0.00'}
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="mt-4 pt-3 border-t border-gray-100">
                            ${buttonsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderMobileButtons(producto) {
        if (producto.eliminado) {
            return `
                <div class="space-y-2">
                    <div class="grid grid-cols-2 gap-2">
                        <button 
                            data-id="${producto.id}" 
                            class="ver-btn flex items-center justify-center gap-1.5 bg-brand-brown text-white px-3 py-2.5 rounded-lg hover:bg-brand-light-brown transition-colors text-sm font-medium"
                            title="Ver detalles"
                        >
                            <i class="fas fa-eye text-xs"></i>
                            <span>Ver</span>
                        </button>
                        <button 
                            data-id="${producto.id}" 
                            class="reactivate-btn flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            title="Reactivar producto"
                        >
                            <i class="fas fa-undo text-xs"></i>
                            <span>Reactivar</span>
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="space-y-2">
                <div class="grid grid-cols-2 gap-2">
                    <button 
                        data-id="${producto.id}" 
                        class="ver-btn flex items-center justify-center gap-1.5 bg-brand-brown text-white px-3 py-2.5 rounded-lg hover:bg-brand-light-brown transition-colors text-sm font-medium"
                        title="Ver detalles"
                    >
                        <i class="fas fa-eye text-xs"></i>
                        <span>Ver</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderTabletButtons(producto) {
        if (producto.eliminado) {
            return `
                <div class="flex flex-wrap gap-1.5 justify-center">
                    <button 
                        data-id="${producto.id}" 
                        class="ver-btn flex items-center gap-1 bg-brand-brown text-white px-2.5 py-1.5 rounded-md hover:bg-brand-light-brown transition-colors text-xs font-medium"
                        title="Ver detalles"
                    >
                        <i class="fas fa-eye"></i>
                        <span>Ver</span>
                    </button>
                    <button 
                        data-id="${producto.id}" 
                        class="reactivate-btn flex items-center gap-1 bg-green-600 text-white px-2.5 py-1.5 rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                        title="Reactivar producto"
                    >
                        <i class="fas fa-undo"></i>
                        <span>Reactivar</span>
                    </button>
                </div>
            `;
        }

        return `
            <div class="flex flex-wrap gap-1.5 justify-center">
                <button 
                    data-id="${producto.id}" 
                    class="ver-btn flex items-center gap-1 bg-brand-brown text-white px-2.5 py-1.5 rounded-md hover:bg-brand-light-brown transition-colors text-xs font-medium"
                    title="Ver detalles"
                >
                    <i class="fas fa-eye"></i>
                    <span>Ver</span>
                </button>
            </div>
        `;
    }

    renderDesktopButtons(producto) {
        if (producto.eliminado) {
            return `
                <div class="flex flex-wrap gap-2">
                    <button 
                        data-id="${producto.id}" 
                        class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-sm font-medium"
                        title="Ver detalles"
                    >
                        <i class="fas fa-eye"></i>
                        <span>Detalles</span>
                    </button>
                    <button 
                        data-id="${producto.id}" 
                        class="reactivate-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
                        title="Reactivar producto"
                    >
                        <i class="fas fa-undo"></i>
                        <span>Reactivar</span>
                    </button>
                </div>
            `;
        }

        return `
            <div class="flex flex-wrap gap-2">
                <button 
                    data-id="${producto.id}" 
                    class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-sm font-medium"
                    title="Ver detalles"
                >
                    <i class="fas fa-eye"></i>
                    <span>Detalles</span>
                </button>
            </div>
        `;
    }

    renderPagination() {
        let pagContainer = document.getElementById('productosPagination');
        if (!pagContainer) {
            pagContainer = document.createElement('div');
            pagContainer.id = 'productosPagination';
            pagContainer.className = 'flex justify-center mt-6';
            document.getElementById('productosListContainer').after(pagContainer);
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
                    this.loadProductos();
                } else if (val === 'next' && this.currentPage < this.totalPages - 1) {
                    this.currentPage++;
                    this.loadProductos();
                } else if (!isNaN(val)) {
                    const page = parseInt(val);
                    if (page !== this.currentPage) {
                        this.currentPage = page;
                        this.loadProductos();
                    }
                }
            };
        });
    }

    filterProductos() {
        const searchTerm = document.getElementById('productoSearchInput')?.value || '';
        this.tableViewManager.filterData(searchTerm);
        this.currentPage = 0;
        this.loadProductos();
    }

    // newProducto() {
    //     this.currentProducto = null;
    //     this.clearForm();
    //     document.getElementById('modalProductoTitle').textContent = 'Nuevo Producto';
    //     document.getElementById('btnProductoIcon').className = 'fas fa-plus mr-2';
    //     document.getElementById('btnProductoText').textContent = 'Crear Producto';
    //     document.getElementById('modalProducto').classList.remove('hidden');
    //     document.getElementById('productoNombre').disabled = false;
    // }

    async verProducto(id) {
        const allProductos = [...this.productosActivos, ...this.productosEliminados];
        const producto = allProductos.find(p => String(p.id) === String(id));
        if (!producto) {
            window.showToast('Producto no encontrado.', 'error');
            return;
        }

        // Manejar la imagen del producto en el modal de detalles
        const detalleImg = document.getElementById('detalleProductoImg');
        const imgContainer = detalleImg ? detalleImg.parentElement : null;
        // Limpiar cualquier placeholder anterior
        if (imgContainer) {
            // Restaurar solo la imagen y eliminar otros nodos (placeholders)
            imgContainer.innerHTML = '';
            imgContainer.appendChild(detalleImg);
        }
        // Resetear la imagen a la de placeholder por defecto
        if (detalleImg) {
            detalleImg.style.display = '';
            detalleImg.src = '/images/product-placeholder.png';
            detalleImg.alt = 'Foto producto';
        }

        const hasImage = producto.fotoUrl && producto.fotoUrl.trim() && producto.fotoUrl !== 'null';
        if (detalleImg) {
            if (hasImage) {
                detalleImg.src = producto.fotoUrl;
                detalleImg.alt = producto.nombre || 'Producto';
                detalleImg.onerror = function() {
                    this.style.display = 'none';
                    if (this.parentElement) {
                        // Eliminar cualquier placeholder anterior
                        Array.from(this.parentElement.children).forEach(child => {
                            if (child !== this) this.parentElement.removeChild(child);
                        });
                        this.parentElement.innerHTML += `
                            <div class="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                <i class="fas fa-image text-6xl mb-4"></i>
                                <span class="text-lg">Sin imagen disponible</span>
                            </div>
                        `;
                    }
                };
                detalleImg.style.display = '';
            } else {
                // Si no hay imagen, ocultar el <img> y mostrar el placeholder
                detalleImg.style.display = 'none';
                if (detalleImg.parentElement) {
                    // Eliminar cualquier placeholder anterior
                    Array.from(detalleImg.parentElement.children).forEach(child => {
                        if (child !== detalleImg) detalleImg.parentElement.removeChild(child);
                    });
                    detalleImg.parentElement.innerHTML += `
                        <div class="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <i class="fas fa-image text-6xl mb-4"></i>
                            <span class="text-lg">Sin imagen disponible</span>
                        </div>
                    `;
                }
            }
        }

        // Llenar datos
        document.getElementById('detalleProductoNombre').textContent = producto.nombre || 'Sin nombre';
        document.getElementById('detalleProductoCodigo').textContent = producto.codigo || 'Sin código';
        document.getElementById('detalleProductoTipo').textContent = producto.tipo || 'N/A';
        document.getElementById('detalleProductoDescripcion').textContent = producto.descripcion || 'N/A';
        document.getElementById('detalleProductoPrecioVenta').textContent =
            `$${producto.precioVenta ? Number(producto.precioVenta).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : '0.00'}`;
        // document.getElementById('detalleProductoPrecioCompra').textContent =
        //     `$${producto.precioCompra ? Number(producto.precioCompra).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : '0.00'}`;

        // Mostrar modal
        this.currentProducto = producto;
        document.getElementById('modalVerProducto').classList.remove('hidden');
    }

    async editProducto(id) {
        const allProductos = [...this.productosActivos, ...this.productosEliminados];
        const producto = allProductos.find(p => String(p.id) === String(id));
        if (!producto) {
            window.showToast('Producto no encontrado.', 'error');
            return;
        }
        this.currentProducto = producto;
        this.fillForm(producto);
        document.getElementById('modalProductoTitle').textContent = 'Editar Producto';
        document.getElementById('btnProductoIcon').className = 'fas fa-save mr-2';
        document.getElementById('btnProductoText').textContent = 'Actualizar Producto';
        document.getElementById('productoNombre').disabled = false;
        document.getElementById('modalProducto').classList.remove('hidden');
    }

    // async deleteProducto(id) {
    //     if (!confirm(`¿Estás seguro de que deseas eliminar el producto?`)) return;
    //     try {
    //         await this.productoService.deleteProducto(id);
    //         window.showToast('Producto eliminado exitosamente.', 'success');
    //         await this.loadProductos();
    //     } catch (error) {
    //         window.showToast('Error al eliminar el producto.', 'error');
    //     }
    // }

    async reactivateProducto(id) {
        if (!confirm(`¿Estás seguro de que deseas reactivar el producto?`)) return;
        try {
            await this.productoService.reactivateProducto(id);
            window.showToast('Producto reactivado exitosamente.', 'success');
            await this.loadProductos();
        } catch (error) {
            window.showToast('Error al reactivar el producto.', 'error');
        }
    }

    async handleSubmitProducto(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Determinar el tipo final del producto
        let tipoFinal = formData.get('tipo');
        if (tipoFinal === 'otro') {
            const otroTipo = formData.get('otroTipo');
            if (otroTipo && otroTipo.trim()) {
                tipoFinal = otroTipo.trim().toLowerCase();
            } else {
                showError('productoTipo', 'Debe especificar el tipo de producto');
                return;
            }
        }

        const productoData = {
            nombre: formData.get('nombre'),
            tipo: tipoFinal,
            descripcion: formData.get('descripcion'),
            precioVenta: formData.get('precioVenta') ? parseFloat(formData.get('precioVenta')) : null,
            precioCompra: formData.get('precioCompra') ? parseFloat(formData.get('precioCompra')) : null,
        };

        // Foto (base64)
        const fotoInput = document.getElementById('productoFoto');
        if (fotoInput && fotoInput.files.length > 0) {
            productoData.fotoBase64 = await this.getBase64(fotoInput.files[0]);
        } else if (this.currentProducto && this.currentProducto.fotoUrl) {
            productoData.fotoBase64 = this.currentProducto.fotoUrl;
        }

        if (!validateFormProducto(productoData)) {
            return;
        }

        try {
            if (this.currentProducto) {
                await this.productoService.updateProducto(this.currentProducto.id, productoData);
                window.showToast('Producto actualizado exitosamente.', 'success');
            } else {
                await this.productoService.createProducto(productoData);
                window.showToast('Producto creado exitosamente.', 'success');
            }
            this.cerrarModalProducto();
            // Recargar tipos de productos para incluir el nuevo tipo si se agregó uno
            await this.loadTiposProductos();
            await this.loadProductos();
        } catch (error) {
            window.showToast('Error al guardar el producto.', 'error');
        }
    }

    clearForm() {
        document.getElementById('formProducto').reset();
        document.getElementById('productoFotoPreview').src = "#";
        document.getElementById('productoFotoPreview').classList.add('hidden');

        // Resetear el campo "otro tipo" específicamente
        const otroTipoContainer = document.getElementById('otroTipoContainer');
        const otroTipoInput = document.getElementById('otroTipoInput');

        if (otroTipoContainer && otroTipoInput) {
            otroTipoContainer.classList.add('hidden');
            otroTipoInput.required = false;
            otroTipoInput.value = '';
        }

        [
            'productoNombreError', 'productoTipoError', 'productoDescripcionError',
            'productoPrecioVentaError', 'productoPrecioCompraError'
        ].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = '';
                el.classList.add('hidden');
            }
        });
    }

    fillForm(producto) {
        document.getElementById('productoNombre').value = producto.nombre || '';

        // Manejar el tipo de producto correctamente
        const productoTipoSelect = document.getElementById('productoTipo');
        const otroTipoContainer = document.getElementById('otroTipoContainer');
        const otroTipoInput = document.getElementById('otroTipoInput');

        // Verificar si el tipo existe en las opciones del select
        const tipoProducto = producto.tipo ? producto.tipo.toLowerCase() : '';
        const existeEnSelect = [...productoTipoSelect.options].some(option => option.value === tipoProducto);

        if (existeEnSelect) {
            productoTipoSelect.value = tipoProducto;
            otroTipoContainer.classList.add('hidden');
            otroTipoInput.required = false;
            otroTipoInput.value = '';
        } else if (tipoProducto) {
            // Si el tipo no existe en el select, usar "otro"
            productoTipoSelect.value = 'otro';
            otroTipoContainer.classList.remove('hidden');
            otroTipoInput.required = true;
            otroTipoInput.value = producto.tipo;
        } else {
            productoTipoSelect.value = '';
            otroTipoContainer.classList.add('hidden');
            otroTipoInput.required = false;
            otroTipoInput.value = '';
        }

        document.getElementById('productoDescripcion').value = producto.descripcion || '';
        document.getElementById('productoPrecioVenta').value = producto.precioVenta || '';
        document.getElementById('productoPrecioCompra').value = producto.precioCompra || '';

        if (producto.fotoUrl) {
            document.getElementById('productoFotoPreview').src = producto.fotoUrl;
            document.getElementById('productoFotoPreview').classList.remove('hidden');
        } else {
            document.getElementById('productoFotoPreview').src = "#";
            document.getElementById('productoFotoPreview').classList.add('hidden');
        }
    }

    cerrarModalProducto() {
        document.getElementById('modalProducto').classList.add('hidden');
        this.clearForm();
        this.currentProducto = null;
    }

    cerrarModalVerProducto() {
        document.getElementById('modalVerProducto').classList.add('hidden');
        this.currentProducto = null;
    }

    editarProductoDesdeDetalle() {
        if (this.currentProducto) {
            this.cerrarModalVerProducto();
            this.editProducto(this.currentProducto.id);
        }
    }

    previewFoto(e) {
        const input = e.target;
        const preview = document.getElementById('productoFotoPreview');
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                preview.src = ev.target.result;
                preview.classList.remove('hidden');
            }
            reader.readAsDataURL(input.files[0]);
        } else {
            preview.src = "#";
            preview.classList.add('hidden');
        }
    }

    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    showLoading() {
        const container = document.getElementById('productosListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Consultando información de productos...</p>
                    <p class="text-gray-500 text-sm mt-2">Un momento, por favor</p>
                </div>
            `;
        }
    }

    hideLoading() {}
}
const productosManager = new ProductosManager();
window.productosManager = productosManager;

// Make table view manager available globally
window.tableViewManager = productosManager.tableViewManager;

window.cerrarModalProducto = () => productosManager.cerrarModalProducto();
window.cerrarModalVerProducto = () => productosManager.cerrarModalVerProducto();
window.editarProductoDesdeDetalle = () => productosManager.editarProductoDesdeDetalle();

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
function validateFormProducto(data) {
    let valid = true;
    ['productoNombre', 'productoTipo', 'productoPrecioVenta', 'productoPrecioCompra'].forEach(field => clearError(field));
    if (!data.nombre) {
        showError('productoNombre', 'El nombre es obligatorio');
        valid = false;
    }
    if (!data.tipo) {
        showError('productoTipo', 'El tipo es obligatorio');
        valid = false;
    }
    if (data.precioVenta == null || data.precioVenta === '') {
        showError('productoPrecioVenta', 'El precio de venta es obligatorio');
        valid = false;
    } else if (isNaN(data.precioVenta) || data.precioVenta < 0) {
        showError('productoPrecioVenta', 'El precio de venta debe ser mayor o igual a 0');
        valid = false;
    }
    if (data.precioCompra == null || data.precioCompra === '') {
        showError('productoPrecioCompra', 'El precio de compra es obligatorio');
        valid = false;
    } else if (isNaN(data.precioCompra) || data.precioCompra < 0) {
        showError('productoPrecioCompra', 'El precio de compra debe ser mayor o igual a 0');
        valid = false;
    }
    return valid;
}