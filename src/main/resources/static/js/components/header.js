// src/main/resources/static/js/components/header.js

export const headerComponent = {
    updateTitleAndSubtitle: (url) => {
        const titleElement = document.getElementById('cont-header-title');
        const subtitleElement = document.getElementById('cont-header-subtitle');
        const quickActionsElement = document.getElementById('cont-quick-actions');

        if (!titleElement || !subtitleElement || !quickActionsElement) {
            console.warn('Header elements not found. Skipping title/subtitle/actions update.');
            return;
        }

        let title = 'Contabilidad';
        let subtitle = 'Gestión integral de transacciones y finanzas';
        let quickActionsHtml = '';

        if (url.includes('/dashboard')) {
            title = 'Dashboard';
            subtitle = 'Resumen general de la contabilidad';
            quickActionsHtml = `
                <button class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                    <i class="fas fa-sync-alt mr-2"></i>Actualizar Datos
                </button>
            `;
        } else if (url.includes('/transacciones')) {
            title = 'Transacciones';
            subtitle = 'Registro y seguimiento de movimientos';
            quickActionsHtml = `
                <button data-action="open-wizard" data-type="VENTA" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                    <i class="fas fa-plus mr-2"></i>Nueva Venta
                </button>
                <button data-action="open-wizard" data-type="COMPRA" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                    <i class="fas fa-shopping-cart mr-2"></i>Nueva Compra
                </button>
                <button data-action="open-wizard" data-type="DEVOLUCION" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                    <i class="fas fa-undo mr-2"></i>Devolución
                </button>
            `;
        } else if (url.includes('/productos')) {
            title = 'Productos';
            subtitle = 'Gestión de inventario y productos';
            quickActionsHtml = `
                <button class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                    <i class="fas fa-plus mr-2"></i>Nuevo Producto
                </button>
            `;
        } else if (url.includes('/clientes')) {
            title = 'Clientes';
            subtitle = 'Gestión de la base de datos de clientes';
            quickActionsHtml = `
                <button class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                    <i class="fas fa-user-plus mr-2"></i>Nuevo Cliente
                </button>
            `;
        } else if (url.includes('/suplidores')) {
            title = 'Suplidores';
            subtitle = 'Gestión de proveedores y suplidores';
            quickActionsHtml = `
                <button class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                    <i class="fas fa-plus mr-2"></i>Nuevo Suplidor
                </button>
            `;

        } else if (url.includes('/config')) {
            title = 'Configuración';
            subtitle = 'Ajustes generales del módulo de contabilidad';
            quickActionsHtml = `
                <button class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                    <i class="fas fa-save mr-2"></i>Guardar Cambios
                </button>
            `;
        } else if (url.includes('/index') || url === '/pages/contabilidad/' || url === '/pages/contabilidad') {
            title = 'Inicio Contabilidad';
            subtitle = 'Bienvenido al módulo de contabilidad';
            quickActionsHtml = `
                <button data-action="open-wizard" data-type="VENTA" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                    <i class="fas fa-plus mr-2"></i>Nueva Venta
                </button>
            `;
        }

        titleElement.textContent = title;
        subtitleElement.textContent = subtitle;
        quickActionsElement.innerHTML = quickActionsHtml;
    }
};