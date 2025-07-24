// src/main/resources/static/js/contabilidad/main.js

import { setupContabilidadNavigation } from './contabilidad-router.js';
import { sidebarComponent } from '../components/sidebar.js';
import { headerComponent } from '../components/header.js';
import { TransactionWizard } from '../components/transactionWizard.js';
import { TransaccionService } from '../services/transaccionService.js';

// Global instance of the TransactionWizard and TransaccionService
let transactionWizardInstance;
const transaccionService = new TransaccionService();

document.addEventListener('DOMContentLoaded', function() {
    // Setup dynamic navigation for contabilidad module
    setupContabilidadNavigation();

    // Initial highlight and header update based on current URL
    const initialUrl = window.location.pathname;
    sidebarComponent.highlightCurrentPage(initialUrl);
    headerComponent.updateTitleAndSubtitle(initialUrl);

    // Initialize TransactionWizard
    transactionWizardInstance = new TransactionWizard();

    // Expose wizard functions globally for HTML onclick attributes
    window.openTransactionWizard = (type) => transactionWizardInstance.open(type);
    window.closeTransactionWizard = () => transactionWizardInstance.close();
    window.wizardNextStep = () => transactionWizardInstance.nextStep();
    window.wizardPrevStep = () => transactionWizardInstance.prevStep();

    // Load dashboard data if on the dashboard page
    if (initialUrl.includes('/pages/contabilidad/dashboard.html')) {
        loadDashboardData();
    }
});

async function loadDashboardData() {
    const statisticsContainer = document.getElementById('statisticsContainer');
    const transaccionesRecientesContainer = document.getElementById('transaccionesRecientes');
    const productosMasVendidosContainer = document.getElementById('productosMasVendidos');

    if (!statisticsContainer || !transaccionesRecientesContainer || !productosMasVendidosContainer) {
        console.warn('Dashboard containers not found. Skipping dashboard data load.');
        return;
    }

    // Show loading indicators
    statisticsContainer.innerHTML = '<div class="flex items-center justify-center py-12"><div class="animate-spin h-8 w-8 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';
    transaccionesRecientesContainer.innerHTML = '<div class="flex items-center justify-center py-8"><div class="animate-spin h-6 w-6 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';
    productosMasVendidosContainer.innerHTML = '<div class="flex items-center justify-center py-8"><div class="animate-spin h-6 w-6 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';

    try {
        const dashboardData = await transaccionService.getDashboardData();
        console.log('Dashboard Data:', dashboardData);

        // Render Estado de Caja
        renderEstadoCaja(dashboardData.estadoCaja);

        // Render Resumen del Día
        renderResumenDelDia(dashboardData.resumenDelDia);

        // Render Transacciones Recientes
        renderTransaccionesRecientes(dashboardData.transaccionesRecientes);

        // Render Productos Más Vendidos
        renderProductosMasVendidos(dashboardData.productosMasVendidos);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        statisticsContainer.innerHTML = '<p class="text-red-500">Error al cargar los datos del dashboard.</p>';
        transaccionesRecientesContainer.innerHTML = '<p class="text-red-500">Error al cargar las transacciones recientes.</p>';
        productosMasVendidosContainer.innerHTML = '<p class="text-red-500">Error al cargar los productos más vendidos.</p>';
    }
}

function renderEstadoCaja(estadoCaja) {
    const container = document.getElementById('estadoCaja');
    if (!container) return;

    if (!estadoCaja || !estadoCaja.cajaAbierta) {
        container.innerHTML = '<p class="text-gray-600">No hay caja abierta actualmente.</p>';
        return;
    }

    container.innerHTML = `
        <div class="bg-blue-100 p-4 rounded-lg shadow-sm">
            <p class="text-sm text-blue-700">Caja Abierta</p>
            <p class="text-lg font-bold text-blue-900">${formatCurrency(estadoCaja.montoInicialCaja)}</p>
            <p class="text-xs text-blue-600">Monto Inicial</p>
        </div>
        <div class="bg-green-100 p-4 rounded-lg shadow-sm">
            <p class="text-sm text-green-700">Ventas Efectivo</p>
            <p class="text-lg font-bold text-green-900">${formatCurrency(estadoCaja.totalVentasEfectivo)}</p>
            <p class="text-xs text-green-600">Hoy</p>
        </div>
        <div class="bg-purple-100 p-4 rounded-lg shadow-sm">
            <p class="text-sm text-purple-700">Ventas Tarjeta</p>
            <p class="text-lg font-bold text-purple-900">${formatCurrency(estadoCaja.totalVentasTarjeta)}</p>
            <p class="text-xs text-purple-600">Hoy</p>
        </div>
        <div class="bg-yellow-100 p-4 rounded-lg shadow-sm">
            <p class="text-sm text-yellow-700">Efectivo en Caja</p>
            <p class="text-lg font-bold text-yellow-900">${formatCurrency(estadoCaja.totalEfectivoEnCaja)}</p>
            <p class="text-xs text-yellow-600">Estimado</p>
        </div>
    `;
}

function renderResumenDelDia(resumen) {
    const container = document.getElementById('resumenDelDia');
    if (!container) return;

    if (!resumen) {
        container.innerHTML = '<p class="text-gray-600">No hay resumen del día disponible.</p>';
        return;
    }

    container.innerHTML = `
        <div class="bg-gray-100 p-4 rounded-lg shadow-sm">
            <p class="text-sm text-gray-700">Total Transacciones</p>
            <p class="text-lg font-bold text-gray-900">${resumen.totalTransacciones}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-sm">
            <p class="text-sm text-gray-700">Total Ventas</p>
            <p class="text-lg font-bold text-gray-900">${formatCurrency(resumen.totalVentas)}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-sm">
            <p class="text-sm text-gray-700">Ventas Netas</p>
            <p class="text-lg font-bold text-gray-900">${formatCurrency(resumen.ventasNetas)}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow-sm">
            <p class="text-sm text-gray-700">Clientes Atendidos</p>
            <p class="text-lg font-bold text-gray-900">${resumen.clientesAtendidos}</p>
        </div>
    `;
}

function renderTransaccionesRecientes(transacciones) {
    const container = document.getElementById('transaccionesRecientes');
    if (!container) return;

    if (!transacciones || transacciones.length === 0) {
        container.innerHTML = '<p class="text-gray-600">No hay transacciones recientes.</p>';
        return;
    }

    container.innerHTML = transacciones.map(t => `
        <div class="border-b border-gray-200 pb-2 mb-2 last:border-b-0">
            <p class="text-sm font-medium">#${t.numeroFactura || t.id} - ${t.clienteNombre}</p>
            <p class="text-xs text-gray-600">${formatDate(t.fecha)} - ${formatCurrency(t.total)} (${t.metodoPago})</p>
        </div>
    `).join('');
}

function renderProductosMasVendidos(productos) {
    const container = document.getElementById('productosMasVendidos');
    if (!container) return;

    if (!productos || productos.length === 0) {
        container.innerHTML = '<p class="text-gray-600">No hay productos más vendidos.</p>';
        return;
    }

    container.innerHTML = productos.map(p => `
        <div class="border-b border-gray-200 pb-2 mb-2 last:border-b-0">
            <p class="text-sm font-medium">${p.nombreProducto}</p>
            <p class="text-xs text-gray-600">Vendidos: ${p.cantidadVendida} - ${formatCurrency(p.totalVendido)}</p>
        </div>
    `).join('');
}

function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}
