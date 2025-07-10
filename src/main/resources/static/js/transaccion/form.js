let transaccionService;
let pasoActual = 1;
let productos = [];
let suplidores = [];
let clientes = [];
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
        [productos, suplidores, clientes] = await Promise.all([
            transaccionService.obtenerProductos(),
            transaccionService.obtenerSuplidores(),
            transaccionService.obtenerClientes()
        ]);
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
        
        // Configurar automáticamente el tipo de contraparte según el tipo de transacción
        if (tipo === 'COMPRA' || tipo === 'DEVOLUCION_COMPRA') {
            suplidorRadio.checked = true;
            clienteRadio.disabled = true;
            suplidorRadio.disabled = false;
        } else if (tipo === 'VENTA' || tipo === 'DEVOLUCION_VENTA') {
            clienteRadio.checked = true;
            suplidorRadio.disabled = true;
            clienteRadio.disabled = false;
        } else {
            clienteRadio.disabled = false;
            suplidorRadio.disabled = false;
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
             onclick="seleccionarContraparte(${item.id}, '${tipoContraparte}', '${item.nombre}')">
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

function seleccionarContraparte(id, tipo, nombre) {
    // Remover selección anterior
    document.querySelectorAll('.counterpart-selector').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Agregar selección actual
    event.currentTarget.classList.add('selected');
    
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
        productoLabel = 'Producto (nuevo)';
        productoInput = `
            <input type="text" class="form-control" placeholder="Nombre del producto" onchange="actualizarNombreProducto(${lineaId}, this)" required>
        `;
    } else {
        // Si es venta o devolución de venta, usar productos existentes
        productoLabel = 'Producto (existente)';
        productosOptions = productos.map(producto => 
            `<option value="${producto.id}" data-precio="${producto.precio}">${producto.nombre}</option>`
        ).join('');
        productoInput = `
            <select class="form-select" onchange="actualizarPrecioProducto(${lineaId}, this)" required>
                <option value="">Seleccionar producto</option>
                ${productosOptions}
            </select>
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
    
    const subtotal = lineasTransaccion.reduce((sum, linea) => sum + linea.total, 0);
    const impuestos = subtotal * 0.18;
    const total = subtotal + impuestos;
    
    const transaccion = {
        tipo: document.getElementById('tipo').value,
        fecha: document.getElementById('fecha').value,
        contraparteId: contraparteSeleccionada.id,
        tipoContraparte: contraparteSeleccionada.tipo,
        contraparteNombre: contraparteSeleccionada.nombre,
        numeroFactura: document.getElementById('numeroFactura').value,
        numeroOrdenCompra: document.getElementById('numeroOrdenCompra').value,
        metodoPago: document.getElementById('metodoPago').value,
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
        mostrarError('Error al guardar la transacción');
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