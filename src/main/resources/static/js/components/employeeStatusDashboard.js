/**
 * Componente de Dashboard de Estado de Empleados
 * Muestra empleados comerciales y sus métricas calculadas
 */
class EmployeeStatusDashboard {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.refreshInterval = null;
        this.employeesData = [];
        this.filteredEmployeesData = [];
        this.salesData = [];
        this.isLoading = false;

        if (!this.container) {
            console.error(`Container with id ${containerId} not found`);
            return;
        }

        this.init();
    }

    init() {
        this.render();
        this.loadData();
        this.startAutoRefresh();
        console.log('EmployeeStatusDashboard initialized successfully');
    }

    render() {
        this.container.innerHTML = `
            <div class="employee-status-dashboard">
                <div class="dashboard-header">
                    <h3 class="dashboard-title">
                        <i class="fas fa-users text-purple-600"></i>
                        Estado de Empleados Comerciales
                    </h3>
                    <div class="dashboard-actions">
                        <button onclick="employeeStatus.refresh()" class="refresh-btn">
                            <i class="fas fa-sync-alt"></i>
                            Actualizar
                        </button>
                        <div class="last-updated">
                            <i class="fas fa-clock text-gray-400"></i>
                            <span id="employeeLastUpdated">Cargando...</span>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <!-- Métricas principales -->
                    <div class="metrics-row">
                        <div class="metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-user-tie text-blue-600"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value" id="totalComerciales">-</div>
                                <div class="metric-label">Empleados Comerciales</div>
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-trophy text-gold-600"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value" id="topPerformer">-</div>
                                <div class="metric-label">Mejor Vendedor</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tabla de empleados -->
                    <div class="employee-table-section">
                        <div class="table-header">
                            <h4 class="section-title">Empleados Comerciales Activos</h4>
                            <div class="table-filters">
                                <select id="sortBy" class="filter-select" onchange="employeeStatus.sortEmployees()">
                                    <option value="nombre">Ordenar por Nombre</option>
                                    <option value="fechaContratacion">Fecha de Contratación</option>
                                    <option value="salario">Salario</option>
                                    <option value="comision">Comisión</option>
                                    <option value="performance">Rendimiento</option>
                                </select>
                                <select id="filterStatus" class="filter-select" onchange="employeeStatus.filterByStatus()">
                                    <option value="all">Todos los Estados</option>
                                    <option value="active">Solo Activos</option>
                                    <option value="new">Nuevos (< 3 meses)</option>
                                    <option value="experienced">Experimentados (> 1 año)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="employee-table-container">
                            <div id="employeeTable" class="employee-table">
                                <div class="loading-spinner">
                                    <i class="fas fa-spinner fa-spin text-gray-400"></i>
                                    <p class="text-gray-500 mt-2">Cargando empleados...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoading();

            // Cargar empleados y datos de ventas en paralelo
            await Promise.all([
                this.loadEmployees(),
                this.loadSalesData()
            ]);

            // Calcular métricas y renderizar
            this.calculateMetrics();
            this.filteredEmployeesData = [...this.employeesData];
            this.updateMetrics();
            this.renderEmployeeTable();
            this.updateTimestamp();

        } catch (error) {
            console.error('Error loading employee data:', error);
            this.showError('Error al cargar los datos de empleados');
        } finally {
            this.isLoading = false;
        }
    }

    showLoading() {
        const tableContainer = document.getElementById('employeeTable');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                    <p class="text-gray-500 mt-2">Cargando empleados...</p>
                </div>
            `;
        }
    }

    async loadEmployees() {
        try {
            const response = await fetch('/api/empleados');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const allEmployees = await response.json();

            // Filtrar solo empleados comerciales activos
            this.employeesData = allEmployees.filter(emp =>
                emp.rol === 'COMERCIAL' && !emp.deleted
            );

        } catch (error) {
            console.warn('API not available, using simulated data:', error);
            // Generar datos simulados en caso de error
            this.employeesData = this.generateSimulatedEmployees();
        }
    }

    async loadSalesData() {
        try {
            const response = await fetch('/api/transacciones?tipo=VENTA');
            if (response.ok) {
                const transactions = await response.json();
                this.salesData = transactions.filter(t => t.tipo === 'VENTA' && t.estado === 'COMPLETADA');
            } else {
                this.salesData = [];
            }
        } catch (error) {
            console.warn('Could not load sales data for metrics calculation:', error);
            this.salesData = this.generateSimulatedSales();
        }
    }

    generateSimulatedEmployees() {
        // Datos simulados para demostración
        return [
            {
                cedula: '001-1234567-8',
                nombre: 'Juan Carlos',
                apellido: 'Pérez',
                telefono: '809-123-4567',
                email: 'juan.perez@thelarte.com',
                rol: 'COMERCIAL',
                salario: 45000,
                comision: 5.5,
                fechaContratacion: '2023-01-15',
                deleted: false
            },
            {
                cedula: '001-2345678-9',
                nombre: 'María Isabel',
                apellido: 'García',
                telefono: '809-234-5678',
                email: 'maria.garcia@thelarte.com',
                rol: 'COMERCIAL',
                salario: 38000,
                comision: 4.0,
                fechaContratacion: '2022-06-20',
                deleted: false
            },
            {
                cedula: '001-3456789-0',
                nombre: 'Pedro Antonio',
                apellido: 'Rodríguez',
                telefono: '809-345-6789',
                email: 'pedro.rodriguez@thelarte.com',
                rol: 'COMERCIAL',
                salario: 52000,
                comision: 6.0,
                fechaContratacion: '2021-03-10',
                deleted: false
            },
            {
                cedula: '001-4567890-1',
                nombre: 'Ana Sofía',
                apellido: 'Martínez',
                telefono: '809-456-7890',
                email: 'ana.martinez@thelarte.com',
                rol: 'COMERCIAL',
                salario: 41000,
                comision: 4.5,
                fechaContratacion: '2023-08-12',
                deleted: false
            }
        ];
    }

    generateSimulatedSales() {
        // Generar datos de ventas simulados para calcular métricas
        const salesData = [];
        const employeeIds = this.employeesData.map(emp => emp.cedula.replace(/-/g, ''));

        for (let i = 0; i < 50; i++) {
            salesData.push({
                id: i + 1,
                tipo: 'VENTA',
                estado: 'COMPLETADA',
                total: Math.random() * 50000 + 10000,
                vendedorId: employeeIds[Math.floor(Math.random() * employeeIds.length)],
                fecha: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
            });
        }

        return salesData;
    }

    calculateMetrics() {
        this.employeesData.forEach(employee => {
            // Calcular tiempo de servicio
            const hireDate = new Date(employee.fechaContratacion);
            const now = new Date();
            const monthsWorked = Math.floor((now - hireDate) / (1000 * 60 * 60 * 24 * 30.44));
            employee.monthsWorked = Math.max(0, monthsWorked);

            // Calcular ventas del empleado
            const employeeId = employee.cedula.replace(/-/g, '');
            const employeeSales = this.salesData.filter(sale =>
                sale.vendedorId && sale.vendedorId.toString() === employeeId
            );

            const totalSales = employeeSales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
            employee.totalSales = totalSales;
            employee.salesCount = employeeSales.length;

            // Calcular comisiones ganadas
            const commissionEarned = totalSales * ((employee.comision || 0) / 100);
            employee.commissionEarned = commissionEarned;

            // Calcular performance score
            employee.performanceScore = this.calculatePerformanceScore(employee);

            // Determinar status
            employee.status = this.determineEmployeeStatus(employee);
        });
    }

    calculatePerformanceScore(employee) {
        let score = 0;

        // Puntuación basada en ventas (40% del total)
        const salesScore = Math.min(employee.totalSales / 100000, 1) * 40;
        score += salesScore;

        // Puntuación basada en experiencia (30% del total)
        const experienceScore = Math.min(employee.monthsWorked / 24, 1) * 30;
        score += experienceScore;

        // Puntuación basada en cantidad de ventas (30% del total)
        const countScore = Math.min(employee.salesCount / 20, 1) * 30;
        score += countScore;

        return Math.round(Math.max(0, score));
    }

    determineEmployeeStatus(employee) {
        if (employee.monthsWorked < 3) return 'new';
        if (employee.performanceScore > 75) return 'top';
        if (employee.performanceScore > 50) return 'good';
        return 'regular';
    }

    updateMetrics() {
        const comerciales = this.employeesData;

        // Total comerciales
        const totalElement = document.getElementById('totalComerciales');
        if (totalElement) {
            totalElement.textContent = comerciales.length;
        }

        // Mejor vendedor
        const topPerformerElement = document.getElementById('topPerformer');
        if (topPerformerElement && comerciales.length > 0) {
            const topPerformer = comerciales.reduce((best, current) =>
                (current.performanceScore > best.performanceScore) ? current : best, comerciales[0]
            );
            topPerformerElement.textContent = `${topPerformer.nombre} ${topPerformer.apellido}`;
        }
    }

    renderEmployeeTable() {
        const tableContainer = document.getElementById('employeeTable');
        if (!tableContainer) return;

        if (this.filteredEmployeesData.length === 0) {
            tableContainer.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-user-slash text-gray-400 text-4xl"></i>
                    <p class="text-gray-500 mt-2">No hay empleados comerciales registrados</p>
                </div>
            `;
            return;
        }

        const tableHtml = `
            <div class="table-responsive">
                <table class="employee-table-grid">
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Contacto</th>
                            <th>Experiencia</th>
                            <th>Salario</th>
                            <th>Comisión</th>
                            <th>Rendimiento</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.filteredEmployeesData.map(employee => this.renderEmployeeRow(employee)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        tableContainer.innerHTML = tableHtml;
    }

    renderEmployeeRow(employee) {
        const statusClass = this.getStatusClass(employee.status);
        const statusIcon = this.getStatusIcon(employee.status);
        const statusText = this.getStatusText(employee.status);

        const experienceText = employee.monthsWorked >= 12 ?
            `${Math.floor(employee.monthsWorked / 12)} año${Math.floor(employee.monthsWorked / 12) > 1 ? 's' : ''}` :
            `${employee.monthsWorked} mes${employee.monthsWorked !== 1 ? 'es' : ''}`;

        return `
            <tr class="employee-row" data-employee-id="${employee.cedula}">
                <td class="employee-info">
                    <div class="employee-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="employee-details">
                        <div class="employee-name">${employee.nombre} ${employee.apellido}</div>
                        <div class="employee-id">ID: ${employee.cedula}</div>
                    </div>
                </td>
                <td class="contact-info">
                    <div class="contact-item">
                        <i class="fas fa-phone text-gray-400"></i>
                        <span>${employee.telefono || 'No registrado'}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope text-gray-400"></i>
                        <span>${employee.email || 'No registrado'}</span>
                    </div>
                </td>
                <td class="experience-info">
                    <div class="experience-main">${experienceText}</div>
                    <div class="hire-date">Desde ${this.formatDate(employee.fechaContratacion)}</div>
                </td>
                <td class="salary-info">
                    <div class="salary-amount">${this.formatCurrency(employee.salario)}</div>
                    <div class="salary-period">Mensual</div>
                </td>
                <td class="commission-info">
                    <div class="commission-rate">${(employee.comision || 0).toFixed(1)}%</div>
                    <div class="commission-earned">${this.formatCurrency(employee.commissionEarned)}</div>
                </td>
                <td class="performance-info">
                    <div class="performance-score">
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${employee.performanceScore}%"></div>
                        </div>
                        <span class="score-text">${employee.performanceScore}/100</span>
                    </div>
                    <div class="performance-details">
                        ${employee.salesCount} venta${employee.salesCount !== 1 ? 's' : ''} • ${this.formatCurrency(employee.totalSales)}
                    </div>
                </td>
                <td class="status-info">
                    <span class="status-badge ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${statusText}
                    </span>
                </td>
            </tr>
        `;
    }

    sortEmployees() {
        const sortBy = document.getElementById('sortBy')?.value || 'nombre';

        this.filteredEmployeesData.sort((a, b) => {
            switch (sortBy) {
                case 'nombre':
                    return `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
                case 'fechaContratacion':
                    return new Date(b.fechaContratacion) - new Date(a.fechaContratacion);
                case 'salario':
                    return (b.salario || 0) - (a.salario || 0);
                case 'comision':
                    return (b.comision || 0) - (a.comision || 0);
                case 'performance':
                    return (b.performanceScore || 0) - (a.performanceScore || 0);
                default:
                    return 0;
            }
        });

        this.renderEmployeeTable();
    }

    filterByStatus() {
        const filterStatus = document.getElementById('filterStatus')?.value || 'all';

        if (filterStatus === 'all') {
            this.filteredEmployeesData = [...this.employeesData];
        } else {
            this.filteredEmployeesData = this.employeesData.filter(emp => {
                switch (filterStatus) {
                    case 'active':
                        return !emp.deleted;
                    case 'new':
                        return emp.monthsWorked < 3;
                    case 'experienced':
                        return emp.monthsWorked >= 12;
                    default:
                        return true;
                }
            });
        }

        this.renderEmployeeTable();
    }

    updateTimestamp() {
        const timestampElement = document.getElementById('employeeLastUpdated');
        if (timestampElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            timestampElement.textContent = `${timeString}`;
        }
    }

    showError(message) {
        const tableContainer = document.getElementById('employeeTable');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                    <p class="text-gray-700 mt-2">${message}</p>
                    <button onclick="employeeStatus.refresh()" class="retry-btn">
                        <i class="fas fa-redo"></i>
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    startAutoRefresh() {
        // Refrescar cada 10 minutos
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 600000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    destroy() {
        this.stopAutoRefresh();
        console.log('EmployeeStatusDashboard destroyed');
    }

    // Método público para refrescar manualmente
    refresh() {
        this.loadData();
    }

    // Utility functions
    formatCurrency(amount) {
        if (!amount && amount !== 0) return 'RD$ 0.00';

        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(Math.abs(amount));
    }

    formatDate(date) {
        if (!date) return '';
        try {
            return new Date(date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return '';
        }
    }

    getStatusClass(status) {
        const classes = {
            'new': 'status-new',
            'top': 'status-top',
            'good': 'status-good',
            'regular': 'status-regular'
        };
        return classes[status] || 'status-regular';
    }

    getStatusIcon(status) {
        const icons = {
            'new': 'fa-star',
            'top': 'fa-trophy',
            'good': 'fa-thumbs-up',
            'regular': 'fa-minus-circle'
        };
        return icons[status] || 'fa-minus-circle';
    }

    getStatusText(status) {
        const texts = {
            'new': 'Nuevo',
            'top': 'Top',
            'good': 'Bueno',
            'regular': 'Regular'
        };
        return texts[status] || 'Regular';
    }
}

// Exportar para uso global
window.EmployeeStatusDashboard = EmployeeStatusDashboard;
