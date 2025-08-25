import { TransaccionService } from '../services/transaccionService.js';
import { TableViewManager } from '../components/tableView.js';
import { imprimirFactura } from '../printable/imprimirFactu.js';
import { CardnetService } from '../services/cardnetService.js'; // Nueva importación
import { TerminalPaymentProcessor } from '../components/TerminalPaymentProcessor.js'; // Nueva importación


// --- MAIN CLASS ---
class TransaccionesManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentPage = 0;
        this.transactionsPerPage = 25;
        this.totalPages = 0;
        this.totalItems = 0;
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        this.vista = 'tarjetas';
        // Inicializar servicios para el terminal de pago
        this.cardnetService = new CardnetService();
        this.terminalPaymentProcessor = new TerminalPaymentProcessor(this.cardnetService);


        this.tableViewManager = new TableViewManager('#transaccionesListContainer', {
            columns: this.getResponsiveColumns(),
            actions: [
                {
                    icon: 'fas fa-eye',
                    handler: 'transaccionesManager.viewTransactionDetails',
                    className: 'text-brand-brown hover:text-brand-light-brown',
                    title: 'Ver detalles'
                }
                // Acción de eliminar removida
            ],
            searchFields: ['numeroFactura', 'cliente.nombre', 'cliente.apellido', 'cliente.cedula', 'proveedor.nombre', 'tipoTransaccion', 'estado'],
            idField: 'id',
            emptyIcon: 'fas fa-exchange-alt'
        });

        this.init();
    }

    // Fragmento para que el tipo de transacción se vea correctamente en la tabla (TableViewManager)
    getResponsiveColumns() {
        return [
            {
                header: 'Factura #',
                field: 'numeroFactura',
                formatter: (value, item) => value || `#${item.id}`
            },
            {
                header: 'Tipo',
                field: 'tipoTransaccion',
                formatter: (value, item) =>
                    this.formatTransactionType(value || item.tipoTransaccion || item.tipo || 'N/A')
            },
            {
                header: 'Cliente/Proveedor',
                field: 'cliente',
                formatter: (value, item) => {
                    // COMPRA: mostrar proveedor
                    if ((item.tipoTransaccion || item.tipo) === 'COMPRA' && item.proveedor && item.proveedor.nombre) {
                        return item.proveedor.nombre;
                    }
                    // VENTA u otros: mostrar cliente si existe
                    if (item.cliente && (item.cliente.nombre || item.cliente.apellido)) {
                        return `${item.cliente.nombre || ''} ${item.cliente.apellido || ''}`.trim();
                    }
                    // Contraparte genérica
                    if (item.contraparteNombre) return item.contraparteNombre;
                    // Por defecto
                    return 'Consumidor Final';
                }
            },
            {
                header: 'Fecha',
                field: 'fecha',
                formatter: (value) => value ? this.formatDate(value) : 'N/A'
            },
            {
                header: 'Estado',
                field: 'estado',
                formatter: (value) => {
                    const color = this.getStateColor(value);
                    return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-${color}-100 text-${color}-800">${value || 'N/A'}</span>`;
                }
            },
            {
                header: 'Total',
                field: 'total',
                formatter: (value) => `<span class="font-bold text-brand-brown">${this.formatCurrency(value)}</span>`
            }
        ];
    }

    formatTransactionType(type) {
        const types = {
            'COMPRA': 'Compra',
            'VENTA': 'Venta',
            'DEVOLUCION_COMPRA': 'Devolución Compra',
            'DEVOLUCION_VENTA': 'Devolución Venta'
        };
        if (!type) return 'N/A';
        return types[type] || type;
    }

    async init() {
        this.setupEventListeners();
        this.setupResponsiveHandlers();
        this.checkUrlFilters();
        await this.loadTransactions();
        this.updateTransactionCount();
        // Inicializar la vista y los botones
        this.updateViewButtons();
        this.renderVista();
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
        this.updateViewButtons();
        this.renderVista();
    }

    updateViewButtons() {
        const btnTarjetas = document.getElementById('btnVistaTarjetas');
        const btnTabla = document.getElementById('btnVistaTabla');

        if (btnTarjetas && btnTabla) {
            if (this.vista === 'tarjetas') {
                btnTarjetas.className = 'px-3 py-1 rounded-md text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm';
                btnTabla.className = 'px-3 py-1 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900';
            } else {
                btnTarjetas.className = 'px-3 py-1 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900';
                btnTabla.className = 'px-3 py-1 rounded-md text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm';
            }
        }
    }

    renderVista() {
        if (this.vista === 'tarjetas') {
            document.getElementById('transaccionesListContainer').classList.remove('hidden');
            document.getElementById('transaccionesTableContainer').classList.add('hidden');
            // Usar el TableViewManager para cambiar a vista de tarjetas
            this.tableViewManager.switchToCardView();
            this.renderTransactions();
            this.renderPagination();
        } else {
            document.getElementById('transaccionesListContainer').classList.add('hidden');
            document.getElementById('transaccionesTableContainer').classList.remove('hidden');
            // Usar el TableViewManager para cambiar a vista de tabla
            this.tableViewManager.switchToTableView();
            this.renderTableTransactions();
            // NO renderizar paginación separada para tabla, el TableViewManager la maneja
        }
    }

    async loadTransactions() {
        this.showLoading();
        try {
            const filters = {
                tipo: document.getElementById('transaccionTipoFilter')?.value || null,
                estado: document.getElementById('transaccionEstadoFilter')?.value || null,
                busqueda: document.getElementById('transaccionSearchInput')?.value || null,
                page: this.currentPage,
                size: this.transactionsPerPage
            };
            this.transactions = await this.transaccionService.obtenerTransacciones(filters);
            this.filteredTransactions = [...this.transactions];
            this.tableViewManager.setData(this.transactions);

            this.renderTransactions();
            this.updateTransactionCount();
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.transactions = [];
            this.filteredTransactions = [];
            this.tableViewManager.setData([]);
            this.renderTransactions();
        } finally {
            this.hideLoading();
        }
    }

    getFilteredTransactions() {
        return [...this.filteredTransactions];
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
    // 2. Mejorar el método de filtrado para manejar cédulas con formato dominicano
    filterTransactions() {
        const tipo = document.getElementById('transaccionTipoFilter')?.value || '';
        const estado = document.getElementById('transaccionEstadoFilter')?.value || '';
        const busquedaOriginal = document.getElementById('transaccionSearchInput')?.value || '';
        const busqueda = busquedaOriginal.toLowerCase().trim();
        this.currentPage = 0;

        console.log('Búsqueda iniciada:', busqueda);

        // Normalizar búsqueda (quitar caracteres no numéricos)
        const busquedaLimpia = busqueda.replace(/[^0-9]/g, '');
        const esNumerica = /^\d+$/.test(busquedaLimpia);

        console.log(`Búsqueda normalizada: "${busquedaLimpia}" (Es numérica: ${esNumerica})`);

        // Función para formatear cédula (solo para clientes)
        function formatearComoCedula(id) {
            if (!id) return '';
            let idStr = String(id).replace(/\D/g, '');
            while (idStr.length < 11) idStr = '0' + idStr;
            return idStr;
        }

        this.filteredTransactions = this.transactions.filter(t => {
            // Filtros básicos por tipo y estado
            let matchesTipo = tipo ? (t.tipo && t.tipo.toUpperCase() === tipo.toUpperCase()) : true;
            let matchesEstado = estado ? (t.estado && t.estado.toUpperCase() === estado.toUpperCase()) : true;

            // Si no hay búsqueda, solo aplicar filtros tipo/estado
            if (!busqueda) return matchesTipo && matchesEstado;

            // BÚSQUEDA POR NOMBRE (caso más simple)
            const nombreContraparte = (t.contraparteNombre || '').toLowerCase();
            if (nombreContraparte.includes(busqueda)) {
                console.log(`✅ Coincidencia por NOMBRE en transacción #${t.id}`);
                return matchesTipo && matchesEstado;
            }

            // BÚSQUEDA POR IDENTIFICACIÓN (cédula o RNC)
            if (esNumerica) {
                // 1. Para compras: buscar en RNC del proveedor (NUNCA en el contraparteId)
                if (t.tipo === 'COMPRA' && t.proveedor && t.proveedor.rnc) {
                    const rncLimpio = t.proveedor.rnc.replace(/[^0-9]/g, '');
                    if (rncLimpio.includes(busquedaLimpia) || busquedaLimpia.includes(rncLimpio)) {
                        console.log(`✅ Coincidencia por RNC en transacción #${t.id}`);
                        return matchesTipo && matchesEstado;
                    }
                }

                // 2. Para ventas: buscar en cédula del cliente
                else if (t.tipo !== 'COMPRA') {
                    // Buscar en la cédula del objeto cliente
                    if (t.cliente && t.cliente.cedula) {
                        const cedulaLimpia = t.cliente.cedula.replace(/[^0-9]/g, '');
                        if (cedulaLimpia.includes(busquedaLimpia) || busquedaLimpia.includes(cedulaLimpia)) {
                            console.log(`✅ Coincidencia por CÉDULA en transacción #${t.id}`);
                            return matchesTipo && matchesEstado;
                        }
                    }

                    // Buscar en el contraparteId SOLO para ventas (como respaldo, no para compras)
                    else if (t.contraparteId) {
                        const cedulaFormateada = formatearComoCedula(t.contraparteId);
                        if (cedulaFormateada.includes(busquedaLimpia) ||
                            busquedaLimpia.includes(cedulaFormateada) ||
                            String(t.contraparteId).includes(busquedaLimpia)) {
                            console.log(`✅ Coincidencia por CONTRAPARTE_ID en transacción #${t.id}`);
                            return matchesTipo && matchesEstado;
                        }
                    }
                }

                // 3. Búsqueda directa por ID de transacción o contraparteId sin formatear
                if (String(t.id).includes(busquedaLimpia) ||
                    (t.contraparteId && String(t.contraparteId).includes(busquedaLimpia))) {
                    console.log(`✅ Coincidencia por ID en transacción #${t.id}`);
                    return matchesTipo && matchesEstado;
                }
            }

            // BÚSQUEDA EN OTROS CAMPOS
            const facturaNum = (t.numeroFactura || '').toLowerCase();

            const matchesOtros = facturaNum.includes(busqueda);

            if (matchesOtros) {
                console.log(`✅ Coincidencia en OTROS CAMPOS para transacción #${t.id}`);
            }

            return matchesTipo && matchesEstado && matchesOtros;
        });

        console.log(`Filtrado completado: ${this.filteredTransactions.length} de ${this.transactions.length} transacciones encontradas`);

        // Actualizar la vista activa
        this.renderVista();
        this.updateTransactionCount();
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
                <div class="text-center py-8 md:py-12 col-span-full">
                    <div class="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-exchange-alt text-2xl md:text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-base md:text-lg font-medium text-gray-900 mb-2">Sin transacciones</h3>
                    <p class="text-gray-600 mb-4 md:mb-6 text-sm md:text-base px-4">${emptyMessage}</p>
                    ${!searchTerm && !tipoFilter && !estadoFilter ? `
                        <div class="flex flex-col sm:flex-row gap-2 justify-center">
                            <button onclick="window.openTransactionWizard('VENTA')" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown text-sm md:text-base">
                                <i class="fas fa-plus mr-2"></i>Nueva Venta
                            </button>
                            <button onclick="window.openTransactionWizard('COMPRA')" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm md:text-base">
                                <i class="fas fa-shopping-cart mr-2"></i>Nueva Compra
                            </button>
                        </div>
                    ` : `
                        <button onclick="transaccionesManager.clearFilters()" class="text-brand-brown hover:text-brand-light-brown text-sm md:text-base">
                            <i class="fas fa-times mr-2"></i>Limpiar filtros
                        </button>
                    `}
                </div>
            `;
            return;
        }

        container.innerHTML = toShow.map(transaction => this.renderTransactionCard(transaction)).join('');
    }

    renderTransactionCard(transaction) {
        const stateColor = this.getStateColor(transaction.estado);
        // Usa tipoTransaccion y tipo para mostrar correctamente
        const tipoTransaccion = this.formatTransactionType(transaction.tipoTransaccion || transaction.tipo || 'N/A');
        const clientName =
            transaction.cliente && (transaction.cliente.nombre || transaction.cliente.apellido)
                ? `${transaction.cliente.nombre || ''} ${transaction.cliente.apellido || ''}`.trim()
                : transaction.proveedor && transaction.proveedor.nombre
                    ? transaction.proveedor.nombre
                    : transaction.contraparteNombre
                        ? transaction.contraparteNombre
                        : 'Consumidor Final';

        return `
        <div class="transaction-card flex flex-col h-full w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-h-[220px]
            sm:min-h-[240px] md:min-h-[260px] lg:min-h-[280px] xl:min-h-[300px]
            ${this.isMobile ? 'max-w-full' : 'max-w-[420px] xl:max-w-[480px]'}
            ">
            <div class="flex-1 flex flex-col p-3 sm:p-4 md:p-5">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-semibold text-gray-900 truncate">
                            ${tipoTransaccion !== 'N/A' ? tipoTransaccion : 'Sin tipo'}
                        </h3>
                        <p class="text-sm text-gray-500">${transaction.numeroFactura || transaction.id}</p>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-${stateColor}-100 text-${stateColor}-800 ml-2 whitespace-nowrap">
                        ${transaction.estado || 'N/A'}
                    </span>
                </div>
                <div class="flex-1 flex flex-col gap-2 mt-1">
                    <div class="flex items-center text-sm text-gray-600">
                        <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                            <i class="fas fa-user text-gray-400"></i>
                        </span>
                        <span class="truncate">${clientName}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                        <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                            <i class="fas fa-calendar text-gray-400"></i>
                        </span>
                        <span class="truncate text-xs">${transaction.fecha ? this.formatDate(transaction.fecha) : 'N/A'}</span>
                    </div>
                    ${transaction.metodoPago ? `
                    <div class="flex items-center text-sm text-gray-600">
                        <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                            <i class="fas fa-credit-card text-gray-400"></i>
                        </span>
                        <span class="truncate text-xs">${transaction.metodoPago}</span>
                    </div>
                    ` : ''}
                    <div class="flex items-center text-lg font-bold text-brand-brown mt-2">
                        <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                            <i class="fas fa-dollar-sign text-brand-brown text-sm"></i>
                        </span>
                        <span>${this.formatCurrency(transaction.total)}</span>
                    </div>
                </div>
                <div class="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                    <button
                        onclick="transaccionesManager.viewTransactionDetails(${transaction.id})"
                        class="flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-sm font-medium"
                        title="Ver detalles"
                        type="button"
                    >
                        <i class="fas fa-eye"></i>
                        <span>Detalles</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    }
    // Agregar un método para cambiar estados automáticamente
    async cambiarEstadoAutomatico(transaccionId, nuevoEstado, motivoCambio = '') {
        try {
            await this.transaccionService.cambiarEstadoTransaccion(transaccionId, nuevoEstado);
            // Actualizar la transacción en la lista y en detalles si está abierta
            await this.loadTransactions();

            // Si el modal de detalles está abierto y muestra esta transacción
            const detallesContainer = document.getElementById('detallesTransaccion');
            if (
                detallesContainer &&
                !document.getElementById('modalVerTransaccion').classList.contains('hidden') &&
                detallesContainer.getAttribute('data-transaction-id') == transaccionId
            ) {
                const transaction = await this.transaccionService.obtenerTransaccionPorId(transaccionId);
                this.renderTransactionDetailsModal(transaction);
            }

            // Mostrar notificación
            const mensaje = motivoCambio
                ? `Estado cambiado a: ${nuevoEstado} (${motivoCambio})`
                : `Estado cambiado automáticamente a: ${nuevoEstado}`;
            window.showToast(mensaje, 'info');
        } catch (error) {
            console.error('Error changing transaction state automatically:', error);
        }
    }

    renderMobileButtons(transaction) {
        return `
            <div class="space-y-2">
                <div class="grid grid-cols-1 gap-2">
                    <button 
                        onclick="transaccionesManager.viewTransactionDetails(${transaction.id})" 
                        class="flex items-center justify-center gap-1.5 bg-brand-brown text-white px-3 py-2.5 rounded-lg hover:bg-brand-light-brown transition-colors text-sm font-medium"
                        title="Ver detalles"
                        type="button"
                    >
                        <i class="fas fa-eye text-xs"></i>
                        <span>Ver Detalles</span>
                    </button>
                    <button onclick="transaccionesManager.imprimirFactura(document.getElementById('detallesTransaccion').getAttribute('data-transaction-id'))" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-print mr-2"></i>
                        Imprimir
                    </button>
                </div>
            </div>
        `;
    }

    renderTabletButtons(transaction) {
        return `
            <div class="flex flex-wrap gap-1.5 justify-center">
                <button 
                    onclick="transaccionesManager.viewTransactionDetails(${transaction.id})" 
                    class="flex items-center gap-1 bg-brand-brown text-white px-2.5 py-1.5 rounded-md hover:bg-brand-light-brown transition-colors text-xs font-medium"
                    title="Ver detalles"
                    type="button"
                >
                    <i class="fas fa-eye"></i>
                    <span>Ver</span>
                </button>
                <button 
                    onclick="transaccionesManager.imprimirFactura(${transaction.id})"
                    class="flex items-center gap-1 bg-blue-600 text-white px-2.5 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                    title="Imprimir factura"
                    type="button"
                >
                    <i class="fas fa-print"></i>
                    <span>Print</span>
                </button>
            </div>
        `;
    }

    renderDesktopButtons(transaction) {
        return `
            <div class="flex flex-wrap gap-2">
                <button 
                    onclick="transaccionesManager.viewTransactionDetails(${transaction.id})" 
                    class="flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-sm font-medium"
                    title="Ver detalles"
                    type="button"
                >
                    <i class="fas fa-eye"></i>
                    <span>Detalles</span>
                </button>
                <button 
                    onclick="transaccionesManager.imprimirFactura(${transaction.id})"
                    class="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
                    title="Imprimir factura"
                    type="button"
                >
                    <i class="fas fa-print"></i>
                </button>
            </div>
        `;
    }

    changePage(page) {
        this.currentPage = page;
        this.renderVista();
    }

    renderTableTransactions() {
        // Usar el TableViewManager para mostrar TODOS los datos filtrados
        const filtered = this.getFilteredTransactions();

        // Pasar todos los datos filtrados al TableViewManager
        // El TableViewManager se encargará de la paginación internamente
        this.tableViewManager.setData(filtered);

        // Sincronizar la página actual si es necesario
        this.tableViewManager.currentPage = this.currentPage;
    }


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

    // Mejorar el método getStateColor para tener colores más específicos
    getStateColor(state) {
        if (!state) return 'gray';

        const colors = {
            'PENDIENTE': 'yellow',
            'CONFIRMADA': 'blue',
            'PROCESANDO': 'orange',
            'COMPLETADA': 'green',
            'CANCELADA': 'red',
            'FACTURADA': 'purple',
            'RECIBIDA': 'indigo',
            'PAGADA': 'green',
            'ENTREGADA': 'teal',
            'COBRADA': 'emerald',
            'DEVUELTA': 'emerald',
            'PARCIALMENTE_DEVUELTA': 'yellow'
        };

        return colors[state.toUpperCase()] || 'gray';
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

        // Depuración: registrar la transacción para verificar su estructura
        console.log('Datos de transacción:', transaction);

        detailsContainer.setAttribute('data-transaction-id', transaction.id);

        // Formatear cédula para clientes (solo para ventas)
        function formatearComoCedula(id) {
            if (!id) return '';

            // Convertir a string y eliminar caracteres no numéricos
            let idStr = String(id).replace(/\D/g, '');

            // Si ya tiene guiones, no reformatear
            if (idStr.includes('-')) return idStr;

            // Rellenar con ceros al inicio si es necesario para llegar a 11 dígitos
            while (idStr.length < 11) {
                idStr = '0' + idStr;
            }

            // Aplicar formato de cédula dominicana: XXX-XXXXXXX-X
            if (idStr.length === 11) {
                return `${idStr.substring(0, 3)}-${idStr.substring(3, 10)}-${idStr.substring(10)}`;
            }

            return idStr; // Devolver sin formato si no tiene 11 dígitos
        }

        // Añadir esta verificación para facturas grandes (superior a 250,000 pesos)
        const esFacturaGrande = transaction.total >= 250000;

        // Información de la contraparte
        let contraparteInfo = '';

        if (transaction.tipo === 'COMPRA' && transaction.proveedor) {
            // CASO DE COMPRA: MOSTRAR INFORMACIÓN DEL PROVEEDOR
            contraparteInfo = `
        <p><strong>Proveedor:</strong> ${transaction.proveedor.nombre}</p>
        <p><strong>RNC:</strong> ${transaction.proveedor.rnc || 'N/A'}</p>`;

            // Mostrar ID del proveedor como información adicional (no formatear como RNC)
            if (transaction.contraparteId) {
                contraparteInfo += `<p><strong>ID en sistema:</strong> ${transaction.contraparteId}</p>`;
            }

            contraparteInfo += `
        <p><strong>Teléfono:</strong> ${transaction.proveedor.telefono || 'N/A'}</p>
        <p><strong>Email:</strong> ${transaction.proveedor.email || 'N/A'}</p>
        `;
        } else if (transaction.cliente && (transaction.cliente.nombre || transaction.cliente.apellido)) {
            // CASO DE VENTA CON CLIENTE: MOSTRAR INFORMACIÓN DEL CLIENTE
            // Información básica del cliente
            contraparteInfo = `
        <p><strong>Cliente:</strong> ${transaction.cliente.nombre || ''} ${transaction.cliente.apellido || ''}</p>`;

            // Mostrar cédula si existe
            const tieneCedula = transaction.cliente.cedula && transaction.cliente.cedula.trim() !== '';
            if (tieneCedula) {
                contraparteInfo += `<p><strong>Cédula:</strong> ${transaction.cliente.cedula}</p>`;
            }
            // Si no hay cédula pero hay contraparteId, intentar formatearlo como cédula
            else if (transaction.contraparteId) {
                const cedulaFormateada = formatearComoCedula(transaction.contraparteId);
                contraparteInfo += `<p><strong>Cédula:</strong> ${cedulaFormateada}</p>`;
            }

            // Mostrar advertencia si es factura grande y no tiene cédula
            if (esFacturaGrande && !tieneCedula) {
                contraparteInfo += `<p class="font-bold text-red-600">ADVERTENCIA: Se requiere cédula para facturas mayores a RD$250,000</p>`;
            }

            // Añadir información de contacto si existe
            if (transaction.cliente.telefono) {
                contraparteInfo += `<p><strong>Teléfono:</strong> ${transaction.cliente.telefono}</p>`;
            }
            if (transaction.cliente.email) {
                contraparteInfo += `<p><strong>Email:</strong> ${transaction.cliente.email}</p>`;
            }

            // Mostrar ID del cliente como información adicional
            if (transaction.contraparteId) {
                contraparteInfo += `<p><strong>ID en sistema:</strong> ${transaction.contraparteId}</p>`;
            }
        } else if (transaction.contraparteNombre) {
            // CASO CON SOLO NOMBRE DE CONTRAPARTE
            if (transaction.tipo === 'COMPRA') {
                // Para compras - mostrar nombre del proveedor y RNC si disponible
                contraparteInfo = `<p><strong>Proveedor:</strong> ${transaction.contraparteNombre}</p>`;

                // Mostrar el ID como información adicional (no como RNC)
                if (transaction.contraparteId) {
                    contraparteInfo += `<p><strong>ID en sistema:</strong> ${transaction.contraparteId}</p>`;
                }
            } else {
                // Para ventas - mostrar nombre del cliente y cédula si disponible
                contraparteInfo = `<p><strong>Cliente:</strong> ${transaction.contraparteNombre}</p>`;

                // Intentar formatear el contraparteId como cédula para ventas
                if (transaction.contraparteId) {
                    const cedulaFormateada = formatearComoCedula(transaction.contraparteId);
                    contraparteInfo += `<p><strong>Cédula:</strong> ${cedulaFormateada}</p>`;
                }

                // Mostrar advertencia si es factura grande
                if (esFacturaGrande) {
                    contraparteInfo += `<p class="font-bold text-red-600">ADVERTENCIA: Se requiere cédula para facturas mayores a RD$250,000</p>`;
                }
            }
        } else {
            // CASO SIN INFORMACIÓN DE CONTRAPARTE
            const etiqueta = transaction.tipo === 'COMPRA' ? 'Proveedor' : 'Cliente';
            contraparteInfo = `<p><strong>${etiqueta}:</strong> <span class="italic">Sin nombre registrado</span></p>`;

            if (transaction.tipo === 'COMPRA') {
                // Para compras - mostrar el ID como información adicional
                if (transaction.contraparteId) {
                    contraparteInfo += `<p><strong>ID en sistema:</strong> ${transaction.contraparteId}</p>`;
                }
            } else {
                // Para ventas - intentar formatear como cédula
                if (transaction.contraparteId) {
                    const cedulaFormateada = formatearComoCedula(transaction.contraparteId);
                    contraparteInfo += `<p><strong>Cédula:</strong> ${cedulaFormateada}</p>`;
                }

                // Mostrar advertencia si es factura grande
                if (esFacturaGrande) {
                    contraparteInfo += `<p class="font-bold text-red-600">ADVERTENCIA: Se requiere cédula para facturas mayores a RD$250,000</p>`;
                }
            }
        }

        // El resto de la función permanece igual...
        // Lista de productos
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
    `).join('')
            : '<p class="text-gray-500 italic">No hay productos en esta transacción.</p>';

        // Selector de estado
        const estadoOptions = ['PENDIENTE', 'CONFIRMADA', 'PROCESANDO', 'COMPLETADA', 'CANCELADA', 'DEVUELTA', 'PARCIALMENTE_DEVUELTA'];
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

        // Calcular unidades totales
        let totalUnidades = 0;
        if (transaction.lineas && transaction.lineas.length > 0) {
            totalUnidades = transaction.lineas.reduce((sum, line) => sum + (parseInt(line.cantidad) || 0), 0);
        }

        // Verificar si es venta en cuotas
        let planPagosHTML = '';
        if (transaction.tipoPago === 'ENCUOTAS' || transaction.planPagos) {
            const planPagos = transaction.planPagos || {};
            const montoInicial = planPagos.montoInicial || 0;
            const montoTotal = planPagos.montoTotal || transaction.total || 0;
            const saldoPendiente = planPagos.saldoPendiente || (transaction.total - montoInicial);
            const cuotas = planPagos.cuotas || [];

            planPagosHTML = `
        <div class="mt-6 border-t pt-4">
            <h4 class="text-lg font-bold text-brand-brown mb-3">Plan de Pagos</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-blue-50 p-4 rounded-lg">
                <div>
                    <p><strong>Tipo de pago:</strong> En cuotas</p>
                    <p><strong>Pago inicial:</strong> ${this.formatCurrency(montoInicial)}</p>
                    <p><strong>Total a financiar:</strong> ${this.formatCurrency(montoTotal - montoInicial)}</p>
                </div>
                <div>
                    <p><strong>Número de cuotas:</strong> ${cuotas.length}</p>
                    <p class="${saldoPendiente <= 0 ? 'text-green-600' : 'text-yellow-600'} font-bold">
                        <strong>Saldo pendiente:</strong> ${this.formatCurrency(saldoPendiente)}
                    </p>
                </div>
            </div>
            
            <div class="mb-4">
                <h5 class="font-semibold mb-2">Cuotas registradas:</h5>
                ${cuotas.length > 0 ? `
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-white border border-gray-200">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="py-2 px-3 text-left text-sm font-medium text-gray-700 border-b">Cuota</th>
                                    <th class="py-2 px-3 text-left text-sm font-medium text-gray-700 border-b">Fecha</th>
                                    <th class="py-2 px-3 text-right text-sm font-medium text-gray-700 border-b">Monto</th>
                                    <th class="py-2 px-3 text-center text-sm font-medium text-gray-700 border-b">Estado</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${cuotas.map(cuota => `
                                    <tr>
                                        <td class="py-2 px-3 text-sm">${cuota.numero}</td>
                                        <td class="py-2 px-3 text-sm">${new Date(cuota.fecha).toLocaleDateString()}</td>
                                        <td class="py-2 px-3 text-sm text-right">${this.formatCurrency(cuota.monto)}</td>
                                        <td class="py-2 px-3 text-sm text-center">
                                            <span class="px-2 py-1 text-xs font-medium rounded-full 
                                                ${cuota.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                cuota.estado === 'PAGADA' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                                ${cuota.estado}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="text-gray-500 italic">No hay cuotas registradas aún.</p>'}
            </div>
        </div>
    `;
        }

        // Añadir botón para pago con terminal si la transacción está pendiente
        const isPendiente = transaction.estado === 'PENDIENTE';
        const terminalPaymentButton = isPendiente ? `
    <div class="mt-4 pt-4 border-t">
        <h4 class="font-bold mb-3">Opciones de Pago</h4>
        <div class="flex flex-wrap gap-2">
            <button onclick="procesarPagoTerminal(${transaction.id})" 
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <i class="fas fa-credit-card mr-2"></i>
                Procesar Pago con Terminal
            </button>
        </div>
    </div>
    ` : '';

        // Calcular los impuestos correctamente
        const impuestosFormateados = transaction.impuestos
            ? this.formatCurrency(transaction.impuestos)
            : (transaction.lineas && transaction.lineas.length > 0)
                ? this.formatCurrency(transaction.lineas.reduce((sum, line) => sum + (line.impuestoMonto || 0), 0))
                : this.formatCurrency(0);

        // Renderizar todo el contenido
        detailsContainer.innerHTML = `
    <div class="space-y-4">
        <div class="bg-blue-50 p-3 rounded-lg">
            <p><strong>Factura #:</strong> ${transaction.numeroFactura || transaction.id}</p>
            <p><strong>Tipo:</strong> ${this.formatTransactionType(transaction.tipo)}</p>
            <p><strong>Fecha:</strong> ${this.formatDate(transaction.fecha)}</p>
            ${estadoSelect}
            <p class="mt-1"><strong>Unidades totales:</strong> ${totalUnidades}</p>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
            <h4 class="font-bold mb-2">Información del ${transaction.tipo === 'COMPRA' ? 'Proveedor' : 'Cliente'}:</h4>
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
        
        ${planPagosHTML}
        
        ${terminalPaymentButton}
        
        <div class="bg-green-50 p-3 rounded-lg text-right">
            <p><strong>Subtotal:</strong> ${this.formatCurrency(transaction.subtotal || 0)}</p>
            <p><strong>Impuestos:</strong> ${impuestosFormateados}</p>
            <p class="text-xl font-bold text-green-700">Total: ${this.formatCurrency(transaction.total)}</p>
        </div>
        
        <!-- Botón de abonar al final, solo para ventas en cuotas con saldo pendiente -->
        ${(transaction.tipoPago === 'ENCUOTAS' && transaction.planPagos?.saldoPendiente > 0) ? `
            <div class="flex justify-end mt-4">
                <button onclick="transaccionesManager.agregarPago(${transaction.id})" 
                        class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                        <i class="fas fa-money-bill-wave mr-2"></i> Abonar
                </button>
            </div>
        ` : ''}
    </div>
    `;
    }
    cerrarModalVerTransaccion() {
        document.getElementById('modalVerTransaccion').classList.add('hidden');
    }

    async agregarPago(transaccionId) {
        // Obtener la transacción actualizada
        const transaccion = await this.transaccionService.obtenerTransaccionPorId(transaccionId);
        const planPagos = transaccion.planPagos || {};
        const saldoPendiente = planPagos.saldoPendiente || 0;

        // Si no hay saldo pendiente, no permitir más pagos
        if (saldoPendiente <= 0) {
            window.showToast('Esta transacción ya está completamente pagada', 'info');
            return;
        }

        // Crear modal para registrar nuevo pago
        const modal = document.createElement('div');
        modal.id = 'modalRegistrarPago';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-900">Registrar Nuevo Pago</h3>
                <button id="cerrarModalPago" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago</label>
                    <input type="date" id="fechaPago" class="w-full border rounded-lg p-2" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                    <input type="number" id="montoPago" class="w-full border rounded-lg p-2" min="0" max="${saldoPendiente}" step="0.01" value="${saldoPendiente}">
                    <p class="text-sm text-gray-500 mt-1">Saldo pendiente: ${this.formatCurrency(saldoPendiente)}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                    <select id="metodoPago" class="w-full border rounded-lg p-2">
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="TARJETA">Tarjeta</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                    <textarea id="observacionesPago" class="w-full border rounded-lg p-2" rows="2"></textarea>
                </div>
                <div class="pt-4">
                    <button id="guardarPago" class="w-full bg-brand-brown text-white py-2 rounded-lg hover:bg-brand-light-brown">
                        Registrar Pago
                    </button>
                </div>
            </div>
        </div>
    `;

        document.body.appendChild(modal);

        // Configurar eventos
        document.getElementById('cerrarModalPago').onclick = () => {
            modal.remove();
        };

        document.getElementById('guardarPago').onclick = async () => {
            try {
                const fechaPago = document.getElementById('fechaPago').value;
                const montoPago = parseFloat(document.getElementById('montoPago').value);
                const metodoPago = document.getElementById('metodoPago').value;
                const observaciones = document.getElementById('observacionesPago').value;

                // Validaciones
                if (!fechaPago || isNaN(montoPago) || montoPago <= 0) {
                    window.showToast('Ingrese una fecha y monto válidos', 'error');
                    return;
                }

                if (montoPago > saldoPendiente) {
                    window.showToast(`El monto no puede exceder el saldo pendiente (${this.formatCurrency(saldoPendiente)})`, 'error');
                    return;
                }

                // Registrar el pago
                await this.transaccionService.registrarPago({
                    transaccionId,
                    fecha: fechaPago,
                    monto: montoPago,
                    metodoPago,
                    observaciones
                });

                // Cerrar modal y refrescar detalles
                modal.remove();
                window.showToast('Pago registrado exitosamente', 'success');

                // Refrescar la vista de detalles
                this.viewTransactionDetails(transaccionId);

                // Opcionalmente, actualizar la lista de transacciones
                await this.loadTransactions();
            } catch (error) {
                console.error('Error al registrar pago:', error);
                window.showToast('Error al registrar el pago: ' + (error.message || error), 'error');
            }
        };
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

    setupResponsiveHandlers() {
        window.addEventListener('resize', () => {
            const newIsMobile = window.innerWidth < 768;
            const newIsTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

            if (newIsMobile !== this.isMobile || newIsTablet !== this.isTablet) {
                this.isMobile = newIsMobile;
                this.isTablet = newIsTablet;
                this.tableViewManager.updateColumns(this.getResponsiveColumns());
                // Re-render transactions if view changed significantly
                if (this.vista === 'tabla') {
                    this.renderTableTransactions();
                } else {
                    this.renderTransactions();
                }
            }
        });
    }
    imprimirFactura(id) {
        // Buscar la transacción primero
        this.transaccionService.obtenerTransaccionPorId(id)
            .then(transaccion => {
                // Importa y usa la función directamente
                imprimirFactura(transaccion);
            })
            .catch(error => {
                console.error('Error al obtener la transacción:', error);
                window.showToast('Error al generar la factura.', 'error');
            });
    }

    // --- Funciones para el Terminal Verifone ---
    async procesarPagoTerminal(transaccionId) {
        try {
            // 1. Obtener datos de la transacción
            const transaccion = await this.transaccionService.obtenerTransaccionPorId(transaccionId);
            if (!transaccion) {
                throw new Error("No se pudo obtener la transacción");
            }

            // 2. Mostrar modal de pago con terminal
            document.getElementById('terminalPaymentModal').classList.remove('hidden');
            document.getElementById('terminalPaymentStatus').classList.remove('hidden');
            document.getElementById('terminalPaymentComplete').classList.add('hidden');
            document.getElementById('terminalPaymentError').classList.add('hidden');
            document.getElementById('terminalStatusMessage').textContent = 'Enviando transacción al terminal...';
            document.getElementById('terminalInstructions').textContent = 'Por favor espere mientras se procesa la solicitud.';

            // 3. Preparar datos para Cardnet
            const paymentData = {
                ordenId: `THELARTE-${transaccionId}`,
                total: transaccion.total,
                impuestos: transaccion.impuestos || 0,
                nombre: transaccion.cliente?.nombre
                    ? `${transaccion.cliente.nombre} ${transaccion.cliente.apellido || ''}`
                    : 'Consumidor Final',
                descripcion: `Factura #${transaccion.numeroFactura || transaccion.id}`
            };

            // 4. Crear sesión directamente indicando que es para terminal físico
            const sessionData = await this.cardnetService.createSession(paymentData, true);

            if (!sessionData || !sessionData.SESSION) {
                throw new Error("No se pudo crear la sesión de pago para el terminal");
            }

            const sessionId = sessionData.SESSION;
            const sessionKey = sessionData['session-key'];

            // 5. Iniciar monitoreo del estado de la transacción
            this.handleTerminalStatusChange({
                status: 'CREATED',
                message: 'Transacción enviada al terminal',
                sessionId,
                sessionKey
            });

            // 6. Iniciar polling para consultar estado
            await this.startPollingTerminalStatus(
                sessionId,
                this.handleTerminalStatusChange.bind(this),
                this.handleTerminalPaymentComplete.bind(this, transaccionId),
                this.handleTerminalPaymentError.bind(this)
            );

        } catch (error) {
            console.error('Error al procesar pago con terminal:', error);
            this.handleTerminalPaymentError(error);
        }
    }

// Método para manejar el polling de consulta de estado
    async startPollingTerminalStatus(sessionId, onStatusChange, onComplete, onError) {
        const startTime = Date.now();
        const maxPollingTime = 300000; // 5 minutos máximo
        const pollingInterval = 3000; // Consultar cada 3 segundos

        // Función para consultar estado
        const checkStatus = async () => {
            try {
                const statusData = await this.cardnetService.checkStatus(sessionId);

                // Notificar cambio de estado
                if (onStatusChange) {
                    onStatusChange(statusData);
                }

                // Si la transacción está completada
                if (statusData.isCompleted) {
                    if (onComplete) {
                        onComplete(statusData);
                    }
                    return true; // Terminar polling
                }

                // Si ha pasado el tiempo máximo, detener
                if (Date.now() - startTime > maxPollingTime) {
                    if (onError) {
                        onError(new Error("Tiempo de espera agotado para la transacción"));
                    }
                    return true; // Terminar polling
                }

                return false; // Continuar polling
            } catch (error) {
                if (onError) {
                    onError(error);
                }
                return true; // Terminar polling en caso de error
            }
        };

        // Iniciar ciclo de polling
        const poll = async () => {
            const shouldStop = await checkStatus();
            if (!shouldStop) {
                setTimeout(poll, pollingInterval);
            }
        };

        // Iniciar primer ciclo
        poll();
    }

    handleTerminalStatusChange(statusData) {
        const statusMessage = document.getElementById('terminalStatusMessage');
        const instructions = document.getElementById('terminalInstructions');

        if (statusData.status === 'CREATED') {
            statusMessage.textContent = 'Transacción enviada al terminal';
            instructions.textContent = 'Por favor, pida al cliente que presente su tarjeta en el terminal.';
        } else if (statusData.status === 'PENDING') {
            statusMessage.textContent = 'Esperando acción en terminal';
            instructions.textContent = 'El terminal está procesando el pago.';
        } else if (statusData.status === 'CANCELLED_BY_USER') {
            this.handleTerminalPaymentError(new Error("Transacción cancelada por el usuario"));
        } else {
            statusMessage.textContent = statusData.message || 'Procesando...';
        }
    }

    handleTerminalPaymentComplete(transaccionId, statusData) {
        // Ocultar sección de estado y mostrar la de completado
        document.getElementById('terminalPaymentStatus').classList.add('hidden');
        document.getElementById('terminalPaymentComplete').classList.remove('hidden');

        if (statusData.authCode) {
            document.getElementById('terminalAuthCode').textContent =
                `Código de autorización: ${statusData.authCode}`;
        }

        // Actualizar la transacción en base de datos
        this.transaccionService.actualizarTransaccion(transaccionId, {
            estado: 'COMPLETADA',
            metodoPago: 'TARJETA',
            observaciones: `Pago con tarjeta completado. Auth: ${statusData.authCode || 'N/A'}`
        }).then(() => {
            // Cambiar el estado automáticamente con notificación
            this.cambiarEstadoAutomatico(transaccionId, 'COMPLETADA', 'Pago confirmado con tarjeta');

            // Cerrar el modal automáticamente después de 3 segundos
            setTimeout(() => {
                this.closeTerminalPaymentModal();
                // Actualizar los detalles si están abiertos
                const detallesContainer = document.getElementById('detallesTransaccion');
                if (detallesContainer &&
                    !document.getElementById('modalVerTransaccion').classList.contains('hidden') &&
                    detallesContainer.getAttribute('data-transaction-id') == transaccionId) {
                    this.viewTransactionDetails(transaccionId);
                }
            }, 3000);

            // Recargar transacciones
            this.loadTransactions();
        }).catch(error => {
            console.error('Error al actualizar transacción:', error);
            window.showToast('El pago fue procesado pero hubo un error al actualizar la transacción', 'warning');

            // Recargar transacciones de todos modos
            this.loadTransactions();
        });
    }

    handleTerminalPaymentError(error) {
        document.getElementById('terminalPaymentStatus').classList.add('hidden');
        document.getElementById('terminalPaymentError').classList.remove('hidden');
        document.getElementById('terminalErrorMessage').textContent =
            error.message || 'Error desconocido al procesar el pago';

        console.error('Error en pago con terminal:', error);
    }

    cancelTerminalPayment() {
        if (this.terminalPaymentProcessor) {
            this.terminalPaymentProcessor.cancelTransaction();
        }
        this.closeTerminalPaymentModal();
    }

    closeTerminalPaymentModal() {
        document.getElementById('terminalPaymentModal').classList.add('hidden');
    }

}
// --- GLOBAL INSTANCE & EXPORTS ---
const transaccionesManager = new TransaccionesManager();
window.transaccionesManager = transaccionesManager;
window.tableViewManager = transaccionesManager.tableViewManager;
window.cerrarModalVerTransaccion = () => transaccionesManager.cerrarModalVerTransaccion();
window.imprimirFactura = (id) => transaccionesManager.imprimirFactura(id);
window.agregarPago = (id) => transaccionesManager.agregarPago(id);

// Nuevas funciones para el terminal
window.procesarPagoTerminal = (id) => transaccionesManager.procesarPagoTerminal(id);
window.cancelTerminalPayment = () => transaccionesManager.cancelTerminalPayment();
window.closeTerminalPaymentModal = () => transaccionesManager.closeTerminalPaymentModal();

// En el archivo transacciones.js (al final donde defines funciones globales)
window.imprimirFactura = () => {
    // Obtener el ID de la transacción actual que se está viendo en el modal
    const idTransaccion = document.getElementById('detallesTransaccion').getAttribute('data-transaction-id');
    if (idTransaccion) {
        transaccionesManager.imprimirFactura(idTransaccion);
    } else {
        window.showToast('No se puede imprimir la factura: ID de transacción no encontrado', 'error');
    }
};
// --- SIDEBAR MOBILE/HAMBURGUESA ---
document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.remove('hidden');
});
document.getElementById('closeSidebarBtn')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.add('hidden');
});
document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.add('hidden');
});

