let transaccionService;
let pasoActual = 1;
let transaccionOriginalSeleccionada = null;
let productosSeleccionados = [];
let transaccionesOriginales = [];
let productosTransaccionOriginal = [];
let tipoDevolucion = ''; // "DEVOLUCION_COMPRA" o "DEVOLUCION_VENTA"

// Configuración de moneda dominicana
const CURRENCY_CONFIG = {
    locale: 'es-DO',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
};

function formatearMonedaDominicana(cantidad) {
    if (!cantidad && cantidad !== 0) return 'RD$ 0,00';
    const numero = Math.abs(cantidad);
    const partes = numero.toFixed(2).split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimal = partes[1];
    return `RD$ ${entero},${decimal}`;
}

document.addEventListener('DOMContentLoaded', async function() {
    transaccionService = new TransaccionService();

    // 1. Detectar si viene por URL y seleccionar el tipo en el combobox
    const urlParams = new URLSearchParams(window.location.search);
    tipoDevolucion = urlParams.get('tipo') || '';
    document.getElementById('tipoDevolucionSelect').value = tipoDevolucion;
    document.getElementById('tipo').value = tipoDevolucion;

    // 2. Actualizar display y badge inicial
    let display = '';
    if (tipoDevolucion === 'DEVOLUCION_COMPRA') display = 'Devolución de Compra';
    else if (tipoDevolucion === 'DEVOLUCION_VENTA') display = 'Devolución de Venta';
    document.getElementById('tipoDisplay').value = display;
    document.getElementById('tipoTransaccionBadge').textContent = display;
    document.getElementById('tipoTransaccionBadge').className = `transaction-type-badge tipo-devolucion`;

    // 3. Listener para cambios en el combobox
    document.getElementById('tipoDevolucionSelect').addEventListener('change', function() {
        tipoDevolucion = this.value;
        document.getElementById('tipo').value = tipoDevolucion;

        let display = '';
        if (tipoDevolucion === 'DEVOLUCION_COMPRA') display = 'Devolución de Compra';
        else if (tipoDevolucion === 'DEVOLUCION_VENTA') display = 'Devolución de Venta';
        else display = '';

        document.getElementById('tipoDisplay').value = display;
        document.getElementById('tipoTransaccionBadge').textContent = display;
        document.getElementById('tipoTransaccionBadge').className = `transaction-type-badge tipo-devolucion`;

        // Si deseas, puedes recargar las transacciones originales según el tipo
        cargarTransaccionesOriginales();
    });

    inicializarAsistenteDevolucion();
    await cargarTransaccionesOriginales();
});

function inicializarAsistenteDevolucion() {
    document.getElementById('tipo').value = tipoDevolucion;
    const display = tipoDevolucion === 'DEVOLUCION_COMPRA' ? 'Devolución de Compra' : 'Devolución de Venta';
    document.getElementById('tipoDisplay').value = display;
    document.getElementById('tipoTransaccionBadge').textContent = display;
    document.getElementById('tipoTransaccionBadge').className = `transaction-type-badge tipo-devolucion`;

    document.getElementById('contraparteStepLabel').textContent = 'Transacción';
    document.getElementById('contraparteTitle').textContent = 'Seleccionar Transacción a Devolver';
    document.getElementById('confirmContraparteLabel').textContent = 'Transacción:';

    // Fecha actual
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    document.getElementById('fecha').value = ahora.toISOString().slice(0, 16);
}

async function cargarTransaccionesOriginales() {
    try {
        // Para devolución de venta, listamos ventas; para compra, las compras
        const endpoint = tipoDevolucion === 'DEVOLUCION_COMPRA'
            ? '/api/transacciones/compras'
            : '/api/transacciones/ventas';
        const resp = await fetch(endpoint);
        transaccionesOriginales = await resp.json();
        cargarTransaccionesEnWizard();
    } catch (error) {
        mostrarError('Error al cargar transacciones originales');
    }
}

function cargarTransaccionesEnWizard() {
    const container = document.getElementById('contraparteContainer');

    if (!transaccionesOriginales || transaccionesOriginales.length === 0) {
        container.innerHTML = `
          <div class="text-center py-12">
            <i class="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600 text-lg mb-4">No hay transacciones para devolver</p>
          </div>
        `;
        return;
    }

    container.innerHTML = transaccionesOriginales.map(tx => `
      <div class="counterpart-card ${transaccionOriginalSeleccionada?.id === tx.id ? 'selected' : ''}"
           onclick="seleccionarTransaccionOriginal(${tx.id})">
        <div>
          <strong>#${tx.id}</strong> - ${tx.contraparteNombre || ''}
          <br>
          <span class="text-gray-500">Fecha: ${tx.fecha}</span>
          <br>
          <span class="text-gray-500">Total: ${formatearMonedaDominicana(tx.total)}</span>
        </div>
      </div>
    `).join('');
}

window.seleccionarTransaccionOriginal = async function(id) {
    transaccionOriginalSeleccionada = transaccionesOriginales.find(t => t.id === id);
    if (!transaccionOriginalSeleccionada) {
        mostrarError('Transacción no encontrada');
        return;
    }
    productosTransaccionOriginal = transaccionOriginalSeleccionada.lineas || [];
    productosSeleccionados = [];
    cargarProductosDeTransaccionOriginal();
    siguientePaso();
};

function siguientePaso() {
    if (!validarPaso(pasoActual)) return;
    if (pasoActual < 4) {
        pasoActual++;
        mostrarPaso(pasoActual);
        if (pasoActual === 2) cargarTransaccionesEnWizard();
        if (pasoActual === 3) cargarProductosDeTransaccionOriginal();
        if (pasoActual === 4) mostrarResumenFinalDevolucion();
    }
}

function anteriorPaso() {
    if (pasoActual > 1) {
        pasoActual--;
        mostrarPaso(pasoActual);
    }
}

function mostrarPaso(paso) {
    document.querySelectorAll('.wizard-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === paso) step.classList.add('active');
        else if (index + 1 < paso) step.classList.add('completed');
    });

    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`step${paso}`).classList.add('active');

    document.getElementById('btnAnterior').style.display = paso > 1 ? 'block' : 'none';
    document.getElementById('btnSiguiente').style.display = paso < 4 ? 'block' : 'none';
    document.getElementById('btnConfirmar').style.display = paso === 4 ? 'block' : 'none';
}

function validarPaso(paso) {
    switch (paso) {
        case 1:
            if (!document.getElementById('fecha').value) {
                mostrarError('Por favor, selecciona una fecha válida');
                return false;
            }
            break;
        case 2:
            if (!transaccionOriginalSeleccionada || !transaccionOriginalSeleccionada.id) {
                mostrarError('Seleccione la transacción original');
                return false;
            }
            break;
        case 3:
            if (productosSeleccionados.length === 0) {
                mostrarError('Seleccione al menos un producto para devolver');
                return false;
            }
            for (let prod of productosSeleccionados) {
                const lineaOriginal = productosTransaccionOriginal.find(l => l.productoId === prod.productoId);
                if (!lineaOriginal) {
                    mostrarError(`Producto inválido`);
                    return false;
                }
                if (prod.cantidad <= 0 || prod.cantidad > lineaOriginal.cantidad) {
                    mostrarError(`Cantidad inválida para ${lineaOriginal.productoNombre}. Máx: ${lineaOriginal.cantidad}`);
                    return false;
                }
            }
            break;
    }
    return true;
}

function cargarProductosDeTransaccionOriginal() {
    const container = document.getElementById('productosContainer');
    if (!productosTransaccionOriginal || productosTransaccionOriginal.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8">
            <i class="fas fa-exclamation-circle text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600 text-lg">No hay productos en la transacción original</p>
          </div>
        `;
        return;
    }

    container.innerHTML = productosTransaccionOriginal.map(producto => {
        const seleccionado = productosSeleccionados.find(p => p.productoId === producto.productoId);
        return `
        <div class="counterpart-card ${seleccionado ? 'selected' : ''}">
            <div class="flex items-center">
                <div class="w-12 h-12 bg-[#7b5222] rounded-full flex items-center justify-center mr-4">
                    <i class="fas fa-box text-white"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-lg text-[#59391B]">${producto.productoNombre}</h4>
                    <span class="text-sm text-gray-500">Vendidos: ${producto.cantidad}</span>
                    <span class="text-sm text-gray-500 ml-2">Precio: ${formatearMonedaDominicana(producto.precioUnitario)}</span>
                </div>
                <div>
                    <input type="number" min="0" max="${producto.cantidad}" value="${seleccionado ? seleccionado.cantidad : 0}"
                        class="w-20 px-2 py-1 border rounded text-center"
                        onchange="actualizarCantidadDevolucion(${producto.productoId}, this.value, '${producto.productoNombre}', ${producto.precioUnitario})">
                </div>
            </div>
        </div>
        `;
    }).join('');
    actualizarResumenProductosDevolucion();
}

window.actualizarCantidadDevolucion = function(productoId, nuevaCantidad, productoNombre, precioUnitario) {
    nuevaCantidad = parseInt(nuevaCantidad) || 0;
    const idx = productosSeleccionados.findIndex(p => p.productoId === productoId);
    if (idx >= 0) {
        if (nuevaCantidad > 0) {
            productosSeleccionados[idx].cantidad = nuevaCantidad;
        } else {
            productosSeleccionados.splice(idx, 1);
        }
    } else if (nuevaCantidad > 0) {
        productosSeleccionados.push({
            productoId,
            productoNombre,
            cantidad: nuevaCantidad,
            precioUnitario
        });
    }
    cargarProductosDeTransaccionOriginal();
};

function actualizarResumenProductosDevolucion() {
    const productosDiv = document.getElementById('productosSeleccionados');
    if (productosSeleccionados.length > 0) {
        productosDiv.style.display = 'block';
        const listaHtml = productosSeleccionados.map(producto => `
            <div class="product-item flex justify-between items-center">
                <div>
                    <span class="font-medium">${producto.productoNombre}</span>
                    <span class="text-gray-600 text-sm ml-2">(${producto.cantidad} × ${formatearMonedaDominicana(producto.precioUnitario)})</span>
                </div>
                <span class="font-bold text-[#7b5222]">${formatearMonedaDominicana(producto.precioUnitario * producto.cantidad)}</span>
            </div>
        `).join('');
        document.getElementById('listaProductosSeleccionados').innerHTML = listaHtml;
    } else {
        productosDiv.style.display = 'none';
    }
}

function mostrarResumenFinalDevolucion() {
    document.getElementById('confirmTipo').textContent = document.getElementById('tipoDisplay').value;
    document.getElementById('confirmFecha').textContent = new Date(document.getElementById('fecha').value).toLocaleString('es-DO');
    document.getElementById('confirmTransaccion').textContent = `#${transaccionOriginalSeleccionada.id} - ${transaccionOriginalSeleccionada.contraparteNombre || ''}`;

    // Lista de productos
    const productosHtml = productosSeleccionados.map(producto => {
        const totalProducto = producto.precioUnitario * producto.cantidad;
        return `
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
                <div>
                    <span class="font-medium">${producto.productoNombre}</span>
                    <span class="text-gray-600 text-sm ml-2">(${producto.cantidad} × ${formatearMonedaDominicana(producto.precioUnitario)})</span>
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
    btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...';
    btnConfirmar.disabled = true;
    document.getElementById('loadingOverlay').classList.remove('hidden');

    try {
        // Validaciones finales
        if (!transaccionOriginalSeleccionada || !transaccionOriginalSeleccionada.id) {
            throw new Error('Debe seleccionar la transacción original');
        }
        if (productosSeleccionados.length === 0) {
            throw new Error('Seleccione al menos un producto para devolver');
        }
        for (let prod of productosSeleccionados) {
            const lineaOriginal = productosTransaccionOriginal.find(l => l.productoId === prod.productoId);
            if (!lineaOriginal || prod.cantidad > lineaOriginal.cantidad) {
                throw new Error(`Cantidad inválida para ${prod.productoNombre}`);
            }
        }

        // Calcular totales
        const subtotal = productosSeleccionados.reduce((sum, p) => sum + (p.precioUnitario * p.cantidad), 0);
        const itbis = subtotal * 0.18;
        const total = subtotal + itbis;

        // Construir transacción devolución
        const devolucion = {
            tipo: tipoDevolucion,
            fecha: document.getElementById('fecha').value,
            contraparteId: transaccionOriginalSeleccionada.contraparteId,
            tipoContraparte: transaccionOriginalSeleccionada.tipoContraparte,
            contraparteNombre: transaccionOriginalSeleccionada.contraparteNombre,
            transaccionOrigenId: transaccionOriginalSeleccionada.id,
            numeroFactura: document.getElementById('numeroFactura').value || null,
            observaciones: document.getElementById('observaciones').value || null,
            subtotal: subtotal,
            impuestos: itbis,
            total: total,
            estado: 'PENDIENTE',
            lineas: productosSeleccionados.map(producto => ({
                productoId: producto.productoId,
                productoNombre: producto.productoNombre,
                cantidad: producto.cantidad,
                precioUnitario: producto.precioUnitario,
                impuestoPorcentaje: 18.0,
                subtotal: producto.precioUnitario * producto.cantidad,
                impuestoMonto: (producto.precioUnitario * producto.cantidad) * 0.18,
                total: (producto.precioUnitario * producto.cantidad) * 1.18
            }))
        };

        await transaccionService.crearTransaccion(devolucion);

        mostrarExito('¡Devolución registrada exitosamente!');
        setTimeout(() => { window.location.href = 'index.html'; }, 2000);

    } catch (error) {
        mostrarError(error.message || 'Error al crear la devolución');
        btnConfirmar.innerHTML = textoOriginal;
        btnConfirmar.disabled = false;
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
}

// Notificaciones
function mostrarError(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    toast.innerHTML = `<div class="flex items-center"><i class="fas fa-exclamation-circle mr-3 text-lg"></i><span class="font-medium">${mensaje}</span><button type="button" class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-times"></i></button></div>`;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 5000);
}

function mostrarExito(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    toast.innerHTML = `<div class="flex items-center"><i class="fas fa-check-circle mr-3 text-lg"></i><span class="font-medium">${mensaje}</span><button type="button" class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()"><i class="fas fa-times"></i></button></div>`;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3000);
}