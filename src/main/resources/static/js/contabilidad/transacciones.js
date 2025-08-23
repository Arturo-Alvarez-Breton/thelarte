import { TransaccionService } from '../services/transaccionService.js';

// --- MAIN CLASS ---
class TransaccionesManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentPage = 0;
        this.transactionsPerPage = 9;
        this.filtersVisible = false;
        this.vista = 'tarjetas'; // 'tarjetas' o 'tabla'
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.checkUrlFilters();
        await this.loadTransactions();
        this.updateTransactionCount();
    }

    setupEventListeners() {
        document.getElementById('transaccionTipoFilter')?.addEventListener('change', () => this.filterTransactions());
        document.getElementById('transaccionEstadoFilter')?.addEventListener('change', () => this.filterTransactions());
        document.getElementById('transaccionSearchInput')?.addEventListener('input', () => this.filterTransactions());
        document.querySelectorAll('[data-action="open-wizard"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type') || e.target.closest('[data-type]')?.getAttribute('data-type');
                if (type && window.openTransactionWizard) window.openTransactionWizard(type);
            });
        });
        document.getElementById('btnVistaTarjetas')?.addEventListener('click', () => this.setVista('tarjetas'));
        document.getElementById('btnVistaTabla')?.addEventListener('click', () => this.setVista('tabla'));
    }

    setVista(vista) {
        this.vista = vista;
        this.renderVista();
    }

    renderVista() {
        if (this.vista === 'tarjetas') {
            document.getElementById('transaccionesListContainer').classList.remove('hidden');
            document.getElementById('transaccionesTableContainer').classList.add('hidden');
            this.renderTransactions();
            this.renderPagination();
        } else {
            document.getElementById('transaccionesListContainer').classList.add('hidden');
            document.getElementById('transaccionesTableContainer').classList.remove('hidden');
            this.renderTableTransactions();
            this.renderTablePagination();
        }
    }

    async loadTransactions() {
        this.showLoading();
        try {
            this.transactions = await this.transaccionService.obtenerTransacciones({});
            this.filterTransactions();
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.transactions = [];
            this.filterTransactions();
        } finally {
            this.hideLoading();
        }
    }

    checkUrlFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        const cliente = urlParams.get('cliente');
        const clienteNombre = urlParams.get('clienteNombre');
        if (cliente) {
            const searchInput = document.getElementById('transaccionSearchInput');
            if (searchInput) searchInput.value = cliente;
            if (clienteNombre) this.showClientFilter(clienteNombre, cliente);
        }
    }

    async cambiarEstadoTransaccion(id, nuevoEstado) {
        try {
            await this.transaccionService.cambiarEstadoTransaccion(id, nuevoEstado);
            await this.loadTransactions();
            const transaction = await this.transaccionService.obtenerTransaccionPorId(id);
            this.renderTransactionDetailsModal(transaction);
            window.showToast(`Estado cambiado a: ${nuevoEstado}`, 'success');
        } catch (error) {
            console.error('Error changing transaction state:', error);
            window.showToast('Error al cambiar el estado de la transacción.', 'error');
        }
    }
    showClientFilter(clienteNombre, cedula) {
        const container = document.querySelector('.container');
        if (container) {
            const filterInfo = document.createElement('div');
            filterInfo.className = 'bg-blue-50 border-l-4 border-blue-400 p-4 mb-4';
            filterInfo.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-filter text-blue-400"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-blue-700">
                                Mostrando transacciones de: <strong>${clienteNombre}</strong> (${cedula})
                            </p>
                        </div>
                    </div>
                    <div class="ml-auto pl-3">
                        <button onclick="transaccionesManager.clearClientFilter()" class="text-blue-400 hover:text-blue-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            const firstChild = container.firstElementChild;
            container.insertBefore(filterInfo, firstChild);
        }
    }

    clearClientFilter() {
        const url = new URL(window.location);
        url.searchParams.delete('cliente');
        url.searchParams.delete('clienteNombre');
        window.history.replaceState({}, '', url);
        const searchInput = document.getElementById('transaccionSearchInput');
        if (searchInput) searchInput.value = '';
        const filterInfo = document.querySelector('.bg-blue-50');
        if (filterInfo) filterInfo.remove();
        this.filterTransactions();
    }

    filterTransactions() {
        const tipo = document.getElementById('transaccionTipoFilter')?.value || '';
        const estado = document.getElementById('transaccionEstadoFilter')?.value || '';
        const busqueda = document.getElementById('transaccionSearchInput')?.value?.toLowerCase() || '';
        this.currentPage = 0;

        this.filteredTransactions = this.transactions.filter(t => {
            let matchesTipo = tipo ? (t.tipo && t.tipo.toUpperCase() === tipo.toUpperCase()) : true;
            let matchesEstado = estado ? (t.estado && t.estado.toUpperCase() === estado.toUpperCase()) : true;

            let matchesBusqueda = true;
            if (busqueda) {
                let cliente = t.cliente ? `${t.cliente.nombre || ''} ${t.cliente.apellido || ''}` : '';
                let proveedor = t.proveedor ? `${t.proveedor.nombre || ''}` : '';
                let contraparte = t.contraparteNombre || '';
                let numFactura = t.numeroFactura || '';
                let id = String(t.id || '');
                let total = String(t.total || '').replace(/[\D]+/g, '');
                matchesBusqueda = (
                    cliente.toLowerCase().includes(busqueda) ||
                    proveedor.toLowerCase().includes(busqueda) ||
                    contraparte.toLowerCase().includes(busqueda) ||
                    numFactura.toLowerCase().includes(busqueda) ||
                    id.includes(busqueda) ||
                    total.includes(busqueda)
                );
            }
            return matchesTipo && matchesEstado && matchesBusqueda;
        });
        this.renderVista();
        this.updateTransactionCount();
    }

    getFilteredTransactions() {
        return [...this.filteredTransactions];
    }

    // --- Render Cards ---
    renderTransactions() {
        const container = document.getElementById('transaccionesListContainer');
        if (!container) return;
        const filtered = this.getFilteredTransactions();
        const start = this.currentPage * this.transactionsPerPage;
        const end = start + this.transactionsPerPage;
        const toShow = filtered.slice(start, end);

        if (toShow.length === 0) {
            const searchTerm = document.getElementById('transaccionSearchInput')?.value;
            const tipoFilter = document.getElementById('transaccionTipoFilter')?.value;
            const estadoFilter = document.getElementById('transaccionEstadoFilter')?.value;
            let emptyMessage = 'No hay transacciones registradas.';
            if (searchTerm || tipoFilter || estadoFilter) {
                emptyMessage = 'No se encontraron transacciones que coincidan con los filtros aplicados.';
            }
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-exchange-alt text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Sin transacciones</h3>
                    <p class="text-gray-600 mb-6">${emptyMessage}</p>
                    <button onclick="window.openTransactionWizard('VENTA')" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown flex items-center gap-2">
                        <i class="fas fa-plus mr-2"></i>Nueva Venta
                    </button>
                    <button onclick="window.openTransactionWizard('COMPRA')" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown flex items-center gap-2">
                        <i class="fas fa-shopping-cart mr-2"></i>Nueva Compra
                    </button>
                    <button onclick="window.openTransactionWizard('DEVOLUCION_VENTA')" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown flex items-center gap-2">
                        <i class="fas fa-undo mr-2"></i>Devolución Venta
                    </button>
                    <button onclick="window.openTransactionWizard('DEVOLUCION_COMPRA')" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown flex items-center gap-2">
                        <i class="fas fa-undo-alt mr-2"></i>Devolución Compra
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = toShow.map(transaction => {
            const stateColor = this.getStateColor(transaction.estado);
            const clientName =
                (transaction.cliente && transaction.cliente.nombre)
                    ? `${transaction.cliente.nombre}${transaction.cliente.apellido ? ' ' + transaction.cliente.apellido : ''}`
                    : (transaction.contraparteNombre
                        ? transaction.contraparteNombre
                        : 'Consumidor Final');

            return `
            <div class="bg-white rounded-lg shadow-md p-4 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-semibold">${this.formatTransactionType(transaction.tipo)} #${transaction.numeroFactura || transaction.id}</h3>
                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-${stateColor}-100 text-${stateColor}-800">
                        ${transaction.estado}
                    </span>
                </div>
                <p class="text-gray-600">Cliente: ${clientName}</p>
                <p class="text-gray-600">Fecha: ${this.formatDate(transaction.fecha)}</p>
                <p class="text-lg font-bold text-brand-brown mt-2">Total: ${this.formatCurrency(transaction.total)}</p>
                <div class="mt-4 flex flex-wrap gap-2 items-center justify-between">
                    <button onclick="transaccionesManager.viewTransactionDetails(${transaction.id})"
                            class="flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm"
                    >
                        <i class="fas fa-eye"></i> Detalles
                    </button>
                    <button onclick="transaccionesManager.eliminarTransaccion(${transaction.id})"
                            class="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                    >
                        <i class="fas fa-trash-alt"></i> 
                    </button>
                </div>
            </div>
        `;
        }).join('');
    }

    // --- Render Table + Pagination ---
    renderTableTransactions() {
        const container = document.getElementById('transaccionesTableContainer');
        if (!container) return;
        const filtered = this.getFilteredTransactions();
        const start = this.currentPage * this.transactionsPerPage;
        const end = start + this.transactionsPerPage;
        const toShow = filtered.slice(start, end);

        if (toShow.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-exchange-alt text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Sin transacciones</h3>
                    <p class="text-gray-600 mb-6">No se encontraron transacciones.</p>
                </div>
            `;
            return;
        }
        container.innerHTML = `
            <table class="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-md">
                <thead>
                    <tr>
                        <th class="px-4 py-2 text-left font-bold">Factura #</th>
                        <th class="px-4 py-2 text-left font-bold">Tipo</th>
                        <th class="px-4 py-2 text-left font-bold">Cliente</th>
                        <th class="px-4 py-2 text-left font-bold">Fecha</th>
                        <th class="px-4 py-2 text-left font-bold">Total</th>
                        <th class="px-4 py-2 text-left font-bold">Estado</th>
                        <th class="px-4 py-2 text-left font-bold">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${toShow.map(transaction => {
            const stateColor = this.getStateColor(transaction.estado);
            const clientName =
                (transaction.cliente && transaction.cliente.nombre)
                    ? `${transaction.cliente.nombre}${transaction.cliente.apellido ? ' ' + transaction.cliente.apellido : ''}`
                    : (transaction.contraparteNombre
                        ? transaction.contraparteNombre
                        : 'Consumidor Final');
            return `
                        <tr>
                            <td class="px-4 py-2">${transaction.numeroFactura || transaction.id}</td>
                            <td class="px-4 py-2">${this.formatTransactionType(transaction.tipo)}</td>
                            <td class="px-4 py-2">${clientName}</td>
                            <td class="px-4 py-2">${this.formatDate(transaction.fecha)}</td>
                            <td class="px-4 py-2">${this.formatCurrency(transaction.total)}</td>
                            <td class="px-4 py-2">
                                <span class="px-2 py-1 text-xs font-medium rounded-full bg-${stateColor}-100 text-${stateColor}-800">${transaction.estado}</span>
                            </td>
                            <td class="px-4 py-2 flex flex-wrap gap-2">
                                <button onclick="transaccionesManager.viewTransactionDetails(${transaction.id})"
                                        class="flex items-center gap-2 bg-brand-brown text-white px-2 py-1 rounded hover:bg-brand-light-brown transition-colors shadow-sm"
                                >
                                    <i class="fas fa-eye"></i> Detalles
                                </button>
                                <button onclick="transaccionesManager.eliminarTransaccion(${transaction.id})"
                                        class="flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
    }

    // Paginación para tarjetas (por defecto)
    renderPagination() {
        if (this.vista !== 'tarjetas') return;
        const filtered = this.getFilteredTransactions();
        const totalPages = Math.ceil(filtered.length / this.transactionsPerPage);
        const paginationContainer = document.getElementById('paginacion');
        if (!paginationContainer) return;
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        let paginationHtml = '<div class="flex justify-center space-x-2">';
        for (let i = 0; i < totalPages; i++) {
            paginationHtml += `
            <button onclick="transaccionesManager.changePage(${i})" 
                    class="px-3 py-1 rounded ${this.currentPage === i ? 'bg-brand-brown text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                ${i + 1}
            </button>
        `;
        }
        paginationHtml += '</div>';
        paginationContainer.innerHTML = paginationHtml;
    }

    // Paginación para tabla
    renderTablePagination() {
        if (this.vista !== 'tabla') return;
        const filtered = this.getFilteredTransactions();
        const totalPages = Math.ceil(filtered.length / this.transactionsPerPage);
        const paginationContainer = document.getElementById('paginacion');
        if (!paginationContainer) return;
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        let paginationHtml = '<div class="flex justify-center space-x-2 my-4">';
        for (let i = 0; i < totalPages; i++) {
            paginationHtml += `
            <button onclick="transaccionesManager.changePage(${i})" 
                    class="px-3 py-1 rounded ${this.currentPage === i ? 'bg-brand-brown text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                ${i + 1}
            </button>
        `;
        }
        paginationHtml += '</div>';
        paginationContainer.innerHTML = paginationHtml;
    }

    changePage(page) {
        this.currentPage = page;
        this.renderVista();
    }

    clearFilters() {
        document.getElementById('transaccionTipoFilter').value = '';
        document.getElementById('transaccionEstadoFilter').value = '';
        document.getElementById('transaccionSearchInput').value = '';
        this.filterTransactions();
    }

    updateTransactionCount() {
        const countElement = document.getElementById('totalTransacciones');
        if (countElement) {
            countElement.textContent = `${this.getFilteredTransactions().length} transacciones`;
        }
    }

    showLoading() {
        const container = document.getElementById('transaccionesListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Consultando historial de transacciones...</p>
                    <p class="text-gray-500 text-sm mt-2">Un momento, por favor</p>
                </div>
            `;
        }
    }
    hideLoading() {}

    showError(message) {
        const container = document.getElementById('transaccionesListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="transaccionesManager.loadTransactions()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                        <i class="fas fa-refresh mr-2"></i>Reintentar
                    </button>
                </div>
            `;
        }
    }

    // --- UTILS ---
    formatCurrency(amount) {
        if (typeof amount !== 'number') amount = parseFloat(amount) || 0;
        return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(amount);
    }
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
    formatTransactionType(type) {
        const types = { 'COMPRA': 'Compra', 'VENTA': 'Venta', 'DEVOLUCION_COMPRA': 'Devolución Compra', 'DEVOLUCION_VENTA': 'Devolución Venta' };
        return types[type] || type;
    }
    getStateColor(state) {
        const colors = {
            'PENDIENTE': 'yellow', 'CONFIRMADA': 'blue', 'PROCESANDO': 'orange',
            'COMPLETADA': 'green', 'CANCELADA': 'red',
            'FACTURADA': 'purple', 'RECIBIDA': 'indigo', 'PAGADA': 'green',
            'ENTREGADA': 'teal', 'COBRADA': 'emerald',
            'DEVUELTA': 'emerald', 'PARCIALMENTE_DEVUELTA': 'yellow'
        };
        return colors[state] || 'gray';
    }

    // --- Transaction actions ---
    async viewTransactionDetails(id) {
        try {
            const transaction = await this.transaccionService.obtenerTransaccionPorId(id);
            if (transaction) {
                this.renderTransactionDetailsModal(transaction);
                document.getElementById('modalVerTransaccion').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error viewing transaction details:', error);
            window.showToast('Error al cargar los detalles de la transacción.', 'error');
        }
    }

    renderTransactionDetailsModal(transaction) {
        const detailsContainer = document.getElementById('detallesTransaccion');
        if (!detailsContainer) return;
        let contraparteInfo = '';
        if (transaction.tipo === 'COMPRA' && transaction.proveedor) {
            contraparteInfo = `
                <p><strong>Proveedor:</strong> ${transaction.proveedor.nombre}</p>
                <p><strong>RNC:</strong> ${transaction.proveedor.rnc || 'N/A'}</p>
                <p><strong>Teléfono:</strong> ${transaction.proveedor.telefono || 'N/A'}</p>
                <p><strong>Email:</strong> ${transaction.proveedor.email || 'N/A'}</p>
            `;
        } else if (transaction.cliente && (transaction.cliente.nombre || transaction.cliente.apellido)) {
            contraparteInfo = `<p><strong>Cliente:</strong> ${transaction.cliente.nombre || ''} ${transaction.cliente.apellido || ''} (${transaction.cliente.cedula || ''})</p>`;
        } else if (transaction.contraparteNombre) {
            contraparteInfo = `<p><strong>Cliente:</strong> ${transaction.contraparteNombre}</p>`;
        } else {
            contraparteInfo = `<p><strong>Cliente:</strong> Consumidor Final</p>`;
        }
        const productsList = transaction.lineas && transaction.lineas.length > 0
            ? transaction.lineas.map(line => `
        <div class="flex justify-between items-center border-b pb-2 mb-2 bg-gray-50 p-2 rounded">
            <div>
                <p class="font-medium">${line.nombreProducto || line.productoNombre || 'Sin nombre'}</p>
                <p class="text-sm text-gray-600">Cantidad: ${line.cantidad} | Precio: ${this.formatCurrency(line.precioUnitario)}</p>
                <p class="text-sm text-gray-600">Código: ${line.codigoProducto || 'N/A'}</p>
            </div>
            <div class="text-right">
                <p class="font-bold">${this.formatCurrency(line.subtotalLinea ?? line.subtotal ?? 0)}</p>
                ${line.descuento ? `<p class="text-sm text-red-600">Desc: ${this.formatCurrency(line.descuento)}</p>` : ''}
            </div>
        </div>
    `).join('') : '<p class="text-gray-500 italic">No hay productos en esta transacción.</p>';
        const estadoOptions = ['PENDIENTE', 'CONFIRMADA', 'PROCESANDO', 'COMPLETADA', 'CANCELADA','DEVUELTA','PARCIALMENTE_DEVUELTA'];
        const estadoSelect = `
            <div class="flex items-center space-x-2">
                <label class="font-bold">Estado:</label>
                <select id="estadoTransaccion" class="border rounded px-2 py-1" onchange="transaccionesManager.cambiarEstadoTransaccion(${transaction.id}, this.value)">
                    ${estadoOptions.map(estado =>
            `<option value="${estado}" ${transaction.estado === estado ? 'selected' : ''}>${estado}</option>`
        ).join('')}
                </select>
            </div>
        `;
        detailsContainer.innerHTML = `
            <div class="space-y-4">
                <div class="bg-blue-50 p-3 rounded-lg">
                    <p><strong>Factura #:</strong> ${transaction.numeroFactura || 'N/A'}</p>
                    <p><strong>Tipo:</strong> ${this.formatTransactionType(transaction.tipo)}</p>
                    <p><strong>Fecha:</strong> ${this.formatDate(transaction.fecha)}</p>
                    ${estadoSelect}
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <h4 class="font-bold mb-2">Información de Contraparte:</h4>
                    ${contraparteInfo}
                </div>
                <div>
                    <p><strong>Método de Pago:</strong> ${transaction.metodoPago}</p>
                    <p><strong>Observaciones:</strong> ${transaction.observaciones || 'N/A'}</p>
                </div>
                <div>
                    <h4 class="font-bold mb-2">Muebles/Productos Registrados:</h4>
                    <div class="border rounded p-3 max-h-64 overflow-y-auto">${productsList}</div>
                </div>
                <div class="bg-green-50 p-3 rounded-lg text-right">
                    <p><strong>Subtotal:</strong> ${this.formatCurrency(transaction.subtotal || 0)}</p>
                    <p><strong>Impuestos:</strong> ${this.formatCurrency(transaction.impuestos || 0)}</p>
                    <p class="text-xl font-bold text-green-700">Total: ${this.formatCurrency(transaction.total)}</p>
                </div>
            </div>
        `;
    }

    cerrarModalVerTransaccion() {
        document.getElementById('modalVerTransaccion').classList.add('hidden');
    }

    imprimirFactura() {
        window.showToast('Funcionalidad de impresión en desarrollo.', 'info');
    }

    async eliminarTransaccion(id) {
        if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
            try {
                await this.transaccionService.eliminarTransaccion(id);
                await this.loadTransactions();
                window.showToast('Transacción eliminada exitosamente', 'success');
            } catch (error) {
                console.error('Error al eliminar transacción:', error);
                window.showToast('Error al eliminar la transacción', 'error');
            }
        }
    }
}

// --- GLOBAL INSTANCE & EXPORTS ---
const transaccionesManager = new TransaccionesManager();
window.transaccionesManager = transaccionesManager;
window.cerrarModalVerTransaccion = () => transaccionesManager.cerrarModalVerTransaccion();
window.imprimirFactura = () => transaccionesManager.imprimirFactura();

const quickActions = document.getElementById('cont-quick-actions');
if (quickActions) {
    quickActions.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="open-wizard"]');
        if (btn) {
            const tipo = btn.getAttribute('data-type');
            if (tipo && window.openTransactionWizard) window.openTransactionWizard(tipo);
        }
    });
}

document.getElementById('transaccionesListContainer').addEventListener('click', function(e) {
    let btn = e.target.closest('[data-action="eliminar"]');
    if (btn) {
        const id = btn.getAttribute('data-id');
        transaccionesManager.eliminarTransaccion(Number(id));
        e.preventDefault();
    }
});