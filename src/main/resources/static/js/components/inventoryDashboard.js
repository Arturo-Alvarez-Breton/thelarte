/**
 * Componente de Dashboard de Inventario
 * Muestra resumen de productos, gráfico por categoría y productos con bajo stock
 */
class InventoryDashboard {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.refreshInterval = null;
        this.data = [];

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
            <div class="inventory-dashboard">
                <div class="dashboard-header">
                    <h3 class="dashboard-title">
                        <i class="fas fa-boxes text-blue-600"></i>
                        Resumen de Inventario
                    </h3>
                    <div class="last-updated">
                        <i class="fas fa-sync-alt text-gray-400"></i>
                        <span id="lastUpdated">Actualizando...</span>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <!-- Métricas principales -->
                    <div class="metrics-row">
                        <div class="metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-box text-green-600"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value" id="totalProductos">-</div>
                                <div class="metric-label">Productos Activos</div>
                            </div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-warehouse text-blue-600"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value" id="totalStock">-</div>
                                <div class="metric-label">Total en Stock</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Gráfico y lista de productos -->
                    <div class="dashboard-grid">
                        <div class="chart-section">
                            <h4 class="section-title">Distribución por Categoría</h4>
                            <div class="chart-container">
                                <canvas id="categoryChart"></canvas>
                            </div>
                            <div id="noDataChart" class="no-data hidden">
                                <i class="fas fa-chart-pie text-gray-300 text-4xl"></i>
                                <p class="text-gray-500 mt-2">No hay datos disponibles</p>
                            </div>
                        </div>
                        
                        <div class="low-stock-section">
                            <h4 class="section-title">Productos con Menor Stock</h4>
                            <div class="low-stock-list" id="lowStockList">
                                <div class="loading-spinner">
                                    <i class="fas fa-spinner fa-spin text-gray-400"></i>
                                    <p class="text-gray-500 mt-2">Cargando productos...</p>
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
            const response = await fetch('/api/productos');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.data = await response.json();
            this.updateMetrics();
            this.updateChart();
            this.updateLowStockList();
            this.updateTimestamp();

        } catch (error) {
            console.error('Error loading inventory data:', error);
            this.showError('Error al cargar los datos de inventario');
        }
    }

    updateMetrics() {
        // Filtrar productos activos (no eliminados)
        const activeProducts = this.data.filter(product => !product.eliminado);

        // Calcular total de stock (suma de cantidadDisponible)
        const totalStock = activeProducts.reduce((sum, product) => {
            return sum + (product.cantidadDisponible || 0);
        }, 0);

        // Actualizar elementos del DOM
        document.getElementById('totalProductos').textContent = activeProducts.length;
        document.getElementById('totalStock').textContent = totalStock.toLocaleString();

        // Calcular valor total del inventario (opcional)
        const totalValue = activeProducts.reduce((sum, product) => {
            const stock = (product.cantidadDisponible || 0) + (product.cantidadAlmacen || 0);
            const price = product.precioCompra || 0;
            return sum + (stock * price);
        }, 0);
        document.getElementById('valorInventario').textContent = this.formatCurrency(totalValue);
    }

    updateChart() {
        const activeProducts = this.data.filter(product => !product.eliminado);

        if (activeProducts.length === 0) {
            this.showNoDataChart();
            return;
        }

        // Agrupar por categoría/tipo
        const categoryData = activeProducts.reduce((acc, product) => {
            const category = product.tipo || 'Sin Categoría';
            if (!acc[category]) {
                acc[category] = {
                    count: 0,
                    stock: 0
                };
            }
            acc[category].count++;
            acc[category].stock += (product.cantidadDisponible || 0);
            return acc;
        }, {});

        const categories = Object.keys(categoryData);
        const stockValues = categories.map(cat => categoryData[cat].stock);
        const colors = this.generateColors(categories.length);

        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        // Destruir gráfico anterior si existe
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: stockValues,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const category = context.label;
                                const stock = context.parsed;
                                const count = categoryData[category].count;
                                return `${category}: ${stock} unidades (${count} productos)`;
                            }
                        }
                    }
                }
            }
        });

        this.hideNoDataChart();
    }

    updateLowStockList() {
        const activeProducts = this.data.filter(product => !product.eliminado);

        // Ordenar por stock ascendente y tomar los primeros 5
        const lowStockProducts = activeProducts
            .sort((a, b) => (a.cantidadDisponible || 0) - (b.cantidadDisponible || 0))
            .slice(0, 5);

        const listContainer = document.getElementById('lowStockList');

        if (lowStockProducts.length === 0) {
            listContainer.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-check-circle text-green-400 text-3xl"></i>
                    <p class="text-gray-500 mt-2">Todos los productos tienen stock adecuado</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = lowStockProducts.map(product => {
            const stock = product.cantidadDisponible || 0;
            const stockClass = stock === 0 ? 'stock-zero' : stock <= 3 ? 'stock-critical' : 'stock-low';
            const stockIcon = stock === 0 ? 'fa-times-circle' : stock <= 3 ? 'fa-exclamation-triangle' : 'fa-exclamation-circle';

            return `
                <div class="low-stock-item">
                    <div class="product-info">
                        <div class="product-name">${product.nombre}</div>
                        <div class="product-category">${product.tipo || 'Sin categoría'}</div>
                    </div>
                    <div class="stock-info ${stockClass}">
                        <i class="fas ${stockIcon}"></i>
                        <span class="stock-value">${stock}</span>
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
        document.getElementById('lastUpdated').textContent = `Actualizado: ${timeString}`;
    }

    showNoDataChart() {
        document.getElementById('categoryChart').style.display = 'none';
        document.getElementById('noDataChart').classList.remove('hidden');
    }

    hideNoDataChart() {
        document.getElementById('categoryChart').style.display = 'block';
        document.getElementById('noDataChart').classList.add('hidden');
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="inventory-dashboard error-state">
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                    <p class="text-gray-700 mt-2">${message}</p>
                    <button onclick="location.reload()" class="retry-btn">
                        <i class="fas fa-redo"></i>
                        Reintentar
                    </button>
                </div>
            </div>
        `;
    }

    generateColors(count) {
        const colors = [
            '#3B82F6', // Blue
            '#10B981', // Green
            '#F59E0B', // Yellow
            '#EF4444', // Red
            '#8B5CF6', // Purple
            '#F97316', // Orange
            '#06B6D4', // Cyan
            '#84CC16', // Lime
            '#EC4899', // Pink
            '#6B7280'  // Gray
        ];

        // Si necesitamos más colores, generamos variaciones
        const result = [];
        for (let i = 0; i < count; i++) {
            if (i < colors.length) {
                result.push(colors[i]);
            } else {
                // Generar color aleatorio
                const hue = (i * 137.508) % 360; // Golden angle approximation
                result.push(`hsl(${hue}, 70%, 60%)`);
            }
        }

        return result;
    }

    startAutoRefresh() {
        // Refrescar cada 30 segundos
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 30000);
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
}

// Exportar para uso global
window.InventoryDashboard = InventoryDashboard;
