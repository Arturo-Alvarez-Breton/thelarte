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

    // Use the globally available TransactionWizard instance
    transactionWizardInstance = window.transactionWizard;

    // Load dashboard data if on the dashboard page
    if (initialUrl.includes('/pages/contabilidad/dashboard.html')) {
        loadDashboardData();
    }
});

async function loadDashboardData() {
    const estadoCajaContainer = document.getElementById('estadoCaja');

    if (!estadoCajaContainer) {
        console.warn('Dashboard containers not found. Skipping dashboard data load.');
        return;
    }

    // Show loading indicator
    estadoCajaContainer.innerHTML = '<div class="flex items-center justify-center py-12"><div class="animate-spin h-8 w-8 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';

    try {
        const dashboardData = await transaccionService.getDashboardData();
        console.log('Dashboard Data:', dashboardData);

        // Render Estado de Caja
        renderEstadoCaja(dashboardData.estadoCaja || {});

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        estadoCajaContainer.innerHTML = '<div class="text-center py-8"><p class="text-red-500">Error al cargar los datos del dashboard.</p><p class="text-gray-500 text-sm mt-2">Verifique su conexión e intente de nuevo.</p></div>';
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

