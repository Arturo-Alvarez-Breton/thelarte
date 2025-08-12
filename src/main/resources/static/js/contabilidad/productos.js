import { TransaccionService } from '../services/transaccionService.js';

class ProductosManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.productos = [];
        this.filteredProductos = [];
        this.currentPage = 0;
        this.productosPerPage = 10;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadProductos();
    }

    setupEventListeners() {
        document.getElementById('productSearchInput')?.addEventListener('keyup', () => this.filterProducts());
    }

    async loadProductos() {
        this.showLoading();
        try {
            const filters = {
                busqueda: document.getElementById('productSearchInput')?.value || null,
                page: this.currentPage,
                size: this.productosPerPage
            };
            this.productos = await this.transaccionService.getProductosParaVenta(filters.busqueda, null, filters.page, filters.size);
            this.filteredProductos = [...this.productos];
            this.renderProductos();
        } catch (error) {
            console.error('Error loading products:', error);
            // Show empty state instead of error for no data scenarios
            this.productos = [];
            this.filteredProductos = [];
            this.renderProductos();
        } finally {
            this.hideLoading();
        }
    }

    renderProductos() {
        const container = document.getElementById('productosListContainer');
        if (!container) return;

        if (this.filteredProductos.length === 0) {
            const searchTerm = document.getElementById('productSearchInput')?.value;
            const emptyMessage = searchTerm ?
                `No se encontraron productos que coincidan con "${searchTerm}".` :
                'No hay productos disponibles en el inventario.';

            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-box-open text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Sin productos</h3>
                    <p class="text-gray-600 mb-6">${emptyMessage}</p>
                    ${searchTerm ? `
                        <button onclick="document.getElementById('productSearchInput').value = ''; productosManager.filterProducts();" class="text-brand-brown hover:text-brand-light-brown">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    ` : `
                        <p class="text-sm text-gray-500">Los productos son gestionados por el administrador del sistema.</p>
                    `}
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredProductos.map(product => `
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold">${product.nombre}</h3>
                <p class="text-gray-600">Código: ${product.codigo}</p>
                <p class="text-gray-600">Categoría: ${product.categoria}</p>
                <p class="text-gray-600">Precio: ${this.formatCurrency(product.precioVenta)}</p>
                <p class="text-gray-600">Stock: ${product.cantidadDisponible}</p>
                <div class="mt-4 flex space-x-2">
                    <button onclick="productosManager.verProducto(${product.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ver Detalles</button>
                </div>
            </div>
        `).join('');
    }

    filterProducts() {
        this.currentPage = 0;
        this.loadProductos();
    }

    async verProducto(id) {
        try {
            const producto = this.productos.find(p => p.id === id);
            if (!producto) {
                window.showToast('Producto no encontrado.', 'error');
                return;
            }

            document.getElementById('detallesProducto').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Nombre</label>
                        <p class="mt-1 text-sm text-gray-900">${producto.nombre}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Código</label>
                        <p class="mt-1 text-sm text-gray-900">${producto.codigo}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Categoría</label>
                        <p class="mt-1 text-sm text-gray-900">${producto.categoria || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Precio Compra</label>
                        <p class="mt-1 text-sm text-gray-900">${this.formatCurrency(producto.precioCompra)}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Precio Venta</label>
                        <p class="mt-1 text-sm text-gray-900">${this.formatCurrency(producto.precioVenta)}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Stock Disponible</label>
                        <p class="mt-1 text-sm text-gray-900">${producto.cantidadDisponible}</p>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Descripción</label>
                        <p class="mt-1 text-sm text-gray-900">${producto.descripcion || 'N/A'}</p>
                    </div>
                </div>
            `;

            this.currentProducto = producto;
            document.getElementById('modalVerProducto').classList.remove('hidden');
        } catch (error) {
            console.error('Error viewing product:', error);
            window.showToast('Error al mostrar los detalles del producto.', 'error');
        }
    }

    cerrarModalVerProducto() {
        document.getElementById('modalVerProducto').classList.add('hidden');
        this.currentProducto = null;
    }

    showLoading() {
        const container = document.getElementById('productosListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Consultando inventario de productos...</p>
                    <p class="text-gray-500 text-sm mt-2">Un momento, por favor</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Content will replace the loading spinner, no need for explicit hiding
    }

    showError(message) {
        const container = document.getElementById('productosListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="productosManager.loadProductos()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                        <i class="fas fa-refresh mr-2"></i>Reintentar
                    </button>
                </div>
            `;
        }
    }

    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    }
}

const productosManager = new ProductosManager();
window.productosManager = productosManager;

// Funciones globales para los event handlers de los modales
window.cerrarModalVerProducto = () => productosManager.cerrarModalVerProducto();