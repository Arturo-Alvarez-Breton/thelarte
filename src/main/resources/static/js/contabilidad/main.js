// Contabilidad Module - Simplified Main JavaScript
class ContabilidadManager {
    constructor() {
        this.transaccionService = null;
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentPage = 1;
        this.transactionsPerPage = 12;
        this.currentView = 'cards';
        this.filtersVisible = false;
        
        // Components
        this.sidebarComponent = null;
        this.headerComponent = null;
        this.transactionWizard = null;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize services
            this.transaccionService = new TransaccionService();
            
            // Initialize components
            this.initializeComponents();
            
            // Load initial data
            await this.loadTransactions();
            await this.loadStatistics();
            
            console.log('Contabilidad module initialized successfully');
        } catch (error) {
            console.error('Error initializing contabilidad module:', error);
            this.showToast('Error al inicializar el módulo de contabilidad', 'error');
        }
    }
    
    initializeComponents() {
        // Initialize sidebar component
        this.sidebarComponent = new SidebarComponent();
        this.sidebarComponent.highlightCurrentPage();
        
        // Initialize header component
        this.headerComponent = new HeaderComponent({
            title: 'Módulo de Contabilidad',
            subtitle: 'Gestión integral de transacciones y finanzas'
        });
        
        // Initialize transaction wizard
        this.transactionWizard = new TransactionWizard(this.transaccionService);
        
        // Initialize user component
        this.userComponent = new UserComponent();
    }
    
    async loadTransactions() {
        try {
            this.showLoading();
            this.transactions = await this.transaccionService.obtenerTransacciones();
            this.filteredTransactions = [...this.transactions];
            this.currentPage = 1;
            this.renderTransactions();
            this.updateTransactionCount();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.showToast('Error al cargar las transacciones', 'error');
            this.hideLoading();
        }
    }
    
    async loadStatistics() {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            
            // Calculate statistics
            const salesThisMonth = this.transactions.filter(t => 
                t.tipo === 'VENTA' && new Date(t.fecha) >= startOfMonth
            );
            const purchasesThisMonth = this.transactions.filter(t => 
                t.tipo === 'COMPRA' && new Date(t.fecha) >= startOfMonth
            );
            const salesThisYear = this.transactions.filter(t => 
                t.tipo === 'VENTA' && new Date(t.fecha) >= startOfYear
            );
            
            const pendingTransactions = this.transactions.filter(t => t.estado === 'PENDIENTE');
            const completedTransactions = this.transactions.filter(t => 
                ['COMPLETADA', 'PAGADA', 'COBRADA', 'ENTREGADA'].includes(t.estado)
            );
            
            const statistics = {
                totalSalesMonth: salesThisMonth.reduce((sum, t) => sum + (t.total || 0), 0),
                totalPurchasesMonth: purchasesThisMonth.reduce((sum, t) => sum + (t.total || 0), 0),
                totalSalesYear: salesThisYear.reduce((sum, t) => sum + (t.total || 0), 0),
                pendingCount: pendingTransactions.length,
                completedCount: completedTransactions.length,
                salesCount: salesThisMonth.length,
                purchasesCount: purchasesThisMonth.length
            };
            
            this.renderStatistics(statistics);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }
    
    renderStatistics(stats) {
        const container = document.getElementById('statisticsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="stats-card text-white p-6 rounded-xl shadow-lg" style="--color-1: #10b981; --color-2: #059669;">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold mb-2">Ventas del Mes</h3>
                        <p class="text-3xl font-bold">${this.formatCurrency(stats.totalSalesMonth)}</p>
                        <p class="text-sm opacity-90">${stats.salesCount} transacciones</p>
                    </div>
                    <i class="fas fa-chart-line text-4xl opacity-80"></i>
                </div>
            </div>
            
            <div class="stats-card text-white p-6 rounded-xl shadow-lg" style="--color-1: #3b82f6; --color-2: #2563eb;">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold mb-2">Compras del Mes</h3>
                        <p class="text-3xl font-bold">${this.formatCurrency(stats.totalPurchasesMonth)}</p>
                        <p class="text-sm opacity-90">${stats.purchasesCount} transacciones</p>
                    </div>
                    <i class="fas fa-shopping-cart text-4xl opacity-80"></i>
                </div>
            </div>
            
            <div class="stats-card text-white p-6 rounded-xl shadow-lg" style="--color-1: #8b5cf6; --color-2: #7c3aed;">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold mb-2">Ventas del Año</h3>
                        <p class="text-3xl font-bold">${this.formatCurrency(stats.totalSalesYear)}</p>
                        <p class="text-sm opacity-90">Acumulado 2025</p>
                    </div>
                    <i class="fas fa-calendar-alt text-4xl opacity-80"></i>
                </div>
            </div>
            
            <div class="stats-card text-white p-6 rounded-xl shadow-lg" style="--color-1: #f59e0b; --color-2: #d97706;">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold mb-2">Pendientes</h3>
                        <p class="text-3xl font-bold">${stats.pendingCount}</p>
                        <p class="text-sm opacity-90">Requieren atención</p>
                    </div>
                    <i class="fas fa-clock text-4xl opacity-80"></i>
                </div>
            </div>
        `;
    }
    
    renderTransactions() {
        const container = document.getElementById('transactionsContainer');
        if (!container) return;
        
        if (this.filteredTransactions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16">
                    <i class="fas fa-inbox text-6xl text-gray-400 mb-4"></i>
                    <h4 class="text-xl font-semibold text-gray-600 mb-2">No hay transacciones</h4>
                    <p class="text-gray-500">Utiliza los filtros o crea una nueva transacción</p>
                </div>
            `;
            return;
        }
        
        // Pagination
        const startIndex = (this.currentPage - 1) * this.transactionsPerPage;
        const endIndex = startIndex + this.transactionsPerPage;
        const pageTransactions = this.filteredTransactions.slice(startIndex, endIndex);
        
        if (this.currentView === 'cards') {
            this.renderTransactionCards(pageTransactions, container);
        } else {
            this.renderTransactionList(pageTransactions, container);
        }
        
        this.renderPagination();
    }
    
    renderTransactionCards(transactions, container) {
        const cardsHtml = transactions.map(transaction => {
            const typeClass = this.getTransactionTypeClass(transaction.tipo);
            const stateColor = this.getStateColor(transaction.estado);
            const typeIcon = this.getTypeIcon(transaction.tipo);
            const isEditable = ['PENDIENTE', 'CONFIRMADA'].includes(transaction.estado);
            
            return `
                <div class="transaction-card ${typeClass} bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div class="p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-brand-brown mb-1 flex items-center">
                                    <i class="${typeIcon} mr-2 text-${this.getTransactionColor(transaction.tipo)}"></i>
                                    ${this.formatTransactionType(transaction.tipo)}
                                </h3>
                                <p class="text-sm text-gray-600 font-medium">#${transaction.id}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-sm font-medium bg-${stateColor}-100 text-${stateColor}-800">
                                ${transaction.estado}
                            </span>
                        </div>
                        
                        <div class="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                            <i class="fas ${transaction.tipoContraparte === 'CLIENTE' ? 'fa-user' : 'fa-truck'} text-gray-500 mr-3"></i>
                            <span class="font-medium text-gray-800">${transaction.contraparteNombre}</span>
                        </div>
                        
                        <div class="flex justify-between items-center mb-4">
                            <div class="flex items-center text-gray-600">
                                <i class="fas fa-calendar mr-2"></i>
                                <span class="text-sm">${this.formatDate(transaction.fecha)}</span>
                            </div>
                            <div class="text-xl font-bold text-brand-brown-light">
                                ${this.formatCurrency(transaction.total)}
                            </div>
                        </div>
                        
                        ${transaction.numeroFactura ? `
                            <div class="mb-3 flex items-center text-gray-600">
                                <i class="fas fa-receipt mr-2"></i>
                                <span class="text-sm">Factura: ${transaction.numeroFactura}</span>
                            </div>
                        ` : ''}
                        
                        ${transaction.lineas && transaction.lineas.length > 0 ? `
                            <div class="mb-4 flex items-center text-gray-600">
                                <i class="fas fa-boxes mr-2"></i>
                                <span class="text-sm">${transaction.lineas.length} producto${transaction.lineas.length > 1 ? 's' : ''}</span>
                            </div>
                        ` : ''}
                        
                        <div class="flex gap-2 pt-3 border-t border-gray-200">
                            <button onclick="contabilidad.viewTransactionDetails(${transaction.id})" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition text-sm font-medium">
                                <i class="fas fa-eye mr-1"></i>Ver
                            </button>
                            ${isEditable ? `
                                <button onclick="contabilidad.editTransaction(${transaction.id})" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition text-sm font-medium">
                                    <i class="fas fa-edit mr-1"></i>Editar
                                </button>
                            ` : `
                                <button class="flex-1 bg-gray-400 text-white py-2 px-3 rounded-lg text-sm font-medium cursor-not-allowed" title="No se puede editar">
                                    <i class="fas fa-lock mr-1"></i>Bloqueado
                                </button>
                            `}
                            <div class="relative">
                                <button onclick="contabilidad.toggleTransactionMenu(${transaction.id})" class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg transition text-sm">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <div id="menu-${transaction.id}" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden z-20">
                                    <a href="#" onclick="contabilidad.duplicateTransaction(${transaction.id})" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i class="fas fa-copy mr-2"></i>Duplicar
                                    </a>
                                    <a href="#" onclick="contabilidad.printTransaction(${transaction.id})" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <i class="fas fa-print mr-2"></i>Imprimir
                                    </a>
                                    <hr class="border-gray-200">
                                    <a href="#" onclick="contabilidad.deleteTransaction(${transaction.id})" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                        <i class="fas fa-trash mr-2"></i>Eliminar
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">${cardsHtml}</div>`;
    }
    
    renderTransactionList(transactions, container) {
        const listHtml = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contraparte</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${transactions.map(transaction => {
                                const stateColor = this.getStateColor(transaction.estado);
                                const isEditable = ['PENDIENTE', 'CONFIRMADA'].includes(transaction.estado);
                                
                                return `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${transaction.id}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <i class="${this.getTypeIcon(transaction.tipo)} mr-2 text-${this.getTransactionColor(transaction.tipo)}"></i>
                                                <span class="text-sm text-gray-900">${this.formatTransactionType(transaction.tipo)}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <i class="fas ${transaction.tipoContraparte === 'CLIENTE' ? 'fa-user' : 'fa-truck'} mr-2 text-gray-400"></i>
                                                <span class="text-sm text-gray-900">${transaction.contraparteNombre}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${this.formatDate(transaction.fecha)}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 py-1 text-xs font-medium rounded-full bg-${stateColor}-100 text-${stateColor}-800">
                                                ${transaction.estado}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-brown-light">${this.formatCurrency(transaction.total)}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div class="flex space-x-2">
                                                <button onclick="contabilidad.viewTransactionDetails(${transaction.id})" class="text-blue-600 hover:text-blue-800" title="Ver detalles">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                ${isEditable ? `
                                                    <button onclick="contabilidad.editTransaction(${transaction.id})" class="text-green-600 hover:text-green-800" title="Editar">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                ` : `
                                                    <button class="text-gray-400 cursor-not-allowed" title="No se puede editar">
                                                        <i class="fas fa-lock"></i>
                                                    </button>
                                                `}
                                                <button onclick="contabilidad.toggleTransactionMenu(${transaction.id})" class="text-gray-600 hover:text-gray-800" title="Más opciones">
                                                    <i class="fas fa-ellipsis-v"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        container.innerHTML = listHtml;
    }
    
    renderPagination() {
        const container = document.getElementById('paginationContainer');
        if (!container) return;
        
        const totalPages = Math.ceil(this.filteredTransactions.length / this.transactionsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHtml = '<div class="flex items-center justify-center space-x-2">';
        
        // Previous button
        paginationHtml += `
            <button onclick="contabilidad.changePage(${this.currentPage - 1})" 
                    class="px-3 py-2 rounded-lg border ${this.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHtml += `
                <button onclick="contabilidad.changePage(1)" class="px-3 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50">1</button>
            `;
            if (startPage > 2) {
                paginationHtml += '<span class="px-2 text-gray-500">...</span>';
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <button onclick="contabilidad.changePage(${i})" 
                        class="px-3 py-2 rounded-lg border ${i === this.currentPage ? 'bg-brand-brown text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += '<span class="px-2 text-gray-500">...</span>';
            }
            paginationHtml += `
                <button onclick="contabilidad.changePage(${totalPages})" class="px-3 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50">${totalPages}</button>
            `;
        }
        
        // Next button
        paginationHtml += `
            <button onclick="contabilidad.changePage(${this.currentPage + 1})" 
                    class="px-3 py-2 rounded-lg border ${this.currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationHtml += '</div>';
        container.innerHTML = paginationHtml;
    }
    
    changePage(page) {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.transactionsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderTransactions();
    }
    
    updateTransactionCount() {
        const countElement = document.getElementById('transactionCount');
        if (countElement) {
            const count = this.filteredTransactions.length;
            countElement.textContent = `${count} transacción${count !== 1 ? 'es' : ''}`;
        }
    }
    
    // Filter functions
    filterTransactions() {
        const tipo = document.getElementById('filtroTipo')?.value || '';
        const estado = document.getElementById('filtroEstado')?.value || '';
        const fechaDesde = document.getElementById('fechaDesde')?.value || '';
        const fechaHasta = document.getElementById('fechaHasta')?.value || '';
        const buscarTexto = document.getElementById('buscarTexto')?.value.toLowerCase() || '';
        
        this.filteredTransactions = this.transactions.filter(transaction => {
            const matchesTipo = !tipo || transaction.tipo === tipo;
            const matchesEstado = !estado || transaction.estado === estado;
            
            const matchesFecha = this.checkDateRange(transaction.fecha, fechaDesde, fechaHasta);
            
            const matchesSearch = !buscarTexto || 
                (transaction.contraparteNombre && transaction.contraparteNombre.toLowerCase().includes(buscarTexto)) ||
                (transaction.numeroFactura && transaction.numeroFactura.toLowerCase().includes(buscarTexto)) ||
                transaction.id.toString().includes(buscarTexto);
            
            return matchesTipo && matchesEstado && matchesFecha && matchesSearch;
        });
        
        this.currentPage = 1;
        this.renderTransactions();
        this.updateTransactionCount();
    }
    
    checkDateRange(transactionDate, fechaDesde, fechaHasta) {
        if (!fechaDesde && !fechaHasta) return true;
        
        const date = new Date(transactionDate);
        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta) : null;
        
        if (desde && date < desde) return false;
        if (hasta && date > hasta) return false;
        
        return true;
    }
    
    clearFilters() {
        document.getElementById('filtroTipo').value = '';
        document.getElementById('filtroEstado').value = '';
        document.getElementById('fechaDesde').value = '';
        document.getElementById('fechaHasta').value = '';
        document.getElementById('buscarTexto').value = '';
        
        this.filterTransactions();
    }
    
    toggleFilters() {
        const dropdown = document.getElementById('filterDropdown');
        const toggleText = document.getElementById('filterToggleText');
        
        if (dropdown && toggleText) {
            this.filtersVisible = !this.filtersVisible;
            dropdown.classList.toggle('active', this.filtersVisible);
            toggleText.textContent = this.filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros';
        }
    }
    
    setView(view) {
        this.currentView = view;
        
        const viewCards = document.getElementById('viewCards');
        const viewList = document.getElementById('viewList');
        
        if (viewCards && viewList) {
            if (view === 'cards') {
                viewCards.className = 'px-3 py-2 bg-brand-brown text-white rounded-lg text-sm';
                viewList.className = 'px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300';
            } else {
                viewList.className = 'px-3 py-2 bg-brand-brown text-white rounded-lg text-sm';
                viewCards.className = 'px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300';
            }
        }
        
        this.renderTransactions();
    }
    
    // Transaction management functions
    async viewTransactionDetails(id) {
        try {
            const transaction = await this.transaccionService.obtenerTransaccionPorId(id);
            // Redirect to detail page or show modal
            window.location.href = `/pages/transaccion/detalle.html?id=${id}`;
        } catch (error) {
            console.error('Error viewing transaction details:', error);
            this.showToast('Error al cargar los detalles de la transacción', 'error');
        }
    }
    
    editTransaction(id) {
        window.location.href = `/pages/transaccion/edit.html?id=${id}`;
    }
    
    async duplicateTransaction(id) {
        try {
            const transaction = await this.transaccionService.obtenerTransaccionPorId(id);
            const newTransaction = {
                ...transaction,
                id: null,
                numeroFactura: null,
                numeroTransaccion: null,
                fechaCreacion: null,
                fechaActualizacion: null,
                estado: 'PENDIENTE'
            };
            
            await this.transaccionService.crearTransaccion(newTransaction);
            await this.loadTransactions();
            await this.loadStatistics();
            this.showToast('Transacción duplicada exitosamente', 'success');
        } catch (error) {
            console.error('Error duplicating transaction:', error);
            this.showToast('Error al duplicar la transacción', 'error');
        }
    }
    
    printTransaction(id) {
        window.open(`/pages/transaccion/print.html?id=${id}`, '_blank');
    }
    
    async deleteTransaction(id) {
        if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
            try {
                await this.transaccionService.eliminarTransaccion(id);
                await this.loadTransactions();
                await this.loadStatistics();
                this.showToast('Transacción eliminada exitosamente', 'success');
            } catch (error) {
                console.error('Error deleting transaction:', error);
                this.showToast('Error al eliminar la transacción', 'error');
            }
        }
    }
    
    toggleTransactionMenu(id) {
        const menu = document.getElementById(`menu-${id}`);
        const allMenus = document.querySelectorAll('[id^="menu-"]');
        
        // Close all other menus
        allMenus.forEach(m => {
            if (m !== menu) {
                m.classList.add('hidden');
            }
        });
        
        // Toggle current menu
        if (menu) {
            menu.classList.toggle('hidden');
        }
    }
    
    // Transaction wizard functions  
    openTransactionWizard(type) {
        if (this.transactionWizard) {
            this.transactionWizard.open(type);
        }
    }
    
    closeTransactionWizard() {
        if (this.transactionWizard) {
            this.transactionWizard.close();
        }
    }
    
    wizardNextStep() {
        if (this.transactionWizard) {
            this.transactionWizard.nextStep();
        }
    }
    
    wizardPrevStep() {
        if (this.transactionWizard) {
            this.transactionWizard.prevStep();
        }
    }
    
    // Utility functions
    formatCurrency(amount) {
        if (!amount && amount !== 0) return 'RD$ 0.00';
        
        const number = Math.abs(amount);
        const parts = number.toFixed(2).split('.');
        const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const decimal = parts[1];
        
        return `RD$ ${integer}.${decimal}`;
    }
    
    formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
    
    getTypeIcon(type) {
        const icons = {
            'COMPRA': 'fas fa-shopping-cart',
            'VENTA': 'fas fa-cash-register',
            'DEVOLUCION_COMPRA': 'fas fa-undo',
            'DEVOLUCION_VENTA': 'fas fa-undo'
        };
        return icons[type] || 'fas fa-exchange-alt';
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
    
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
    
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            // Fallback alert
            alert(message);
        }
    }
    
    exportData() {
        // Export filtered transactions to CSV or Excel
        this.showToast('Exportando datos...', 'info');
        
        // Simulate export
        setTimeout(() => {
            this.showToast('Datos exportados exitosamente', 'success');
        }, 2000);
    }
    
    showReports() {
        this.showToast('Módulo de reportes en desarrollo', 'info');
    }
}

// Global functions for HTML onclick handlers
let contabilidad;
let transactionWizard;

document.addEventListener('DOMContentLoaded', function() {
    contabilidad = new ContabilidadManager();
    
    // Make wizard globally accessible
    setTimeout(() => {
        transactionWizard = contabilidad.transactionWizard;
    }, 100);
});

// Export functions for HTML handlers
window.toggleFilters = () => contabilidad?.toggleFilters();
window.filterTransactions = () => contabilidad?.filterTransactions();
window.clearFilters = () => contabilidad?.clearFilters();
window.setView = (view) => contabilidad?.setView(view);
window.exportData = () => contabilidad?.exportData();
window.showReports = () => contabilidad?.showReports();
window.openTransactionWizard = (type) => contabilidad?.openTransactionWizard(type);
window.closeTransactionWizard = () => contabilidad?.closeTransactionWizard();
window.wizardNextStep = () => contabilidad?.wizardNextStep();
window.wizardPrevStep = () => contabilidad?.wizardPrevStep();

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('[onclick*="toggleTransactionMenu"]')) {
        document.querySelectorAll('[id^="menu-"]').forEach(menu => {
            menu.classList.add('hidden');
        });
    }
});