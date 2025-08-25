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
        this.salesData = []; // Para calcular comisiones

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
                        <div class="last-updated">
                            <i class="fas fa-sync-alt text-gray-400"></i>
                            <span id="employeeLastUpdated">Actualizando...</span>
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
        try {
            // Cargar empleados
            await this.loadEmployees();

            // Cargar datos de ventas para calcular métricas
            await this.loadSalesData();

            // Calcular y mostrar métricas
            this.calculateMetrics();
            this.updateMetrics();
            this.renderEmployeeTable();
            this.updateTimestamp();

        } catch (error) {
            console.error('Error loading employee data:', error);
            this.showError('Error al cargar los datos de empleados');
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
            console.error('Error loading employees:', error);
            // Generar datos simulados en caso de error
            this.employeesData = this.generateSimulatedEmployees();
        }
    }

    async loadSalesData() {
        try {
            const response = await fetch('/api/transacciones/ventas');
            if (response.ok) {
                this.salesData = await response.json();
            } else {
                // Si no hay datos de ventas, usar array vacío
                this.salesData = [];
            }
        } catch (error) {
            console.warn('Could not load sales data for metrics calculation:', error);
            this.salesData = [];
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
            }
        ];
    }

    calculateMetrics() {
        this.employeesData.forEach(employee => {
            // Calcular tiempo de servicio
            const hireDate = new Date(employee.fechaContratacion);
            const now = new Date();
            const monthsWorked = Math.floor((now - hireDate) / (1000 * 60 * 60 * 24 * 30));
            employee.monthsWorked = monthsWorked;

            // Calcular ventas del empleado (si hay datos de ventas)
            const employeeSales = this.salesData.filter(sale =>
                sale.vendedorId && sale.vendedorId.toString() === employee.cedula.replace(/-/g, '')
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

        return Math.round(score);
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
        document.getElementById('totalComerciales').textContent = comerciales.length;

        // Mejor vendedor
        const topPerformer = comerciales.reduce((best, current) =>
            (current.performanceScore > best.performanceScore) ? current : best, comerciales[0] || {}
        );
        document.getElementById('topPerformer').textContent =
            topPerformer.nombre ? `${topPerformer.nombre} ${topPerformer.apellido}` : '-';
    }

    renderEmployeeTable() {
        const tableContainer = document.getElementById('employeeTable');

        if (this.employeesData.length === 0) {
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
                        ${this.employeesData.map(employee => this.renderEmployeeRow(employee)).join('')}
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
            `${Math.floor(employee.monthsWorked / 12)} años` :
            `${employee.monthsWorked} meses`;

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
                        <span>${employee.telefono}</span>
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
                        ${employee.salesCount} ventas • ${this.formatCurrency(employee.totalSales)}
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

        this.employeesData.sort((a, b) => {
            switch (sortBy) {
                case 'nombre':
                    return `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
                case 'fechaContratacion':
                    return new Date(b.fechaContratacion) - new Date(a.fechaContratacion);
                case 'salario':
                    return b.salario - a.salario;
                case 'comision':
                    return (b.comision || 0) - (a.comision || 0);
                case 'performance':
                    return b.performanceScore - a.performanceScore;
                default:
                    return 0;
            }
        });

        this.renderEmployeeTable();
    }

    filterByStatus() {
        const filterStatus = document.getElementById('filterStatus')?.value || 'all';

        // Recargar datos originales si es necesario
        if (filterStatus === 'all') {
            this.loadData();
            return;
        }

        const now = new Date();
        this.employeesData = this.employeesData.filter(emp => {
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

        this.updateMetrics();
        this.renderEmployeeTable();
    }

    updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('employeeLastUpdated').textContent = `Actualizado: ${timeString}`;
    }

    showError(message) {
        const tableContainer = document.getElementById('employeeTable');
        if (tableContainer) {
            tableContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                    <p class="text-gray-700 mt-2">${message}</p>
                    <button onclick="employeeStatus.loadData()" class="retry-btn">
                        <i class="fas fa-redo"></i>
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    startAutoRefresh() {
        // Refrescar cada 5 minutos
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 300000); // 5 minutos en milisegundos
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    destroy() {
        this.stopAutoRefresh();
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
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
