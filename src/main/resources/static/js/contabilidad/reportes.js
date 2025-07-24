// src/main/resources/static/js/contabilidad/reportes.js

import { TransaccionService } from '../services/transaccionService.js';

class ReportesManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadDailySalesReport();
        await this.loadTopSellingProducts();
    }

    setupEventListeners() {
        document.getElementById('exportReportBtn')?.addEventListener('click', () => this.exportReport());
        document.getElementById('dailyReportDate')?.addEventListener('change', () => this.loadDailySalesReport());
        document.getElementById('topSellingDateFrom')?.addEventListener('change', () => this.loadTopSellingProducts());
        document.getElementById('topSellingDateTo')?.addEventListener('change', () => this.loadTopSellingProducts());
    }

    async loadDailySalesReport() {
        const reportDate = document.getElementById('dailyReportDate')?.value;
        const container = document.getElementById('dailySalesReportContainer');
        if (!container) return;

        container.innerHTML = '<div class="flex items-center justify-center py-8"><div class="animate-spin h-6 w-6 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';

        try {
            const report = await this.transaccionService.getReporteVentasDelDia(reportDate);
            container.innerHTML = `
                <p>Fecha: <strong>${report.fecha}</strong></p>
                <p>Total Transacciones: <strong>${report.totalTransacciones}</strong></p>
                <p>Total Ventas: <strong>${this.formatCurrency(report.totalVentas)}</strong></p>
            `;
        } catch (error) {
            console.error('Error loading daily sales report:', error);
            container.innerHTML = '<p class="text-red-500">Error al cargar el reporte de ventas diarias.</p>';
        }
    }

    async loadTopSellingProducts() {
        const dateFrom = document.getElementById('topSellingDateFrom')?.value;
        const dateTo = document.getElementById('topSellingDateTo')?.value;
        const container = document.getElementById('topSellingProductsContainer');
        if (!container) return;

        container.innerHTML = '<div class="flex items-center justify-center py-8"><div class="animate-spin h-6 w-6 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';

        try {
            const products = await this.transaccionService.getProductosMasVendidos(dateFrom, dateTo, 5); // Limit to 5
            if (products.length === 0) {
                container.innerHTML = '<p class="text-gray-600">No hay productos más vendidos en el período seleccionado.</p>';
                return;
            }
            container.innerHTML = products.map(p => `
                <div class="border-b border-gray-200 pb-2 mb-2 last:border-b-0">
                    <p class="text-sm font-medium">${p.nombreProducto}</p>
                    <p class="text-xs text-gray-600">Vendidos: ${p.cantidadVendida} - ${this.formatCurrency(p.totalVendido)}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading top selling products:', error);
            container.innerHTML = '<p class="text-red-500">Error al cargar los productos más vendidos.</p>';
        }
    }

    exportReport() {
        window.showToast('Exportando reporte... (funcionalidad en desarrollo)', 'info');
    }

    formatCurrency(amount) {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
            minimumFractionDigits: 2
        }).format(amount);
    }
}

const reportesManager = new ReportesManager();
window.reportesManager = reportesManager;
