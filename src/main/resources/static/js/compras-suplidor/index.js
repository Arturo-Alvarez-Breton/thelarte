let transaccionService;
let currentPage = 1;
const itemsPerPage = 10;
let currentFilter = 'all';

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
    // Verificar autenticación y permisos
    if (!verificarAutenticacion()) {
        return;
    }
    
    transaccionService = new TransaccionService();
    
    inicializarEventos();
    await cargarDatos();
});

function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    
    if (!token) {
        window.location.href = '/pages/login.html';
        return false;
    }
    
    if (!userRoles.includes('COMPRAS_SUPLIDOR')) {
        mostrarError('No tienes permisos para acceder a este módulo');
        setTimeout(() => {
            window.location.href = '/pages/dashboard.html';
        }, 2000);
        return false;
    }
    
    return true;
}

function inicializarEventos() {
    // Filtros
    document.getElementById('filtroTodos').addEventListener('click', () => filtrarTransacciones('all'));
    document.getElementById('filtroPendientes').addEventListener('click', () => filtrarTransacciones('PENDIENTE'));
    document.getElementById('filtroConfirmadas').addEventListener('click', () => filtrarTransacciones('CONFIRMADA'));
    document.getElementById('filtroRecibidas').addEventListener('click', () => filtrarTransacciones('RECIBIDA'));
    document.getElementById('filtroPagadas').addEventListener('click', () => filtrarTransacciones('PAGADA'));
    
    // Botones de acción
    document.getElementById('btnNuevaCompra').addEventListener('click', () => {
        window.location.href = 'form.html';
    });
    
    document.getElementById('btnActualizar').addEventListener('click', () => {
        cargarDatos();
    });
    
    // Búsqueda
    document.getElementById('buscarTransaccion').addEventListener('input', debounce(buscarTransacciones, 300));
}

async function cargarDatos() {
    try {
        mostrarLoader(true);
        const compras = await transaccionService.obtenerCompras();
        mostrarTransacciones(compras);
        actualizarEstadisticas(compras);
    } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarError('Error al cargar las transacciones de compra');
    } finally {
        mostrarLoader(false);
    }
}

function mostrarTransacciones(compras) {
    const tbody = document.getElementById('tablaCompras');
    tbody.innerHTML = '';
    
    if (compras.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>No se encontraron transacciones de compra</p>
                </td>
            </tr>
        `;
        return;
    }
    
    compras.forEach(compra => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-3 px-4 border-b">${compra.id}</td>
            <td class="py-3 px-4 border-b">${formatearFecha(compra.fecha)}</td>
            <td class="py-3 px-4 border-b">${compra.contraparteNombre}</td>
            <td class="py-3 px-4 border-b">${formatearMonedaDominicana(compra.total)}</td>
            <td class="py-3 px-4 border-b">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${getEstadoClasses(compra.estado)}">
                    ${compra.estado}
                </span>
            </td>
            <td class="py-3 px-4 border-b">${compra.numeroOrdenCompra || '-'}</td>
            <td class="py-3 px-4 border-b">${formatearFecha(compra.fechaEntregaEsperada) || '-'}</td>
            <td class="py-3 px-4 border-b">
                <div class="flex space-x-2">
                    <button class="btn btn-sm btn-info" onclick="verDetalle(${compra.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${compra.estado === 'PENDIENTE' ? `
                        <button class="btn btn-sm btn-warning" onclick="editarCompra(${compra.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="confirmarCompra(${compra.id})" title="Confirmar">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    ${compra.estado === 'CONFIRMADA' ? `
                        <button class="btn btn-sm btn-primary" onclick="marcarRecibida(${compra.id})" title="Marcar como recibida">
                            <i class="fas fa-truck"></i>
                        </button>
                    ` : ''}
                    ${compra.estado === 'RECIBIDA' ? `
                        <button class="btn btn-sm btn-success" onclick="marcarPagada(${compra.id})" title="Marcar como pagada">
                            <i class="fas fa-dollar-sign"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" onclick="eliminarCompra(${compra.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    actualizarPaginacion(compras.length);
}

function actualizarEstadisticas(compras) {
    const totalCompras = compras.length;
    const pendientes = compras.filter(c => c.estado === 'PENDIENTE').length;
    const confirmadas = compras.filter(c => c.estado === 'CONFIRMADA').length;
    const completadas = compras.filter(c => c.estado === 'PAGADA').length;
    const totalGastado = compras.reduce((sum, c) => sum + (c.total || 0), 0);
    
    document.getElementById('totalCompras').textContent = totalCompras;
    document.getElementById('comprasPendientes').textContent = pendientes;
    document.getElementById('comprasConfirmadas').textContent = confirmadas;
    document.getElementById('comprasCompletadas').textContent = completadas;
    document.getElementById('totalGastado').textContent = formatearMonedaDominicana(totalGastado);
}

function filtrarTransacciones(estado) {
    currentFilter = estado;
    
    // Actualizar UI de filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (estado === 'all') {
        document.getElementById('filtroTodos').classList.add('active');
    } else {
        document.getElementById(`filtro${estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()}`).classList.add('active');
    }
    
    // Aplicar filtro
    cargarDatos();
}

async function buscarTransacciones(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    if (searchTerm.length < 3 && searchTerm.length > 0) {
        return;
    }
    
    try {
        const compras = await transaccionService.obtenerCompras();
        let filteredCompras = compras;
        
        if (searchTerm.length >= 3) {
            filteredCompras = compras.filter(compra => 
                compra.contraparteNombre.toLowerCase().includes(searchTerm) ||
                compra.id.toString().includes(searchTerm) ||
                (compra.numeroOrdenCompra && compra.numeroOrdenCompra.toLowerCase().includes(searchTerm))
            );
        }
        
        mostrarTransacciones(filteredCompras);
    } catch (error) {
        console.error('Error buscando transacciones:', error);
        mostrarError('Error al buscar transacciones');
    }
}

async function verDetalle(id) {
    window.location.href = `../transaccion/detalle.html?id=${id}`;
}

async function editarCompra(id) {
    window.location.href = `../transaccion/edit.html?id=${id}`;
}

async function confirmarCompra(id) {
    if (!confirm('¿Está seguro de que desea confirmar esta compra?')) {
        return;
    }
    
    try {
        await transaccionService.confirmarCompra(id);
        mostrarExito('Compra confirmada exitosamente');
        await cargarDatos();
    } catch (error) {
        console.error('Error confirmando compra:', error);
        mostrarError('Error al confirmar la compra');
    }
}

async function marcarRecibida(id) {
    if (!confirm('¿Está seguro de que desea marcar esta compra como recibida?')) {
        return;
    }
    
    try {
        await transaccionService.marcarComoRecibida(id);
        mostrarExito('Compra marcada como recibida');
        await cargarDatos();
    } catch (error) {
        console.error('Error marcando compra como recibida:', error);
        mostrarError('Error al marcar la compra como recibida');
    }
}

async function marcarPagada(id) {
    if (!confirm('¿Está seguro de que desea marcar esta compra como pagada?')) {
        return;
    }
    
    try {
        await transaccionService.marcarComoPagada(id);
        mostrarExito('Compra marcada como pagada');
        await cargarDatos();
    } catch (error) {
        console.error('Error marcando compra como pagada:', error);
        mostrarError('Error al marcar la compra como pagada');
    }
}

async function eliminarCompra(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta compra? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        await transaccionService.marcarComoEliminada(id);
        mostrarExito('Compra eliminada exitosamente');
        await cargarDatos();
    } catch (error) {
        console.error('Error eliminando compra:', error);
        mostrarError('Error al eliminar la compra');
    }
}

function getEstadoClasses(estado) {
    switch (estado) {
        case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
        case 'CONFIRMADA': return 'bg-blue-100 text-blue-800';
        case 'RECIBIDA': return 'bg-purple-100 text-purple-800';
        case 'PAGADA': return 'bg-green-100 text-green-800';
        case 'COMPLETADA': return 'bg-green-100 text-green-800';
        case 'CANCELADA': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function actualizarPaginacion(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('paginacion');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Botón anterior
    if (currentPage > 1) {
        paginationHTML += `<button class="btn btn-sm btn-secondary" onclick="cambiarPagina(${currentPage - 1})">Anterior</button>`;
    }
    
    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        const active = i === currentPage ? 'btn-primary' : 'btn-secondary';
        paginationHTML += `<button class="btn btn-sm ${active}" onclick="cambiarPagina(${i})">${i}</button>`;
    }
    
    // Botón siguiente
    if (currentPage < totalPages) {
        paginationHTML += `<button class="btn btn-sm btn-secondary" onclick="cambiarPagina(${currentPage + 1})">Siguiente</button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

function cambiarPagina(page) {
    currentPage = page;
    cargarDatos();
}

function mostrarLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
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
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Service class para Transacciones
class TransaccionService {
    constructor() {
        this.baseUrl = '/api/transacciones';
    }
    
    async obtenerCompras() {
        const response = await fetch(`${this.baseUrl}/compras`);
        if (!response.ok) throw new Error('Error al obtener compras');
        return await response.json();
    }
    
    async confirmarCompra(id) {
        const response = await fetch(`${this.baseUrl}/${id}/confirmar`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Error al confirmar compra');
        return await response.json();
    }
    
    async marcarComoRecibida(id) {
        const response = await fetch(`${this.baseUrl}/${id}/recibir`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Error al marcar como recibida');
        return await response.json();
    }
    
    async marcarComoPagada(id) {
        const response = await fetch(`${this.baseUrl}/${id}/pagar`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Error al marcar como pagada');
        return await response.json();
    }
    
    async marcarComoEliminada(id) {
        const response = await fetch(`${this.baseUrl}/${id}/delete`, {
            method: 'PATCH'
        });
        if (!response.ok) throw new Error('Error al eliminar compra');
        return await response.json();
    }
}