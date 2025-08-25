/**
 * Componente de Alertas de Stock
 * Muestra productos con bajo stock y sin stock con filtros avanzados
 */
class StockAlertsWidget {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.refreshInterval = null;
        this.data = [];
        this.filteredData = [];
        this.filters = {
            tipo: '',
            busqueda: '',
            estado: 'all' // all, low, zero
        };
        this.currentProduct = null;

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
            <div class="stock-alerts-widget">
                <div class="widget-header">
                    <h3 class="widget-title">
                        <i class="fas fa-exclamation-triangle text-yellow-500"></i>
                        Alertas de Stock
                    </h3>
                    <div class="widget-actions">
                        <div class="last-updated">
                            <i class="fas fa-sync-alt text-gray-400"></i>
                            <span id="stockAlertsLastUpdated">Actualizando...</span>
                        </div>
                    </div>
                </div>
                
                <div class="widget-content">
                    <!-- Métricas principales -->
                    <div class="alerts-metrics">
                        <div class="alert-metric critical">
                            <div class="metric-icon">
                                <i class="fas fa-times-circle text-red-500"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value" id="sinStockCount">0</div>
                                <div class="metric-label">Sin Stock</div>
                            </div>
                        </div>
                        
                        <div class="alert-metric warning">
                            <div class="metric-icon">
                                <i class="fas fa-exclamation-triangle text-yellow-500"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value" id="bajoStockCount">0</div>
                                <div class="metric-label">Bajo Stock</div>
                            </div>
                        </div>
                        
                        <div class="alert-metric info">
                            <div class="metric-icon">
                                <i class="fas fa-info-circle text-blue-500"></i>
                            </div>
                            <div class="metric-content">
                                <div class="metric-value" id="soloAlmacenCount">0</div>
                                <div class="metric-label">Solo en Almacen</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Filtros -->
                    <div class="alerts-filters">
                        <div class="filter-group">
                            <label for="stockFilterTipo" class="filter-label">Tipo de Producto</label>
                            <select id="stockFilterTipo" class="filter-select" onchange="stockAlerts.applyFilters()">
                                <option value="">Todos los tipos</option>
                                <option value="MUEBLE">Muebles</option>
                                <option value="MESA">Mesas</option>
                                <option value="SILLA">Sillas</option>
                                <option value="OTOMAN">Otomanes</option>
                                <option value="OTRO">Otros</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="stockFilterBusqueda" class="filter-label">Buscar Producto</label>
                            <input type="text" 
                                   id="stockFilterBusqueda" 
                                   class="filter-input" 
                                   placeholder="Buscar por nombre..."
                                   onkeyup="stockAlerts.applyFilters()">
                        </div>
                        
                        <div class="filter-group">
                            <label for="stockFilterEstado" class="filter-label">Estado de Stock</label>
                            <select id="stockFilterEstado" class="filter-select" onchange="stockAlerts.applyFilters()">
                                <option value="all">Todos los estados</option>
                                <option value="zero">Sin stock (0)</option>
                                <option value="low">Bajo stock (1-5)</option>
                                <option value="only_almacen">Solo en almacén</option>
                                <option value="only_tienda">Solo en tienda</option>
                                <option value="damaged">Con unidades dañadas</option>
                                <option value="reparacion">En reparación</option>
                                <option value="desbalanceado">Distribución desbalanceada</option>
                            </select>
                        </div>
                        
                        <div class="filter-actions">
                            <button onclick="stockAlerts.clearFilters()" class="clear-filters-btn">
                                <i class="fas fa-times"></i>
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                    
                    <!-- Lista de productos con alertas -->
                    <div class="alerts-list-container">
                        <div id="alertsList" class="alerts-list">
                            <div class="loading-spinner">
                                <i class="fas fa-spinner fa-spin text-gray-400"></i>
                                <p class="text-gray-500 mt-2">Cargando alertas...</p>
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

            const allProducts = await response.json();
            
            // Filtrar productos activos con algún tipo de alerta
            this.data = allProducts.filter(product => {
                if (product.eliminado) return false;

                const tienda = product.cantidadDisponible || 0;
                const almacen = product.cantidadAlmacen || 0;
                const dañados = product.cantidadDañados || 0;
                const enReparacion = product.cantidadReparacion || 0;
                const totalStock = tienda + almacen + dañados + enReparacion;

                // Incluir producto si:
                // - Tiene stock muy bajo en total
                // - Solo existe en almacén (nada en tienda)
                // - Tiene unidades dañadas
                // - Tiene unidades en reparación
                // - Tiene distribución desequilibrada (más del 80% en un solo lugar)

                return totalStock <= 5 || // Stock muy bajo
                       (tienda === 0 && almacen > 0) || // Solo en almacén
                       dañados > 0 || // Productos dañados
                       enReparacion > 0 || // Productos en reparación
                       (tienda > 0 && tienda / totalStock > 0.8) || // Mayoría en tienda
                       (almacen > 0 && almacen / totalStock > 0.8); // Mayoría en almacén
            });

            this.filteredData = [...this.data];
            this.updateMetrics();
            this.applyFilters();
            this.updateTimestamp();

        } catch (error) {
            console.error('Error loading stock alerts data:', error);
            this.showError('Error al cargar las alertas de stock');
        }
    }

    updateMetrics() {
        const sinStock = this.data.filter(product => {
            const totalStock = (product.cantidadDisponible || 0) + (product.cantidadAlmacen || 0);
            return totalStock === 0;
        }).length;

        const bajoStock = this.data.filter(product => {
            const totalStock = (product.cantidadDisponible || 0) + (product.cantidadAlmacen || 0);
            return totalStock > 0 && totalStock <= 5;
        }).length;

        // Solo en almacen: productos con cantidadDisponible == 0 y cantidadAlmacen > 0
        const soloAlmacen = this.data.filter(product => (product.cantidadDisponible === 0 || !product.cantidadDisponible) && product.cantidadAlmacen > 0).length;

        document.getElementById('sinStockCount').textContent = sinStock;
        document.getElementById('bajoStockCount').textContent = bajoStock;
        document.getElementById('soloAlmacenCount').textContent = soloAlmacen;
    }

    applyFilters() {
        // Obtener valores de filtros
        const tipo = document.getElementById('stockFilterTipo')?.value || '';
        const busqueda = document.getElementById('stockFilterBusqueda')?.value.toLowerCase() || '';
        const estado = document.getElementById('stockFilterEstado')?.value || 'all';

        this.filters = { tipo, busqueda, estado };

        // Aplicar filtros
        this.filteredData = this.data.filter(product => {
            const totalStock = (product.cantidadDisponible || 0) + (product.cantidadAlmacen || 0);
            
            // Filtro por tipo
            if (tipo && product.tipo !== tipo) return false;
            
            // Filtro por búsqueda
            if (busqueda && !product.nombre.toLowerCase().includes(busqueda)) return false;
            
            // Filtro por estado de stock
            if (estado === 'zero' && totalStock > 0) return false;
            if (estado === 'low' && (totalStock === 0 || totalStock > 5)) return false;
            if (estado === 'only_almacen' && (product.cantidadAlmacen === 0 || product.cantidadDisponible > 0)) return false;
            if (estado === 'only_tienda' && (product.cantidadDisponible === 0 || product.cantidadAlmacen > 0)) return false;
            if (estado === 'damaged' && product.cantidadDañados === 0) return false;
            if (estado === 'reparacion' && product.cantidadReparacion === 0) return false;
            if (estado === 'desbalanceado' && (product.cantidadDisponible / totalStock > 0.8 && product.cantidadAlmacen / totalStock > 0.8)) return false;

            return true;
        });

        this.renderAlertsList();
    }

    renderAlertsList() {
        const listContainer = document.getElementById('alertsList');

        if (this.filteredData.length === 0) {
            listContainer.innerHTML = `
                <div class="no-alerts">
                    <i class="fas fa-check-circle text-green-400 text-4xl mb-3"></i>
                    <h4 class="text-lg font-semibold text-gray-700 mb-2">¡Excelente!</h4>
                    <p class="text-gray-500">No hay alertas de stock con los filtros actuales</p>
                </div>
            `;
            return;
        }

        // Ordenar por prioridad de alerta y luego por stock total
        const sortedData = this.filteredData.sort((a, b) => {
            // Productos sin stock tienen prioridad máxima
            const stockA = (a.cantidadDisponible || 0) + (a.cantidadAlmacen || 0);
            const stockB = (b.cantidadDisponible || 0) + (b.cantidadAlmacen || 0);

            // Primero ordenar por stock total
            if (stockA === 0 && stockB > 0) return -1;
            if (stockB === 0 && stockA > 0) return 1;

            // Productos con unidades dañadas tienen segunda prioridad
            const dañadosA = a.cantidadDañados || 0;
            const dañadosB = b.cantidadDañados || 0;
            if (dañadosA > 0 && dañadosB === 0) return -1;
            if (dañadosB > 0 && dañadosA === 0) return 1;

            // Luego productos en reparación
            const reparacionA = a.cantidadReparacion || 0;
            const reparacionB = b.cantidadReparacion || 0;
            if (reparacionA > 0 && reparacionB === 0) return -1;
            if (reparacionB > 0 && reparacionA === 0) return 1;

            // Finalmente por stock total (menor primero)
            return stockA - stockB;
        });

        listContainer.innerHTML = sortedData.map(product => {
            const stockDisponible = product.cantidadDisponible || 0;
            const stockAlmacen = product.cantidadAlmacen || 0;
            const dañados = product.cantidadDañados || 0;
            const enReparacion = product.cantidadReparacion || 0;
            const totalStock = stockDisponible + stockAlmacen + dañados + enReparacion;
            const totalUtilizable = stockDisponible + stockAlmacen;

            // Determinar tipo de alerta
            let alertLevel, alertIcon, alertColor, statusText;

            if (totalUtilizable === 0) {
                alertLevel = 'critical';
                alertIcon = 'fa-times-circle';
                alertColor = 'text-red-500';
                statusText = 'Sin Stock';
            } else if (dañados > 0) {
                alertLevel = 'damaged';
                alertIcon = 'fa-tools';
                alertColor = 'text-orange-500';
                statusText = 'Con Daños';
            } else if (enReparacion > 0) {
                alertLevel = 'repair';
                alertIcon = 'fa-wrench';
                alertColor = 'text-blue-500';
                statusText = 'En Reparación';
            } else if (stockDisponible === 0 && stockAlmacen > 0) {
                alertLevel = 'warehouse';
                alertIcon = 'fa-warehouse';
                alertColor = 'text-purple-500';
                statusText = 'Solo en Almacén';
            } else if (stockAlmacen === 0 && stockDisponible > 0) {
                alertLevel = 'store';
                alertIcon = 'fa-store';
                alertColor = 'text-indigo-500';
                statusText = 'Solo en Tienda';
            } else if (totalUtilizable <= 5) {
                alertLevel = 'warning';
                alertIcon = 'fa-exclamation-triangle';
                alertColor = 'text-yellow-500';
                statusText = 'Bajo Stock';
            } else if ((stockDisponible / totalStock > 0.8) || (stockAlmacen / totalStock > 0.8)) {
                alertLevel = 'unbalanced';
                alertIcon = 'fa-balance-scale';
                alertColor = 'text-teal-500';
                statusText = 'Distribución Desbalanceada';
            } else {
                alertLevel = 'warning';
                alertIcon = 'fa-exclamation-triangle';
                alertColor = 'text-yellow-500';
                statusText = 'Bajo Stock';
            }

            return `
                <div class="alert-item ${alertLevel} hover:shadow-lg hover:border-gray-300 transform transition-all duration-300 hover:-translate-y-1">
                    <div class="alert-icon">
                        <i class="fas ${alertIcon} ${alertColor}"></i>
                    </div>
                    <div class="alert-content">
                        <div class="product-main-info">
                            <h4 class="product-name">${product.nombre}</h4>
                            <div class="product-meta">
                                <span class="product-type">${this.formatProductType(product.tipo)}</span>
                                <span class="product-code">${product.codigo || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="stock-details">
                            <div class="stock-breakdown">
                                <div class="stock-item">
                                    <span class="stock-label">Tienda:</span>
                                    <span class="stock-value ${stockDisponible === 0 ? 'zero' : 'available'}">${stockDisponible}</span>
                                </div>
                                <div class="stock-item">
                                    <span class="stock-label">Almacén:</span>
                                    <span class="stock-value ${stockAlmacen === 0 ? 'zero' : 'available'}">${stockAlmacen}</span>
                                </div>
                            </div>
                            ${dañados > 0 || enReparacion > 0 ? `
                                <div class="stock-breakdown mt-1">
                                    ${dañados > 0 ? `
                                        <div class="stock-item">
                                            <span class="stock-label">Dañados:</span>
                                            <span class="stock-value damaged">${dañados}</span>
                                        </div>
                                    ` : ''}
                                    ${enReparacion > 0 ? `
                                        <div class="stock-item">
                                            <span class="stock-label">Reparando:</span>
                                            <span class="stock-value repairing">${enReparacion}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                            <div class="total-stock mt-1">
                                <span class="total-label">Total Utilizable:</span>
                                <span class="total-value ${totalUtilizable === 0 ? 'zero' : totalUtilizable <= 3 ? 'critical' : 'low'}">${totalUtilizable}</span>
                            </div>
                        </div>
                    </div>
                    <div class="alert-status">
                        <span class="status-badge ${alertLevel}">
                            ${statusText}
                        </span>
                        <div class="alert-actions">
                            <button onclick="stockAlerts.viewProduct('${product.id}')" class="action-btn view" title="Ver producto">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    clearFilters() {
        document.getElementById('stockFilterTipo').value = '';
        document.getElementById('stockFilterBusqueda').value = '';
        document.getElementById('stockFilterEstado').value = 'all';
        
        this.filters = { tipo: '', busqueda: '', estado: 'all' };
        this.applyFilters();
    }

    viewProduct(productId) {
        const product = this.data.find(p => p.id == productId);
        if (!product) {
            window.showToast?.('Producto no encontrado', 'error') ||
            alert('Producto no encontrado');
            return;
        }

        this.currentProduct = product;
        this.openProductModal();
    }

    openProductModal() {
        if (!this.currentProduct) return;

        const product = this.currentProduct;

        // Preparar los datos en el modal
        document.getElementById('detalleProductoImg').src = product.fotoUrl || '/images/product-placeholder.png';
        document.getElementById('detalleProductoNombre').textContent = product.nombre || 'Sin nombre';
        document.getElementById('detalleProductoTipo').textContent = this.formatProductType(product.tipo) || 'N/A';
        document.getElementById('detalleProductoDescripcion').textContent = product.descripcion || 'Sin descripción';

        // Formatear precios
        const precioVenta = product.precioVenta ?
            `$${parseFloat(product.precioVenta).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` :
            '$0.00';

        const precioCompra = product.precioCompra ?
            `$${parseFloat(product.precioCompra).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` :
            '$0.00';

        document.getElementById('detalleProductoPrecioVenta').textContent = precioVenta;
        document.getElementById('detalleProductoPrecioCompra').textContent = precioCompra;

        // Actualizar el botón para ir a editar
        const editBtn = document.querySelector('#modalVerProducto button[onclick^="stockAlerts.viewProductInAdmin"]');
        if (editBtn) {
            editBtn.setAttribute('onclick', `stockAlerts.viewProductInAdmin('${product.id}')`);
        }

        // Mostrar el modal
        document.getElementById('modalVerProducto').classList.remove('hidden');

        // Bloquear scroll de fondo
        document.body.style.overflow = 'hidden';
    }

    closeProductModal() {
        document.getElementById('modalVerProducto').classList.add('hidden');
        document.body.style.overflow = '';
        this.currentProduct = null;
    }

    viewProductInAdmin(productId) {
        window.location.href = `/pages/admin/productos.html?id=${productId}`;
    }

    updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('stockAlertsLastUpdated').textContent = `${timeString}`;
    }

    showError(message) {
        const listContainer = document.getElementById('alertsList');
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                    <p class="text-gray-700 mt-2">${message}</p>
                    <button onclick="stockAlerts.loadData()" class="retry-btn">
                        <i class="fas fa-redo"></i>
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    startAutoRefresh() {
        // Refrescar cada 2 minutos
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 120000);
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

    refresh() {
        this.loadData();
    }

    // Utility functions
    formatProductType(tipo) {
        const types = {
            'MUEBLE': 'Mueble',
            'MESA': 'Mesa',
            'SILLA': 'Silla',
            'OTOMAN': 'Otomán',
            'OTRO': 'Otro'
        };
        return types[tipo] || tipo;
    }
}

// Exportar para uso global
window.StockAlertsWidget = StockAlertsWidget;
