// src/main/resources/static/js/components/tableView.js

class TableViewManager {
    constructor(containerSelector, config) {
        this.container = document.querySelector(containerSelector);
        this.config = config;
        this.currentPage = 0;
        this.pageSize = 25;
        this.totalPages = 0;
        this.totalItems = 0;
        this.data = [];
        this.filteredData = [];
        this.isTableView = false;

        this.init();
    }

    init() {
        this.createViewToggle();
        this.createTableContainer();
        this.createPaginationContainer();
    }

    createViewToggle() {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'flex items-center gap-2 mb-4';
        toggleContainer.innerHTML = `
            <span class="text-sm font-medium text-gray-700">Vista:</span>
            <div class="bg-gray-100 rounded-lg p-1 flex">
                <button id="cardViewBtn" class="px-3 py-1 rounded-md text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm">
                    <i class="fas fa-th-large mr-1"></i>Tarjetas
                </button>
                <button id="tableViewBtn" class="px-3 py-1 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900">
                    <i class="fas fa-table mr-1"></i>Tabla
                </button>
            </div>
            <div class="ml-auto flex items-center gap-2" id="pageSizeContainer" style="display: none;">
                <span class="text-sm text-gray-600">Filas por página:</span>
                <select id="pageSizeSelect" class="px-2 py-1 border border-gray-300 rounded text-sm">
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
        `;

        this.container.parentNode.insertBefore(toggleContainer, this.container);

        document.getElementById('cardViewBtn').addEventListener('click', () => this.switchToCardView());
        document.getElementById('tableViewBtn').addEventListener('click', () => this.switchToTableView());
        document.getElementById('pageSizeSelect').addEventListener('change', (e) => {
            this.pageSize = parseInt(e.target.value);
            this.currentPage = 0;
            this.renderTable();
        });
    }

    createTableContainer() {
        this.tableContainer = document.createElement('div');
        this.tableContainer.id = 'tableContainer';
        this.tableContainer.className = 'hidden overflow-x-auto bg-white rounded-lg shadow';
        this.tableContainer.innerHTML = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50" id="tableHead"></thead>
                <tbody class="bg-white divide-y divide-gray-200" id="tableBody"></tbody>
            </table>
        `;
        this.container.parentNode.insertBefore(this.tableContainer, this.container.nextSibling);
    }

    createPaginationContainer() {
        this.paginationContainer = document.createElement('div');
        this.paginationContainer.id = 'tablePagination';
        this.paginationContainer.className = 'hidden flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200';
        this.tableContainer.appendChild(this.paginationContainer);
    }

    switchToCardView() {
        this.isTableView = false;
        document.getElementById('cardViewBtn').className = 'px-3 py-1 rounded-md text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm';
        document.getElementById('tableViewBtn').className = 'px-3 py-1 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900';
        document.getElementById('pageSizeContainer').style.display = 'none';
        this.container.classList.remove('hidden');
        this.tableContainer.classList.add('hidden');
        this.paginationContainer.classList.add('hidden');
    }

    switchToTableView() {
        this.isTableView = true;
        document.getElementById('cardViewBtn').className = 'px-3 py-1 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900';
        document.getElementById('tableViewBtn').className = 'px-3 py-1 rounded-md text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm';
        document.getElementById('pageSizeContainer').style.display = 'flex';
        this.container.classList.add('hidden');
        this.tableContainer.classList.remove('hidden');
        this.paginationContainer.classList.remove('hidden');
        this.renderTable();
    }

    setData(data) {
        this.data = data;
        this.filteredData = [...data];
        this.updatePagination();
        if (this.isTableView) {
            this.renderTable();
        }
    }

    filterData(searchTerm = '', additionalFilters = {}) {
        let filtered = [...this.data];

        if (searchTerm) {
            filtered = filtered.filter(item =>
                this.config.searchFields.some(field => {
                    const value = this.getNestedValue(item, field);
                    return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
                })
            );
        }

        // Apply additional filters
        Object.entries(additionalFilters).forEach(([key, value]) => {
            if (value) {
                filtered = filtered.filter(item => {
                    const itemValue = this.getNestedValue(item, key);
                    return itemValue && itemValue.toString().toLowerCase() === value.toLowerCase();
                });
            }
        });

        this.filteredData = filtered;
        this.currentPage = 0;
        this.updatePagination();
        if (this.isTableView) {
            this.renderTable();
        }
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }

    updatePagination() {
        this.totalItems = this.filteredData.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
        if (this.currentPage >= this.totalPages) {
            this.currentPage = Math.max(0, this.totalPages - 1);
        }
    }

    renderTable() {
        this.renderTableHeader();
        this.renderTableBody();
        this.renderPagination();
    }

    renderTableHeader() {
        const thead = document.getElementById('tableHead');
        thead.innerHTML = `
            <tr>
                ${this.config.columns.map(col => 
                    `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${col.header}</th>`
                ).join('')}
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
        `;
    }

    renderTableBody() {
        const tbody = document.getElementById('tableBody');
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${this.config.columns.length + 1}" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <i class="${this.config.emptyIcon || 'fas fa-inbox'} text-4xl mb-2"></i>
                            <p>No hay datos para mostrar</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pageData.map(item => `
            <tr class="hover:bg-gray-50">
                ${this.config.columns.map(col => {
                    const value = this.getNestedValue(item, col.field);
                    const formattedValue = col.formatter ? col.formatter(value, item) : (value || 'N/A');
                    return `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formattedValue}</td>`;
                }).join('')}
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        ${this.config.actions.map(action => 
                            `<button 
                                onclick="${action.handler}('${this.getNestedValue(item, this.config.idField)}')"
                                class="${action.className}"
                                title="${action.title}"
                            >
                                <i class="${action.icon}"></i>
                            </button>`
                        ).join('')}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderPagination() {
        const startItem = this.currentPage * this.pageSize + 1;
        const endItem = Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);

        this.paginationContainer.innerHTML = `
            <div class="flex items-center text-sm text-gray-700">
                <span>Mostrando ${startItem} a ${endItem} de ${this.totalItems} resultados</span>
            </div>
            <div class="flex items-center space-x-2">
                <button 
                    onclick="tableViewManager.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 0 ? 'disabled' : ''}
                    class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Anterior
                </button>
                ${this.renderPageNumbers()}
                <button 
                    onclick="tableViewManager.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage >= this.totalPages - 1 ? 'disabled' : ''}
                    class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Siguiente
                </button>
            </div>
        `;
    }

    renderPageNumbers() {
        const maxVisible = 5;
        let startPage = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(this.totalPages - 1, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(0, endPage - maxVisible + 1);
        }

        let html = '';

        if (startPage > 0) {
            html += `<button onclick="tableViewManager.goToPage(0)" class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">1</button>`;
            if (startPage > 1) {
                html += `<span class="px-2 py-1 text-gray-500">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button 
                    onclick="tableViewManager.goToPage(${i})" 
                    class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium ${
                        i === this.currentPage 
                            ? 'bg-brand-brown text-white border-brand-brown' 
                            : 'text-gray-700 bg-white hover:bg-gray-50'
                    }"
                >
                    ${i + 1}
                </button>
            `;
        }

        if (endPage < this.totalPages - 1) {
            if (endPage < this.totalPages - 2) {
                html += `<span class="px-2 py-1 text-gray-500">...</span>`;
            }
            html += `<button onclick="tableViewManager.goToPage(${this.totalPages - 1})" class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">${this.totalPages}</button>`;
        }

        return html;
    }

    goToPage(page) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.renderTable();
        }
    }
}

export { TableViewManager };
