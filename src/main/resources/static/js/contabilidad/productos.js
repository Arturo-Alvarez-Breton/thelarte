// src/main/resources/static/js/contabilidad/productos.js

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
        document.getElementById('nuevoProductoBtn')?.addEventListener('click', () => this.newProduct());
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
            window.showToast('Error al cargar los productos.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderProductos() {
        const container = document.getElementById('productosListContainer');
        if (!container) return;

        if (this.filteredProductos.length === 0) {
            container.innerHTML = '<p class="text-gray-600">No hay productos disponibles.</p>';
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
                    <button onclick="productosManager.editProduct(${product.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Editar</button>
                    <button onclick="productosManager.deleteProduct(${product.id})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    filterProducts() {
        this.currentPage = 0;
        this.loadProductos();
    }

    newProduct() {
        window.showToast('Funcionalidad para añadir nuevo producto en desarrollo.', 'info');
    }

    editProduct(id) {
        window.showToast(`Funcionalidad para editar producto ${id} en desarrollo.`, 'info');
    }

    async deleteProduct(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            try {
                // Assuming a deleteProduct method exists in TransaccionService or a new ProductoService
                // await this.transaccionService.deleteProduct(id);
                window.showToast('Producto eliminado exitosamente (simulado).', 'success');
                this.loadProductos();
            } catch (error) {
                console.error('Error deleting product:', error);
                window.showToast('Error al eliminar el producto.', 'error');
            }
        }
    }

    showLoading() {
        document.getElementById('productosListContainer').innerHTML = '<div class="flex items-center justify-center py-12"><div class="animate-spin h-8 w-8 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';
    }

    hideLoading() {
        // No specific hide loading for now, as content replaces spinner
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
