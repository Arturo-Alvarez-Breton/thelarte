// Gestión de transacciones del cajero
class TransaccionesCajero {
    constructor() {
        this.paginaActual = 0;
        this.tamañoPagina = 20;
        this.transaccionActual = null;
        this.init();
    }

    init() {
        this.configurarEventos();
        this.cargarTransacciones();
        this.configurarFechaDefecto();
    }

    configurarEventos() {
        // Eventos de filtros
        document.getElementById('filtroTipo').addEventListener('change', () => this.aplicarFiltros());
        document.getElementById('filtroEstado').addEventListener('change', () => this.aplicarFiltros());
        document.getElementById('fechaDesde').addEventListener('change', () => this.aplicarFiltros());
        document.getElementById('fechaHasta').addEventListener('change', () => this.aplicarFiltros());
    }

    configurarFechaDefecto() {
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fechaDesde').value = hoy;
        document.getElementById('fechaHasta').value = hoy;
    }

    async cargarTransacciones() {
        this.mostrarLoading(true);
        
        try {
            const params = this.construirParametrosFiltro();
            const response = await fetch(`/api/cajero/transacciones?${params}`);
            
            if (response.ok) {
                const transacciones = await response.json();
                this.renderizarTransacciones(transacciones);
                this.actualizarContador(transacciones.length);
            } else {
                console.error('Error al cargar transacciones:', response.status);
                this.mostrarMensajeError('Error al cargar las transacciones');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            this.mostrarMensajeError('Error de conexión');
        } finally {
            this.mostrarLoading(false);
        }
    }

    construirParametrosFiltro() {
        const params = new URLSearchParams();
        
        const tipo = document.getElementById('filtroTipo').value;
        const estado = document.getElementById('filtroEstado').value;
        const fechaDesde = document.getElementById('fechaDesde').value;
        const fechaHasta = document.getElementById('fechaHasta').value;
        
        if (tipo) params.append('tipo', tipo);
        if (estado) params.append('estado', estado);
        if (fechaDesde) params.append('fechaDesde', fechaDesde);
        if (fechaHasta) params.append('fechaHasta', fechaHasta);
        
        params.append('page', this.paginaActual);
        params.append('size', this.tamañoPagina);
        
        return params.toString();
    }

    renderizarTransacciones(transacciones) {
        const tbody = document.getElementById('tablaTransacciones');
        
        if (transacciones.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                        No se encontraron transacciones
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = transacciones.map(transaccion => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${transaccion.numeroFactura}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${transaccion.cliente ? transaccion.cliente.nombre + ' ' + transaccion.cliente.apellido : 'Cliente Consumidor'}</div>
                    ${transaccion.cliente ? `<div class="text-xs text-gray-500">${transaccion.cliente.cedula}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getColorTipo(transaccion.tipoTransaccion)}">
                        ${this.formatearTipoTransaccion(transaccion.tipoTransaccion)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">$${this.formatearMoneda(transaccion.total)}</div>
                    ${transaccion.metodoPago ? `<div class="text-xs text-gray-500">${transaccion.metodoPago}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getColorEstado(transaccion.estado)}">
                        ${this.formatearEstado(transaccion.estado)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${this.formatearFecha(transaccion.fecha)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="verTransaccion(${transaccion.id})" class="text-blue-600 hover:text-blue-900 transition-colors">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="imprimirTransaccion(${transaccion.id})" class="text-green-600 hover:text-green-900 transition-colors">
                            <i class="fas fa-print"></i>
                        </button>
                        ${transaccion.estado === 'PENDIENTE' ? `
                            <button onclick="editarTransaccion(${transaccion.id})" class="text-yellow-600 hover:text-yellow-900 transition-colors">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async verTransaccion(id) {
        try {
            const response = await fetch(`/api/cajero/transacciones/${id}`);
            
            if (response.ok) {
                const transaccion = await response.json();
                this.mostrarDetallesTransaccion(transaccion);
            } else {
                alert('Error al cargar detalles de la transacción');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    }

    mostrarDetallesTransaccion(transaccion) {
        this.transaccionActual = transaccion;
        
        const detallesContainer = document.getElementById('detallesTransaccion');
        
        detallesContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h4 class="font-semibold text-gray-900 mb-3">Información General</h4>
                    <div class="space-y-2 text-sm">
                        <div><span class="font-medium">Número de Factura:</span> ${transaccion.numeroFactura}</div>
                        <div><span class="font-medium">Tipo:</span> ${this.formatearTipoTransaccion(transaccion.tipoTransaccion)}</div>
                        <div><span class="font-medium">Estado:</span> <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getColorEstado(transaccion.estado)}">${this.formatearEstado(transaccion.estado)}</span></div>
                        <div><span class="font-medium">Fecha:</span> ${this.formatearFechaCompleta(transaccion.fecha)}</div>
                        <div><span class="font-medium">Método de Pago:</span> ${transaccion.metodoPago || 'No especificado'}</div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-gray-900 mb-3">Cliente</h4>
                    <div class="space-y-2 text-sm">
                        ${transaccion.cliente ? `
                            <div><span class="font-medium">Nombre:</span> ${transaccion.cliente.nombre} ${transaccion.cliente.apellido}</div>
                            <div><span class="font-medium">Cédula:</span> ${transaccion.cliente.cedula}</div>
                            <div><span class="font-medium">Teléfono:</span> ${transaccion.cliente.telefono || 'No disponible'}</div>
                            <div><span class="font-medium">Email:</span> ${transaccion.cliente.email || 'No disponible'}</div>
                        ` : `
                            <div class="text-gray-500">Cliente Consumidor Final</div>
                        `}
                    </div>
                </div>
            </div>
            
            <div class="mb-6">
                <h4 class="font-semibold text-gray-900 mb-3">Productos</h4>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 py-2 text-left">Producto</th>
                                <th class="px-3 py-2 text-right">Cantidad</th>
                                <th class="px-3 py-2 text-right">Precio Unit.</th>
                                <th class="px-3 py-2 text-right">Descuento</th>
                                <th class="px-3 py-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(transaccion.lineas || []).map(linea => `
                                <tr class="border-t">
                                    <td class="px-3 py-2">
                                        <div class="font-medium">${linea.nombreProducto}</div>
                                        <div class="text-xs text-gray-500">${linea.codigoProducto}</div>
                                    </td>
                                    <td class="px-3 py-2 text-right">${linea.cantidad}</td>
                                    <td class="px-3 py-2 text-right">$${this.formatearMoneda(linea.precioUnitario)}</td>
                                    <td class="px-3 py-2 text-right">$${this.formatearMoneda(linea.descuento)}</td>
                                    <td class="px-3 py-2 text-right font-medium">$${this.formatearMoneda(linea.subtotalLinea)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex justify-between items-center text-sm mb-2">
                    <span>Subtotal:</span>
                    <span>$${this.formatearMoneda(transaccion.subtotal)}</span>
                </div>
                <div class="flex justify-between items-center text-sm mb-2">
                    <span>Impuestos:</span>
                    <span>$${this.formatearMoneda(transaccion.impuestos)}</span>
                </div>
                <div class="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>$${this.formatearMoneda(transaccion.total)}</span>
                </div>
            </div>
            
            ${transaccion.observaciones ? `
                <div class="mt-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Observaciones</h4>
                    <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded">${transaccion.observaciones}</p>
                </div>
            ` : ''}
        `;
        
        document.getElementById('modalVerTransaccion').classList.remove('hidden');
    }

    async imprimirTransaccion(id) {
        try {
            const response = await fetch(`/api/cajero/facturas/${id}/imprimir`);
            
            if (response.ok) {
                const facturaData = await response.json();
                this.abrirVentanaImpresion(facturaData);
                
                // Marcar como impresa
                await fetch(`/api/cajero/facturas/${id}/marcar-impresa`, { method: 'POST' });
            } else {
                alert('Error al preparar la factura para impresión');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al imprimir');
        }
    }

    abrirVentanaImpresion(facturaData) {
        const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
        
        const htmlFactura = this.generarHTMLFactura(facturaData);
        
        ventanaImpresion.document.write(htmlFactura);
        ventanaImpresion.document.close();
        
        ventanaImpresion.onload = function() {
            ventanaImpresion.print();
        };
    }

    generarHTMLFactura(factura) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Factura ${factura.factura.numeroFactura}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .company-info { text-align: center; margin-bottom: 20px; }
                    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .client-info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total-section { text-align: right; }
                    .footer { margin-top: 30px; text-align: center; font-size: 10px; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${factura.empresa.nombre}</h1>
                    <p>RNC: ${factura.empresa.rnc}</p>
                    <p>${factura.empresa.direccion}</p>
                    <p>Tel: ${factura.empresa.telefono} | Email: ${factura.empresa.email}</p>
                </div>
                
                <div class="invoice-info">
                    <div>
                        <h3>${factura.factura.tipo}</h3>
                        <p><strong>Número:</strong> ${factura.factura.numeroFactura}</p>
                        <p><strong>NCF:</strong> ${factura.factura.ncf || 'N/A'}</p>
                    </div>
                    <div>
                        <p><strong>Fecha:</strong> ${new Date(factura.factura.fecha).toLocaleString('es-DO')}</p>
                        <p><strong>Cajero:</strong> ${factura.factura.cajero}</p>
                        <p><strong>Método de Pago:</strong> ${factura.factura.metodoPago}</p>
                    </div>
                </div>
                
                <div class="client-info">
                    <h4>Datos del Cliente</h4>
                    <p><strong>Nombre:</strong> ${factura.cliente.nombre} ${factura.cliente.apellido || ''}</p>
                    ${factura.cliente.cedula ? `<p><strong>Cédula:</strong> ${factura.cliente.cedula}</p>` : ''}
                    ${factura.cliente.telefono ? `<p><strong>Teléfono:</strong> ${factura.cliente.telefono}</p>` : ''}
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Cant.</th>
                            <th>Precio Unit.</th>
                            <th>Descuento</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(factura.lineas || []).map(linea => `
                            <tr>
                                <td>${linea.codigo}</td>
                                <td>${linea.descripcion}</td>
                                <td>${linea.cantidad}</td>
                                <td>$${this.formatearMoneda(linea.precioUnitario)}</td>
                                <td>$${this.formatearMoneda(linea.descuento)}</td>
                                <td>$${this.formatearMoneda(linea.subtotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <p><strong>Subtotal: $${this.formatearMoneda(factura.resumen.subtotal)}</strong></p>
                    <p><strong>Descuentos: $${this.formatearMoneda(factura.resumen.totalDescuentos)}</strong></p>
                    <p><strong>ITBIS: $${this.formatearMoneda(factura.resumen.totalItbis)}</strong></p>
                    <h3>TOTAL: $${this.formatearMoneda(factura.resumen.total)}</h3>
                </div>
                
                <div class="footer">
                    <p>¡Gracias por su compra!</p>
                    <p>Documento procesado digitalmente</p>
                </div>
            </body>
            </html>
        `;
    }

    aplicarFiltros() {
        this.paginaActual = 0;
        this.cargarTransacciones();
    }

    limpiarFiltros() {
        document.getElementById('filtroTipo').value = '';
        document.getElementById('filtroEstado').value = '';
        document.getElementById('fechaDesde').value = '';
        document.getElementById('fechaHasta').value = '';
        this.aplicarFiltros();
    }

    cerrarModalVerTransaccion() {
        document.getElementById('modalVerTransaccion').classList.add('hidden');
        this.transaccionActual = null;
    }

    imprimirFactura() {
        if (this.transaccionActual) {
            this.imprimirTransaccion(this.transaccionActual.id);
        }
    }

    nuevaVenta() {
        // Redireccionar a la página de nueva venta o abrir modal
        alert('Funcionalidad de nueva venta - Por implementar');
    }

    mostrarLoading(mostrar) {
        const loading = document.getElementById('loadingTransacciones');
        const tabla = document.getElementById('tablaTransacciones');
        
        if (mostrar) {
            loading.classList.remove('hidden');
            tabla.innerHTML = '';
        } else {
            loading.classList.add('hidden');
        }
    }

    actualizarContador(total) {
        document.getElementById('totalTransacciones').textContent = `${total} transacciones`;
    }

    mostrarMensajeError(mensaje) {
        const tbody = document.getElementById('tablaTransacciones');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-red-500">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    ${mensaje}
                </td>
            </tr>
        `;
    }

    // Utilidades
    getColorTipo(tipo) {
        switch (tipo) {
            case 'VENTA':
                return 'bg-green-100 text-green-800';
            case 'DEVOLUCION_VENTA':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getColorEstado(estado) {
        switch (estado) {
            case 'PENDIENTE':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMADA':
                return 'bg-blue-100 text-blue-800';
            case 'COMPLETADA':
                return 'bg-green-100 text-green-800';
            case 'CANCELADA':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    formatearTipoTransaccion(tipo) {
        switch (tipo) {
            case 'VENTA':
                return 'Venta';
            case 'DEVOLUCION_VENTA':
                return 'Devolución';
            default:
                return tipo;
        }
    }

    formatearEstado(estado) {
        switch (estado) {
            case 'PENDIENTE':
                return 'Pendiente';
            case 'CONFIRMADA':
                return 'Confirmada';
            case 'COMPLETADA':
                return 'Completada';
            case 'CANCELADA':
                return 'Cancelada';
            default:
                return estado;
        }
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
        return date.toLocaleDateString('es-DO');
    }

    formatearFechaCompleta(fecha) {
        if (!fecha) return '';
        const date = new Date(fecha);
        return date.toLocaleString('es-DO');
    }
}

// Funciones globales
function verTransaccion(id) {
    transaccionesCajero.verTransaccion(id);
}

function imprimirTransaccion(id) {
    transaccionesCajero.imprimirTransaccion(id);
}

function editarTransaccion(id) {
    alert('Funcionalidad de edición - Por implementar');
}

function aplicarFiltros() {
    transaccionesCajero.aplicarFiltros();
}

function limpiarFiltros() {
    transaccionesCajero.limpiarFiltros();
}

function cerrarModalVerTransaccion() {
    transaccionesCajero.cerrarModalVerTransaccion();
}

function imprimirFactura() {
    transaccionesCajero.imprimirFactura();
}

function nuevaVenta() {
    transaccionesCajero.nuevaVenta();
}

// Inicializar
const transaccionesCajero = new TransaccionesCajero();