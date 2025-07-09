let transaccionService;
let transacciones = [];
let transaccionesFiltradas = [];
const loadingOverlay = document.getElementById('loadingOverlay');

function showLoading(){ if(loadingOverlay) loadingOverlay.classList.remove('hidden'); }
function hideLoading(){ if(loadingOverlay) loadingOverlay.classList.add('hidden'); }

document.addEventListener('DOMContentLoaded', async function() {
    transaccionService = new TransaccionService();
    const onboarding = document.getElementById('onboardingTx');
    if(onboarding && !localStorage.getItem('txOnboarded')){
        onboarding.classList.remove('hidden');
    }
    await cargarTransacciones();
});

async function cargarTransacciones() {
    try {
        showLoading();
        transacciones = await transaccionService.obtenerTransacciones();
        transaccionesFiltradas = [...transacciones];
        mostrarTransacciones();
        hideLoading();
    } catch (error) {
        console.error('Error al cargar transacciones:', error);
        mostrarError('Error al cargar las transacciones');
        hideLoading();
    }
}

function mostrarTransacciones() {
    const container = document.getElementById('transaccionesContainer');
    
    if (transaccionesFiltradas.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-16 text-center">
                <i class="fas fa-inbox text-6xl text-gray-400 mb-4"></i>
                <h4 class="text-xl font-semibold text-gray-600 mb-2">No hay transacciones</h4>
                <p class="text-gray-500 text-base">Crea tu primera transacción para empezar</p>
            </div>
        `;
        return;
    }

    const transaccionesHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            ${transaccionesFiltradas.map(transaccion => `
                <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-${obtenerColorTipo(transaccion.tipo)} overflow-hidden">
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-[#59391B] mb-1 flex items-center">
                                    <i class="${obtenerTipoIcon(transaccion.tipo)} mr-2 text-${obtenerColorTipo(transaccion.tipo)}"></i>
                                    ${formatearTipo(transaccion.tipo)}
                                </h3>
                                <p class="text-sm text-gray-600 font-medium">#${transaccion.id}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-sm font-medium bg-${obtenerEstadoColor(transaccion.estado)}-100 text-${obtenerEstadoColor(transaccion.estado)}-800">
                                ${transaccion.estado}
                            </span>
                        </div>

                        <div class="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                            <i class="fas ${transaccion.tipoContraparte === 'CLIENTE' ? 'fa-user' : 'fa-truck'} text-gray-500 mr-3"></i>
                            <span class="font-medium text-gray-800 text-base">${transaccion.contraparteNombre}</span>
                        </div>

                        <div class="flex justify-between items-center mb-4">
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-calendar mr-2"></i>
                                <span class="text-sm">${formatearFecha(transaccion.fecha)}</span>
                            </div>
                            <div class="text-xl font-bold text-[#7b5222]">
                                ${formatearMoneda(transaccion.total)}
                            </div>
                        </div>

                        ${transaccion.numeroFactura ? `
                            <div class="mb-3 flex items-center text-gray-600">
                                <i class="fas fa-receipt mr-2"></i>
                                <span class="text-sm">Factura: ${transaccion.numeroFactura}</span>
                            </div>
                        ` : ''}

                        ${transaccion.lineas && transaccion.lineas.length > 0 ? `
                            <div class="mb-4 flex items-center text-gray-600">
                                <i class="fas fa-boxes mr-2"></i>
                                <span class="text-sm">${transaccion.lineas.length} producto${transaccion.lineas.length > 1 ? 's' : ''}</span>
                            </div>
                        ` : ''}

                        <div class="flex gap-2 pt-3 border-t">
                            <button class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition text-sm font-medium" onclick="verDetalles(${transaccion.id})">
                                <i class="fas fa-eye mr-1"></i>Ver
                            </button>
                            <button class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition text-sm font-medium" onclick="editarTransaccion(${transaccion.id})">
                                <i class="fas fa-edit mr-1"></i>Editar
                            </button>
                            <div class="relative">
                                <button class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg transition text-sm" onclick="toggleDropdown(${transaccion.id})">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <div id="dropdown-${transaccion.id}" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden z-10">
                                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onclick="duplicarTransaccion(${transaccion.id})">
                                        <i class="fas fa-copy mr-2"></i>Duplicar
                                    </a>
                                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onclick="imprimirTransaccion(${transaccion.id})">
                                        <i class="fas fa-print mr-2"></i>Imprimir
                                    </a>
                                    <hr class="border-gray-200">
                                    <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50" onclick="eliminarTransaccion(${transaccion.id})">
                                        <i class="fas fa-trash mr-2"></i>Eliminar
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = transaccionesHtml;
}

function formatearTipo(tipo) {
    const tipos = {
        'COMPRA': 'Compra',
        'VENTA': 'Venta',
        'DEVOLUCION_COMPRA': 'Devolución Compra',
        'DEVOLUCION_VENTA': 'Devolución Venta'
    };
    return tipos[tipo] || tipo;
}

function obtenerColorTipo(tipo) {
    const colores = {
        'COMPRA': 'green-500',
        'VENTA': 'yellow-500',
        'DEVOLUCION_COMPRA': 'red-500',
        'DEVOLUCION_VENTA': 'red-500'
    };
    return colores[tipo] || 'blue-500';
}

function obtenerTipoIcon(tipo) {
    const iconos = {
        'COMPRA': 'fas fa-shopping-cart',
        'VENTA': 'fas fa-cash-register',
        'DEVOLUCION_COMPRA': 'fas fa-undo',
        'DEVOLUCION_VENTA': 'fas fa-undo'
    };
    return iconos[tipo] || 'fas fa-exchange-alt';
}

function obtenerEstadoColor(estado) {
    const colores = {
        'PENDIENTE': 'yellow',
        'CONFIRMADA': 'blue',
        'COMPLETADA': 'green',
        'CANCELADA': 'red',
        'FACTURADA': 'purple',
        'RECIBIDA': 'indigo',
        'PAGADA': 'green',
        'ENTREGADA': 'teal',
        'COBRADA': 'emerald'
    };
    return colores[estado] || 'gray';
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatearMoneda(cantidad) {
    if (!cantidad) return '€0.00';
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(cantidad);
}

function toggleDropdown(id) {
    const dropdown = document.getElementById(`dropdown-${id}`);
    const allDropdowns = document.querySelectorAll('[id^="dropdown-"]');
    
    allDropdowns.forEach(dd => {
        if (dd !== dropdown) {
            dd.classList.add('hidden');
        }
    });
    
    dropdown.classList.toggle('hidden');
}

// Cerrar dropdowns al hacer clic fuera
document.addEventListener('click', function(event) {
    if (!event.target.closest('[onclick^="toggleDropdown"]')) {
        document.querySelectorAll('[id^="dropdown-"]').forEach(dd => {
            dd.classList.add('hidden');
        });
    }
});

function filtrarTransacciones() {
    const filtroTipo = document.getElementById('filtroTipo').value;
    const filtroEstado = document.getElementById('filtroEstado').value;
    const filtroContraparte = document.getElementById('filtroContraparte').value;
    const buscarTexto = document.getElementById('buscarTexto').value.toLowerCase();

    transaccionesFiltradas = transacciones.filter(transaccion => {
        const cumpleTipo = !filtroTipo || transaccion.tipo === filtroTipo;
        const cumpleEstado = !filtroEstado || transaccion.estado === filtroEstado;
        const cumpleContraparte = !filtroContraparte || transaccion.tipoContraparte === filtroContraparte;
        const cumpleBusqueda = !buscarTexto || 
            transaccion.contraparteNombre.toLowerCase().includes(buscarTexto) ||
            transaccion.numeroFactura?.toLowerCase().includes(buscarTexto) ||
            transaccion.id.toString().includes(buscarTexto);

        return cumpleTipo && cumpleEstado && cumpleContraparte && cumpleBusqueda;
    });

    mostrarTransacciones();
}

function crearTransaccion(tipo) {
    window.location.href = `form.html?tipo=${tipo}`;
}

function verDetalles(id) {
    window.location.href = `detalle.html?id=${id}`;
}

function editarTransaccion(id) {
    window.location.href = `form.html?id=${id}`;
}

async function duplicarTransaccion(id) {
    try {
        const transaccion = await transaccionService.obtenerTransaccionPorId(id);
        const nuevaTransaccion = {
            ...transaccion,
            id: null,
            numeroFactura: null,
            numeroTransaccion: null,
            fechaCreacion: null,
            fechaActualizacion: null,
            estado: 'PENDIENTE'
        };
        
        await transaccionService.crearTransaccion(nuevaTransaccion);
        await cargarTransacciones();
        mostrarExito('Transacción duplicada exitosamente');
    } catch (error) {
        console.error('Error al duplicar transacción:', error);
        mostrarError('Error al duplicar la transacción');
    }
}

function imprimirTransaccion(id) {
    window.open(`print.html?id=${id}`, '_blank');
}

async function eliminarTransaccion(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
        try {
            await transaccionService.eliminarTransaccion(id);
            await cargarTransacciones();
            mostrarExito('Transacción eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar transacción:', error);
            mostrarError('Error al eliminar la transacción');
        }
    }
}

function mostrarError(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-3 text-lg"></i>
            <span class="text-sm font-medium">${mensaje}</span>
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
            <span class="text-sm font-medium">${mensaje}</span>
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

function dismissTxOnboarding(){
    localStorage.setItem('txOnboarded','1');
    const o = document.getElementById('onboardingTx');
    if(o) o.classList.add('hidden');}