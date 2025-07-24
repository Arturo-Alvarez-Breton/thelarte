// src/main/resources/static/js/contabilidad/config.js

import { TransaccionService } from '../services/transaccionService.js';

class ConfigManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.configuracion = {};
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadConfiguracion();
    }

    setupEventListeners() {
        document.getElementById('saveConfigBtn')?.addEventListener('click', () => this.saveConfiguracion());
    }

    async loadConfiguracion() {
        this.showLoading();
        try {
            this.configuracion = await this.transaccionService.getConfiguracionCaja();
            this.renderConfiguracion();
        } catch (error) {
            console.error('Error loading configuration:', error);
            window.showToast('Error al cargar la configuración.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderConfiguracion() {
        const container = document.getElementById('configuracionForm'); // Assuming a form or container for config
        if (!container) return;

        // Example: Render a simple input for a setting
        container.innerHTML = `
            <div class="mb-4">
                <label for="monedaPrincipal" class="block text-sm font-medium text-gray-700 mb-2">Moneda Principal:</label>
                <input type="text" id="monedaPrincipal" value="${this.configuracion.monedaPrincipal || 'DOP'}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
            </div>
            <div class="mb-4">
                <label for="tasaItbis" class="block text-sm font-medium text-gray-700 mb-2">Tasa ITBIS (%):</label>
                <input type="number" id="tasaItbis" value="${this.configuracion.tasaItbis || 18}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
            </div>
        `;
    }

    async saveConfiguracion() {
        this.showLoading();
        try {
            const updatedConfig = {
                monedaPrincipal: document.getElementById('monedaPrincipal')?.value,
                tasaItbis: parseFloat(document.getElementById('tasaItbis')?.value)
            };
            await this.transaccionService.actualizarConfiguracionCaja(updatedConfig);
            window.showToast('Configuración guardada exitosamente.', 'success');
        } catch (error) {
            console.error('Error saving configuration:', error);
            window.showToast('Error al guardar la configuración.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        document.getElementById('configuracionForm').innerHTML = '<div class="flex items-center justify-center py-12"><div class="animate-spin h-8 w-8 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';
    }

    hideLoading() {
        // Content replaces spinner, no explicit hide needed after render
    }
}

const configManager = new ConfigManager();
window.configManager = configManager;
