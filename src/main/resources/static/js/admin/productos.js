import { ProductoService } from '../services/productoService.js';

class ProductosManager {
    constructor() {
        this.productoService = new ProductoService();
        this.productos = [];
        this.filteredProductos = [];
        this.currentProducto = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadProductos();
    }

    setupEventListeners() {
        document.getElementById('nuevoProductoBtn')?.addEventListener('click', () => this.newProducto());
        document.getElementById('productoSearchInput')?.addEventListener('input', () => this.filterProductos());
        document.getElementById('productoTipoFilter')?.addEventListener('change', () => this.filterProductos());
        document.getElementById('formProducto')?.addEventListener('submit', (e) => this.handleSubmitProducto(e));
        document.getElementById('productosListContainer')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('ver-btn')) {
                const id = e.target.dataset.id;
                this.verProducto(id);
            }
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                this.editProducto(id);
            }
            if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;
                this.deleteProducto(id);
            }
        });
        document.getElementById('productoFoto')?.addEventListener('change', (e) => this.previewFoto(e));
    }

    async loadProductos() {
        this.showLoading();
        try {
            const allProductos = await this.productoService.getProductos();
            const searchValue = (document.getElementById('productoSearchInput')?.value || '').trim().toLowerCase();
            const tipoValue = (document.getElementById('productoTipoFilter')?.value || '').trim().toLowerCase();
            let filtered = allProductos;
            if (tipoValue) {
                filtered = filtered.filter(p => p.tipo && p.tipo.toLowerCase() === tipoValue);
            }
            if (searchValue) {
                filtered = filtered.filter(p =>
                    (p.nombre && p.nombre.toLowerCase().includes(searchValue)) ||
                    (p.descripcion && p.descripcion.toLowerCase().includes(searchValue))
                );
            }
            this.filteredProductos = filtered;
            this.productos = allProductos;
            this.renderProductos();
        } catch (error) {
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
            const searchTerm = document.getElementById('productoSearchInput')?.value;
            const emptyMessage = searchTerm ?
                `No se encontraron productos que coincidan con "${searchTerm}".` :
                'No hay productos registrados.';
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-box-open text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Sin productos</h3>
                    <p class="text-gray-600 mb-6">${emptyMessage}</p>
                    ${!searchTerm ? `
                        <button onclick="productosManager.newProducto()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                            <i class="fas fa-plus mr-2"></i>Agregar Primer Producto
                        </button>
                    ` : `
                        <button onclick="document.getElementById('productoSearchInput').value = ''; productosManager.filterProductos();" class="text-brand-brown hover:text-brand-light-brown">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    `}
                </div>
            `;
            return;
        }
        container.innerHTML = this.filteredProductos.map(p => `
            <div class="bg-white rounded-lg shadow-md p-4 flex flex-col">
                <div class="flex items-center gap-4 mb-2">
                    <img src="${p.fotoUrl || '/images/product-placeholder.png'}" class="w-24 h-16 object-cover rounded-lg border border-gray-200 bg-gray-100" alt="${p.nombre || 'Producto'}">
                    <div>
                        <h3 class="text-lg font-semibold">${p.nombre || 'Sin nombre'}</h3>
                        <p class="text-gray-600">Tipo: ${p.tipo || 'N/A'}</p>
                        <p class="text-gray-600 text-sm">${p.descripcion || ''}</p>
                    </div>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-brand-brown font-bold text-lg">$${p.precioVenta ? Number(p.precioVenta).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : '0.00'}</span>
                    <div class="flex space-x-2">
                        <button data-id="${p.id}" class="ver-btn bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ver Detalles</button>
                        <button data-id="${p.id}" class="edit-btn bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Editar</button>
                        <button data-id="${p.id}" class="delete-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterProductos() {
        this.loadProductos();
    }

    newProducto() {
        this.currentProducto = null;
        this.clearForm();
        document.getElementById('modalProductoTitle').textContent = 'Nuevo Producto';
        document.getElementById('btnProductoIcon').className = 'fas fa-plus mr-2';
        document.getElementById('btnProductoText').textContent = 'Crear Producto';
        document.getElementById('modalProducto').classList.remove('hidden');
        document.getElementById('productoNombre').disabled = false;
    }

    async verProducto(id) {
        const producto = this.productos.find(p => String(p.id) === String(id));
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
                    <label class="block text-sm font-medium text-gray-700">Tipo</label>
                    <p class="mt-1 text-sm text-gray-900">${producto.tipo}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Descripción</label>
                    <p class="mt-1 text-sm text-gray-900">${producto.descripcion || 'N/A'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Precio Venta</label>
                    <p class="mt-1 text-sm text-gray-900">$${producto.precioVenta ? Number(producto.precioVenta).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : '0.00'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Precio Compra</label>
                    <p class="mt-1 text-sm text-gray-900">$${producto.precioCompra ? Number(producto.precioCompra).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : '0.00'}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Foto</label>
                    <div class="mt-1">
                        <img src="${producto.fotoUrl || '/images/product-placeholder.png'}" class="w-32 h-24 object-cover rounded-lg border border-gray-200 bg-gray-100" alt="Foto producto">
                    </div>
                </div>
                <div class="md:col-span-2 flex justify-end mt-6">
                    <button onclick="productosManager.editProducto('${producto.id}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-edit mr-2"></i>
                        Editar
                    </button>
                </div>
            </div>
        `;
        this.currentProducto = producto;
        document.getElementById('modalVerProducto').classList.remove('hidden');
    }

    async editProducto(id) {
        const producto = this.productos.find(p => String(p.id) === String(id));
        if (!producto) {
            window.showToast('Producto no encontrado.', 'error');
            return;
        }
        this.currentProducto = producto;
        this.fillForm(producto);
        document.getElementById('modalProductoTitle').textContent = 'Editar Producto';
        document.getElementById('btnProductoIcon').className = 'fas fa-save mr-2';
        document.getElementById('btnProductoText').textContent = 'Actualizar Producto';
        document.getElementById('productoNombre').disabled = true;
        document.getElementById('modalProducto').classList.remove('hidden');
    }

    async deleteProducto(id) {
        if (!confirm(`¿Estás seguro de que deseas eliminar el producto?`)) return;
        try {
            await this.productoService.deleteProducto(id);
            window.showToast('Producto eliminado exitosamente.', 'success');
            await this.loadProductos();
        } catch (error) {
            window.showToast('Error al eliminar el producto.', 'error');
        }
    }

    async handleSubmitProducto(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const productoData = {
            nombre: formData.get('nombre'),
            tipo: formData.get('tipo'),
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
            await this.loadProductos();
        } catch (error) {
            window.showToast('Error al guardar el producto.', 'error');
        }
    }

    clearForm() {
        document.getElementById('formProducto').reset();
        document.getElementById('productoFotoPreview').src = "#";
        document.getElementById('productoFotoPreview').classList.add('hidden');
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
        document.getElementById('productoTipo').value = producto.tipo || '';
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