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
            'COMPLETADA': 'green',    // En lugar de COBRADA
            'CANCELADA': 'red',
            'FACTURADA': 'purple',
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

        console.log('Datos de transacción:', transaction);

        detailsContainer.setAttribute('data-transaction-id', transaction.id);

        this.renderInitialDetails(transaction, detailsContainer);

        if (transaction.contraparteId) {
            const tipoContraparte = transaction.tipo === 'COMPRA' ? 'proveedor' : 'cliente';
            const needsFetch = tipoContraparte === 'cliente' ?
                (!transaction.cliente?.telefono && !transaction.cliente?.email) :
                (!transaction.proveedor?.telefono && !transaction.proveedor?.email);

            if (needsFetch) {
                // Solo normaliza la cédula si es cliente, si es proveedor usa el id tal cual
                const idParaBuscar = tipoContraparte === 'cliente'
                    ? normalizarCedula(String(transaction.contraparteId))
                    : transaction.contraparteId;

                this.buscarDatosContraparte(idParaBuscar, tipoContraparte)
                    .then(datosCompletos => {
                        if (datosCompletos) {
                            const transactionActualizada = {...transaction};
                            if (tipoContraparte === 'cliente') {
                                transactionActualizada.cliente = {...(transaction.cliente || {}), ...datosCompletos};
                            } else {
                                transactionActualizada.proveedor = {...(transaction.proveedor || {}), ...datosCompletos};
                            }
                            this.renderInitialDetails(transactionActualizada, detailsContainer);
                        }
                    })
                    .catch(error => console.error('Error al obtener datos completos:', error));
            }
        }
    }
// Método para buscar datos completos de un cliente o proveedor
    buscarDatosContraparte(id, tipo) {
        return new Promise((resolve, reject) => {
            // Determinar endpoint según tipo
            const endpoint = tipo === 'cliente' ? '/api/clientes/' : '/api/suplidores/';

            fetch(endpoint + id)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(`Datos completos de ${tipo} obtenidos:`, data);
                    resolve(data);
                })
                .catch(error => {
                    console.error(`Error buscando datos de ${tipo}:`, error);
                    resolve(null); // Resolvemos con null para no interrumpir el flujo
                });
        });
    }

// Método para renderizar los detalles iniciales y actualizados
    renderInitialDetails(transaction, detailsContainer) {
        function formatearComoCedula(id) {
            if (!id) return '';
            let idStr = String(id).replace(/\D/g, '');
            if (idStr.includes('-')) return idStr;
            while (idStr.length < 11) idStr = '0' + idStr;
            if (idStr.length === 11) {
                return `${idStr.substring(0, 3)}-${idStr.substring(3, 10)}-${idStr.substring(10)}`;
            }
            return idStr;
        }

        const esFacturaGrande = transaction.total >= 250000;

        // DATOS DE CONTACTO: Extraer teléfono y email de manera robusta
        let telefono = '';
        let email = '';

        if (transaction.tipo === 'COMPRA') {
            // Buscar en proveedor primero
            if (transaction.proveedor) {
                telefono = transaction.proveedor.telefono || telefono;
                email = transaction.proveedor.email || email;
            }
        } else {
            // Buscar en cliente primero
            if (transaction.cliente) {
                telefono = transaction.cliente.telefono || telefono;
                email = transaction.cliente.email || email;
            }
        }

        // Buscar en raíz como respaldo
        telefono = telefono || transaction.telefono || '';
        email = email || transaction.email || '';

        const mostrarTelefono = telefono ? telefono : 'N/A';
        const mostrarEmail = email ? email : 'N/A';

        // CONSTRUCCIÓN DE INFORMACIÓN DE CONTRAPARTE
        let contraparteInfo = '';
        if (transaction.tipo === 'COMPRA' && transaction.proveedor) {
            contraparteInfo = `
            <p><strong>Proveedor:</strong> ${transaction.proveedor.nombre}</p>
            <p><strong>RNC:</strong> ${transaction.proveedor.rnc || 'N/A'}</p>
            ${transaction.contraparteId ? `<p><strong>ID en sistema:</strong> ${transaction.contraparteId}</p>` : ''}
            <p><strong>Teléfono:</strong> ${mostrarTelefono}</p>
            <p><strong>Email:</strong> ${mostrarEmail}</p>
        `;
        } else if (transaction.cliente && (transaction.cliente.nombre || transaction.cliente.apellido)) {
            contraparteInfo = `
            <p><strong>Cliente:</strong> ${transaction.cliente.nombre || ''} ${transaction.cliente.apellido || ''}</p>`;

            const tieneCedula = transaction.cliente.cedula && transaction.cliente.cedula.trim() !== '';
            if (tieneCedula) {
                contraparteInfo += `<p><strong>Cédula:</strong> ${transaction.cliente.cedula}</p>`;
            } else if (transaction.contraparteId) {
                const cedulaFormateada = formatearComoCedula(transaction.contraparteId);
                contraparteInfo += `<p><strong>Cédula:</strong> ${cedulaFormateada}</p>`;
            }
            if (esFacturaGrande && !tieneCedula) {
                contraparteInfo += `<p class="font-bold text-red-600">ADVERTENCIA: Se requiere cédula para facturas mayores a RD$250,000</p>`;
            }
            contraparteInfo += `
            <p><strong>Teléfono:</strong> ${mostrarTelefono}</p>
            <p><strong>Email:</strong> ${mostrarEmail}</p>
        `;
            if (transaction.contraparteId) {
                contraparteInfo += `<p><strong>ID en sistema:</strong> ${transaction.contraparteId}</p>`;
            }
        } else if (transaction.contraparteNombre) {
            if (transaction.tipo === 'COMPRA') {
                contraparteInfo = `<p><strong>Proveedor:</strong> ${transaction.contraparteNombre}</p>`;
                if (transaction.contraparteId) {
                    contraparteInfo += `<p><strong>ID en sistema:</strong> ${transaction.contraparteId}</p>`;
                }
            } else {
                contraparteInfo = `<p><strong>Cliente:</strong> ${transaction.contraparteNombre}</p>`;
                if (transaction.contraparteId) {
                    const cedulaFormateada = formatearComoCedula(transaction.contraparteId);
                    contraparteInfo += `<p><strong>Cédula:</strong> ${cedulaFormateada}</p>`;
                }
                if (esFacturaGrande) {
                    contraparteInfo += `<p class="font-bold text-red-600">ADVERTENCIA: Se requiere cédula para facturas mayores a RD$250,000</p>`;
                }
            }
            contraparteInfo += `
            <p><strong>Teléfono:</strong> ${mostrarTelefono}</p>
            <p><strong>Email:</strong> ${mostrarEmail}</p>
        `;
        } else {
            const etiqueta = transaction.tipo === 'COMPRA' ? 'Proveedor' : 'Cliente';
            contraparteInfo = `<p><strong>${etiqueta}:</strong> <span class="italic">Sin nombre registrado</span></p>`;
            if (transaction.tipo === 'COMPRA') {
                if (transaction.contraparteId) {
                    contraparteInfo += `<p><strong>ID en sistema:</strong> ${transaction.contraparteId}</p>`;
                }
            } else {
                if (transaction.contraparteId) {
                    const cedulaFormateada = formatearComoCedula(transaction.contraparteId);
                    contraparteInfo += `<p><strong>Cédula:</strong> ${cedulaFormateada}</p>`;
                }
                if (esFacturaGrande) {
                    contraparteInfo += `<p class="font-bold text-red-600">ADVERTENCIA: Se requiere cédula para facturas mayores a RD$250,000</p>`;
                }
            }
            contraparteInfo += `
            <p><strong>Teléfono:</strong> ${mostrarTelefono}</p>
            <p><strong>Email:</strong> ${mostrarEmail}</p>
        `;
        }

        // PRODUCTOS
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

        // SELECTOR DE ESTADOS
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

        // UNIDADES TOTALES
        let totalUnidades = 0;
        if (transaction.lineas && transaction.lineas.length > 0) {
            totalUnidades = transaction.lineas.reduce((sum, line) => sum + (parseInt(line.cantidad) || 0), 0);
        }

        // PLAN DE PAGOS
        let planPagosHTML = '';
        if (transaction.tipoPago === 'ENCUOTAS' || transaction.planPagos) {
            const montoInicial = transaction.montoInicial || 0;
            const montoTotal = transaction.total || 0;
            const saldoPendiente = transaction.saldoPendiente || 0;
            const pagos = transaction.pagos || [];
            const pagoInicial = pagos.find(p => p.numeroCuota === 0);
            const cuotasProgramadas = pagos.filter(p => p.numeroCuota > 0);
            const pagosAdicionales = pagos.filter(p => p.numeroCuota === null || p.numeroCuota === undefined);
            const todosPagos = [...cuotasProgramadas, ...pagosAdicionales];

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
                    <p><strong>Número de cuotas programadas:</strong> ${cuotasProgramadas.length}</p>
                    <p><strong>Pagos adicionales:</strong> ${pagosAdicionales.length}</p>
                    <p class="${saldoPendiente <= 0 ? 'text-green-600' : 'text-yellow-600'} font-bold">
                        <strong>Saldo pendiente:</strong> ${this.formatCurrency(saldoPendiente)}
                    </p>
                </div>
            </div>
            
            <div class="mb-4">
                <h5 class="font-semibold mb-2">Pagos registrados:</h5>
                ${(pagoInicial || todosPagos.length > 0) ? `
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-white border border-gray-200">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="py-2 px-3 text-left text-sm font-medium text-gray-700 border-b">Tipo</th>
                                    <th class="py-2 px-3 text-left text-sm font-medium text-gray-700 border-b">Fecha</th>
                                    <th class="py-2 px-3 text-right text-sm font-medium text-gray-700 border-b">Monto</th>
                                    <th class="py-2 px-3 text-center text-sm font-medium text-gray-700 border-b">Estado</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${pagoInicial ? `
                                    <tr>
                                        <td class="py-2 px-3 text-sm">Inicial</td>
                                        <td class="py-2 px-3 text-sm">${new Date(pagoInicial.fecha).toLocaleDateString()}</td>
                                        <td class="py-2 px-3 text-sm text-right">${this.formatCurrency(pagoInicial.monto)}</td>
                                        <td class="py-2 px-3 text-sm text-center">
                                            <span class="px-2 py-1 text-xs font-medium rounded-full 
                                                ${pagoInicial.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                pagoInicial.estado === 'COMPLETADO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                                ${pagoInicial.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ` : ''}
                                ${todosPagos.map(pago => `
                                    <tr>
                                        <td class="py-2 px-3 text-sm">${pago.numeroCuota ? 'Cuota ' + pago.numeroCuota : 'Pago adicional'}</td>
                                        <td class="py-2 px-3 text-sm">${new Date(pago.fecha).toLocaleDateString()}</td>
                                        <td class="py-2 px-3 text-sm text-right">${this.formatCurrency(pago.monto)}</td>
                                        <td class="py-2 px-3 text-sm text-center">
                                            <span class="px-2 py-1 text-xs font-medium rounded-full 
                                                ${pago.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                pago.estado === 'COMPLETADO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                                ${pago.estado}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="text-gray-500 italic">No hay pagos registrados aún.</p>'}
            </div>
        </div>`;
        }

        // IMPUESTOS FORMATEADOS
        const impuestosFormateados = transaction.impuestos
            ? this.formatCurrency(transaction.impuestos)
            : (transaction.lineas && transaction.lineas.length > 0)
                ? this.formatCurrency(transaction.lineas.reduce((sum, line) => sum + (line.impuestoMonto || 0), 0))
                : this.formatCurrency(0);

        // RENDERIZAR HTML COMPLETO
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
        
        <div class="bg-green-50 p-3 rounded-lg text-right">
            <p><strong>Subtotal:</strong> ${this.formatCurrency(transaction.subtotal || 0)}</p>
            <p><strong>Impuestos:</strong> ${impuestosFormateados}</p>
            <p class="text-xl font-bold text-green-700">Total: ${this.formatCurrency(transaction.total)}</p>
        </div>
        
        <!-- Botón de abonar al final, solo para ventas en cuotas con saldo pendiente -->
        ${(transaction.tipoPago === 'ENCUOTAS' && transaction.saldoPendiente > 0) ? `
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
        try {
            // Obtener la transacción actualizada
            const transaccion = await this.transaccionService.obtenerTransaccionPorId(transaccionId);
            if (!transaccion) {
                window.showToast('No se pudo obtener la información de la transacción', 'error');
                return;
            }

            // Verificar si hay cuotas pendientes
            const pagos = transaccion.pagos || [];
            const cuotasPendientes = pagos.filter(p => p.estado === 'PENDIENTE');
            const saldoPendiente = transaccion.saldoPendiente || 0;

            console.log("Detalles del pago:", {
                totalPagos: pagos.length,
                cuotasPendientes: cuotasPendientes.length,
                saldoPendiente: saldoPendiente
            });

            // Si no hay saldo pendiente, no permitir más pagos
            if (saldoPendiente <= 0) {
                window.showToast('Esta transacción ya está completamente pagada', 'info');
                return;
            }

            // Si hay saldo pendiente, mostrar modal para registrar pago
            const montoMaximo = saldoPendiente;

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
                        <input type="number" id="montoPago" class="w-full border rounded-lg p-2" min="0" max="${montoMaximo}" step="0.01" value="${montoMaximo}">
                        <p class="text-sm text-gray-500 mt-1">Saldo pendiente: ${this.formatCurrency(montoMaximo)}</p>
                    </div>
                    <div id="montoPagoErrorMsg" class="text-red-600 text-sm font-semibold mt-1"></div>
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
                    const montoErrorDiv = document.getElementById('montoPagoErrorMsg');
                    // Limpia el mensaje de error antes de validar
                    if (montoErrorDiv) montoErrorDiv.textContent = '';

                    // Validaciones
                    if (!fechaPago || isNaN(montoPago) || montoPago <= 0) {
                        window.showToast('Ingrese una fecha y monto válidos', 'error');
                        if (montoErrorDiv) montoErrorDiv.textContent = 'Ingrese una fecha y monto válidos.';
                        return;
                    }

                    if (montoPago > saldoPendiente) {
                        window.showToast(`El monto no puede exceder el saldo pendiente (${this.formatCurrency(saldoPendiente)})`, 'error');
                        if (montoErrorDiv) montoErrorDiv.textContent = `El monto no puede exceder el saldo pendiente (${this.formatCurrency(saldoPendiente)})`;
                        return;
                    }

                    // Si el método de pago es TARJETA, procesar con Cardnet
                    if (metodoPago === 'TARJETA') {
                        modal.remove(); // Cerrar el modal actual

                        // Procesar pago con Cardnet
                        await this.procesarPagoTarjetaCardnet(transaccionId, {
                            fecha: fechaPago,
                            monto: montoPago,
                            metodoPago: metodoPago,
                            observaciones: observaciones
                        });

                        return; // Salir del flujo actual, el proceso continúa en procesarPagoTarjetaCardnet
                    }

                    // Registrar el pago (para métodos que no son TARJETA)
                    await this.transaccionService.registrarPago(transaccionId, {
                        fecha: fechaPago,
                        monto: montoPago,
                        metodoPago,
                        observaciones
                    });

                    // Cerrar modal y refrescar detalles
                    modal.remove();
                    window.showToast('Pago registrado exitosamente', 'success');

                    // Refrescar la vista de detalles
                    await this.viewTransactionDetails(transaccionId);

                    // Actualizar lista de transacciones
                    await this.loadTransactions();
                } catch (error) {
                    console.error('Error al registrar pago:', error);
                    window.showToast('Error al registrar el pago: ' + (error.message || error), 'error');
                    const montoErrorDiv = document.getElementById('montoPagoErrorMsg');
                    if (montoErrorDiv) montoErrorDiv.textContent = error.message || 'Error al registrar el pago.';
                }
            };


            document.getElementById('montoPago').addEventListener('input', () => {
                const montoErrorDiv = document.getElementById('montoPagoErrorMsg');
                if (montoErrorDiv) montoErrorDiv.textContent = '';
            });
        } catch (error) {
            console.error('Error al verificar el estado de pagos:', error);
            window.showToast('Error al verificar el estado de los pagos', 'error');
        }
    }

    // Nueva función para procesar pagos con tarjeta a través de Cardnet
    async procesarPagoTarjetaCardnet(transaccionId, datosPago) {
        try {
            // 1. Mostrar pantalla de carga
            this.showLoadingOverlay("Iniciando proceso de pago con tarjeta...");

            // 2. Obtener datos de la transacción para el proceso de pago
            const transaccion = await this.transaccionService.obtenerTransaccionPorId(transaccionId);
            if (!transaccion) {
                throw new Error("No se pudo obtener la información de la transacción");
            }

            // 3. Crear datos para la sesión de Cardnet
            const paymentData = {
                ordenId: `ABONO-${transaccionId}-${Date.now()}`,
                total: datosPago.monto,
                impuestos: 0,
                nombre: transaccion.cliente?.nombre
                    ? `${transaccion.cliente.nombre} ${transaccion.cliente.apellido || ''}`
                    : transaccion.contraparteNombre || 'Cliente',
                descripcion: `Abono a factura #${transaccion.numeroFactura || transaccion.id}`
            };

            // 4. Crear sesión indicando que es para terminal físico
            const sessionData = await this.cardnetService.createSession(paymentData, true);

            if (!sessionData || !sessionData.SESSION) {
                throw new Error("No se pudo crear la sesión de pago para el terminal");
            }

            const sessionId = sessionData.SESSION;
            const sessionKey = sessionData['session-key'];

            // 5. Ocultar pantalla de carga y mostrar modal de proceso de terminal
            this.hideLoadingOverlay();
            this.showTerminalPaymentModal(sessionId, transaccionId, datosPago);

        } catch (error) {
            this.hideLoadingOverlay();
            window.showToast(`Error al iniciar pago con tarjeta: ${error.message}`, 'error');
            console.error('Error al procesar pago con tarjeta:', error);
        }
    }

// Modal para pago con terminal
    showTerminalPaymentModal(sessionId, transaccionId, datosPago) {
        // Crear un modal para mostrar el estado del proceso en terminal
        const modal = document.createElement('div');
        modal.id = 'terminalPaymentModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div class="bg-brand-brown text-white p-6">
            <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold">Pago con Terminal</h3>
                <button id="closeTerminalModal" class="text-white hover:text-gray-300">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="p-6">
            <div id="terminalPaymentStatus" class="mb-4">
                <div class="flex items-center justify-center mb-4">
                    <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full"></div>
                </div>
                <p class="text-center text-lg font-medium" id="terminalStatusMessage">
                    Transacción enviada al terminal
                </p>
                <p class="text-center text-gray-600 mt-2" id="terminalInstructions">
                    Por favor, solicite al cliente que presente su tarjeta en el terminal.
                </p>
            </div>
            
            <div id="terminalPaymentComplete" class="text-center hidden">
                <div class="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                    <i class="fas fa-check-circle text-3xl text-green-500 mb-2"></i>
                    <p class="font-bold">¡Pago completado exitosamente!</p>
                    <p id="terminalAuthCode" class="mt-1"></p>
                </div>
                <button id="closeTerminalPaymentComplete" 
                        class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                    Cerrar
                </button>
            </div>
            
            <div id="terminalPaymentError" class="text-center hidden">
                <div class="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
                    <i class="fas fa-exclamation-circle text-3xl text-red-500 mb-2"></i>
                    <p class="font-bold">Error en la transacción</p>
                    <p id="terminalErrorMessage" class="mt-1"></p>
                </div>
                <button id="closeTerminalPaymentError" 
                        class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
    `;

        document.body.appendChild(modal);

        // Configurar los eventos
        document.getElementById('closeTerminalModal').addEventListener('click', () => {
            this.cancelTerminalPayment();
        });

        document.getElementById('closeTerminalPaymentComplete')?.addEventListener('click', () => {
            document.getElementById('terminalPaymentModal').remove();
        });

        document.getElementById('closeTerminalPaymentError')?.addEventListener('click', () => {
            document.getElementById('terminalPaymentModal').remove();
        });

        // Iniciar el polling para consultar estado
        this.startPollingTerminalStatus(
            sessionId,
            this.handleTerminalStatusChange.bind(this),
            (statusData) => this.handlePaymentComplete(transaccionId, datosPago, statusData),
            this.handleTerminalPaymentError.bind(this)
        );
    }
    // Método para manejar la finalización exitosa del pago
    async handlePaymentComplete(transaccionId, datosPago, statusData) {
        const statusDiv = document.getElementById('terminalPaymentStatus');
        const completeDiv = document.getElementById('terminalPaymentComplete');
        const authCodeElement = document.getElementById('terminalAuthCode');

        if (!statusDiv || !completeDiv) return;

        // Ocultar estado y mostrar completado
        statusDiv.classList.add('hidden');
        completeDiv.classList.remove('hidden');

        // Mostrar código de autorización si existe
        if (statusData.authCode && authCodeElement) {
            authCodeElement.textContent = `Código de autorización: ${statusData.authCode}`;
        }

        try {
            // Actualizar los datos de pago con la información de la tarjeta
            datosPago.cardnetAuthCode = statusData.authCode || '';
            datosPago.referenceNumber = statusData.RetrievalReferenceNumber || statusData.sessionId || '';
            datosPago.ultimosCuatro = statusData.CreditCardNumber ? statusData.CreditCardNumber.slice(-4) : '';

            // Añadir información de la tarjeta a las observaciones
            const tarjetaInfo = `Pago con tarjeta. Auth: ${datosPago.cardnetAuthCode}, Ref: ${datosPago.referenceNumber}, Tarjeta: xxxx-xxxx-xxxx-${datosPago.ultimosCuatro}`;
            datosPago.observaciones = datosPago.observaciones
                ? `${datosPago.observaciones}. ${tarjetaInfo}`
                : tarjetaInfo;

            // Registrar el pago en el sistema
            await this.transaccionService.registrarPago(transaccionId, datosPago);

            // Mostrar mensaje de éxito
            window.showToast('Pago con tarjeta registrado exitosamente', 'success');

            // Cerrar el modal automáticamente después de 3 segundos
            setTimeout(() => {
                const modal = document.getElementById('terminalPaymentModal');
                if (modal) modal.remove();

                // Refrescar la vista de detalles
                this.viewTransactionDetails(transaccionId);

                // Actualizar lista de transacciones
                this.loadTransactions();
            }, 3000);

        } catch (error) {
            console.error('Error al registrar pago con tarjeta:', error);

            // Mostrar mensaje de error en el modal
            statusDiv.classList.add('hidden');
            const errorDiv = document.getElementById('terminalPaymentError');
            if (errorDiv) {
                errorDiv.classList.remove('hidden');
                const errorMsg = document.getElementById('terminalErrorMessage');
                if (errorMsg) {
                    errorMsg.textContent = `Error al registrar el pago: ${error.message || 'Error desconocido'}`;
                }
            }
        }
    }

// Método para manejar cambios de estado en la transacción del terminal
    handleTerminalStatusChange(statusData) {
        const statusMessage = document.getElementById('terminalStatusMessage');
        const instructions = document.getElementById('terminalInstructions');

        if (!statusMessage || !instructions) return;

        if (statusData.status === 'CREATED') {
            statusMessage.textContent = 'Transacción enviada al terminal';
            instructions.textContent = 'Por favor, solicite al cliente que presente su tarjeta en el terminal.';
        } else if (statusData.status === 'PENDING') {
            statusMessage.textContent = 'Esperando acción en terminal';
            instructions.textContent = 'El terminal está procesando el pago.';
        } else if (statusData.status === 'CANCELLED_BY_USER') {
            this.handleTerminalPaymentError(new Error("Transacción cancelada por el usuario"));
        } else {
            statusMessage.textContent = statusData.message || 'Procesando...';
        }
    }

// Método para manejar errores en el proceso de pago en terminal
    handleTerminalPaymentError(error) {
        const statusDiv = document.getElementById('terminalPaymentStatus');
        const errorDiv = document.getElementById('terminalPaymentError');
        const errorMessageElement = document.getElementById('terminalErrorMessage');

        if (!statusDiv || !errorDiv) return;

        // Ocultar estado y mostrar error
        statusDiv.classList.add('hidden');
        errorDiv.classList.remove('hidden');

        // Mostrar mensaje de error
        if (errorMessageElement) {
            errorMessageElement.textContent = error.message || 'Error desconocido al procesar el pago';
        }
    }

// Cancela una transacción en curso en el terminal
    cancelTerminalPayment() {
        // Detener polling
        if (this._pollingInterval) {
            clearInterval(this._pollingInterval);
            this._pollingInterval = null;
        }

        // Cerrar modal
        const modal = document.getElementById('terminalPaymentModal');
        if (modal) modal.remove();
    }

// Inicia consultas periódicas al servidor para verificar estado
    async startPollingTerminalStatus(sessionId, onStatusChange, onComplete, onError) {
        const startTime = Date.now();
        const maxPollingTime = 300000; // 5 minutos máximo
        const pollingInterval = 3000; // Consultar cada 3 segundos

        // Limpiar cualquier intervalo existente
        if (this._pollingInterval) {
            clearInterval(this._pollingInterval);
        }

        this._pollingInterval = setInterval(async () => {
            try {
                const statusData = await this.cardnetService.checkStatus(sessionId);

                // Notificar el cambio de estado
                if (onStatusChange) {
                    onStatusChange(statusData);
                }

                // Si la transacción está completada
                if (statusData.isCompleted) {
                    clearInterval(this._pollingInterval);
                    this._pollingInterval = null;
                    if (onComplete) {
                        onComplete(statusData);
                    }
                }

                // Si ha pasado el tiempo máximo, detener
                if (Date.now() - startTime > maxPollingTime) {
                    clearInterval(this._pollingInterval);
                    this._pollingInterval = null;
                    if (onError) {
                        onError(new Error("Tiempo de espera agotado para la transacción"));
                    }
                }

            } catch (error) {
                console.error("Error consultando estado:", error);
                clearInterval(this._pollingInterval);
                this._pollingInterval = null;
                if (onError) {
                    onError(error);
                }
            }
        }, pollingInterval);
    }

// Métodos de utilidad para mostrar/ocultar overlays
    showLoadingOverlay(message = "Procesando...") {
        const overlay = document.createElement('div');
        overlay.id = 'paymentLoadingOverlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
            <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-gray-600 font-medium">${message}</p>
        </div>
    `;
        document.body.appendChild(overlay);
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('paymentLoadingOverlay');
        if (overlay) overlay.remove();
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




    // Modificación de handleTerminalPaymentComplete para manejar correctamente el saldo pendiente
    handleTerminalPaymentComplete(statusData) {
        const statusDiv = document.getElementById('terminalPaymentStatus');
        const completeDiv = document.getElementById('terminalPaymentComplete');
        const authCodeElement = document.getElementById('terminalAuthCode');

        if (!statusDiv || !completeDiv) return;

        // Ocultar estado y mostrar completado
        statusDiv.classList.add('hidden');
        completeDiv.classList.remove('hidden');

        // Mostrar código de autorización
        if (statusData.authCode && authCodeElement) {
            authCodeElement.textContent = `Código de autorización: ${statusData.authCode}`;
        }

        // Guardar información para la venta
        this.transactionData.cardnetResponse = statusData;
        this.transactionData.cardnetAuthCode = statusData.authCode;
        this.transactionData.referenceNumber = statusData.referenceName || statusData.sessionId;

        // Si es pago en cuotas y hay cuotas que fueron cobradas con la tarjeta
        if (this.transactionData.tipoPago === 'ENCUOTAS' && this.cuotasACobrar && this.cuotasACobrar.length > 0) {
            // Calcular el monto total de las cuotas cobradas
            const montoCuotasCobradas = this.cuotasACobrar.reduce((sum, cuota) => {
                return sum + parseFloat(cuota.monto || 0);
            }, 0);

            // Recorremos las cuotas a cobrar y marcamos cada una como COMPLETADA
            this.cuotasACobrar.forEach(cuotaCobrada => {
                const cuota = this.transactionData.cuotasFlexibles.find(c => c.id === cuotaCobrada.id);
                if (cuota) {
                    cuota.estado = 'COMPLETADO';
                }
            });

            // Actualizar el saldo pendiente
            if (this.transactionData.saldoPendiente) {
                this.transactionData.saldoPendiente -= montoCuotasCobradas;
                // Asegurar que no quede negativo
                if (this.transactionData.saldoPendiente < 0) {
                    this.transactionData.saldoPendiente = 0;
                }
            }

            // Mensaje informativo
            window.showToast(`Se marcaron ${this.cuotasACobrar.length} cuota(s) como pagadas y se actualizó el saldo pendiente`, 'success');
        }
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

export function normalizarCedula(cedula) {
    if (!cedula) return '';
    let soloNumeros = cedula.replace(/\D/g, '');
    while (soloNumeros.length < 11) {
        soloNumeros = '0' + soloNumeros;
    }
    if (soloNumeros.length === 11) {
        return (
            soloNumeros.substring(0, 3) + '-' +
            soloNumeros.substring(3, 10) + '-' +
            soloNumeros.substring(10)
        );
    }
    return cedula;
}

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

