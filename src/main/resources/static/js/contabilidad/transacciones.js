import { TransaccionService } from '../services/transaccionService.js';

// --- MAIN CLASS ---
class TransaccionesManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.transactions = [];
        this.currentPage = 0;
        this.transactionsPerPage = 9; // Cambiado a 9
        this.filtersVisible = false;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.checkUrlFilters();
        await this.loadTransactions();
        this.updateTransactionCount();
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

    setupEventListeners() {
        document.getElementById('transaccionTipoFilter')?.addEventListener('change', () => this.filterTransactions());
        document.getElementById('transaccionEstadoFilter')?.addEventListener('change', () => this.filterTransactions());
        document.getElementById('transaccionSearchInput')?.addEventListener('keyup', () => this.filterTransactions());
        document.querySelectorAll('[data-action="open-wizard"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type') || e.target.closest('[data-type]')?.getAttribute('data-type');
                if (type && window.openTransactionWizard) window.openTransactionWizard(type);
            });
        });
    }

    async loadTransactions() {
        this.showLoading();
        try {
            // Si tu backend NO pagina, no pases page y size, solo usa los filtros
            const filters = {
                tipo: document.getElementById('transaccionTipoFilter')?.value || null,
                estado: document.getElementById('transaccionEstadoFilter')?.value || null,
                busqueda: document.getElementById('transaccionSearchInput')?.value || null
            };
            this.transactions = await this.transaccionService.obtenerTransacciones(filters);
            this.renderTransactions();
            this.renderPagination();
            this.updateTransactionCount();
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.transactions = [];
            this.renderTransactions();
            this.renderPagination();
        } finally {
            this.hideLoading();
        }
    }

    getFilteredTransactions() {
        // Puedes meter aquí lógica extra de filtrado si tu backend no filtra bien
        return [...this.transactions];
    }

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
                    ${!searchTerm && !tipoFilter && !estadoFilter ? `
                        <div class="space-x-2">
                            <button onclick="window.openTransactionWizard('VENTA')" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                                <i class="fas fa-plus mr-2"></i>Nueva Venta
                            </button>
                            <button onclick="window.openTransactionWizard('COMPRA')" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                <i class="fas fa-shopping-cart mr-2"></i>Nueva Compra
                            </button>
                        </div>
                    ` : `
                        <button onclick="transaccionesManager.clearFilters()" class="text-brand-brown hover:text-brand-light-brown">
                            <i class="fas fa-times mr-2"></i>Limpiar filtros
                        </button>
                    `}
                </div>
            `;
            return;
        }

        const cardsHtml = toShow.map(transaction => {
            const stateColor = this.getStateColor(transaction.estado);
            const clientName = transaction.cliente ? `${transaction.cliente.nombre} ${transaction.cliente.apellido}` : 'Consumidor Final';
            return `
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-semibold">${this.formatTransactionType(transaction.tipoTransaccion)} #${transaction.numeroFactura || transaction.id}</h3>
                        <span class="px-2 py-1 text-xs font-medium rounded-full bg-${stateColor}-100 text-${stateColor}-800">
                            ${transaction.estado}
                        </span>
                    </div>
                    <p class="text-gray-600">Cliente: ${clientName}</p>
                    <p class="text-gray-600">Fecha: ${this.formatDate(transaction.fecha)}</p>
                    <p class="text-lg font-bold text-brand-brown mt-2">Total: ${this.formatCurrency(transaction.total)}</p>
                    <div class="mt-4 flex space-x-2">
                        <button onclick="transaccionesManager.viewTransactionDetails(${transaction.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Ver Detalles</button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = cardsHtml;
    }

    renderPagination() {
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

    changePage(page) {
        this.currentPage = page;
        this.renderTransactions();
        this.renderPagination();
    }

    filterTransactions() {
        this.currentPage = 0;
        this.loadTransactions();
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
            'PENDIENTE': 'yellow', 'CONFIRMADA': 'blue', 'COMPLETADA': 'green', 'CANCELADA': 'red',
            'FACTURADA': 'purple', 'RECIBIDA': 'indigo', 'PAGADA': 'green', 'ENTREGADA': 'teal', 'COBRADA': 'emerald'
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
        if (transaction.tipoTransaccion === 'COMPRA' && transaction.proveedor) {
            contraparteInfo = `
                <p><strong>Proveedor:</strong> ${transaction.proveedor.nombre}</p>
                <p><strong>RNC:</strong> ${transaction.proveedor.rnc || 'N/A'}</p>
                <p><strong>Teléfono:</strong> ${transaction.proveedor.telefono || 'N/A'}</p>
                <p><strong>Email:</strong> ${transaction.proveedor.email || 'N/A'}</p>
            `;
        } else if (transaction.cliente) {
            contraparteInfo = `<p><strong>Cliente:</strong> ${transaction.cliente.nombre} ${transaction.cliente.apellido} (${transaction.cliente.cedula})</p>`;
        } else {
            contraparteInfo = `<p><strong>Cliente:</strong> Consumidor Final</p>`;
        }
        const productsList = transaction.lineas && transaction.lineas.length > 0
            ? transaction.lineas.map(line => `
                <div class="flex justify-between items-center border-b pb-2 mb-2 bg-gray-50 p-2 rounded">
                    <div>
                        <p class="font-medium">${line.nombreProducto}</p>
                        <p class="text-sm text-gray-600">Cantidad: ${line.cantidad} | Precio: ${this.formatCurrency(line.precioUnitario)}</p>
                        <p class="text-sm text-gray-600">Código: ${line.codigoProducto || 'N/A'}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold">${this.formatCurrency(line.subtotalLinea)}</p>
                        ${line.descuento ? `<p class="text-sm text-red-600">Desc: ${this.formatCurrency(line.descuento)}</p>` : ''}
                    </div>
                </div>
            `).join('') : '<p class="text-gray-500 italic">No hay productos en esta transacción.</p>';
        const estadoOptions = ['PENDIENTE', 'CONFIRMADA', 'PROCESANDO', 'COMPLETADA', 'CANCELADA'];
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
                    <p><strong>Tipo:</strong> ${this.formatTransactionType(transaction.tipoTransaccion)}</p>
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

    async cambiarEstadoTransaccion(id, nuevoEstado) {
        try {
            const transaction = this.transactions.find(t => t.id === id);
            if (transaction) {
                transaction.estado = nuevoEstado;
                this.renderTransactions();
                window.showToast(`Estado cambiado a: ${nuevoEstado}`, 'success');
            }
        } catch (error) {
            console.error('Error changing transaction state:', error);
            window.showToast('Error al cambiar el estado de la transacción.', 'error');
        }
    }

    cerrarModalVerTransaccion() {
        document.getElementById('modalVerTransaccion').classList.add('hidden');
    }

    imprimirFactura() {
        window.showToast('Funcionalidad de impresión en desarrollo.', 'info');
    }

    editTransaction(id) {
        window.showToast(`Editar transacción ${id} - Funcionalidad en desarrollo.`, 'info');
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