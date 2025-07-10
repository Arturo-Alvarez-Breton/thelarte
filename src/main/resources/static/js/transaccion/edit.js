// Variables globales
let transaccionService;
let pasoActual = 1;
let tipoTransaccion = '';
let transaccionId = null;
let transaccionOriginal = null;
let contraparteSeleccionada = null;
let productosSeleccionados = [];
let productos = [];
let contrapartes = [];

// Configuración de moneda dominicana
const CURRENCY_CONFIG = {
    locale: 'es-DO',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
};

function formatearMonedaDominicana(cantidad) {
    if (!cantidad && cantidad !== 0) return 'RD$ 0,00';
    
    // Usar formateo manual para asegurar el formato correcto
    const numero = Math.abs(cantidad);
    const partes = numero.toFixed(2).split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimal = partes[1];
    
    return `RD$ ${entero},${decimal}`;
}

document.addEventListener('DOMContentLoaded', async function() {
    // Usar TransaccionService existente, no redefinirlo
    if (window.TransaccionService) {
        transaccionService = new TransaccionService();
    } else {
        console.error("TransaccionService no está definido");
        mostrarError("Error al cargar el servicio de transacciones");
        return;
    }
    
    // Obtener ID de transacción de la URL
    const urlParams = new URLSearchParams(window.location.search);
    transaccionId = urlParams.get('id');
    
    if (!transaccionId) {
        mostrarError('ID de transacción no especificado');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    try {
        await cargarTransaccion(transaccionId);
        await cargarDatos();
    } catch (error) {
        console.error('Error al cargar transacción:', error);
        mostrarError('Error al cargar la transacción');
    }
});

/**
 * Inicializa el asistente con los datos de la transacción cargada
 */
function inicializarAsistente() {
    // Configurar tipo de transacción
    document.getElementById('tipo').value = tipoTransaccion;
    
    const tiposDisplay = {
        'VENTA': 'Venta',
        'COMPRA': 'Compra', 
        'DEVOLUCION_COMPRA': 'Devolución de Compra',
        'DEVOLUCION_VENTA': 'Devolución de Venta'
    };
    
    const tiposClasses = {
        'VENTA': 'tipo-venta',
        'COMPRA': 'tipo-compra',
        'DEVOLUCION_COMPRA': 'tipo-devolucion',
        'DEVOLUCION_VENTA': 'tipo-devolucion'
    };
    
    const tipoDisplay = tiposDisplay[tipoTransaccion] || tipoTransaccion;
    document.getElementById('tipoDisplay').value = tipoDisplay;
    
    const badge = document.getElementById('tipoTransaccionBadge');
    if (badge) {
        badge.textContent = tipoDisplay;
        badge.className = `transaction-type-badge ${tiposClasses[tipoTransaccion] || ''}`;
    }
    
    // Configurar etiquetas según el tipo
    const esVenta = tipoTransaccion === 'VENTA' || tipoTransaccion === 'DEVOLUCION_VENTA';
    const contraparteLabel = esVenta ? 'Cliente' : 'Proveedor';
    
    const contraparteStepLabel = document.getElementById('contraparteStepLabel');
    if (contraparteStepLabel) contraparteStepLabel.textContent = contraparteLabel;
    
    const contraparteTitle = document.getElementById('contraparteTitle');
    if (contraparteTitle) contraparteTitle.textContent = `Seleccionar ${contraparteLabel}`;
    
    const confirmContraparteLabel = document.getElementById('confirmContraparteLabel');
    if (confirmContraparteLabel) confirmContraparteLabel.textContent = `${contraparteLabel}:`;
    
    // Actualizar el título de la página para mostrar que es edición
    const pageTitle = document.querySelector('h2.text-2xl');
    if (pageTitle) {
        pageTitle.textContent = 'Editar Transacción';
    }
    
    // Configurar botón de guardar cambios
    const btnConfirmar = document.getElementById('btnConfirmar');
    if (btnConfirmar) {
        btnConfirmar.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Cambios';
        // Asegurar que el botón usa la función correcta
        btnConfirmar.setAttribute('onclick', 'guardarCambiosTransaccion()');
    }
}

/**
 * Carga los datos de la transacción por su ID
 */
async function cargarTransaccion(id) {
    try {
        document.getElementById('loadingOverlay').classList.remove('hidden');
        
        transaccionOriginal = await transaccionService.obtenerTransaccionPorId(id);
        console.log("Transacción cargada:", transaccionOriginal);
        
        // Establecer el tipo de transacción
        tipoTransaccion = transaccionOriginal.tipo;
        
        // Inicializar el asistente con el tipo de transacción
        inicializarAsistente();
        
        // Llenar los campos del formulario con los datos de la transacción
        document.getElementById('fecha').value = new Date(transaccionOriginal.fecha)
            .toISOString().slice(0, 16);
            
        document.getElementById('numeroFactura').value = transaccionOriginal.numeroFactura || '';
        document.getElementById('observaciones').value = transaccionOriginal.observaciones || '';
        
        // Establecer la contraparte seleccionada
        contraparteSeleccionada = {
            id: transaccionOriginal.contraparteId,
            nombre: transaccionOriginal.contraparteNombre
        };
        
        // Establecer los productos seleccionados
        if (transaccionOriginal.lineas && transaccionOriginal.lineas.length > 0) {
            productosSeleccionados = transaccionOriginal.lineas.map(linea => ({
                id: linea.productoId,
                nombre: linea.productoNombre,
                precio: linea.precioUnitario,
                cantidad: linea.cantidad,
                descripcion: linea.descripcionProducto,
                stock: linea.cantidad, // Asumimos que el stock disponible es al menos la cantidad actual
                esNuevo: !linea.productoId
            }));
        }
        
        document.getElementById('loadingOverlay').classList.add('hidden');
    } catch (error) {
        document.getElementById('loadingOverlay').classList.add('hidden');
        console.error('Error al cargar transacción:', error);
        throw error;
    }
}

async function cargarDatos() {
    try {
        // Cargar productos
        productos = await transaccionService.obtenerProductos();
        console.log("Productos cargados:", productos);
        
        // Normalizar stock para productos ya seleccionados
        productos.forEach(producto => {
            const seleccionado = productosSeleccionados.find(p => p.id === producto.id);
            if (seleccionado) {
                seleccionado.stock = Math.max(producto.cantidadDisponible, seleccionado.cantidad);
            }
            
            // Normalizar propiedades de stock
            if (producto.cantidadDisponible === undefined) {
                if (producto.stock !== undefined) {
                    producto.cantidadDisponible = producto.stock;
                } else if (producto.cantidad !== undefined) {
                    producto.cantidadDisponible = producto.cantidad;
                } else {
                    producto.cantidadDisponible = 0;
                }
            }
        });
        
        // Cargar contrapartes según el tipo de transacción
        const esVenta = tipoTransaccion === 'VENTA' || tipoTransaccion === 'DEVOLUCION_VENTA';
        if (esVenta) {
            contrapartes = await transaccionService.obtenerClientes();
        } else {
            contrapartes = await transaccionService.obtenerSuplidores();
        }
        
        // Mostrar el primer paso
        mostrarPaso(1);
        
    } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarError('Error al cargar los datos necesarios');
    }
}

function siguientePaso() {
    if (!validarPaso(pasoActual)) {
        return;
    }
    
    if (pasoActual < 4) {
        pasoActual++;
        mostrarPaso(pasoActual);
        
        // Cargar contenido específico del paso
        if (pasoActual === 2) {
            cargarContrapartes();
        } else if (pasoActual === 3) {
            cargarProductos();
        } else if (pasoActual === 4) {
            mostrarResumenFinal();
        }
    }
}

function anteriorPaso() {
    if (pasoActual > 1) {
        pasoActual--;
        mostrarPaso(pasoActual);
    }
}

function mostrarPaso(paso) {
    // Actualizar pasos visuales
    document.querySelectorAll('.wizard-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === paso) {
            step.classList.add('active');
        } else if (index + 1 < paso) {
            step.classList.add('completed');
        }
    });
    
    // Mostrar contenido del paso
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`step${paso}`).classList.add('active');
    
    // Actualizar botones
    document.getElementById('btnAnterior').style.display = paso > 1 ? 'block' : 'none';
    document.getElementById('btnSiguiente').style.display = paso < 4 ? 'block' : 'none';
    document.getElementById('btnConfirmar').style.display = paso === 4 ? 'block' : 'none';
}

// Reutilizar funciones existentes de form.js
function validarPaso(paso) {
    switch (paso) {
        case 1:
            const fecha = document.getElementById('fecha').value;
            if (!fecha) {
                mostrarError('Por favor, selecciona una fecha válida');
                return false;
            }
            break;
            
        case 2:
            if (!contraparteSeleccionada) {
                const esVenta = tipoTransaccion === 'VENTA' || tipoTransaccion === 'DEVOLUCION_VENTA';
                const label = esVenta ? 'cliente' : 'proveedor';
                mostrarError(`Por favor, selecciona un ${label}`);
                return false;
            }
            break;
            
        case 3:
            if (productosSeleccionados.length === 0) {
                mostrarError('Por favor, selecciona al menos un producto');
                return false;
            }
            
            // Validar cantidades
            for (let producto of productosSeleccionados) {
                if (!producto.cantidad || producto.cantidad <= 0) {
                    mostrarError('Todas las cantidades deben ser mayores a 0');
                    return false;
                }
            }
            break;
    }
    return true;
}

function cargarContrapartes() {
    const container = document.getElementById('contraparteContainer');
    if (!container) return;
    
    if (contrapartes.length === 0) {
        const esVenta = tipoTransaccion === 'VENTA' || tipoTransaccion === 'DEVOLUCION_VENTA';
        const tipoLabel = esVenta ? 'clientes' : 'proveedores';
        const btnLabel = esVenta ? 'Cliente' : 'Proveedor';
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600 text-lg mb-4">No hay ${tipoLabel} registrados</p>
                <button type="button" class="bg-[#59391B] hover:bg-[#7b5222] text-white px-4 py-2 rounded-lg transition" onclick="mostrarFormularioContraparte()">
                    <i class="fas fa-plus mr-2"></i>Agregar ${btnLabel}
                </button>
            </div>
        `;
        return;
    }
    
    const esVenta = tipoTransaccion === 'VENTA' || tipoTransaccion === 'DEVOLUCION_VENTA';
    const icon = esVenta ? 'fa-user' : 'fa-truck';
    const btnLabel = esVenta ? 'Cliente' : 'Proveedor';
    
    const contrapartesHtml = `
        <div class="mb-4 text-right">
            <button type="button" class="bg-[#59391B] hover:bg-[#7b5222] text-white px-4 py-2 rounded-lg transition text-sm" onclick="mostrarFormularioContraparte()">
                <i class="fas fa-plus mr-2"></i>Nuevo ${btnLabel}
            </button>
        </div>
        ${contrapartes.map(contraparte => `
            <div class="counterpart-card ${contraparteSeleccionada?.id === contraparte.id ? 'selected' : ''}" 
                 onclick="seleccionarContraparte(${contraparte.id}, '${contraparte.nombre}', this)">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-[#59391B] rounded-full flex items-center justify-center mr-4">
                        <i class="fas ${icon} text-white text-lg"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-lg text-[#59391B]">${contraparte.nombre}</h4>
                        <p class="text-gray-600 text-sm">${contraparte.email || contraparte.telefono || (contraparte.telefonos && contraparte.telefonos.length > 0 ? contraparte.telefonos[0] : 'Sin contacto')}</p>
                        ${contraparte.direccion ? `<p class="text-gray-500 text-xs">${contraparte.direccion}</p>` : ''}
                        ${contraparte.ciudad ? `<p class="text-gray-500 text-xs">${contraparte.ciudad}</p>` : ''}
                    </div>
                    <div class="text-[#59391B]">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            </div>
        `).join('')}
    `;
    
    container.innerHTML = contrapartesHtml;
}

function seleccionarContraparte(id, nombre, element) {
    // Remover selección anterior
    document.querySelectorAll('.counterpart-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Agregar selección actual
    element.classList.add('selected');
    
    contraparteSeleccionada = { id, nombre };
    
    // Mostrar feedback visual
    const esVenta = tipoTransaccion === 'VENTA' || tipoTransaccion === 'DEVOLUCION_VENTA';
    mostrarExito(`${esVenta ? 'Cliente' : 'Proveedor'} seleccionado: ${nombre}`);
}

function cargarProductos() {
    const container = document.getElementById('productosContainer');
    if (!container) return;
    
    console.log("Cargando productos. Total:", productos.length);
    
    // Para compras, mostrar opción de agregar productos nuevos
    const esCompra = tipoTransaccion === 'COMPRA' || tipoTransaccion === 'DEVOLUCION_COMPRA';
    if (esCompra) {
        const productosHtml = `
            <div class="mb-4 flex justify-between">
                <h4 class="text-lg font-semibold text-[#59391B]">Productos de la Transacción (${productosSeleccionados.length})</h4>
                <button type="button" class="bg-[#59391B] hover:bg-[#7b5222] text-white px-4 py-2 rounded-lg transition text-sm" onclick="mostrarFormularioProducto()">
                    <i class="fas fa-plus mr-2"></i>Agregar Producto Nuevo
                </button>
            </div>
            <div id="productosAgregados">
                ${productosSeleccionados.length === 0 ? `
                    <div class="text-center py-8">
                        <i class="fas fa-boxes text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600">No hay productos agregados</p>
                        <p class="text-gray-500 text-sm">Haga clic en "Agregar Producto Nuevo" para empezar</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.innerHTML = productosHtml;
        
        if (productosSeleccionados.length > 0) {
            mostrarProductosAgregados();
        }
        
        return;
    }
    
    // Para ventas, mostrar productos existentes
    if (!productos || productos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-boxes text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600 text-lg">No hay productos disponibles</p>
                <p class="text-gray-500">No se encontraron productos en el sistema</p>
            </div>
        `;
        return;
    }
    
    // Add a toggle for showing out-of-stock products
    const showOutOfStockToggle = `
        <div class="mb-4 flex justify-between items-center">
            <div class="text-sm text-gray-600">
                <span class="inline-block w-3 h-3 rounded-full bg-red-100 border border-red-300 mr-1"></span>
                Productos sin stock disponible
            </div>
            <label class="inline-flex items-center cursor-pointer">
                <span class="mr-2 text-sm text-gray-700">Mostrar productos sin stock</span>
                <div class="relative">
                    <input type="checkbox" id="toggleOutOfStock" class="sr-only" onchange="toggleShowOutOfStock()">
                    <div class="block bg-gray-300 w-10 h-6 rounded-full"></div>
                    <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
            </label>
        </div>
    `;
    
    // Get all products or filter based on toggle state
    const showOutOfStock = sessionStorage.getItem('showOutOfStock') === 'true';
    let productosToShow = showOutOfStock ? productos : productos.filter(p => p.cantidadDisponible > 0);
    
    // If no products to show, always show all products initially
    if (productosToShow.length === 0 && !showOutOfStock) {
        productosToShow = productos;
        sessionStorage.setItem('showOutOfStock', 'true');
    }
    
    // Always show products that are already selected in the transaction
    if (!showOutOfStock) {
        productosSeleccionados.forEach(seleccionado => {
            if (seleccionado.id && !productosToShow.some(p => p.id === seleccionado.id)) {
                const producto = productos.find(p => p.id === seleccionado.id);
                if (producto) {
                    productosToShow.push(producto);
                }
            }
        });
    }
    
    const productosHtml = `
        <div class="mb-4 flex justify-between items-center">
            <h4 class="text-lg font-semibold text-[#59391B]">Productos Disponibles</h4>
            ${showOutOfStockToggle}
        </div>
        
        ${productosToShow.length === 0 ? `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600 text-lg">No hay productos disponibles</p>
                <p class="text-gray-500">No se encontraron productos que mostrar</p>
            </div>
        ` : `
            <div class="space-y-3">
                ${productosToShow.map(producto => {
                    try {
                        const seleccionado = productosSeleccionados.find(p => p.id === producto.id);
                        const tieneStock = producto.cantidadDisponible > 0;
                        const yaSeleccionado = seleccionado !== undefined;
                        
                        return `
                            <div class="counterpart-card ${yaSeleccionado ? 'selected' : ''} ${!tieneStock && !yaSeleccionado ? 'opacity-70 bg-red-50 border-red-200' : ''}" 
                                onclick="${tieneStock || yaSeleccionado ? `toggleProducto(${producto.id}, '${producto.nombre.replace(/'/g, "\\'")}', ${producto.precio || 0}, ${producto.cantidadDisponible}, this)` : 'mostrarAlertaStockInsuficiente()'}">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 bg-${tieneStock || yaSeleccionado ? '[#7b5222]' : 'gray-400'} rounded-full flex items-center justify-center mr-4">
                                        <i class="fas fa-box text-white"></i>
                                    </div>
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-lg text-[#59391B]">${producto.nombre}</h4>
                                        <p class="text-[#7b5222] font-medium">${formatearMonedaDominicana(producto.precio || 0)}</p>
                                        <span class="text-sm ${tieneStock ? 'text-gray-500' : yaSeleccionado ? 'text-blue-500 font-medium' : 'text-red-500 font-medium'}">
                                            ${yaSeleccionado ? 'Ya en transacción' : tieneStock ? `Stock: ${producto.cantidadDisponible}` : 'Agotado'}
                                        </span>
                                    </div>
                                    <div class="flex items-center">
                                        ${yaSeleccionado ? `
                                            <div class="mr-4">
                                                <input type="number" min="1" max="${Math.max(producto.cantidadDisponible, seleccionado.cantidad)}" 
                                                    value="${seleccionado.cantidad}" 
                                                    class="w-20 px-2 py-1 border rounded text-center"
                                                    onclick="event.stopPropagation()"
                                                    onchange="actualizarCantidad(${producto.id}, this.value)">
                                            </div>
                                        ` : ''}
                                        <i class="fas ${yaSeleccionado ? 'fa-check-circle text-green-600' : tieneStock ? 'fa-plus-circle text-[#59391B]' : 'fa-ban text-red-500'}"></i>
                                    </div>
                                </div>
                            </div>
                        `;
                    } catch (error) {
                        console.error("Error rendering product:", producto, error);
                        return ''; // Skip product with rendering error
                    }
                }).join('')}
            </div>
        `}
    `;
    
    container.innerHTML = productosHtml;
    
    // Update toggle state
    const toggleOutOfStock = document.getElementById('toggleOutOfStock');
    if (toggleOutOfStock) {
        toggleOutOfStock.checked = sessionStorage.getItem('showOutOfStock') === 'true';
        toggleOutOfStock.nextElementSibling.nextElementSibling.classList.toggle('translate-x-4', toggleOutOfStock.checked);
    }
    
    // Actualizar resumen de productos
    actualizarResumenProductos();
}

// Add missing function required by the HTML
function mostrarFormularioProducto() {
    const formularioHtml = `
        <div class="bg-white border rounded-lg p-6 mb-4" id="formularioProducto">
            <div class="flex justify-between items-center mb-4">
                <h4 class="text-lg font-semibold text-[#59391B]">Agregar Producto Nuevo</h4>
                <button type="button" class="text-gray-500 hover:text-gray-700" onclick="cargarProductos()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="formulario-producto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-[#59391B] mb-1">Nombre del Producto *</label>
                        <input type="text" name="nombre" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]" placeholder="Ej: Mesa de madera roble">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[#59391B] mb-1">Cantidad *</label>
                        <input type="number" name="cantidad" min="1" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]" placeholder="1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[#59391B] mb-1">Precio Unitario (RD$) *</label>
                        <input type="number" name="precio" step="0.01" min="0" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]" placeholder="0.00">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-[#59391B] mb-1">Descripción</label>
                        <textarea name="descripcion" rows="3" class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]" placeholder="Descripción detallada del producto..."></textarea>
                    </div>
                </div>
                <div class="flex gap-3 mt-4">
                    <button type="button" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition" onclick="procesarAgregarProducto()">
                        <i class="fas fa-plus mr-2"></i>Agregar Producto
                    </button>
                    <button type="button" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition" onclick="cargarProductos()">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const container = document.getElementById('productosContainer');
    if (container) {
        container.insertAdjacentHTML('afterbegin', formularioHtml);
    }
}

function procesarAgregarProducto() {
    const formulario = document.querySelector('.formulario-producto');
    if (!formulario) return;
    
    // Recopilar datos del formulario manualmente
    const inputs = formulario.querySelectorAll('input, textarea');
    const data = {};
    inputs.forEach(input => {
        data[input.name] = input.value;
    });
    
    // Validar datos
    if (!data.nombre || !data.cantidad || !data.precio) {
        mostrarError('Todos los campos marcados con * son obligatorios');
        return;
    }
    
    // Crear nuevo producto
    const nuevoProducto = {
        id: 'nuevo_' + Date.now(), // ID temporal para productos nuevos
        nombre: data.nombre,
        cantidad: parseInt(data.cantidad),
        precio: parseFloat(data.precio),
        descripcion: data.descripcion,
        esNuevo: true
    };
    
    // Agregar a la lista de productos seleccionados
    productosSeleccionados.push(nuevoProducto);
    
    mostrarExito(`Producto "${nuevoProducto.nombre}" agregado`);
    
    // Recargar la lista de productos
    cargarProductos();
}

function toggleShowOutOfStock() {
    const toggle = document.getElementById('toggleOutOfStock');
    if (!toggle) return;
    
    const showOutOfStock = toggle.checked;
    sessionStorage.setItem('showOutOfStock', showOutOfStock);
    toggle.nextElementSibling.nextElementSibling.classList.toggle('translate-x-4', showOutOfStock);
    cargarProductos();
}

function mostrarAlertaStockInsuficiente() {
    mostrarError('Este producto no tiene stock disponible');
}

function toggleProducto(id, nombre, precio, stock, element) {
    console.log("Producto seleccionado:", id, nombre, precio, stock);
    const index = productosSeleccionados.findIndex(p => p.id === id);
    
    if (index >= 0) {
        // Remover producto
        productosSeleccionados.splice(index, 1);
        element.classList.remove('selected');
    } else {
        // Agregar producto
        productosSeleccionados.push({
            id,
            nombre,
            precio,
            stock,
            cantidad: 1
        });
        element.classList.add('selected');
    }
    
    // Actualizar la interfaz
    actualizarResumenProductos();
    cargarProductos();
}

function actualizarCantidad(id, nuevaCantidad) {
    const producto = productosSeleccionados.find(p => p.id === id);
    if (producto) {
        producto.cantidad = parseInt(nuevaCantidad) || 1;
        actualizarResumenProductos();
    }
}

function actualizarResumenProductos() {
    const containerSeleccionados = document.getElementById('productosSeleccionados');
    const listaSeleccionados = document.getElementById('listaProductosSeleccionados');
    const resumen = document.getElementById('resumenProductos');
    
    if (!containerSeleccionados || !listaSeleccionados || !resumen) return;
    
    if (productosSeleccionados.length === 0) {
        containerSeleccionados.style.display = 'none';
        resumen.style.display = 'none';
        return;
    }
    
    // Mostrar productos seleccionados
    const listaHtml = productosSeleccionados.map(producto => {
        const total = producto.precio * producto.cantidad;
        return `
            <div class="product-item flex justify-between items-center">
                <div>
                    <h5 class="font-medium text-[#59391B]">${producto.nombre}</h5>
                    <p class="text-sm text-gray-600">${formatearMonedaDominicana(producto.precio)} × ${producto.cantidad}</p>
                    ${producto.esNuevo ? '<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Nuevo</span>' : ''}
                </div>
                <div class="text-right">
                    <p class="font-bold text-[#7b5222]">${formatearMonedaDominicana(total)}</p>
                    <button type="button" class="text-red-600 hover:text-red-800 text-sm" onclick="removerProducto('${producto.id}')">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    listaSeleccionados.innerHTML = listaHtml;
    containerSeleccionados.style.display = 'block';
    
    // Calcular totales
    const subtotal = productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const itbis = subtotal * 0.18; // 18% ITBIS
    const total = subtotal + itbis;
    
    document.getElementById('subtotalDisplay').textContent = formatearMonedaDominicana(subtotal);
    document.getElementById('itbisDisplay').textContent = formatearMonedaDominicana(itbis);
    document.getElementById('totalDisplay').textContent = formatearMonedaDominicana(total);
    
    resumen.style.display = 'block';
}

function removerProducto(id) {
    productosSeleccionados = productosSeleccionados.filter(p => p.id.toString() !== id.toString());
    cargarProductos();
    actualizarResumenProductos();
}

function mostrarProductosAgregados() {
    const container = document.getElementById('productosAgregados');
    if (!container) return;
    
    const productosHtml = productosSeleccionados.map(producto => `
        <div class="product-item border rounded-lg p-4 mb-3 bg-green-50 border-green-200">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h5 class="font-semibold text-[#59391B] mb-1 flex items-center">
                        ${producto.nombre}
                        ${producto.esNuevo ? '<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-2">Nuevo</span>' : ''}
                    </h5>
                    <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                            <span class="font-medium">Cantidad:</span> ${producto.cantidad}
                        </div>
                        <div>
                            <span class="font-medium">Precio:</span> ${formatearMonedaDominicana(producto.precio)}
                        </div>
                        <div class="col-span-2">
                            <span class="font-medium">Total:</span> 
                            <span class="font-bold text-[#7b5222]">${formatearMonedaDominicana(producto.precio * producto.cantidad)}</span>
                        </div>
                        ${producto.descripcion ? `<div class="col-span-2 text-xs text-gray-500">${producto.descripcion}</div>` : ''}
                    </div>
                </div>
                <div class="flex gap-2 ml-4">
                    <button type="button" class="text-blue-600 hover:text-blue-800 text-sm" onclick="editarProducto('${producto.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="text-red-600 hover:text-red-800 text-sm" onclick="removerProducto('${producto.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = productosHtml;
}

function editarProducto(id) {
    const producto = productosSeleccionados.find(p => p.id.toString() === id.toString());
    if (!producto) return;
    
    const formularioHtml = `
        <div class="bg-white border rounded-lg p-6 mb-4" id="formularioEditarProducto">
            <div class="flex justify-between items-center mb-4">
                <h4 class="text-lg font-semibold text-[#59391B]">Editar Producto</h4>
                <button type="button" class="text-gray-500 hover:text-gray-700" onclick="cargarProductos()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="formulario-editar-producto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-[#59391B] mb-1">Nombre del Producto *</label>
                        <input type="text" name="nombre" value="${producto.nombre}" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[#59391B] mb-1">Cantidad *</label>
                        <input type="number" name="cantidad" value="${producto.cantidad}" min="1" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[#59391B] mb-1">Precio Unitario (RD$) *</label>
                        <input type="number" name="precio" value="${producto.precio}" step="0.01" min="0" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-[#59391B] mb-1">Descripción</label>
                        <textarea name="descripcion" rows="3" class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">${producto.descripcion || ''}</textarea>
                    </div>
                </div>
                <div class="flex gap-3 mt-4">
                    <button type="button" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition" onclick="procesarGuardarEdicion('${id}')">
                        <i class="fas fa-save mr-2"></i>Guardar Cambios
                    </button>
                    <button type="button" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition" onclick="cargarProductos()">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const container = document.getElementById('productosContainer');
    if (container) {
        container.insertAdjacentHTML('afterbegin', formularioHtml);
    }
}

function procesarGuardarEdicion(id) {
    const formulario = document.querySelector('.formulario-editar-producto');
    if (!formulario) return;
    
    // Recopilar datos del formulario
    const nombre = formulario.querySelector('[name="nombre"]').value;
    const cantidad = formulario.querySelector('[name="cantidad"]').value;
    const precio = formulario.querySelector('[name="precio"]').value;
    const descripcion = formulario.querySelector('[name="descripcion"]').value;
    
    // Validar datos
    if (!nombre || !cantidad || !precio) {
        mostrarError('Todos los campos marcados con * son obligatorios');
        return;
    }
    
    // Actualizar producto
    const producto = productosSeleccionados.find(p => p.id.toString() === id.toString());
    if (producto) {
        producto.nombre = nombre;
        producto.cantidad = parseInt(cantidad);
        producto.precio = parseFloat(precio);
        producto.descripcion = descripcion;
        
        mostrarExito('Producto actualizado exitosamente');
        
        // Recargar productos
        cargarProductos();
    }
}

function mostrarResumenFinal() {
    // Información general
    const confirmTipo = document.getElementById('confirmTipo');
    const confirmFecha = document.getElementById('confirmFecha');
    const confirmContraparte = document.getElementById('confirmContraparte');
    
    if (confirmTipo) confirmTipo.textContent = document.getElementById('tipoDisplay').value;
    if (confirmFecha) confirmFecha.textContent = new Date(document.getElementById('fecha').value).toLocaleString('es-DO');
    if (confirmContraparte) confirmContraparte.textContent = contraparteSeleccionada.nombre;
    
    // Totales
    const subtotal = productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const itbis = subtotal * 0.18;
    const total = subtotal + itbis;
    
    const confirmSubtotal = document.getElementById('confirmSubtotal');
    const confirmItbis = document.getElementById('confirmItbis');
    const confirmTotal = document.getElementById('confirmTotal');
    
    if (confirmSubtotal) confirmSubtotal.textContent = formatearMonedaDominicana(subtotal);
    if (confirmItbis) confirmItbis.textContent = formatearMonedaDominicana(itbis);
    if (confirmTotal) confirmTotal.textContent = formatearMonedaDominicana(total);
    
    // Lista de productos
    const confirmProductos = document.getElementById('confirmProductos');
    if (!confirmProductos) return;
    
    const productosHtml = productosSeleccionados.map(producto => {
        const totalProducto = producto.precio * producto.cantidad;
        return `
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
                <div>
                    <span class="font-medium">${producto.nombre}</span>
                    <span class="text-gray-600 text-sm ml-2">(${producto.cantidad} × ${formatearMonedaDominicana(producto.precio)})</span>
                    ${producto.esNuevo ? '<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-1">Nuevo</span>' : ''}
                </div>
                <span class="font-bold text-[#7b5222]">${formatearMonedaDominicana(totalProducto)}</span>
            </div>
        `;
    }).join('');
    
    confirmProductos.innerHTML = productosHtml;
}

// Renombrar la función para que coincida con el HTML
function guardarCambiosTransaccion() {
    const btnConfirmar = document.getElementById('btnConfirmar');
    if (!btnConfirmar) return;
    
    const textoOriginal = btnConfirmar.innerHTML;
    
    // Mostrar loading
    btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...';
    btnConfirmar.disabled = true;
    document.getElementById('loadingOverlay').classList.remove('hidden');
    
    try {
        // Calcular totales
        const subtotal = productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const itbis = subtotal * 0.18;
        const total = subtotal + itbis;
        
        // Construir objeto de transacción actualizada
        const transaccionActualizada = {
            id: transaccionId,
            tipo: tipoTransaccion,
            fecha: document.getElementById('fecha').value,
            contraparteId: contraparteSeleccionada.id,
            tipoContraparte: tipoTransaccion === 'VENTA' || tipoTransaccion === 'DEVOLUCION_VENTA' ? 'CLIENTE' : 'SUPLIDOR',
            contraparteNombre: contraparteSeleccionada.nombre,
            numeroFactura: document.getElementById('numeroFactura').value || null,
            observaciones: document.getElementById('observaciones').value || null,
            subtotal: subtotal,
            impuestos: itbis,
            total: total,
            estado: transaccionOriginal.estado,
            lineas: productosSeleccionados.map(producto => ({
                productoId: producto.esNuevo ? null : producto.id,
                productoNombre: producto.nombre,
                cantidad: producto.cantidad,
                precioUnitario: producto.precio,
                descuentoPorcentaje: 0,
                total: producto.precio * producto.cantidad,
                descripcionProducto: producto.descripcion || null
            }))
        };
        
        // Enviar al servidor
        actualizarTransaccion(transaccionActualizada);
    } catch (error) {
        console.error('Error al preparar transacción:', error);
        mostrarError('Error al preparar los datos de la transacción');
        
        // Restaurar botón
        btnConfirmar.innerHTML = textoOriginal;
        btnConfirmar.disabled = false;
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
}

async function actualizarTransaccion(transaccion) {
    try {
        await transaccionService.actualizarTransaccion(transaccionId, transaccion);
        
        mostrarExito('¡Transacción actualizada exitosamente!');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error('Error al actualizar transacción:', error);
        mostrarError(error.message || 'Error al actualizar la transacción');
        
        // Restaurar botón
        const btnConfirmar = document.getElementById('btnConfirmar');
        if (btnConfirmar) {
            btnConfirmar.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Cambios';
            btnConfirmar.disabled = false;
        }
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
}

function mostrarError(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-3 text-lg"></i>
            <span class="font-medium">${mensaje}</span>
            <button type="button" class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function mostrarExito(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-3 text-lg"></i>
            <span class="font-medium">${mensaje}</span>
            <button type="button" class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}
