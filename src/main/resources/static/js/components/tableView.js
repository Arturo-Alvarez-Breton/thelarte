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
        this.totalItems = data.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        if (this.isTableView) {
            this.renderTable();
        }
    }

    updateColumns(newColumns) {
        this.config.columns = newColumns;
        if (this.isTableView) {
            this.renderTable();
        }
    }

    filterData(searchTerm) {
        if (!searchTerm) {
            this.filteredData = [...this.data];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredData = this.data.filter(item => {
                return this.config.searchFields.some(field => {
                    const value = item[field];
                    return value && value.toString().toLowerCase().includes(term);
                });
            });
        }
        this.totalItems = this.filteredData.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.currentPage = 0;
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
        this.renderTablePagination();
    }

    renderTableHeader() {
        const thead = document.getElementById('tableHead');
        const headerRow = this.config.columns.map(col => `
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ${col.header}
            </th>
        `).join('');

        thead.innerHTML = `
            <tr>
                ${headerRow}
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                </th>
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
                    <td colspan="${this.config.columns.length + 1}" class="px-6 py-4 text-center text-gray-500">
                        <div class="flex flex-col items-center py-8">
                            <i class="${this.config.emptyIcon} text-4xl text-gray-300 mb-4"></i>
                            <p>No hay datos disponibles</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pageData.map(item => {
            const cells = this.config.columns.map(col => {
                let value = item[col.field];
                if (col.formatter) {
                    // Pass both value and complete item to formatter
                    value = col.formatter(value, item);
                }
                return `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${value || 'N/A'}</td>`;
            }).join('');

            const actions = this.config.actions.map(action => `
                <button 
                    onclick="${action.handler}('${item[this.config.idField]}')"
                    class="mr-2 p-1 ${action.className}"
                    title="${action.title}"
                >
                    <i class="${action.icon}"></i>
                </button>
            `).join('');

            return `
                <tr class="hover:bg-gray-50">
                    ${cells}
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${actions}
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderTablePagination() {
        if (this.totalPages <= 1) {
            this.paginationContainer.innerHTML = '';
            return;
        }

        const prevDisabled = this.currentPage === 0;
        const nextDisabled = this.currentPage === this.totalPages - 1;

        this.paginationContainer.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-700">
                    Mostrando ${this.currentPage * this.pageSize + 1} a ${Math.min((this.currentPage + 1) * this.pageSize, this.totalItems)} de ${this.totalItems} resultados
                </div>
                <div class="flex space-x-1">
                    <button 
                        ${prevDisabled ? 'disabled' : ''}
                        onclick="tableViewManager.prevPage()"
                        class="px-3 py-1 border border-gray-300 rounded-md text-sm ${prevDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}"
                    >
                        Anterior
                    </button>
                    <span class="px-3 py-1 text-sm">
                        Página ${this.currentPage + 1} de ${this.totalPages}
                    </span>
                    <button 
                        ${nextDisabled ? 'disabled' : ''}
                        onclick="tableViewManager.nextPage()"
                        class="px-3 py-1 border border-gray-300 rounded-md text-sm ${nextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        `;
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.renderTable();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.renderTable();
        }
    }
}

export { TableViewManager };
