// src/main/resources/static/js/contabilidad/transacciones.js

import { TransaccionService } from '../services/transaccionService.js';

class TransaccionesManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentPage = 0; // 0-indexed for API
        this.transactionsPerPage = 10; // Default size for API
        this.currentView = 'list'; // Default view for transactions page
        this.filtersVisible = false;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadTransactions();
        this.updateTransactionCount();
    }

    setupEventListeners() {
        document.getElementById('filtroTipo')?.addEventListener('change', () => this.filterTransactions());
        document.getElementById('filtroEstado')?.addEventListener('change', () => this.filterTransactions());
        document.getElementById('fechaDesde')?.addEventListener('change', () => this.filterTransactions());
        document.getElementById('fechaHasta')?.addEventListener('change', () => this.filterTransactions());
        document.getElementById('buscarTexto')?.addEventListener('keyup', () => this.filterTransactions());
        document.getElementById('limpiarFiltrosBtn')?.addEventListener('click', () => this.clearFilters());
        document.getElementById('nuevaVentaBtn')?.addEventListener('click', () => window.openTransactionWizard('VENTA'));
        document.getElementById('viewCards')?.addEventListener('click', () => this.setView('cards'));
        document.getElementById('viewList')?.addEventListener('click', () => this.setView('list'));
    }

    async loadTransactions() {
        this.showLoading();
        try {
            const filters = {
                tipo: document.getElementById('filtroTipo')?.value || null,
                estado: document.getElementById('filtroEstado')?.value || null,
                fechaDesde: document.getElementById('fechaDesde')?.value || null,
                fechaHasta: document.getElementById('fechaHasta')?.value || null,
                page: this.currentPage,
                size: this.transactionsPerPage
            };
            this.transactions = await this.transaccionService.obtenerTransacciones(filters);
            this.filteredTransactions = [...this.transactions]; // Assuming API returns already filtered/paginated data
            this.renderTransactions();
            this.updateTransactionCount();
        } catch (error) {
            console.error('Error loading transactions:', error);
            window.showToast('Error al cargar las transacciones.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderTransactions() {
        const container = document.getElementById('tablaTransacciones');
        if (!container) return;

        if (this.filteredTransactions.length === 0) {
            container.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-gray-500">No hay transacciones que coincidan con los filtros.</td></tr>`;
            return;
        }

        const rowsHtml = this.filteredTransactions.map(transaction => {
            const stateColor = this.getStateColor(transaction.estado);
            const isEditable = ['PENDIENTE', 'CONFIRMADA'].includes(transaction.estado);
            const clientName = transaction.cliente ? `${transaction.cliente.nombre} ${transaction.cliente.apellido}` : 'Consumidor Final';

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${transaction.numeroFactura || transaction.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${clientName}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <i class="${this.getTypeIcon(transaction.tipoTransaccion)} mr-2 text-${this.getTransactionColor(transaction.tipoTransaccion)}"></i>
                            <span class="text-sm text-gray-900">${this.formatTransactionType(transaction.tipoTransaccion)}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-brown-light">${this.formatCurrency(transaction.total)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-medium rounded-full bg-${stateColor}-100 text-${stateColor}-800">
                            ${transaction.estado}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${this.formatDate(transaction.fecha)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                            <button onclick="transaccionesManager.viewTransactionDetails(${transaction.id})" class="text-blue-600 hover:text-blue-800" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${isEditable ? `
                                <button onclick="transaccionesManager.editTransaction(${transaction.id})" class="text-green-600 hover:text-green-800" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                            ` : `
                                <button class="text-gray-400 cursor-not-allowed" title="No se puede editar">
                                    <i class="fas fa-lock"></i>
                                </button>
                            `}
                            <button onclick="transaccionesManager.deleteTransaction(${transaction.id})" class="text-red-600 hover:text-red-800" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        container.innerHTML = rowsHtml;
        this.renderPagination();
    }

    renderPagination() {
        // This part needs to be updated based on actual total pages from API if available
        const totalPages = Math.ceil(this.filteredTransactions.length / this.transactionsPerPage); // Placeholder
        const paginationContainer = document.getElementById('paginacion');
        if (!paginationContainer) return;

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
        this.loadTransactions();
    }

    filterTransactions() {
        this.currentPage = 0; // Reset to first page on filter change
        this.loadTransactions();
    }

    clearFilters() {
        document.getElementById('filtroTipo').value = '';
        document.getElementById('filtroEstado').value = '';
        document.getElementById('fechaDesde').value = '';
        document.getElementById('fechaHasta').value = '';
        document.getElementById('buscarTexto').value = '';
        this.filterTransactions();
    }

    updateTransactionCount() {
        const countElement = document.getElementById('totalTransacciones');
        if (countElement) {
            countElement.textContent = `${this.filteredTransactions.length} transacciones`;
        }
    }

    showLoading() {
        document.getElementById('loadingTransacciones').classList.remove('hidden');
        document.getElementById('tablaTransacciones').innerHTML = ''; // Clear table content
    }

    hideLoading() {
        document.getElementById('loadingTransacciones').classList.add('hidden');
    }

    // Utility functions (can be moved to a shared utility file if needed)
    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    formatTransactionType(type) {
        const types = {
            'COMPRA': 'Compra',
            'VENTA': 'Venta',
            'DEVOLUCION_COMPRA': 'Devolución Compra',
            'DEVOLUCION_VENTA': 'Devolución Venta'
        };
        return types[type] || type;
    }

    getTransactionTypeClass(type) {
        const classes = {
            'COMPRA': 'compra',
            'VENTA': 'venta',
            'DEVOLUCION_COMPRA': 'devolucion',
            'DEVOLUCION_VENTA': 'devolucion'
        };
        return classes[type] || '';
    }

    getTransactionColor(type) {
        const colors = {
            'COMPRA': 'green-600',
            'VENTA': 'yellow-600',
            'DEVOLUCION_COMPRA': 'red-600',
            'DEVOLUCION_VENTA': 'red-600'
        };
        return colors[type] || 'blue-600';
    }

    getStateColor(state) {
        const colors = {
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
        return colors[state] || 'gray';
    }

    // Transaction actions
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

        const clientInfo = transaction.cliente ? 
            `<p><strong>Cliente:</strong> ${transaction.cliente.nombre} ${transaction.cliente.apellido} (${transaction.cliente.cedula})</p>` :
            `<p><strong>Cliente:</strong> Consumidor Final</p>`;

        const productsList = transaction.lineas && transaction.lineas.length > 0 ?
            transaction.lineas.map(line => `
                <div class="flex justify-between items-center border-b pb-1 mb-1">
                    <span>${line.nombreProducto} (x${line.cantidad})</span>
                    <span>${this.formatCurrency(line.subtotalLinea)}</span>
                </div>
            `).join('') :
            '<p>No hay productos en esta transacción.</p>';

        detailsContainer.innerHTML = `
            <div class="space-y-3">
                <p><strong>Factura #:</strong> ${transaction.numeroFactura || 'N/A'}</p>
                <p><strong>Tipo:</strong> ${this.formatTransactionType(transaction.tipoTransaccion)}</p>
                <p><strong>Fecha:</strong> ${this.formatDate(transaction.fecha)}</p>
                <p><strong>Estado:</strong> ${transaction.estado}</p>
                ${clientInfo}
                <p><strong>Método de Pago:</strong> ${transaction.metodoPago}</p>
                <p><strong>Observaciones:</strong> ${transaction.observaciones || 'N/A'}</p>
                
                <h4 class="font-bold mt-4">Productos:</h4>
                <div class="border rounded p-2">${productsList}</div>

                <div class="text-right mt-4">
                    <p><strong>Subtotal:</strong> ${this.formatCurrency(transaction.subtotal)}</p>
                    <p><strong>Impuestos:</strong> ${this.formatCurrency(transaction.impuestos)}</p>
                    <p class="text-xl font-bold">Total: ${this.formatCurrency(transaction.total)}</p>
                </div>
            </div>
        `;
    }

    cerrarModalVerTransaccion() {
        document.getElementById('modalVerTransaccion').classList.add('hidden');
    }

    imprimirFactura() {
        window.showToast('Funcionalidad de impresión en desarrollo.', 'info');
        // Implement actual printing logic here
    }

    editTransaction(id) {
        window.showToast(`Editar transacción ${id} - Funcionalidad en desarrollo.`, 'info');
        // Implement edit logic, possibly opening the wizard in edit mode
    }

    async deleteTransaction(id) {
        if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
            try {
                await this.transaccionService.eliminarTransaccion(id);
                window.showToast('Transacción eliminada exitosamente.', 'success');
                this.loadTransactions(); // Reload transactions after deletion
            } catch (error) {
                console.error('Error deleting transaction:', error);
                window.showToast('Error al eliminar la transacción.', 'error');
            }
        }
    }
}

// Global instance
const transaccionesManager = new TransaccionesManager();

// Expose functions to global scope for HTML onclick attributes
window.transaccionesManager = transaccionesManager;
window.cerrarModalVerTransaccion = () => transaccionesManager.cerrarModalVerTransaccion();
window.imprimirFactura = () => transaccionesManager.imprimirFactura();
