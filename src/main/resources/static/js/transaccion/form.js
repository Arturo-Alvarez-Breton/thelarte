let transaccionService;
let pasoActual = 1;
let productos = [];
let suplidores = [];
let clientes = [];
let empleados = [];
let lineasTransaccion = [];
let contraparteSeleccionada = null;
let editando = false;
let transaccionId = null;

document.addEventListener('DOMContentLoaded', async function() {
    transaccionService = new TransaccionService();
    
    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const tipo = urlParams.get('tipo');
    const id = urlParams.get('id');
    
    if (id) {
        editando = true;
        transaccionId = id;
        document.getElementById('tituloForm').innerHTML = '<i class="fas fa-edit text-primary me-2"></i>Editar Transacción';
        await cargarTransaccion(id);
    } else if (tipo) {
        document.getElementById('tipo').value = tipo;
        // Trigger change event to apply automatic configurations
        document.getElementById('tipo').dispatchEvent(new Event('change'));
    }
    
    // Configurar fecha actual
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    document.getElementById('fecha').value = ahora.toISOString().slice(0, 16);
    
    await cargarDatos();
    configurarEventos();
});

async function cargarDatos() {
    try {
        [productos, suplidores, clientes, empleados] = await Promise.all([
            transaccionService.obtenerProductos(),
            transaccionService.obtenerSuplidores(),
            transaccionService.obtenerClientes(),
            transaccionService.obtenerEmpleados()
        ]);
        
        // Cargar empleados en el select
        const vendedorSelect = document.getElementById('vendedor');
        empleados.forEach(empleado => {
            const option = document.createElement('option');
            option.value = empleado.id;
            option.textContent = empleado.nombre;
            vendedorSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar datos:', error);
        mostrarError('Error al cargar los datos necesarios');
    }
}

async function cargarTransaccion(id) {
    try {
        const transaccion = await transaccionService.obtenerTransaccionPorId(id);
        
        // Llenar los campos del formulario
        document.getElementById('tipo').value = transaccion.tipo;
        document.getElementById('fecha').value = transaccion.fecha.slice(0, 16);
        document.getElementById('numeroFactura').value = transaccion.numeroFactura || '';
        document.getElementById('numeroOrdenCompra').value = transaccion.numeroOrdenCompra || '';
        document.getElementById('metodoPago').value = transaccion.metodoPago || '';
        document.getElementById('condicionesPago').value = transaccion.condicionesPago || '';
        document.getElementById('fechaEntregaEsperada').value = transaccion.fechaEntregaEsperada?.slice(0, 16) || '';
        document.getElementById('direccionEntrega').value = transaccion.direccionEntrega || '';
        document.getElementById('observaciones').value = transaccion.observaciones || '';
        
        // Configurar contraparte
        contraparteSeleccionada = {
            id: transaccion.contraparteId,
            tipo: transaccion.tipoContraparte,
            nombre: transaccion.contraparteNombre
        };
        
        // Cargar líneas de transacción
        lineasTransaccion = transaccion.lineas || [];
        
    } catch (error) {
        console.error('Error al cargar transacción:', error);
        mostrarError('Error al cargar la transacción');
    }
}

function configurarEventos() {
    // Eventos para selección de contraparte
    document.querySelectorAll('input[name="tipoContraparte"]').forEach(radio => {
        radio.addEventListener('change', cargarContrapartes);
    });
    
    // Evento para cambio de tipo de transacción
    document.getElementById('tipo').addEventListener('change', function() {
        const tipo = this.value;
        const clienteRadio = document.getElementById('cliente');
        const suplidorRadio = document.getElementById('suplidor');
        
        // Limpiar productos existentes cuando cambia el tipo
        lineasTransaccion = [];
        document.getElementById('productosContainer').innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-boxes text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600 text-base">No hay productos agregados</p>
            </div>
        `;
        actualizarResumen();
        
        // Configurar automáticamente el tipo de contraparte según el tipo de transacción
        if (tipo === 'COMPRA' || tipo === 'DEVOLUCION_COMPRA') {
            suplidorRadio.checked = true;
            clienteRadio.disabled = true;
            suplidorRadio.disabled = false;
            document.getElementById('vendedorSection').style.display = 'none';
            
            mostrarNotificacion('info', 'Compra seleccionada: Solo suplidores disponibles. Los muebles serán marcados como nuevos.');
        } else if (tipo === 'VENTA' || tipo === 'DEVOLUCION_VENTA') {
            clienteRadio.checked = true;
            suplidorRadio.disabled = true;
            clienteRadio.disabled = false;
            document.getElementById('vendedorSection').style.display = 'block';
            
            mostrarNotificacion('info', 'Venta seleccionada: Solo clientes disponibles. Los muebles serán tomados del inventario. Vendedor requerido.');
        } else {
            clienteRadio.disabled = false;
            suplidorRadio.disabled = false;
            document.getElementById('vendedorSection').style.display = 'none';
        }
        
        if (clienteRadio.checked || suplidorRadio.checked) {
            cargarContrapartes();
        }
    });
}

async function cargarContrapartes() {
    const tipoContraparte = document.querySelector('input[name="tipoContraparte"]:checked')?.value;
    const container = document.getElementById('contraparteContainer');
    
    if (!tipoContraparte) {
        container.innerHTML = '<p class="text-muted text-center py-4">Selecciona el tipo de contraparte</p>';
        return;
    }
    
    const lista = tipoContraparte === 'CLIENTE' ? clientes : suplidores;
    
    if (lista.length === 0) {
        container.innerHTML = `
            <p class="text-muted text-center py-4">
                <i class="fas fa-exclamation-triangle fa-2x mb-2"></i><br>
                No hay ${tipoContraparte.toLowerCase()}s registrados
            </p>
        `;
        return;
    }
    
    const contrapartesHtml = lista.map(item => `
        <div class="counterpart-selector ${contraparteSeleccionada?.id === item.id ? 'selected' : ''}" 
             onclick="seleccionarContraparte(${item.id}, '${tipoContraparte}', '${item.nombre}', this)">
            <div class="d-flex align-items-center">
                <i class="fas ${tipoContraparte === 'CLIENTE' ? 'fa-user' : 'fa-truck'} me-3 text-primary"></i>
                <div>
                    <h6 class="mb-1">${item.nombre}</h6>
                    <small class="text-muted">${item.email || item.telefono || 'Sin contacto'}</small>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = contrapartesHtml;
}

function seleccionarContraparte(id, tipo, nombre, element) {
    // Remover selección anterior
    document.querySelectorAll('.counterpart-selector').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Agregar selección actual
    element.classList.add('selected');
    
    contraparteSeleccionada = { id, tipo, nombre };
}

function agregarProducto() {
    const productosContainer = document.getElementById('productosContainer');
    const lineaId = Date.now();
    const tipoTransaccion = document.getElementById('tipo').value;
    
    let productosOptions = '';
    let productoLabel = 'Producto';
    let productoInput = '';
    
    // Si es compra, permitir agregar productos nuevos
    if (tipoTransaccion === 'COMPRA' || tipoTransaccion === 'DEVOLUCION_COMPRA') {
        productoLabel = 'Producto Nuevo 🆕';
        productoInput = `
            <input type="text" class="form-control" placeholder="Nombre del mueble nuevo" onchange="actualizarNombreProducto(${lineaId}, this)" required>
            <small class="text-muted">Este producto se agregará al inventario como nuevo</small>
        `;
    } else {
        // Si es venta o devolución de venta, usar productos existentes
        productoLabel = 'Producto del Inventario 📦';
        const productosDisponibles = productos.filter(p => p.cantidadDisponible > 0);
        productosOptions = productosDisponibles.map(producto => 
            `<option value="${producto.id}" data-precio="${producto.precio}" data-stock="${producto.cantidadDisponible}">${producto.nombre} (Stock: ${producto.cantidadDisponible})</option>`
        ).join('');
        productoInput = `
            <select class="form-select" onchange="actualizarPrecioProducto(${lineaId}, this)" required>
                <option value="">Seleccionar producto del inventario</option>
                ${productosOptions}
            </select>
            <small class="text-muted">Solo productos con stock disponible</small>
        `;
    }
    
    const nuevaLinea = `
        <div class="product-line" id="linea-${lineaId}">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6>Producto ${lineasTransaccion.length + 1}</h6>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${lineaId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="form-label">${productoLabel}</label>
                        ${productoInput}
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="mb-3">
                        <label class="form-label">Cantidad</label>
                        <input type="number" class="form-control" min="1" value="1" onchange="calcularLineaTotal(${lineaId})" required>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="mb-3">
                        <label class="form-label">Precio Unit.</label>
                        <input type="number" class="form-control" step="0.01" min="0" onchange="calcularLineaTotal(${lineaId})" required>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="mb-3">
                        <label class="form-label">Descuento %</label>
                        <input type="number" class="form-control" step="0.01" min="0" max="100" value="0" onchange="calcularLineaTotal(${lineaId})">
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="mb-3">
                        <label class="form-label">Total</label>
                        <input type="text" class="form-control total-linea" readonly>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (lineasTransaccion.length === 0) {
        productosContainer.innerHTML = nuevaLinea;
    } else {
        productosContainer.insertAdjacentHTML('beforeend', nuevaLinea);
    }
    
    lineasTransaccion.push({ 
        id: lineaId, 
        productoId: null, 
        productoNombre: '', 
        cantidad: 1, 
        precioUnitario: 0, 
        descuento: 0, 
        total: 0 
    });
    actualizarResumen();
}

function actualizarPrecioProducto(lineaId, select) {
    const productoId = select.value;
    const precioInput = select.closest('.product-line').querySelector('input[type="number"][step="0.01"]');
    
    if (productoId) {
        const producto = productos.find(p => p.id == productoId);
        if (producto) {
            precioInput.value = producto.precio;
            
            // Actualizar el objeto en el array
            const lineaObj = lineasTransaccion.find(l => l.id === lineaId);
            if (lineaObj) {
                lineaObj.productoId = productoId;
                lineaObj.productoNombre = producto.nombre;
            }
            
            calcularLineaTotal(lineaId);
        }
    }
}

function actualizarNombreProducto(lineaId, input) {
    const nombreProducto = input.value;
    
    // Actualizar el objeto en el array
    const lineaObj = lineasTransaccion.find(l => l.id === lineaId);
    if (lineaObj) {
        lineaObj.productoNombre = nombreProducto;
        lineaObj.productoId = null; // Para productos nuevos, no hay ID
    }
}

function calcularLineaTotal(lineaId) {
    const linea = document.getElementById(`linea-${lineaId}`);
    const cantidad = parseInt(linea.querySelector('input[type="number"]').value) || 0;
    const precio = parseFloat(linea.querySelector('input[type="number"][step="0.01"]').value) || 0;
    const descuento = parseFloat(linea.querySelector('input[type="number"][step="0.01"][min="0"][max="100"]').value) || 0;
    
    const subtotal = cantidad * precio;
    const descuentoMonto = subtotal * (descuento / 100);
    const total = subtotal - descuentoMonto;
    
    linea.querySelector('.total-linea').value = transaccionService.formatearMoneda(total);
    
    // Actualizar el objeto en el array
    const lineaObj = lineasTransaccion.find(l => l.id === lineaId);
    if (lineaObj) {
        lineaObj.cantidad = cantidad;
        lineaObj.precioUnitario = precio;
        lineaObj.descuento = descuento;
        lineaObj.total = total;
    }
    
    actualizarResumen();
}

function eliminarProducto(lineaId) {
    const linea = document.getElementById(`linea-${lineaId}`);
    linea.remove();
    
    lineasTransaccion = lineasTransaccion.filter(l => l.id !== lineaId);
    
    if (lineasTransaccion.length === 0) {
        document.getElementById('productosContainer').innerHTML = `
            <p class="text-muted text-center py-4">
                <i class="fas fa-boxes fa-2x mb-2"></i><br>
                No hay productos agregados
            </p>
        `;
    }
    
    actualizarResumen();
}

function actualizarResumen() {
    const resumen = document.getElementById('resumenTransaccion');
    
    if (lineasTransaccion.length === 0) {
        resumen.style.display = 'none';
        return;
    }
    
    const subtotal = lineasTransaccion.reduce((sum, linea) => sum + linea.total, 0);
    const impuestos = subtotal * 0.18; // 18% de impuestos
    const total = subtotal + impuestos;
    
    document.getElementById('subtotalResumen').textContent = transaccionService.formatearMoneda(subtotal);
    document.getElementById('impuestosResumen').textContent = transaccionService.formatearMoneda(impuestos);
    document.getElementById('totalResumen').textContent = transaccionService.formatearMoneda(total);
    
    resumen.style.display = 'block';
}

function siguientePaso() {
    if (validarPaso(pasoActual)) {
        if (pasoActual < 4) {
            pasoActual++;
            mostrarPaso(pasoActual);
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
    document.getElementById('btnGuardar').style.display = paso === 4 ? 'block' : 'none';
    
    // Cargar datos específicos del paso
    if (paso === 2 && document.querySelector('input[name="tipoContraparte"]:checked')) {
        cargarContrapartes();
    }
}

function validarPaso(paso) {
    switch (paso) {
        case 1:
            const tipo = document.getElementById('tipo').value;
            const fecha = document.getElementById('fecha').value;
            if (!tipo || !fecha) {
                mostrarError('Por favor, completa todos los campos obligatorios');
                return false;
            }
            break;
        case 2:
            if (!contraparteSeleccionada) {
                mostrarError('Por favor, selecciona una contraparte');
                return false;
            }
            break;
        case 3:
            if (lineasTransaccion.length === 0) {
                mostrarError('Por favor, agrega al menos un producto');
                return false;
            }
            break;
    }
    return true;
}

async function guardarTransaccion() {
    if (!validarPaso(1) || !validarPaso(2) || !validarPaso(3)) {
        return;
    }
    
    // Mostrar loading
    const btnGuardar = document.getElementById('btnGuardar');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';
    btnGuardar.disabled = true;
    
    const subtotal = lineasTransaccion.reduce((sum, linea) => sum + linea.total, 0);
    const impuestos = subtotal * 0.18;
    const total = subtotal + impuestos;
    
    const metadatosPago = recopilarMetadatosPago();
    
    const tipoTransaccion = document.getElementById('tipo').value;
    const vendedorId = document.getElementById('vendedor').value;
    
    // Validar vendedor para ventas
    if ((tipoTransaccion === 'VENTA' || tipoTransaccion === 'DEVOLUCION_VENTA') && !vendedorId) {
        mostrarError('Debe seleccionar un vendedor para las ventas');
        btnGuardar.innerHTML = textoOriginal;
        btnGuardar.disabled = false;
        return;
    }
    
    const transaccion = {
        tipo: tipoTransaccion,
        fecha: document.getElementById('fecha').value,
        contraparteId: contraparteSeleccionada.id,
        tipoContraparte: contraparteSeleccionada.tipo,
        contraparteNombre: contraparteSeleccionada.nombre,
        vendedorId: vendedorId || null,
        numeroFactura: document.getElementById('numeroFactura').value,
        numeroOrdenCompra: document.getElementById('numeroOrdenCompra').value,
        metodoPago: document.getElementById('metodoPago').value,
        metadatosPago: metadatosPago,
        condicionesPago: document.getElementById('condicionesPago').value,
        fechaEntregaEsperada: document.getElementById('fechaEntregaEsperada').value,
        direccionEntrega: document.getElementById('direccionEntrega').value,
        observaciones: document.getElementById('observaciones').value,
        subtotal: subtotal,
        impuestos: impuestos,
        total: total,
        lineas: lineasTransaccion.map(linea => ({
            productoId: linea.productoId,
            productoNombre: linea.productoNombre,
            cantidad: linea.cantidad,
            precioUnitario: linea.precioUnitario,
            descuentoPorcentaje: linea.descuento,
            total: linea.total
        }))
    };
    
    try {
        if (editando) {
            await transaccionService.actualizarTransaccion(transaccionId, transaccion);
            mostrarExito('Transacción actualizada exitosamente');
        } else {
            await transaccionService.crearTransaccion(transaccion);
            mostrarExito('Transacción creada exitosamente');
        }
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        console.error('Error al guardar transacción:', error);
        mostrarError(error.message || 'Error al guardar la transacción');
        
        // Restaurar botón
        btnGuardar.innerHTML = textoOriginal;
        btnGuardar.disabled = false;
    }
}

function mostrarError(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-danger border-0';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-exclamation-circle me-2"></i>${mensaje}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toast);
    });
}

function mostrarExito(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-check-circle me-2"></i>${mensaje}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toast);
    });
}

function mostrarCamposMetodoPago() {
    const metodoPago = document.getElementById('metodoPago').value;
    const camposContainer = document.getElementById('camposMetodoPago');
    
    // Ocultar todos los campos de método de pago
    document.querySelectorAll('.payment-fields').forEach(field => {
        field.classList.add('hidden');
    });
    
    if (!metodoPago) {
        camposContainer.style.display = 'none';
        return;
    }
    
    camposContainer.style.display = 'block';
    
    // Mostrar campos específicos según el método de pago
    switch (metodoPago) {
        case 'EFECTIVO':
            document.getElementById('camposEfectivo').classList.remove('hidden');
            break;
        case 'TRANSFERENCIA_ACH':
            document.getElementById('camposTransferenciaACH').classList.remove('hidden');
            break;
        case 'TRANSFERENCIA_LBTR':
            document.getElementById('camposTransferenciaLBTR').classList.remove('hidden');
            break;
        case 'CHEQUE':
            document.getElementById('camposCheque').classList.remove('hidden');
            break;
        case 'CREDITO':
            document.getElementById('camposCredito').classList.remove('hidden');
            break;
        case 'TRANSFERENCIA_INTERNACIONAL':
            document.getElementById('camposTransferenciaIntl').classList.remove('hidden');
            break;
    }
}

function recopilarMetadatosPago() {
    const metodoPago = document.getElementById('metodoPago').value;
    if (!metodoPago) return null;
    
    let metadatos = {};
    
    switch (metodoPago) {
        case 'EFECTIVO':
            const recibidoPor = document.getElementById('recibidoPor').value;
            if (recibidoPor) {
                metadatos.recibidoPor = recibidoPor;
            }
            break;
            
        case 'TRANSFERENCIA_ACH':
            metadatos = {
                tipoTransferencia: 'ACH',
                bancoOrigen: document.getElementById('bancoOrigen').value,
                bancoDestino: document.getElementById('bancoDestino').value,
                numeroCuentaOrigen: document.getElementById('numeroCuentaOrigen').value,
                numeroReferencia: document.getElementById('numeroReferencia').value
            };
            break;
            
        case 'TRANSFERENCIA_LBTR':
            metadatos = {
                tipoTransferencia: 'LBTR',
                bancoOrigen: document.getElementById('bancoOrigenLBTR').value,
                numeroReferencia: document.getElementById('numeroReferenciaLBTR').value,
                fechaHora: document.getElementById('fechaHora').value
            };
            const costo = document.getElementById('costoTransferencia').value;
            if (costo) {
                metadatos.costoTransferencia = parseFloat(costo);
            }
            break;
            
        case 'CHEQUE':
            metadatos = {
                numeroCheque: document.getElementById('numeroCheque').value,
                banco: document.getElementById('banco').value,
                titular: document.getElementById('titular').value,
                fechaVencimiento: document.getElementById('fechaVencimiento').value
            };
            break;
            
        case 'CREDITO':
            metadatos = {
                banco: document.getElementById('bancoCredito').value,
                plazoPagos: parseInt(document.getElementById('plazoPagos').value),
                tasaInteres: parseFloat(document.getElementById('tasaInteres').value),
                fechaVencimiento: document.getElementById('fechaVencimientoCredito').value
            };
            break;
            
        case 'TRANSFERENCIA_INTERNACIONAL':
            metadatos = {
                swiftOrigen: document.getElementById('swiftOrigen').value,
                swiftDestino: document.getElementById('swiftDestino').value,
                tasaCambio: parseFloat(document.getElementById('tasaCambio').value),
                comisionTransferencia: parseFloat(document.getElementById('comisionTransferencia').value)
            };
            break;
    }
    
    return Object.keys(metadatos).length > 0 ? JSON.stringify(metadatos) : null;
}

function mostrarNotificacion(tipo, mensaje) {
    const colores = {
        'info': 'bg-blue-500',
        'success': 'bg-green-500',
        'warning': 'bg-yellow-500',
        'error': 'bg-red-500'
    };
    
    const iconos = {
        'info': 'fa-info-circle',
        'success': 'fa-check-circle',
        'warning': 'fa-exclamation-triangle',
        'error': 'fa-times-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white ${colores[tipo]} border-0`;
    toast.setAttribute('role', 'alert');
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas ${iconos[tipo]} me-2"></i>${mensaje}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 4000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toast);
    });
}