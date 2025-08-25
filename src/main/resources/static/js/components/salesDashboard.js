/**
 * Componente de Dashboard de Ventas
 * Muestra métricas de ventas diarias/semanales y gráfico de barras
 */
class SalesDashboard {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.refreshInterval = null;
        this.salesData = [];

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
            <div class="sales-dashboard">
                <div class="dashboard-header">
                    <h3 class="dashboard-title">
                        <i class="fas fa-chart-line text-green-600"></i>
                        Dashboard de Ventas
                    </h3>
                    <div class="last-updated">
                        <i class="fas fa-sync-alt text-gray-400"></i>
                        <span id="salesLastUpdated">Actualizando...</span>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <!-- Métricas principales -->
                    <div class="metrics-row">
                        <div class="metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-calendar-day text-blue-600"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value" id="ventasHoy">-</div>
                                <div class="metric-label">Ventas Hoy</div>
                                <div class="metric-change" id="cambioHoy">
                                    <i class="fas fa-arrow-up text-green-500"></i>
                                    <span>+0%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-calendar-week text-purple-600"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value" id="ventasSemana">-</div>
                                <div class="metric-label">Ventas esta Semana</div>
                                <div class="metric-change" id="cambioSemana">
                                    <i class="fas fa-arrow-up text-green-500"></i>
                                    <span>+0%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-receipt text-orange-600"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value" id="transaccionesHoy">-</div>
                                <div class="metric-label">Transacciones Hoy</div>
                                <div class="metric-change" id="cambioTransacciones">
                                    <i class="fas fa-arrow-up text-green-500"></i>
                                    <span>+0</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-dollar-sign text-green-600"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value" id="promedioVenta">-</div>
                                <div class="metric-label">Promedio por Venta</div>
                                <div class="metric-change" id="cambioPromedio">
                                    <i class="fas fa-arrow-up text-green-500"></i>
                                    <span>+0%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Gráfico y lista de ventas -->
                    <div class="dashboard-grid">
                        <div class="chart-section">
                            <div class="chart-header">
                                <h4 class="section-title">Ventas de los Últimos 7 Días</h4>
                                <div class="chart-controls">
                                    <select id="chartPeriod" class="period-selector">
                                        <option value="7">Últimos 7 días</option>
                                        <option value="14">Últimas 2 semanas</option>
                                        <option value="30">Último mes</option>
                                    </select>
                                </div>
                            </div>
                            <div class="chart-container">
                                <canvas id="salesChart"></canvas>
                            </div>
                            <div id="noSalesChart" class="no-data hidden">
                                <i class="fas fa-chart-bar text-gray-300 text-4xl"></i>
                                <p class="text-gray-500 mt-2">No hay datos de ventas disponibles</p>
                            </div>
                        </div>
                        
                        <div class="recent-sales-section">
                            <h4 class="section-title">Ventas Recientes</h4>
                            <div class="recent-sales-list" id="recentSalesList">
                                <div class="loading-spinner">
                                    <i class="fas fa-spinner fa-spin text-gray-400"></i>
                                    <p class="text-gray-500 mt-2">Cargando ventas...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for period change
        const periodSelector = document.getElementById('chartPeriod');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                this.updateChart(parseInt(e.target.value));
            });
        }
    }

    async loadData() {
        try {
            const response = await fetch('/api/transacciones/ventas');
            if (!response.ok) {
                // Si el endpoint no existe o hay error, usar datos simulados
                if (response.status === 404) {
                    console.warn('Endpoint /api/transacciones/ventas not found, using simulated data');
                    this.salesData = this.generateSimulatedData();
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } else {
                this.salesData = await response.json();
            }

            this.updateMetrics();
            this.updateChart(7); // Default to 7 days
            this.updateRecentSalesList();
            this.updateTimestamp();

        } catch (error) {
            console.error('Error loading sales data:', error);
            // En caso de error, usar datos simulados
            console.warn('Using simulated data due to error:', error.message);
            this.salesData = this.generateSimulatedData();
            this.updateMetrics();
            this.updateChart(7);
            this.updateRecentSalesList();
            this.updateTimestamp();
        }
    }

    generateSimulatedData() {
        // Generar datos simulados para demostración
        const simulatedSales = [];
        const now = new Date();

        for (let i = 0; i < 20; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            // Simular entre 0-8 ventas por día
            const dailySales = Math.floor(Math.random() * 9);

            for (let j = 0; j < dailySales; j++) {
                const saleDate = new Date(date);
                saleDate.setHours(
                    Math.floor(Math.random() * 12) + 8, // Entre 8 AM y 8 PM
                    Math.floor(Math.random() * 60)
                );

                simulatedSales.push({
                    id: Date.now() + Math.random() * 1000,
                    tipo: 'VENTA',
                    fecha: saleDate.toISOString(),
                    estado: Math.random() > 0.1 ? 'COMPLETADA' : 'PENDIENTE',
                    contraparteNombre: `Cliente ${Math.floor(Math.random() * 100) + 1}`,
                    total: (Math.random() * 50000 + 5000), // Entre RD$ 5,000 y 55,000
                    numeroFactura: `F-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                    metodoPago: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'][Math.floor(Math.random() * 3)]
                });
            }
        }

        return simulatedSales.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    updateMetrics() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // Ventas de hoy
        const todaySales = this.salesData.filter(sale => {
            const saleDate = new Date(sale.fecha);
            return saleDate >= today && sale.estado !== 'CANCELADA';
        });

        // Ventas de ayer
        const yesterdaySales = this.salesData.filter(sale => {
            const saleDate = new Date(sale.fecha);
            return saleDate >= yesterday && saleDate < today && sale.estado !== 'CANCELADA';
        });

        // Ventas de esta semana
        const thisWeekSales = this.salesData.filter(sale => {
            const saleDate = new Date(sale.fecha);
            return saleDate >= weekAgo && sale.estado !== 'CANCELADA';
        });

        // Ventas de la semana pasada
        const lastWeekSales = this.salesData.filter(sale => {
            const saleDate = new Date(sale.fecha);
            return saleDate >= twoWeeksAgo && saleDate < weekAgo && sale.estado !== 'CANCELADA';
        });

        // Calcular totales
        const todayTotal = todaySales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
        const yesterdayTotal = yesterdaySales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
        const thisWeekTotal = thisWeekSales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
        const lastWeekTotal = lastWeekSales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);

        // Calcular cambios porcentuales
        const dailyChange = yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal * 100) : 0;
        const weeklyChange = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100) : 0;
        const transactionChange = todaySales.length - yesterdaySales.length;

        const todayAverage = todaySales.length > 0 ? todayTotal / todaySales.length : 0;
        const yesterdayAverage = yesterdaySales.length > 0 ? yesterdayTotal / yesterdaySales.length : 0;
        const averageChange = yesterdayAverage > 0 ? ((todayAverage - yesterdayAverage) / yesterdayAverage * 100) : 0;

        // Actualizar elementos del DOM
        document.getElementById('ventasHoy').textContent = this.formatCurrency(todayTotal);
        document.getElementById('ventasSemana').textContent = this.formatCurrency(thisWeekTotal);
        document.getElementById('transaccionesHoy').textContent = todaySales.length;
        document.getElementById('promedioVenta').textContent = this.formatCurrency(todayAverage);

        // Actualizar indicadores de cambio
        this.updateChangeIndicator('cambioHoy', dailyChange, true);
        this.updateChangeIndicator('cambioSemana', weeklyChange, true);
        this.updateChangeIndicator('cambioTransacciones', transactionChange, false);
        this.updateChangeIndicator('cambioPromedio', averageChange, true);
    }

    updateChangeIndicator(elementId, change, isPercentage) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const isPositive = change >= 0;
        const icon = element.querySelector('i');
        const span = element.querySelector('span');

        // Actualizar icono
        icon.className = `fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'} ${isPositive ? 'text-green-500' : 'text-red-500'}`;

        // Actualizar texto
        const prefix = isPositive ? '+' : '';
        const suffix = isPercentage ? '%' : '';
        const value = isPercentage ? Math.abs(change).toFixed(1) : Math.abs(change);
        span.textContent = `${prefix}${value}${suffix}`;
    }

    updateChart(days = 7) {
        const chartData = this.prepareChartData(days);

        if (chartData.labels.length === 0) {
            this.showNoDataChart();
            return;
        }

        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        // Destruir gráfico anterior si existe
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Ventas Diarias',
                    data: chartData.data,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                return `Ventas: ${new Intl.NumberFormat('es-DO', {
                                    style: 'currency',
                                    currency: 'DOP'
                                }).format(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-DO', {
                                    style: 'currency',
                                    currency: 'DOP',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    bar: {
                        borderRadius: 4
                    }
                }
            }
        });

        this.hideNoDataChart();
    }

    prepareChartData(days) {
        const now = new Date();
        const labels = [];
        const data = [];

        // Crear array de los últimos X días
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            // Filtrar ventas de ese día
            const daySales = this.salesData.filter(sale => {
                const saleDate = new Date(sale.fecha);
                return saleDate >= dayStart && saleDate < dayEnd && sale.estado !== 'CANCELADA';
            });

            // Calcular total del día
            const dayTotal = daySales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);

            // Formatear fecha para etiqueta
            const dayLabel = i === 0 ? 'Hoy' :
                           i === 1 ? 'Ayer' :
                           date.toLocaleDateString('es-ES', {
                               weekday: 'short',
                               day: 'numeric',
                               month: 'short'
                           });

            labels.push(dayLabel);
            data.push(dayTotal);
        }

        return { labels, data };
    }

    updateRecentSalesList() {
        const recentSales = this.salesData
            .filter(sale => sale.estado !== 'CANCELADA')
            .slice(0, 8); // Mostrar últimas 8 ventas

        const listContainer = document.getElementById('recentSalesList');

        if (recentSales.length === 0) {
            listContainer.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-receipt text-gray-400 text-3xl"></i>
                    <p class="text-gray-500 mt-2">No hay ventas recientes</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = recentSales.map(sale => {
            const saleDate = new Date(sale.fecha);
            const isToday = this.isToday(saleDate);
            const timeAgo = this.getTimeAgo(saleDate);

            const statusClass = this.getStatusClass(sale.estado);
            const statusIcon = this.getStatusIcon(sale.estado);

            return `
                <div class="recent-sale-item">
                    <div class="sale-main-info">
                        <div class="sale-header">
                            <span class="sale-number">#${sale.numeroFactura || sale.id}</span>
                            <span class="sale-time ${isToday ? 'today' : ''}">${timeAgo}</span>
                        </div>
                        <div class="sale-client">${sale.contraparteNombre || 'Cliente'}</div>
                    </div>
                    <div class="sale-details">
                        <div class="sale-amount">${this.formatCurrency(sale.total)}</div>
                        <div class="sale-status ${statusClass}">
                            <i class="fas ${statusIcon}"></i>
                            <span>${sale.estado}</span>
                        </div>
                        ${sale.metodoPago ? `<div class="sale-method">${sale.metodoPago}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('salesLastUpdated').textContent = `Actualizado: ${timeString}`;
    }

    showNoDataChart() {
        const chartCanvas = document.getElementById('salesChart');
        const noDataDiv = document.getElementById('noSalesChart');
        if (chartCanvas) chartCanvas.style.display = 'none';
        if (noDataDiv) noDataDiv.classList.remove('hidden');
    }

    hideNoDataChart() {
        const chartCanvas = document.getElementById('salesChart');
        const noDataDiv = document.getElementById('noSalesChart');
        if (chartCanvas) chartCanvas.style.display = 'block';
        if (noDataDiv) noDataDiv.classList.add('hidden');
    }

    startAutoRefresh() {
        // Refrescar cada minuto
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 60000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    destroy() {
        this.stopAutoRefresh();
        if (this.chart) {
            this.chart.destroy();
        }
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

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 60) {
            return `hace ${diffMinutes}m`;
        } else if (diffHours < 24) {
            return `hace ${diffHours}h`;
        } else if (diffDays < 7) {
            return `hace ${diffDays}d`;
        } else {
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short'
            });
        }
    }

    getStatusClass(status) {
        const statusClasses = {
            'COMPLETADA': 'status-completed',
            'PENDIENTE': 'status-pending',
            'CANCELADA': 'status-cancelled',
            'FACTURADA': 'status-invoiced',
            'ENTREGADA': 'status-delivered',
            'COBRADA': 'status-paid'
        };
        return statusClasses[status] || 'status-default';
    }

    getStatusIcon(status) {
        const statusIcons = {
            'COMPLETADA': 'fa-check-circle',
            'PENDIENTE': 'fa-clock',
            'CANCELADA': 'fa-times-circle',
            'FACTURADA': 'fa-file-invoice',
            'ENTREGADA': 'fa-truck',
            'COBRADA': 'fa-money-check-alt'
        };
        return statusIcons[status] || 'fa-circle';
    }
}

// Exportar para uso global
window.SalesDashboard = SalesDashboard;

