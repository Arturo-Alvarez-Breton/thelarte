let transaccionService;
let pasoActual = 1;
let tipoTransaccion = '';
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
    transaccionService = new TransaccionService();
    
    // Obtener tipo de transacción de la URL
    const urlParams = new URLSearchParams(window.location.search);
    tipoTransaccion = urlParams.get('tipo');
    
    if (!tipoTransaccion) {
        mostrarError('Tipo de transacción no especificado');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    inicializarAsistente();
    await cargarDatos();
});

function inicializarAsistente() {
    // Configurar tipo de transacción
    document.getElementById('tipo').value = tipoTransaccion;
    
    const tiposDisplay = {
        'VENTA': 'Venta',
        'COMPRA': 'Compra', 
        'DEVOLUCION': 'Devolución'
    };
    
    const tiposClasses = {
        'VENTA': 'tipo-venta',
        'COMPRA': 'tipo-compra',
        'DEVOLUCION': 'tipo-devolucion'
    };
    
    const tipoDisplay = tiposDisplay[tipoTransaccion] || tipoTransaccion;
    document.getElementById('tipoDisplay').value = tipoDisplay;
    
    const badge = document.getElementById('tipoTransaccionBadge');
    badge.textContent = tipoDisplay;
    badge.className = `transaction-type-badge ${tiposClasses[tipoTransaccion] || ''}`;
    
    // Configurar etiquetas según el tipo
    const contraparteLabel = tipoTransaccion === 'VENTA' ? 'Cliente' : 'Proveedor';
    document.getElementById('contraparteStepLabel').textContent = contraparteLabel;
    document.getElementById('contraparteTitle').textContent = `Seleccionar ${contraparteLabel}`;
    document.getElementById('confirmContraparteLabel').textContent = `${contraparteLabel}:`;
    
    // Configurar fecha actual
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    document.getElementById('fecha').value = ahora.toISOString().slice(0, 16);
}

async function cargarDatos() {
    try {
        // Cargar productos
        productos = await transaccionService.obtenerProductos();
        // Ajustar cantidadDisponible a solo las unidades DISPONIBLES
        productos.forEach(producto => {
            if (Array.isArray(producto.unidades)) {
                // Si tienes la lista de unidades
                producto.cantidadDisponible = producto.unidades.filter(u => u.estado === 'DISPONIBLE').length;
            } else if (typeof producto.cantidadDisponiblePorEstado === 'object') {
                // Si tienes un mapa de cantidad por estado
                producto.cantidadDisponible = producto.cantidadDisponiblePorEstado['DISPONIBLE'] || 0;
            }
            // Si ya tienes cantidadDisponible correcta, no hagas nada
        });
        console.log("Productos cargados:", productos); // Debug: Muestra los productos en consola

        // Cargar contrapartes según el tipo de transacción
        if (tipoTransaccion === 'VENTA') {
            contrapartes = await transaccionService.obtenerClientes();
        } else {
            contrapartes = await transaccionService.obtenerSuplidores();
        }

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
                const label = tipoTransaccion === 'VENTA' ? 'cliente' : 'proveedor';
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
                
                if (tipoTransaccion === 'VENTA' && producto.cantidad > producto.cantidadDisponible) {
                    mostrarError(`La cantidad de "${producto.nombre}" excede el stock disponible (${producto.cantidadDisponible})`);
                    return false;
                }
            }
            break;
    }
    return true;
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
    mostrarExito(`${tipoTransaccion === 'VENTA' ? 'Cliente' : 'Proveedor'} seleccionado: ${nombre}`);
}

function cargarContrapartes() {
    const container = document.getElementById('contraparteContainer');
    
    if (contrapartes.length === 0) {
        const tipoLabel = tipoTransaccion === 'VENTA' ? 'clientes' : 'proveedores';
        const btnLabel = tipoTransaccion === 'VENTA' ? 'Cliente' : 'Proveedor';
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
    
    const icon = tipoTransaccion === 'VENTA' ? 'fa-user' : 'fa-truck';
    const btnLabel = tipoTransaccion === 'VENTA' ? 'Cliente' : 'Proveedor';
    
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

function mostrarFormularioContraparte() {
    const esCliente = tipoTransaccion === 'VENTA';
    const tipoLabel = esCliente ? 'Cliente' : 'Proveedor';
    
    const formularioHtml = `
        <div class="bg-white border rounded-lg p-6 mb-4" id="formularioContraparte">
            <div class="flex justify-between items-center mb-4">
                <h4 class="text-lg font-semibold text-[#59391B]">Agregar Nuevo ${tipoLabel}</h4>
                <button type="button" class="text-gray-500 hover:text-gray-700" onclick="cargarContrapartes()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="formulario-contraparte">
                ${esCliente ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Cédula *</label>
                            <input type="text" name="cedula" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]" placeholder="000-0000000-0" oninput="formatCedulaInput(this)">
                            <div class="text-xs text-red-500 mt-1 hidden" id="cedulaFormError"></div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Nombre *</label>
                            <input type="text" name="nombre" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">
                            <div class="text-xs text-red-500 mt-1 hidden" id="nombreFormError"></div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Apellido *</label>
                            <input type="text" name="apellido" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">
                            <div class="text-xs text-red-500 mt-1 hidden" id="apellidoFormError"></div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Teléfono *</label>
                            <input type="tel" name="telefono" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]" placeholder="809-000-0000" oninput="formatTelefonoInput(this)">
                            <div class="text-xs text-red-500 mt-1 hidden" id="telefonoFormError"></div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Email *</label>
                            <input type="email" name="email" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">
                            <div class="text-xs text-red-500 mt-1 hidden" id="emailFormError"></div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Provincia *</label>
                            <select name="provincia" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]" id="provinciaFormSelect">
                                <option value="">Cargando provincias...</option>
                            </select>
                            <div class="text-xs text-red-500 mt-1 hidden" id="provinciaFormError"></div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Dirección Detallada *</label>
                            <input type="text" name="direccionDetallada" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]" placeholder="Ej: Calle 10 #25, Ens. Naco">
                            <div class="text-xs text-red-500 mt-1 hidden" id="direccionFormError"></div>
                        </div>
                    </div>
                ` : `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Nombre *</label>
                            <input type="text" name="nombre" required class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Ciudad</label>
                            <input type="text" name="ciudad" class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Dirección</label>
                            <input type="text" name="direccion" class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Email</label>
                            <input type="email" name="email" class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">RNC</label>
                            <input type="text" name="rnc" class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]" placeholder="000-00000000-0">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">NCF</label>
                            <input type="text" name="ncf" class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Teléfono 1</label>
                            <input type="tel" name="telefono1" class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]" placeholder="809-000-0000">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#59391B] mb-1">Teléfono 2</label>
                            <input type="tel" name="telefono2" class="w-full px-3 py-2 border rounded-lg focus:border-[#59391B] focus:ring-1 focus:ring-[#59391B]" placeholder="809-000-0000">
                        </div>
                    </div>
                `}
                <div class="flex gap-3 mt-4">
                    <button type="button" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition" onclick="procesarGuardarContraparte()">
                        <i class="fas fa-save mr-2"></i>Guardar ${tipoLabel}
                    </button>
                    <button type="button" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition" onclick="cargarContrapartes()">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('contraparteContainer').innerHTML = formularioHtml;
    
    // Cargar provincias si es cliente
    if (esCliente) {
        cargarProvinciasFormulario();
    }
}

function procesarGuardarContraparte() {
    const formulario = document.querySelector('.formulario-contraparte');
    
    // Recopilar datos del formulario manualmente
    const inputs = formulario.querySelectorAll('input, select');
    const data = {};
    inputs.forEach(input => {
        if (input.value) {
            data[input.name] = input.value;
        }
    });
    
    // Crear un evento simulado para mantener la compatibilidad
    const mockEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        target: formulario
    };
    
    guardarContraparte(mockEvent);
}

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
    container.insertAdjacentHTML('afterbegin', formularioHtml);
}

function procesarAgregarProducto() {
    const formulario = document.querySelector('.formulario-producto');
    
    // Recopilar datos del formulario manualmente
    const inputs = formulario.querySelectorAll('input, textarea');
    const data = {};
    inputs.forEach(input => {
        data[input.name] = input.value;
    });
    
    const mockEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        target: formulario
    };
    
    agregarProductoNuevo(mockEvent);
}

function editarProducto(id) {
    const producto = productosSeleccionados.find(p => p.id === id);
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
                    <button type="button" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition" onclick="procesarGuardarEdicion(${id})">
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
    container.insertAdjacentHTML('afterbegin', formularioHtml);
}

function procesarGuardarEdicion(id) {
    const formulario = document.querySelector('.formulario-editar-producto');
    const mockEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        target: {
            ...formulario,
            get: (name) => {
                const input = formulario.querySelector(`[name="${name}"]`);
                return input ? input.value : null;
            }
        }
    };
    
    guardarEdicionProducto(mockEvent, id);
}

function mostrarResumenFinal() {
    // Información general
    document.getElementById('confirmTipo').textContent = document.getElementById('tipoDisplay').value;
    document.getElementById('confirmFecha').textContent = new Date(document.getElementById('fecha').value).toLocaleString('es-DO');
    document.getElementById('confirmContraparte').textContent = contraparteSeleccionada.nombre;
    
    // Totales
    const subtotal = productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const itbis = subtotal * 0.18;
    const total = subtotal + itbis;
    
    document.getElementById('confirmSubtotal').textContent = formatearMonedaDominicana(subtotal);
    document.getElementById('confirmItbis').textContent = formatearMonedaDominicana(itbis);
    document.getElementById('confirmTotal').textContent = formatearMonedaDominicana(total);
    
    // Lista de productos
    const productosHtml = productosSeleccionados.map(producto => {
        const totalProducto = producto.precio * producto.cantidad;
        return `
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
                <div>
                    <span class="font-medium">${producto.nombre}</span>
                    <span class="text-gray-600 text-sm ml-2">(${producto.cantidad} × ${formatearMonedaDominicana(producto.precio)})</span>
                </div>
                <span class="font-bold text-[#7b5222]">${formatearMonedaDominicana(totalProducto)}</span>
            </div>
        `;
    }).join('');
    
    document.getElementById('confirmProductos').innerHTML = productosHtml;
}

async function confirmarTransaccion() {
    const btnConfirmar = document.getElementById('btnConfirmar');
    const textoOriginal = btnConfirmar.innerHTML;
    
    // Mostrar loading
    btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...';
    btnConfirmar.disabled = true;
    document.getElementById('loadingOverlay').classList.remove('hidden');
    
    try {
        // Validar que se haya seleccionado un cliente/proveedor
        if (!contraparteSeleccionada || !contraparteSeleccionada.id) {
            throw new Error(`Debe seleccionar un ${tipoTransaccion === 'VENTA' ? 'cliente' : 'proveedor'} antes de confirmar la transacción`);
        }
        
        const subtotal = productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        const itbis = subtotal * 0.18;
        const total = subtotal + itbis;
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const idVendedor = usuario?.id; // El ID del usuario autenticado
        const transaccion = {
            tipo: tipoTransaccion,
            fecha: document.getElementById('fecha').value,
            contraparteId: contraparteSeleccionada.id,
            tipoContraparte: tipoTransaccion === 'VENTA' ? 'CLIENTE' : 'SUPLIDOR',
            contraparteNombre: contraparteSeleccionada.nombre,
            numeroFactura: document.getElementById('numeroFactura').value || null,
            observaciones: document.getElementById('observaciones').value || null,
            subtotal: subtotal,
            vendedorId: idVendedor,
            impuestos: itbis,
            total: total,
            estado: 'PENDIENTE',
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
        
        await transaccionService.crearTransaccion(transaccion);
        
        mostrarExito('¡Transacción creada exitosamente!');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error al crear transacción:', error);
        mostrarError(error.message || 'Error al crear la transacción');
        
        // Restaurar botón
        btnConfirmar.innerHTML = textoOriginal;
        btnConfirmar.disabled = false;
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

// Funciones de formateo para formularios
function formatCedulaInput(input) {
    let digits = input.value.replace(/\D/g, '').slice(0, 11);
    let part1 = digits.slice(0, 3);
    let part2 = digits.slice(3, 10);
    let part3 = digits.slice(10, 11);
    let formatted = part1;
    if (part2) formatted += '-' + part2;
    if (part3) formatted += '-' + part3;
    input.value = formatted;
}

function formatTelefonoInput(input) {
    let digits = input.value.replace(/\D/g, '').slice(0, 10);
    let part1 = digits.slice(0, 3);
    let part2 = digits.slice(3, 6);
    let part3 = digits.slice(6, 10);
    let formatted = part1;
    if (part2) formatted += '-' + part2;
    if (part3) formatted += '-' + part3;
    input.value = formatted;
}

// Cargar provincias para el formulario
async function cargarProvinciasFormulario() {
    const provinciaSelect = document.getElementById('provinciaFormSelect');
    if (!provinciaSelect) return;
    
    provinciaSelect.innerHTML = '<option value="">Cargando provincias...</option>';
    provinciaSelect.disabled = true;
    
    try {
        const resp = await fetch('https://api.digital.gob.do/v1/territories/provinces');
        if (!resp.ok) throw new Error('Error al obtener provincias');
        const json = await resp.json();
        
        provinciaSelect.innerHTML = '<option value="">Seleccione una provincia</option>';
        if (Array.isArray(json.data)) {
            json.data.forEach(prov => {
                const opt = document.createElement('option');
                opt.value = prov.name;
                opt.textContent = prov.name;
                provinciaSelect.appendChild(opt);
            });
        }
        provinciaSelect.disabled = false;
    } catch (err) {
        provinciaSelect.innerHTML = '<option value="">Error cargando provincias</option>';
        console.error("Error cargando provincias:", err);
        provinciaSelect.disabled = true;
    }
}

// Validaciones para el formulario de contraparte
function validateContraparteForm(data, esCliente) {
    const errors = {};
    
    if (esCliente) {
        // Validaciones para cliente (mismo formato que cliente/form.js)
        if (!data.cedula) {
            errors.cedula = 'La cédula es obligatoria';
        } else {
            const digits = data.cedula.replace(/\D/g, '');
            if (digits.length !== 11) {
                errors.cedula = 'Formato de cédula inválido';
            }
        }
        
        if (!data.nombre) {
            errors.nombre = 'El nombre es obligatorio';
        }
        
        if (!data.apellido) {
            errors.apellido = 'El apellido es obligatorio';
        }
        
        if (!data.telefono) {
            errors.telefono = 'El teléfono es obligatorio';
        } else {
            const telDigits = data.telefono.replace(/\D/g, '');
            if (telDigits.length !== 10) {
                errors.telefono = 'Formato de teléfono inválido';
            }
        }
        
        if (!data.email) {
            errors.email = 'El correo es obligatorio';
        } else {
            const re = /\S+@\S+\.\S+/;
            if (!re.test(data.email)) {
                errors.email = 'Formato de correo inválido';
            }
        }
        
        if (!data.provincia) {
            errors.provincia = 'La provincia es obligatoria';
        }
        
        if (!data.direccionDetallada) {
            errors.direccionDetallada = 'La dirección detallada es obligatoria';
        }
    } else {
        // Validaciones para proveedor
        if (!data.nombre) {
            errors.nombre = 'El nombre es obligatorio';
        }
    }
    
    return errors;
}

function showFormError(fieldName, message) {
    const errorEl = document.getElementById(fieldName + 'FormError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll('[id$="FormError"]');
    errorElements.forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}

async function guardarContraparte(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Obtener datos del formulario manualmente en lugar de usar FormData
    const formulario = event.target;
    const inputs = formulario.querySelectorAll('input, select');
    const formData = {};
    
    inputs.forEach(input => {
        if (input.name && input.value) {
            formData[input.name] = input.value;
        }
    });
    
    const esCliente = tipoTransaccion === 'VENTA';
    
    // Limpiar errores previos
    clearFormErrors();
    
    let datosContraparte;
    
    if (esCliente) {
        datosContraparte = {
            cedula: formData.cedula,
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            email: formData.email,
            provincia: formData.provincia,
            direccionDetallada: formData.direccionDetallada
        };
        
        // Validar datos del cliente
        const errors = validateContraparteForm(datosContraparte, true);
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([field, message]) => {
                showFormError(field, message);
            });
            return;
        }
        
        // Combinar provincia y dirección detallada
        datosContraparte.direccion = `${datosContraparte.provincia}: ${datosContraparte.direccionDetallada}`;
        delete datosContraparte.provincia;
        delete datosContraparte.direccionDetallada;
        
    } else {
        const telefonos = [];
        if (formData.telefono1) telefonos.push(formData.telefono1);
        if (formData.telefono2) telefonos.push(formData.telefono2);
        
        datosContraparte = {
            nombre: formData.nombre,
            ciudad: formData.ciudad,
            direccion: formData.direccion,
            email: formData.email,
            RNC: formData.rnc,
            NCF: formData.ncf,
            telefonos: telefonos
        };
        
        // Validar datos del proveedor
        const errors = validateContraparteForm(datosContraparte, false);
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([field, message]) => {
                showFormError(field, message);
            });
            return;
        }
    }
    
    try {
        const token = localStorage.getItem('authToken');

        let nuevaContraparte;
        
        if (esCliente) {
            const response = await fetch('/api/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosContraparte)
            });
            
            if (response.status === 400) {
                const serverErrors = await response.json();
                Object.entries(serverErrors).forEach(([field, message]) => {
                    showFormError(field, message);
                });
                return;
            }
            
            if (!response.ok) {
                throw new Error('Error al crear cliente');
            }
            
            nuevaContraparte = await response.json();
        } else {
            const response = await fetch('/api/suplidores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosContraparte)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear proveedor');
            }
            
            nuevaContraparte = await response.json();
        }
        
        // Agregar nueva contraparte a la lista local
        contrapartes.push(nuevaContraparte);
        
        // Mostrar mensaje de éxito
        mostrarExito(`${esCliente ? 'Cliente' : 'Proveedor'} creado exitosamente`);
        
        // Recargar lista de contrapartes sin cambiar el paso del wizard
        cargarContrapartes();
        
        // Auto-seleccionar la contraparte recién creada
        setTimeout(() => {
            contraparteSeleccionada = { 
                id: nuevaContraparte.id, 
                nombre: esCliente ? `${nuevaContraparte.nombre} ${nuevaContraparte.apellido}` : nuevaContraparte.nombre 
            };
            
            // Buscar y marcar como seleccionada
            const cards = document.querySelectorAll('.counterpart-card');
            cards.forEach(card => {
                if (card.textContent.includes(contraparteSeleccionada.nombre)) {
                    card.classList.add('selected');
                }
            });
        }, 100);
        
    } catch (error) {
        console.error('Error al guardar contraparte:', error);
        mostrarError(error.message || 'Error al guardar la información');
    }
}

function cargarProductos() {
    const container = document.getElementById('productosContainer');

    // --- Para compras, tu lógica actual (¡no cambies esto!) ---
    if (tipoTransaccion === 'COMPRA') {
        // ... aquí va tu lógica de compra ...
        return;
    }

    // --- Para ventas: Toggle para mostrar/ocultar productos sin stock ---
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

    const showOutOfStock = sessionStorage.getItem('showOutOfStock') === 'true';

    // Filtrar productos según el toggle
    let productosToShow = showOutOfStock ? productos : productos.filter(p => p.cantidadDisponible > 0);

    // Si no hay productos para mostrar y no se está mostrando sin stock, mostrar todos y activar el toggle
    if (productosToShow.length === 0 && !showOutOfStock) {
        productosToShow = productos;
        sessionStorage.setItem('showOutOfStock', 'true');
    }

    const productosHtml = `
        ${showOutOfStockToggle}
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
            return `
                            <div class="counterpart-card ${seleccionado ? 'selected' : ''} ${!tieneStock ? 'opacity-70 bg-red-50 border-red-200' : ''}" 
                                onclick="${tieneStock ? `toggleProducto(${producto.id}, '${producto.nombre.replace(/'/g, "\\'")}', ${producto.precioVenta || 0}, ${producto.cantidadDisponible}, this)` : 'mostrarAlertaStockInsuficiente()'}">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 ${tieneStock ? 'bg-[#7b5222]' : 'bg-gray-400'} rounded-full flex items-center justify-center mr-4">
                                        <i class="fas fa-box text-white"></i>
                                    </div>
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-lg text-[#59391B]">${producto.nombre}</h4>
                                        <p class="text-[#7b5222] font-medium">${formatearMonedaDominicana(producto.precioVenta || 0)}</p>
                                        <span class="text-sm ${tieneStock ? 'text-gray-500' : 'text-red-500 font-medium'}">${tieneStock ? `Stock: ${producto.cantidadDisponible}` : 'Agotado'}</span>
                                    </div>
                                    <div class="flex items-center">
                                        ${seleccionado && tieneStock ? `
                                            <div class="mr-4">
                                                <input type="number" min="1" max="${producto.cantidadDisponible}" 
                                                    value="${seleccionado.cantidad}" 
                                                    class="w-20 px-2 py-1 border rounded text-center"
                                                    onclick="event.stopPropagation()"
                                                    onchange="actualizarCantidad(${producto.id}, this.value)">
                                            </div>
                                        ` : ''}
                                        <i class="fas ${seleccionado ? 'fa-check-circle text-green-600' : tieneStock ? 'fa-plus-circle text-[#59391B]' : 'fa-ban text-red-500'}"></i>
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

    // Actualizar estado visual del toggle
    const toggleOutOfStock = document.getElementById('toggleOutOfStock');
    if (toggleOutOfStock) {
        toggleOutOfStock.checked = sessionStorage.getItem('showOutOfStock') === 'true';
        toggleOutOfStock.nextElementSibling.nextElementSibling.classList.toggle('translate-x-4', toggleOutOfStock.checked);
    }
}

function toggleProducto(id, nombre, precioVenta, cantidadDisponible, element) {
    const idx = productosSeleccionados.findIndex(p => p.id === id);
    if (idx >= 0) {
        productosSeleccionados.splice(idx, 1);
        element.classList.remove('selected');
    } else {
        productosSeleccionados.push({
            id,
            nombre,
            precio: precioVenta,
            cantidadDisponible,
            cantidad: 1
        });
        element.classList.add('selected');
    }
    cargarProductos();
}
