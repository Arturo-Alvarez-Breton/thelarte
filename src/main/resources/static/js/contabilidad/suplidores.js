// src/main/resources/static/js/contabilidad/suplidores.js

import { TransaccionService } from '../services/transaccionService.js';

class SuplidoresManager {
    constructor() {
        this.transaccionService = new TransaccionService(); // Reusing for now, assuming a dedicated service might be needed later
        this.suplidores = [];
        this.filteredSuplidores = [];
        this.currentPage = 0;
        this.suplidoresPerPage = 10;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadSuplidores();
    }

    setupEventListeners() {
        document.getElementById('nuevoSuplidorBtn')?.addEventListener('click', () => this.newSuplidor());
        document.getElementById('suplidorSearchInput')?.addEventListener('keyup', () => this.filterSuplidores());
    }

    async loadSuplidores() {
        this.showLoading();
        try {
            // NOTE: There is no direct API for suppliers in CajeroController.java
            // This part will use mock data or require a new backend API.
            // For now, simulating a delay and returning mock data.
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay

            const mockSuplidores = [
                { id: 1, nombre: 'Suplidor A S.R.L.', rnc: '123-45678-9', contacto: 'Pedro Martínez', telefono: '809-987-6543' },
                { id: 2, nombre: 'Distribuidora B', rnc: '987-65432-1', contacto: 'Ana Sánchez', telefono: '809-111-2222' },
                { id: 3, nombre: 'Importadora C', rnc: '111-22233-4', contacto: 'Luis García', telefono: '809-555-6666' },
            ];

            const searchTerm = document.getElementById('suplidorSearchInput')?.value.toLowerCase() || '';
            this.suplidores = mockSuplidores.filter(s => 
                s.nombre.toLowerCase().includes(searchTerm) || 
                s.rnc.toLowerCase().includes(searchTerm) ||
                s.contacto.toLowerCase().includes(searchTerm)
            );
            this.filteredSuplidores = [...this.suplidores];
            this.renderSuplidores();
        } catch (error) {
            console.error('Error loading suppliers:', error);
            window.showToast('Error al cargar los suplidores.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderSuplidores() {
        const container = document.getElementById('suplidoresListContainer');
        if (!container) return;

        if (this.filteredSuplidores.length === 0) {
            container.innerHTML = '<p class="text-gray-600">No hay suplidores disponibles.</p>';
            return;
        }

        container.innerHTML = this.filteredSuplidores.map(suplidor => `
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold">${suplidor.nombre}</h3>
                <p class="text-gray-600">RNC: ${suplidor.rnc}</p>
                <p class="text-gray-600">Contacto: ${suplidor.contacto}</p>
                <p class="text-gray-600">Teléfono: ${suplidor.telefono}</p>
                <div class="mt-4 flex space-x-2">
                    <button onclick="suplidoresManager.editSuplidor(${suplidor.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Editar</button>
                    <button onclick="suplidoresManager.deleteSuplidor(${suplidor.id})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    filterSuplidores() {
        this.currentPage = 0;
        this.loadSuplidores();
    }

    newSuplidor() {
        window.showToast('Funcionalidad para añadir nuevo suplidor en desarrollo.', 'info');
    }

    editSuplidor(id) {
        window.showToast(`Funcionalidad para editar suplidor ${id} en desarrollo.`, 'info');
    }

    async deleteSuplidor(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este suplidor?')) {
            try {
                // Assuming a deleteSuplidor method exists in a service
                // await this.transaccionService.deleteSuplidor(id);
                window.showToast('Suplidor eliminado exitosamente (simulado).', 'success');
                this.loadSuplidores();
            } catch (error) {
                console.error('Error deleting supplier:', error);
                window.showToast('Error al eliminar el suplidor.', 'error');
            }
        }
    }

    showLoading() {
        document.getElementById('suplidoresListContainer').innerHTML = '<div class="flex items-center justify-center py-12"><div class="animate-spin h-8 w-8 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';
    }

    hideLoading() {
        // No specific hide loading for now, as content replaces spinner
    }
}

const suplidoresManager = new SuplidoresManager();
window.suplidoresManager = suplidoresManager;
