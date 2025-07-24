// Dashboard del cajero
class DashboardCajero {
    constructor() {
        this.init();
    }

    init() {
        this.cargarDashboard();
        this.configurarEventos();
        // Actualizar cada 30 segundos
        setInterval(() => this.cargarDashboard(), 30000);
    }

    configurarEventos() {
        document.getElementById('abrirCajaBtn').addEventListener('click', () => this.mostrarModalAbrirCaja());
        document.getElementById('cerrarCajaBtn').addEventListener('click', () => this.mostrarModalCerrarCaja());
    }

    async cargarDashboard() {
        try {
            const response = await fetch('/api/cajero/dashboard');
            if (response.ok) {
                const data = await response.json();
                this.renderizarDashboard(data);
            } else {
                console.error('Error al cargar dashboard:', response.status);
                this.mostrarMensajeError('Error al cargar los datos del dashboard');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            this.mostrarDashboardOffline();
        }
    }

    renderizarDashboard(data) {
        this.renderizarEstadoCaja(data.estadoCaja || {});
        this.renderizarResumenDelDia(data.resumenDelDia || {});
        this.renderizarTransaccionesRecientes(data.transaccionesRecientes || []);
        this.renderizarProductosMasVendidos(data.productosMasVendidos || []);
        this.actualizarBotonesCaja(data.estadoCaja || {});
    }

    renderizarEstadoCaja(estadoCaja) {
        const container = document.getElementById('estadoCaja');
        
        const estado = estadoCaja.cajaAbierta ? 'ABIERTA' : 'CERRADA';
        const colorEstado = estadoCaja.cajaAbierta ? 'text-green-600' : 'text-red-600';
        
        container.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-cash-register text-2xl ${colorEstado}"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">Estado de Caja</p>
                        <p class="text-lg font-semibold ${colorEstado}">${estado}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-money-bill-wave text-2xl text-green-600"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">Efectivo en Caja</p>
                        <p class="text-lg font-semibold text-gray-900">$${this.formatearMoneda(estadoCaja.totalEfectivoEnCaja || 0)}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-credit-card text-2xl text-blue-600"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">Ventas Tarjeta</p>
                        <p class="text-lg font-semibold text-gray-900">$${this.formatearMoneda(estadoCaja.totalVentasTarjeta || 0)}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-user text-2xl text-brand-brown"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">Cajero</p>
                        <p class="text-lg font-semibold text-gray-900">${estadoCaja.cajeroActual || 'No asignado'}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderizarResumenDelDia(resumen) {
        const container = document.getElementById('resumenDelDia');
        
        container.innerHTML = `
            <div class="bg-blue-50 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-shopping-cart text-2xl text-blue-600"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">Total Ventas</p>
                        <p class="text-lg font-semibold text-gray-900">$${this.formatearMoneda(resumen.totalVentas || 0)}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-green-50 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-receipt text-2xl text-green-600"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">Transacciones</p>
                        <p class="text-lg font-semibold text-gray-900">${resumen.totalTransacciones || 0}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-purple-50 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-users text-2xl text-purple-600"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">Clientes Atendidos</p>
                        <p class="text-lg font-semibold text-gray-900">${resumen.clientesAtendidos || 0}</p>
                    </div>
                </div>
            </div>
            
            <div class="bg-yellow-50 rounded-lg p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-chart-line text-2xl text-yellow-600"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-500">Promedio por Cliente</p>
                        <p class="text-lg font-semibold text-gray-900">$${this.formatearMoneda(resumen.promedioVentaPorCliente || 0)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderizarTransaccionesRecientes(transacciones) {
        const container = document.getElementById('transaccionesRecientes');
        
        if (transacciones.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay transacciones recientes</p>';
            return;
        }
        
        container.innerHTML = transacciones.map(transaccion => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-receipt text-brand-brown"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900">${transaccion.numeroFactura}</p>
                        <p class="text-xs text-gray-500">${transaccion.clienteNombre}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-semibold text-gray-900">$${this.formatearMoneda(transaccion.total)}</p>
                    <p class="text-xs text-gray-500">${this.formatearFecha(transaccion.fecha)}</p>
                </div>
            </div>
        `).join('');
    }

    renderizarProductosMasVendidos(productos) {
        const container = document.getElementById('productosMasVendidos');
        
        if (productos.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay datos de productos vendidos hoy</p>';
            return;
        }
        
        container.innerHTML = productos.map(producto => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <i class="fas fa-box text-brand-brown"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900">${producto.nombreProducto}</p>
                        <p class="text-xs text-gray-500">${producto.categoria || 'Sin categoría'}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-semibold text-gray-900">${producto.cantidadVendida} unidades</p>
                    <p class="text-xs text-gray-500">$${this.formatearMoneda(producto.totalVendido)}</p>
                </div>
            </div>
        `).join('');
    }

    actualizarBotonesCaja(estadoCaja) {
        const btnAbrir = document.getElementById('abrirCajaBtn');
        const btnCerrar = document.getElementById('cerrarCajaBtn');
        
        if (estadoCaja.cajaAbierta) {
            btnAbrir.disabled = true;
            btnAbrir.classList.add('opacity-50', 'cursor-not-allowed');
            btnCerrar.disabled = false;
            btnCerrar.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            btnAbrir.disabled = false;
            btnAbrir.classList.remove('opacity-50', 'cursor-not-allowed');
            btnCerrar.disabled = true;
            btnCerrar.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    mostrarModalAbrirCaja() {
        document.getElementById('modalAbrirCaja').classList.remove('hidden');
        document.getElementById('montoInicialInput').focus();
    }

    mostrarModalCerrarCaja() {
        document.getElementById('modalCerrarCaja').classList.remove('hidden');
        document.getElementById('efectivoContadoInput').focus();
    }

    async confirmarAbrirCaja() {
        const montoInicial = parseFloat(document.getElementById('montoInicialInput').value) || 0;
        
        if (montoInicial < 0) {
            alert('El monto inicial no puede ser negativo');
            return;
        }
        
        try {
            const response = await fetch('/api/cajero/caja/abrir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `montoInicial=${montoInicial}`
            });
            
            if (response.ok) {
                this.cerrarModalAbrirCaja();
                this.cargarDashboard();
                this.mostrarNotificacion('Caja abierta correctamente', 'success');
            } else {
                const error = await response.text();
                alert('Error al abrir caja: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al abrir caja');
        }
    }

    async confirmarCerrarCaja() {
        const efectivoContado = parseFloat(document.getElementById('efectivoContadoInput').value) || 0;
        const observaciones = document.getElementById('observacionesInput').value;
        
        if (efectivoContado < 0) {
            alert('El efectivo contado no puede ser negativo');
            return;
        }
        
        try {
            const params = new URLSearchParams();
            params.append('montoEfectivoCierre', efectivoContado);
            if (observaciones) {
                params.append('observaciones', observaciones);
            }
            
            const response = await fetch('/api/cajero/caja/cerrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });
            
            if (response.ok) {
                const resultado = await response.json();
                this.cerrarModalCerrarCaja();
                this.cargarDashboard();
                this.mostrarResumenCierre(resultado);
            } else {
                const error = await response.text();
                alert('Error al cerrar caja: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al cerrar caja');
        }
    }

    cerrarModalAbrirCaja() {
        document.getElementById('modalAbrirCaja').classList.add('hidden');
        document.getElementById('montoInicialInput').value = '';
    }

    cerrarModalCerrarCaja() {
        document.getElementById('modalCerrarCaja').classList.add('hidden');
        document.getElementById('efectivoContadoInput').value = '';
        document.getElementById('observacionesInput').value = '';
    }

    mostrarResumenCierre(caja) {
        const diferencia = caja.diferenciaCaja || 0;
        const mensaje = diferencia === 0 ? 
            'Caja cerrada correctamente. Sin diferencias.' :
            `Caja cerrada. Diferencia: $${this.formatearMoneda(Math.abs(diferencia))} ${diferencia > 0 ? 'sobrante' : 'faltante'}`;
        
        this.mostrarNotificacion(mensaje, diferencia === 0 ? 'success' : 'warning');
    }

    mostrarDashboardOffline() {
        document.getElementById('estadoCaja').innerHTML = '<p class="text-red-500 text-center py-4">Sin conexión - Datos no disponibles</p>';
        document.getElementById('resumenDelDia').innerHTML = '<p class="text-red-500 text-center py-4">Sin conexión - Datos no disponibles</p>';
        document.getElementById('transaccionesRecientes').innerHTML = '<p class="text-red-500 text-center py-4">Sin conexión - Datos no disponibles</p>';
        document.getElementById('productosMasVendidos').innerHTML = '<p class="text-red-500 text-center py-4">Sin conexión - Datos no disponibles</p>';
    }

    mostrarMensajeError(mensaje) {
        console.error(mensaje);
        // Aquí podrías mostrar una notificación toast
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Implementar sistema de notificaciones toast
        console.log(`${tipo.toUpperCase()}: ${mensaje}`);
        alert(mensaje); // Temporal
    }

    formatearMoneda(valor) {
        return parseFloat(valor || 0).toLocaleString('es-DO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    formatearFecha(fecha) {
        if (!fecha) return '';
        const date = new Date(fecha);
        return date.toLocaleString('es-DO', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Funciones globales para los modales
function cerrarModalAbrirCaja() {
    dashboardCajero.cerrarModalAbrirCaja();
}

function cerrarModalCerrarCaja() {
    dashboardCajero.cerrarModalCerrarCaja();
}

function confirmarAbrirCaja() {
    dashboardCajero.confirmarAbrirCaja();
}

function confirmarCerrarCaja() {
    dashboardCajero.confirmarCerrarCaja();
}

// Inicializar cuando se carga la página
const dashboardCajero = new DashboardCajero();