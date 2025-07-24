let pasoActual = 1;
let tipoDevolucionSeleccionada = '';
let transacciones = [];
let transaccionesFiltradas = [];
let transaccionSeleccionada = null;
let productosADevolver = [];
let productosExpandido = {};
const loadingOverlay = document.getElementById('loadingOverlay');
let productosPorId = {};

async function cargarProductosPorId() {
    try {
        const response = await fetch('/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        const productos = await response.json();
        productosPorId = {};
        productos.forEach(p => {
            productosPorId[p.id] = {
                nombre: p.nombre,
                fotoUrl: p.fotoUrl || null
            };
        });
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await cargarProductosPorId();
    const res = await fetch('/api/transacciones');
    transacciones = await res.json();
    document.getElementById('tipoDevolucionSelect')
        .addEventListener('change', function() {
            tipoDevolucionSeleccionada = this.value;
            actualizarTextosWizard();
        });
    actualizarTextosWizard();
    mostrarPaso(1);
});

function mostrarPaso(paso) {
    document.querySelectorAll('.wizard-step').forEach((step, idx) => {
        step.classList.remove('active', 'completed');
        if (idx === paso - 1) step.classList.add('active');
        else if (idx < paso - 1) step.classList.add('completed');
    });
    document.querySelectorAll('.step-content').forEach((content, idx) => {
        content.classList.toggle('active', idx === paso - 1);
    });
    document.getElementById('btnAnterior').style.display = paso > 1 ? 'block' : 'none';
    document.getElementById('btnSiguiente').style.display = paso < 4 ? 'block' : 'none';
    document.getElementById('btnConfirmar').style.display = paso === 4 ? 'block' : 'none';
    if (paso === 2) cargarTransaccionesParaWizard();
    if (paso === 3) cargarProductosDeTransaccion();
    if (paso === 4) mostrarResumenFinal();
}
window.siguientePaso = function() {
    if (pasoActual === 1 && !tipoDevolucionSeleccionada) return mostrarError('Seleccione el tipo de devolución');
    if (pasoActual === 2 && !transaccionSeleccionada) return mostrarError('Seleccione una transacción');
    if (pasoActual === 3 && productosADevolver.length === 0) return mostrarError('Seleccione al menos una unidad a devolver');
    if (pasoActual < 4) {
        pasoActual++;
        mostrarPaso(pasoActual);
    }
};
window.anteriorPaso = function() {
    if (pasoActual > 1) {
        pasoActual--;
        mostrarPaso(pasoActual);
    }
};

function actualizarTextosWizard() {
    let badge = document.getElementById('tipoTransaccionBadge');
    if (tipoDevolucionSeleccionada === 'DEVOLUCION_VENTA') {
        badge.textContent = 'Devolución Venta';
    } else if (tipoDevolucionSeleccionada === 'DEVOLUCION_COMPRA') {
        badge.textContent = 'Devolución Compra';
    } else {
        badge.textContent = '';
    }
    badge.className = 'transaction-type-badge tipo-devolucion';
    document.getElementById('tipo').value = tipoDevolucionSeleccionada;
    document.getElementById('tipoDisplay').value = badge.textContent;
    document.getElementById('contraparteStepLabel').textContent = 'Transacción';
    document.getElementById('contraparteTitle').textContent = 'Seleccionar Transacción';
    document.getElementById('confirmContraparteLabel').textContent = 'Transacción:';
}

function cargarTransaccionesParaWizard() {
    const tipo = tipoDevolucionSeleccionada === 'DEVOLUCION_COMPRA' ? 'COMPRA' : 'VENTA';
    transaccionesFiltradas = transacciones.filter(t => t.tipo === tipo && t.estado !== 'CANCELADA');
    mostrarTransaccionesWizard();
}
function mostrarTransaccionesWizard() {
    const container = document.getElementById('contraparteContainer');
    if (!container) return;
    if (transaccionesFiltradas.length === 0) {
        container.innerHTML = `<div class="flex flex-col items-center justify-center py-16 text-center">
            <i class="fas fa-inbox text-6xl text-gray-400 mb-4"></i>
            <h4 class="text-xl font-semibold text-gray-600 mb-2">No hay transacciones disponibles</h4>
            <p class="text-gray-500 text-base">No hay transacciones para seleccionar</p>
        </div>`;
        return;
    }
    container.innerHTML = transaccionesFiltradas.map((t, idx) => `
        <div class="counterpart-card flex items-center ${transaccionSeleccionada && transaccionSeleccionada.id === t.id ? 'selected' : ''}"
            onclick="seleccionarTransaccion(${t.id})" style="margin-bottom: 16px;">
            <div class="w-14 h-14 bg-[#59391B] rounded-full flex items-center justify-center mr-5">
                <i class="fas ${t.tipo === 'COMPRA' ? 'fa-truck' : 'fa-user'} text-white text-2xl"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center">
                    <h4 class="font-semibold text-lg text-[#59391B] truncate">${t.contraparteNombre}</h4>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-${obtenerEstadoColor(t.estado)}-100 text-${obtenerEstadoColor(t.estado)}-800">${t.estado}</span>
                </div>
                <div class="text-gray-600 text-sm mt-1">
                    <strong>${formatearTipo(t.tipo)}</strong> #${t.id} &middot; ${formatearFecha(t.fecha)}
                </div>
                <div class="text-[#7b5222] font-bold mt-1">${formatearMoneda(t.total)}</div>
            </div>
        </div>
    `).join('');
}
window.seleccionarTransaccion = function(id) {
    transaccionSeleccionada = transaccionesFiltradas.find(t => t.id === id);
    productosADevolver = [];
    mostrarTransaccionesWizard();
};

function cargarProductosDeTransaccion() {
    const container = document.getElementById('productosContainer');
    if (!transaccionSeleccionada || !Array.isArray(transaccionSeleccionada.lineas) || transaccionSeleccionada.lineas.length === 0) {
        container.innerHTML = `<div class="text-center py-12"><p class="text-lg text-gray-500">No hay productos en la transacción.</p></div>`;
        return;
    }
    container.innerHTML = `
        <h3 class="text-2xl font-bold text-[#59391B] mb-6">Seleccionar Productos</h3>
        <div class="flex flex-col gap-8">
            ${transaccionSeleccionada.lineas.map((linea, idx) => {
        const producto = productosPorId[linea.productoId] || {};
        let unidades = Array.isArray(linea.unidades) && linea.unidades.length > 0
            ? linea.unidades
            : Array.from({length: linea.cantidad}, (_, i) => ({
                unidadId: i + 1,
                nombre: `Unidad #${i + 1}`
            }));
        return `
                    <div>
                        <div class="flex items-center gap-4 mb-2">
                            ${producto.fotoUrl ? `
                                <img src="${producto.fotoUrl}" alt="Producto" class="w-12 h-12 rounded object-cover border border-gray-200 shadow-sm">
                            ` : `
                                <div class="w-12 h-12 flex items-center justify-center rounded bg-[#F2E8DF] text-[#59391B] text-lg font-bold border border-gray-200 shadow-sm">
                                    <i class="fas fa-box"></i>
                                </div>
                            `}
                            <div>
                                <div class="font-bold text-lg text-[#59391B] leading-tight">${producto.nombre || linea.productoNombre} ${linea.codigo ? `<span class="text-xs text-gray-400">(${linea.codigo})</span>` : ""}</div>
                                <div class="text-xs text-gray-500">ID: ${linea.productoId}</div>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            ${unidades.map(unidad => {
            const checked = productosADevolver.find(sel => sel.productoId === linea.productoId && sel.unidadId === unidad.unidadId) ? 'checked' : '';
            const selClass = checked ? "border-[#59391B] bg-[#F2E8DF]" : "border-gray-300 bg-white";
            return `
                                    <label class="flex items-center gap-3 rounded-lg px-4 py-3 border-2 ${selClass} shadow-sm cursor-pointer transition">
                                        <input type="checkbox" class="accent-[#59391B] w-5 h-5" onchange="toggleUnidadADevolver(${linea.productoId}, ${unidad.unidadId}, ${linea.id})" ${checked}>
                                        <div>
                                            <div class="font-medium text-[#59391B]">${unidad.nombre || `Unidad #${unidad.unidadId}`}</div>
                                            <div class="text-xs text-gray-500">
                                                ID: ${unidad.unidadId}
                                                ${unidad.serial ? `&middot; Serial: ${unidad.serial}` : ""}
                                                ${unidad.lote ? `&middot; Lote: ${unidad.lote}` : ""}
                                            </div>
                                        </div>
                                    </label>
                                `;
        }).join('')}
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

window.toggleUnidadADevolver = function(productoId, unidadId, lineaId) {
    const linea = transaccionSeleccionada.lineas.find(l => l.productoId === productoId && l.id === lineaId);
    const producto = productosPorId[productoId] || {};
    let unidad = (Array.isArray(linea.unidades) && linea.unidades.length > 0)
        ? linea.unidades.find(u => u.unidadId === unidadId)
        : {unidadId: unidadId, nombre: `Unidad #${unidadId}`};
    const i = productosADevolver.findIndex(p => p.productoId === productoId && p.unidadId === unidadId && p.lineaId === lineaId);
    if (i === -1) {
        productosADevolver.push({
            productoId: linea.productoId,
            lineaId: linea.id,
            productoNombre: producto.nombre || linea.productoNombre,
            unidadId: unidad.unidadId,
            nombreUnidad: unidad.nombre || `Unidad #${unidad.unidadId}`,
            serial: unidad.serial,
            lote: unidad.lote,
            precioUnitario: linea.precioUnitario,
            fotoUrl: producto.fotoUrl || null
        });
    } else {
        productosADevolver.splice(i, 1);
    }
    cargarProductosDeTransaccion();
};

function mostrarResumenFinal() {
    document.getElementById('confirmTipo').textContent = document.getElementById('tipoDisplay').value;
    document.getElementById('confirmFecha').textContent = new Date(document.getElementById('fecha').value).toLocaleString('es-DO');
    document.getElementById('confirmTransaccion').textContent = transaccionSeleccionada ? `#${transaccionSeleccionada.id} - ${transaccionSeleccionada.contraparteNombre}` : '';
    let resumen = '';
    const agrupado = {};
    productosADevolver.forEach(p => {
        if (!agrupado[p.productoNombre]) agrupado[p.productoNombre] = [];
        agrupado[p.productoNombre].push(p.unidadId);
    });
    Object.entries(agrupado).forEach(([nombre, ids]) => {
        resumen += `<div><strong>${nombre}</strong>: Unidades [${ids.join(', ')}]</div>`;
    });
    document.getElementById('confirmProductos').innerHTML = resumen;
}

window.confirmarTransaccion = async function() {
    try {
        const lineasAgrupadas = {};
        productosADevolver.forEach(p => {
            const clave = `${p.productoId}_${p.lineaId}`;
            if (!lineasAgrupadas[clave]) lineasAgrupadas[clave] = {
                productoId: p.productoId,
                lineaId: p.lineaId,
                unidades: [],
                cantidad: 0 // acumulador para cantidad
            };
            lineasAgrupadas[clave].unidades.push(p.unidadId);
            lineasAgrupadas[clave].cantidad += 1;
        });

        // Inicializa campos numéricos y productoNombre para cada línea
        const lineasParaEnviar = Object.values(lineasAgrupadas).map(linea => ({
            productoId: linea.productoId,
            lineaId: linea.lineaId,
            cantidad: linea.cantidad,
            unidades: linea.unidades,
            productoNombre: productosPorId[linea.productoId]?.nombre || linea.productoNombre || "Desconocido",
            precioUnitario: 0,
            subtotal: 0,
            impuestoPorcentaje: 0,
            impuestoMonto: 0,
            descuentoPorcentaje: 0,
            descuentoMonto: 0,
            total: 0,
            observaciones: ""
        }));

        let contraparteId = transaccionSeleccionada.contraparteId;
        if (!contraparteId) {
            contraparteId = transaccionSeleccionada.clienteId || transaccionSeleccionada.suplidorId;
        }

        // Validar fecha
        let fechaValor = document.getElementById('fecha').value;
        if (!fechaValor) {
            // Si no hay valor, usar la fecha/hora actual en formato local.
            const now = new Date();
            // Formato compatible con LocalDateTime: 'YYYY-MM-DDTHH:mm'
            fechaValor = now.toISOString().slice(0, 16);
        }

        const devolucion = {
            tipo: tipoDevolucionSeleccionada,
            contraparteId: contraparteId,
            tipoContraparte: (tipoDevolucionSeleccionada === 'DEVOLUCION_COMPRA' ? 'SUPLIDOR' : 'CLIENTE'),
            contraparteNombre: transaccionSeleccionada.contraparteNombre || transaccionSeleccionada.clienteNombre || transaccionSeleccionada.suplidorNombre || "Desconocido",
            transaccionOrigenId: transaccionSeleccionada.id,
            fecha: fechaValor,
            numeroFactura: document.getElementById('numeroFactura').value,
            observaciones: document.getElementById('observaciones').value,
            lineas: lineasParaEnviar
        };

        // Si el usuario no seleccionó fecha, avisa y no envía
        if (!fechaValor) {
            mostrarError("Debes seleccionar una fecha para la devolución.");
            return;
        }

        const response = await fetch('/api/transacciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(devolucion)
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || 'Error al crear la devolución');
        }

        await fetch(`/api/transacciones/${transaccionSeleccionada.id}/cancelar`, { method: 'PUT' });

        mostrarExito('¡Devolución creada y transacción original cancelada!');
        setTimeout(() => window.location.href = 'index.html', 1500);
    } catch (err) {
        console.error("Error al procesar devolución:", err);
        mostrarError('Error al procesar la devolución.');
    }
};

function formatearTipo(tipo) {
    const tipos = { 'COMPRA': 'Compra', 'VENTA': 'Venta', 'DEVOLUCION_COMPRA': 'Devolución Compra', 'DEVOLUCION_VENTA': 'Devolución Venta' };
    return tipos[tipo] || tipo;
}
function obtenerColorTipo(tipo) {
    const colores = { 'COMPRA': 'green-500', 'VENTA': 'yellow-600', 'DEVOLUCION_COMPRA': 'red-500', 'DEVOLUCION_VENTA': 'red-500' };
    return colores[tipo] || 'blue-500';
}
function obtenerTipoIcon(tipo) {
    const iconos = { 'COMPRA': 'fas fa-shopping-cart', 'VENTA': 'fas fa-cash-register', 'DEVOLUCION_COMPRA': 'fas fa-undo', 'DEVOLUCION_VENTA': 'fas fa-undo' };
    return iconos[tipo] || 'fas fa-exchange-alt';
}
function obtenerEstadoColor(estado) {
    const colores = { 'PENDIENTE': 'yellow', 'CONFIRMADA': 'blue', 'COMPLETADA': 'green', 'CANCELADA': 'red' };
    return colores[estado] || 'gray';
}
function formatearFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatearMoneda(cantidad) {
    if (!cantidad && cantidad !== 0) return 'RD$ 0,00';
    const numero = Math.abs(cantidad);
    const partes = numero.toFixed(2).split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimal = partes[1];
    return `RD$ ${entero},${decimal}`;
}
function mostrarError(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    toast.innerHTML = `<div class="flex items-center">
        <i class="fas fa-exclamation-circle mr-3 text-lg"></i>
        <span class="text-sm font-medium">${mensaje}</span>
        <button type="button" class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    </div>`;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 4000);
}
function mostrarExito(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    toast.innerHTML = `<div class="flex items-center">
        <i class="fas fa-check-circle mr-3 text-lg"></i>
        <span class="text-sm font-medium">${mensaje}</span>
        <button type="button" class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    </div>`;
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3000);
}