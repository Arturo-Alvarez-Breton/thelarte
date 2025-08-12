// src/main/resources/static/js/contabilidad/productos.js

import { ProductoService } from '../services/productoService.js';
import { TableViewManager } from '../components/tableView.js';

class ProductosManager {
    constructor() {
        this.productoService = new ProductoService();
        this.productos = [];
        this.filteredProductos = [];
        this.currentProducto = null;
        this.tableViewManager = new TableViewManager('#productosListContainer', {
            columns: [
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
                },
                {
                    header: 'Estado',
                    field: 'estado',
                    formatter: (value) => {
                        const estados = {
                            'DISPONIBLE': '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Disponible</span>',
                            'AGOTADO': '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Agotado</span>',
                            'DESCONTINUADO': '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Descontinuado</span>'
                        };
                        return estados[value] || 'N/A';
                    }
                }
            ],
            actions: [
                {
                    icon: 'fas fa-eye',
                    handler: 'productosManager.verProducto',
                    className: 'text-brand-brown hover:text-brand-light-brown',
                    title: 'Ver detalles'
                },
                {
                    icon: 'fas fa-exchange-alt',
                    handler: 'productosManager.verMovimientosProducto',
                    className: 'text-blue-600 hover:text-blue-700',
                    title: 'Movimientos'
                },
                {
                    icon: 'fas fa-edit',
                    handler: 'productosManager.editProducto',
                    className: 'text-green-600 hover:text-green-700',
                    title: 'Editar'
                },
                {
                    icon: 'fas fa-trash-alt',
                    handler: 'productosManager.deleteProducto',
                    className: 'text-red-600 hover:text-red-700',
                    title: 'Eliminar'
                }
            ],
            searchFields: ['nombre', 'tipo', 'descripcion', 'codigo'],
            idField: 'id',
            emptyIcon: 'fas fa-box-open'
        });

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
            if (e.target.classList.contains('movimientos-btn')) {
                const id = e.target.dataset.id;
                this.verMovimientosProducto(id);
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
            this.tableViewManager.setData(allProductos);
            this.renderProductos();
        } catch (error) {
            this.productos = [];
            this.filteredProductos = [];
            this.tableViewManager.setData([]);
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
                <div class="w-full aspect-[16/9] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center mb-4">
                    <img src="${p.fotoUrl || '/images/product-placeholder.png'}" class="object-cover w-full h-full" alt="${p.nombre || 'Producto'}">
                </div>
                <div class="flex-1 flex flex-col justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">${p.nombre || 'Sin nombre'}</h3>
                    <p class="text-gray-600 mb-1">Tipo: ${p.tipo || 'N/A'}</p>
                    <p class="text-gray-600 text-sm mb-2">${p.descripcion || ''}</p>
                    <div class="mt-auto flex flex-wrap gap-2 items-center justify-between">
                        <span class="text-brand-brown font-bold text-lg">$${p.precioVenta ? Number(p.precioVenta).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : '0.00'}</span>
                        <div class="flex flex-wrap gap-2">
                            <button 
                                data-id="${p.id}"
                                class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm"
                                title="Ver detalles"
                            >
                                <i class="fas fa-eye"></i> Detalles
                            </button>
                            <button 
                                data-id="${p.id}"
                                class="movimientos-btn flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                title="Movimientos"
                            >
                                <i class="fas fa-exchange-alt"></i> Movimientos
                            </button>
                            <button 
                                data-id="${p.id}"
                                class="edit-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                title="Editar producto"
                            >
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button 
                                data-id="${p.id}"
                                class="delete-btn flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                title="Eliminar producto"
                            >
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async handleMovimientoProducto(e, producto) {
        e.preventDefault();
        const tipo = document.getElementById('movimientoTipo').value;
        const cantidad = parseInt(document.getElementById('movimientoCantidad').value, 10);
        const motivo = document.getElementById('movimientoObservacion').value;
        if (!tipo || !cantidad || cantidad <= 0) {
            window.showToast('Debes seleccionar un tipo de movimiento y una cantidad válida.', 'error');
            return;
        }
        // Lógica para actualizar el producto (deberías llamar a un endpoint/método backend para registrar movimiento)
        try {
            await this.productoService.registrarMovimientoProducto(producto.id, { tipo, cantidad, motivo });
            window.showToast('Movimiento registrado correctamente.', 'success');
            this.cerrarModalMovimientos();
            await this.loadProductos();
        } catch (error) {
            window.showToast('Error al registrar el movimiento.', 'error');
        }
    }

    cerrarModalMovimientos() {
        document.getElementById('modalMovimientosProducto').classList.add('hidden');
        document.getElementById('movimientosProductoTitle').textContent = '';
        document.getElementById('movimientosProductoBody').innerHTML = '';
    }

    // ... resto del código igual ...
    // (no se han modificado las funciones existentes)

    filterProductos() {
        const searchTerm = document.getElementById('productoSearchInput')?.value || '';
        const tipoFilter = document.getElementById('productoTipoFilter')?.value || '';
        const additionalFilters = {};
        if (tipoFilter) {
            additionalFilters.tipo = tipoFilter;
        }
        this.tableViewManager.filterData(searchTerm, additionalFilters);
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

    // Sólo los métodos relevantes para mostrar cantidades en los modales

    async verProducto(id) {
        const producto = this.productos.find(p => String(p.id) === String(id));
        if (!producto) {
            window.showToast('Producto no encontrado.', 'error');
            return;
        }
        document.getElementById('detallesProducto').innerHTML = `
        <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-shrink-0 w-full md:w-60">
                <img src="${producto.fotoUrl || '/images/product-placeholder.png'}" class="object-cover rounded-lg border w-full h-40 md:h-60" alt="${producto.nombre || 'Producto'}">
            </div>
            <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${producto.nombre || 'Sin nombre'}</h3>
                <p class="text-gray-600 mb-1"><strong>Tipo:</strong> ${producto.tipo || 'N/A'}</p>
                <p class="text-gray-600 mb-1"><strong>Descripción:</strong> ${producto.descripcion || '-'}</p>
                <p class="text-gray-600 mb-1"><strong>Precio Venta:</strong> $${producto.precioVenta ? Number(producto.precioVenta).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : '0.00'}</p>
                <p class="text-gray-600 mb-1"><strong>Precio Compra:</strong> $${producto.precioCompra ? Number(producto.precioCompra).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : '0.00'}</p>
                <p class="text-gray-600 mb-1"><strong>Estado:</strong> ${producto.estado || '-'}</p>
                <p class="text-gray-600 mb-1"><strong>Código:</strong> ${producto.codigo || '-'}</p>
                <div class="mt-4 grid grid-cols-2 gap-2">
                    <div class="bg-gray-100 rounded px-3 py-1"><strong>Disponible:</strong> ${producto.cantidadDisponible ?? 0}</div>
                    <div class="bg-gray-100 rounded px-3 py-1"><strong>Almacén:</strong> ${producto.cantidadAlmacen ?? 0}</div>
                    <div class="bg-gray-100 rounded px-3 py-1"><strong>Reservada:</strong> ${producto.cantidadReservada ?? 0}</div>
                    <div class="bg-gray-100 rounded px-3 py-1"><strong>Dañada:</strong> ${producto.cantidadDanada ?? 0}</div>
                    <div class="bg-gray-100 rounded px-3 py-1"><strong>Devuelta:</strong> ${producto.cantidadDevuelta ?? 0}</div>
                </div>
            </div>
        </div>
    `;
        document.getElementById('modalVerProducto').classList.remove('hidden');
    }

    async verMovimientosProducto(id) {
        const producto = this.productos.find(p => String(p.id) === String(id));
        if (!producto) {
            window.showToast('Producto no encontrado.', 'error');
            return;
        }
        this.renderMovimientosModal(producto);
        document.getElementById('modalMovimientosProducto').classList.remove('hidden');
    }

    renderMovimientosModal(producto) {
        document.getElementById('movimientosProductoTitle').textContent = `Movimientos de "${producto.nombre}"`;
        document.getElementById('movimientosProductoBody').innerHTML = `
        <div class="mb-6">
            <h4 class="font-semibold text-gray-700 mb-2">Cantidades actuales</h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="bg-gray-100 rounded px-3 py-1"><strong>Disponible:</strong> ${producto.cantidadDisponible ?? 0}</div>
                <div class="bg-gray-100 rounded px-3 py-1"><strong>Almacén:</strong> ${producto.cantidadAlmacen ?? 0}</div>
                <div class="bg-gray-100 rounded px-3 py-1"><strong>Reservada:</strong> ${producto.cantidadReservada ?? 0}</div>
                <div class="bg-gray-100 rounded px-3 py-1"><strong>Dañada:</strong> ${producto.cantidadDanada ?? 0}</div>
                <div class="bg-gray-100 rounded px-3 py-1"><strong>Devuelta:</strong> ${producto.cantidadDevuelta ?? 0}</div>
            </div>
        </div>
        <form id="formMovimientoProducto">
            <div class="mb-4">
                <label class="block text-gray-700 mb-1 font-medium">Tipo de movimiento</label>
                <select id="movimientoTipo" name="tipo" class="border rounded px-3 py-2 w-full">
                    <option value="">Seleccione...</option>
                    <option value="almacen_a_disponible">Almacén → Disponible</option>
                    <option value="disponible_a_almacen">Disponible → Almacén</option>
                    <option value="danada_a_disponible">Dañada → Disponible</option>
                    <option value="disponible_a_danada">Disponible → Dañada</option>
                    <option value="ajuste_disponible">Ajuste (Disponible)</option>
                    <option value="ajuste_almacen">Ajuste (Almacén)</option>
                    <option value="ajuste_danada">Ajuste (Dañada)</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 mb-1 font-medium">Cantidad</label>
                <input type="number" id="movimientoCantidad" name="cantidad" min="1" class="border rounded px-3 py-2 w-full" required>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 mb-1 font-medium">Motivo u observación</label>
                <textarea id="movimientoObservacion" name="motivo" class="border rounded px-3 py-2 w-full"></textarea>
            </div>
            <div class="flex gap-2 justify-end">
                <button type="button" onclick="productosManager.cerrarModalMovimientos()" class="bg-gray-300 px-4 py-2 rounded">Cerrar</button>
                <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Registrar movimiento</button>
            </div>
        </form>
        <div id="movimientosProductoHistorial" class="mt-6">
            <!-- Aquí puedes renderizar historial de movimientos (si tienes backend para esto) -->
        </div>
    `;
        document.getElementById('formMovimientoProducto').onsubmit = (e) => this.handleMovimientoProducto(e, producto);
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
        document.getElementById('productoNombre').disabled = false;
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
window.tableViewManager = productosManager.tableViewManager;
window.cerrarModalProducto = () => productosManager.cerrarModalProducto();
window.cerrarModalVerProducto = () => productosManager.cerrarModalVerProducto();
window.editarProductoDesdeDetalle = () => productosManager.editarProductoDesdeDetalle();
window.cerrarModalMovimientos = () => productosManager.cerrarModalMovimientos();

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