let devolucionService;
let transaccionService;
let suplidorService;
let transaccionSeleccionada = null;
let suplidorSeleccionado = null;
let lineasSeleccionadas = [];

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
    devolucionService = new DevolucionService();
    transaccionService = new TransaccionService();
    suplidorService = new SuplidorService();
    
    inicializarFormulario();
    await cargarDatos();
});

function inicializarFormulario() {
    // Configurar fecha actual
    const fechaActual = new Date().toISOString().slice(0, 16);
    document.getElementById('fechaDevolucion').value = fechaActual;
    
    // Event listeners
    document.getElementById('buscarTransaccion').addEventListener('click', buscarTransaccion);
    document.getElementById('buscarSuplidor').addEventListener('click', buscarSuplidor);
    document.getElementById('btnGuardarDevolucion').addEventListener('click', crearDevolucion);
    document.getElementById('btnCancelar').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

async function cargarDatos() {
    try {
        await cargarDevoluciones();
    } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarError('Error al cargar los datos iniciales');
    }
}

async function cargarDevoluciones() {
    try {
        const devoluciones = await devolucionService.obtenerTodas();
        const tbody = document.getElementById('listaDevoluciones');
        tbody.innerHTML = '';
        
        devoluciones.forEach(devolucion => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${devolucion.id}</td>
                <td>${devolucion.transaccionId}</td>
                <td>${devolucion.suplidorNombre}</td>
                <td>${formatearFecha(devolucion.fechaDevolucion)}</td>
                <td><span class="badge badge-${getEstadoBadgeClass(devolucion.estadoDevolucion)}">${devolucion.estadoDevolucion}</span></td>
                <td>${devolucion.motivoDevolucion || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="verDetalle(${devolucion.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editarDevolucion(${devolucion.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${devolucion.estadoDevolucion === 'PENDIENTE' ? 
                        `<button class="btn btn-sm btn-success" onclick="procesarDevolucion(${devolucion.id})">
                            <i class="fas fa-play"></i>
                        </button>` : ''}
                    ${devolucion.estadoDevolucion === 'PROCESANDO' ? 
                        `<button class="btn btn-sm btn-primary" onclick="completarDevolucion(${devolucion.id})">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="cancelarDevolucion(${devolucion.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        actualizarEstadisticas(devoluciones);
    } catch (error) {
        console.error('Error cargando devoluciones:', error);
        mostrarError('Error al cargar las devoluciones');
    }
}

function actualizarEstadisticas(devoluciones) {
    const pendientes = devoluciones.filter(d => d.estadoDevolucion === 'PENDIENTE').length;
    const procesando = devoluciones.filter(d => d.estadoDevolucion === 'PROCESANDO').length;
    const completadas = devoluciones.filter(d => d.estadoDevolucion === 'COMPLETADA').length;
    
    document.getElementById('totalDevoluciones').textContent = devoluciones.length;
    document.getElementById('devolucionesPendientes').textContent = pendientes;
    document.getElementById('devolucionesProcesando').textContent = procesando;
    document.getElementById('devolucionesCompletadas').textContent = completadas;
}

async function buscarTransaccion() {
    const transaccionId = document.getElementById('transaccionId').value;
    
    if (!transaccionId) {
        mostrarError('Ingrese un ID de transacción');
        return;
    }
    
    try {
        const transaccion = await transaccionService.obtenerPorId(transaccionId);
        
        if (!transaccion) {
            mostrarError('Transacción no encontrada');
            return;
        }
        
        if (transaccion.tipo !== 'COMPRA') {
            mostrarError('Solo se pueden crear devoluciones para compras');
            return;
        }
        
        transaccionSeleccionada = transaccion;
        mostrarDetallesTransaccion(transaccion);
        
    } catch (error) {
        console.error('Error buscando transacción:', error);
        mostrarError('Error al buscar la transacción');
    }
}

async function buscarSuplidor() {
    const suplidorId = document.getElementById('suplidorId').value;
    
    if (!suplidorId) {
        mostrarError('Ingrese un ID de suplidor');
        return;
    }
    
    try {
        const suplidor = await suplidorService.obtenerPorId(suplidorId);
        
        if (!suplidor) {
            mostrarError('Suplidor no encontrado');
            return;
        }
        
        suplidorSeleccionado = suplidor;
        document.getElementById('suplidorNombre').value = suplidor.nombre;
        
    } catch (error) {
        console.error('Error buscando suplidor:', error);
        mostrarError('Error al buscar el suplidor');
    }
}

function mostrarDetallesTransaccion(transaccion) {
    document.getElementById('transaccionInfo').innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5>Detalles de la Transacción</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>ID:</strong> ${transaccion.id}</p>
                        <p><strong>Tipo:</strong> ${transaccion.tipo}</p>
                        <p><strong>Estado:</strong> ${transaccion.estado}</p>
                        <p><strong>Fecha:</strong> ${formatearFecha(transaccion.fecha)}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Contraparte:</strong> ${transaccion.contraparteNombre}</p>
                        <p><strong>Total:</strong> ${formatearMonedaDominicana(transaccion.total)}</p>
                        <p><strong>Número de Orden:</strong> ${transaccion.numeroOrdenCompra || '-'}</p>
                    </div>
                </div>
                <div class="mt-3">
                    <h6>Líneas de Transacción:</h6>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Seleccionar</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unit.</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transaccion.lineas.map(linea => `
                                <tr>
                                    <td>
                                        <input type="checkbox" 
                                               onchange="seleccionarLinea(${linea.id}, this.checked)" 
                                               id="linea_${linea.id}">
                                    </td>
                                    <td>${linea.productoNombre}</td>
                                    <td>${linea.cantidad}</td>
                                    <td>${formatearMonedaDominicana(linea.precioUnitario)}</td>
                                    <td>${formatearMonedaDominicana(linea.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function seleccionarLinea(lineaId, selected) {
    const linea = transaccionSeleccionada.lineas.find(l => l.id === lineaId);
    
    if (selected) {
        lineasSeleccionadas.push(linea);
    } else {
        lineasSeleccionadas = lineasSeleccionadas.filter(l => l.id !== lineaId);
    }
    
    actualizarBotonCrear();
}

function actualizarBotonCrear() {
    const btn = document.getElementById('btnGuardarDevolucion');
    btn.disabled = !transaccionSeleccionada || !suplidorSeleccionado || lineasSeleccionadas.length === 0;
}

async function crearDevolucion() {
    if (!transaccionSeleccionada || !suplidorSeleccionado || lineasSeleccionadas.length === 0) {
        mostrarError('Complete todos los campos requeridos');
        return;
    }
    
    const devolucion = {
        transaccion: { id: transaccionSeleccionada.id },
        suplidorId: suplidorSeleccionado.id,
        lineasDevolucion: lineasSeleccionadas.map(linea => ({
            ...linea,
            transaccionDevolucion: null,
            transaccion: null
        })),
        fechaDevolucion: document.getElementById('fechaDevolucion').value,
        motivoDevolucion: document.getElementById('motivoDevolucion').value,
        observaciones: document.getElementById('observaciones').value
    };
    
    try {
        await devolucionService.crear(devolucion);
        mostrarExito('Devolución creada exitosamente');
        
        // Limpiar formulario
        limpiarFormulario();
        
        // Recargar lista
        await cargarDevoluciones();
        
    } catch (error) {
        console.error('Error creando devolución:', error);
        mostrarError('Error al crear la devolución');
    }
}

function limpiarFormulario() {
    document.getElementById('transaccionId').value = '';
    document.getElementById('suplidorId').value = '';
    document.getElementById('suplidorNombre').value = '';
    document.getElementById('motivoDevolucion').value = '';
    document.getElementById('observaciones').value = '';
    document.getElementById('transaccionInfo').innerHTML = '';
    
    transaccionSeleccionada = null;
    suplidorSeleccionado = null;
    lineasSeleccionadas = [];
    
    actualizarBotonCrear();
}

async function procesarDevolucion(id) {
    if (!confirm('¿Está seguro de que desea procesar esta devolución?')) {
        return;
    }
    
    try {
        await devolucionService.procesar(id);
        mostrarExito('Devolución procesada exitosamente');
        await cargarDevoluciones();
    } catch (error) {
        console.error('Error procesando devolución:', error);
        mostrarError('Error al procesar la devolución');
    }
}

async function completarDevolucion(id) {
    if (!confirm('¿Está seguro de que desea completar esta devolución?')) {
        return;
    }
    
    try {
        await devolucionService.completar(id);
        mostrarExito('Devolución completada exitosamente');
        await cargarDevoluciones();
    } catch (error) {
        console.error('Error completando devolución:', error);
        mostrarError('Error al completar la devolución');
    }
}

async function cancelarDevolucion(id) {
    if (!confirm('¿Está seguro de que desea cancelar esta devolución?')) {
        return;
    }
    
    try {
        await devolucionService.cancelar(id);
        mostrarExito('Devolución cancelada exitosamente');
        await cargarDevoluciones();
    } catch (error) {
        console.error('Error cancelando devolución:', error);
        mostrarError('Error al cancelar la devolución');
    }
}

function getEstadoBadgeClass(estado) {
    switch (estado) {
        case 'PENDIENTE': return 'warning';
        case 'PROCESANDO': return 'info';
        case 'COMPLETADA': return 'success';
        case 'CANCELADA': return 'danger';
        default: return 'secondary';
    }
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function mostrarError(mensaje) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `;
    alertContainer.scrollIntoView({ behavior: 'smooth' });
}

function mostrarExito(mensaje) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `;
    alertContainer.scrollIntoView({ behavior: 'smooth' });
}

// Service class para Devoluciones
class DevolucionService {
    constructor() {
        this.baseUrl = '/api/transacciones/devoluciones';
    }
    
    async obtenerTodas() {
        const response = await fetch(this.baseUrl);
        if (!response.ok) throw new Error('Error al obtener devoluciones');
        return await response.json();
    }
    
    async obtenerPorId(id) {
        const response = await fetch(`${this.baseUrl}/${id}`);
        if (!response.ok) throw new Error('Error al obtener devolución');
        return await response.json();
    }
    
    async crear(devolucion) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(devolucion)
        });
        if (!response.ok) throw new Error('Error al crear devolución');
        return await response.json();
    }
    
    async actualizar(id, devolucion) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(devolucion)
        });
        if (!response.ok) throw new Error('Error al actualizar devolución');
        return await response.json();
    }
    
    async procesar(id) {
        const response = await fetch(`${this.baseUrl}/${id}/procesar`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Error al procesar devolución');
        return await response.json();
    }
    
    async completar(id) {
        const response = await fetch(`${this.baseUrl}/${id}/completar`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Error al completar devolución');
        return await response.json();
    }
    
    async cancelar(id) {
        const response = await fetch(`${this.baseUrl}/${id}/cancelar`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Error al cancelar devolución');
        return await response.json();
    }
    
    async eliminar(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar devolución');
    }
}

// Service class para Transacciones (simplificado)
class TransaccionService {
    constructor() {
        this.baseUrl = '/api/transacciones';
    }
    
    async obtenerPorId(id) {
        const response = await fetch(`${this.baseUrl}/${id}`);
        if (!response.ok) throw new Error('Error al obtener transacción');
        return await response.json();
    }
}

// Service class para Suplidores (simplificado)
class SuplidorService {
    constructor() {
        this.baseUrl = '/api/suplidores';
    }
    
    async obtenerPorId(id) {
        const response = await fetch(`${this.baseUrl}/${id}`);
        if (!response.ok) throw new Error('Error al obtener suplidor');
        return await response.json();
    }
}