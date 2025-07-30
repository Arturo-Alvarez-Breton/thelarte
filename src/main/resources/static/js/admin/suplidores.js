// src/main/resources/static/js/contabilidad/suplidores.js

import { TransaccionService } from '../services/transaccionService.js';

class SuplidoresManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.suplidores = [];
        this.filteredSuplidores = [];
        this.currentPage = 0;
        this.suplidoresPerPage = 10;
        this.currentSuplidor = null;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadSuplidores();
    }

    setupEventListeners() {
        document.getElementById('nuevoSuplidorBtn')?.addEventListener('click', () => this.newSuplidor());
        document.getElementById('suplidorSearchInput')?.addEventListener('keyup', () => this.filterSuplidores());
        document.getElementById('formSuplidor')?.addEventListener('submit', (e) => this.handleSubmitSuplidor(e));
    }

    async loadSuplidores() {
        this.showLoading();
        try {
            const filters = {
                busqueda: document.getElementById('suplidorSearchInput')?.value || null,
                page: this.currentPage,
                size: this.suplidoresPerPage
            };
            this.suplidores = await this.transaccionService.getSuplidores(filters.busqueda, filters.page, filters.size);
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
                <p class="text-gray-600">RNC: ${suplidor.rnc || 'N/A'}</p>
                <p class="text-gray-600">Teléfono: ${suplidor.telefono || 'N/A'}</p>
                <p class="text-gray-600">Email: ${suplidor.email || 'N/A'}</p>
                <p class="text-gray-600">Contacto: ${suplidor.contacto || 'N/A'}</p>
                <div class="mt-4 flex space-x-2">
                    <button onclick="suplidoresManager.verSuplidor(${suplidor.id})" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Ver</button>
                    <button onclick="suplidoresManager.editSuplidor(${suplidor.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Editar</button>
                    <!-- Botón eliminar removido -->
                </div>
            </div>
        `).join('');
    }

    filterSuplidores() {
        this.currentPage = 0;
        this.loadSuplidores();
    }

    newSuplidor() {
        this.currentSuplidor = null;
        this.clearForm();
        document.getElementById('modalSuplidorTitle').textContent = 'Nuevo Suplidor';
        document.getElementById('btnSuplidorIcon').className = 'fas fa-plus mr-2';
        document.getElementById('btnSuplidorText').textContent = 'Crear Suplidor';
        document.getElementById('modalSuplidor').classList.remove('hidden');
    }

    async verSuplidor(id) {
        try {
            const suplidor = this.suplidores.find(s => s.id === id);
            if (!suplidor) {
                window.showToast('Suplidor no encontrado.', 'error');
                return;
            }

            document.getElementById('detallesSuplidor').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Nombre</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.nombre}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">RNC/Cédula</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.rnc || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.telefono || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.email || 'N/A'}</p>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Dirección</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.direccion || 'N/A'}</p>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Persona de Contacto</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.contacto || 'N/A'}</p>
                    </div>
                </div>
            `;
            
            this.currentSuplidor = suplidor;
            document.getElementById('modalVerSuplidor').classList.remove('hidden');
        } catch (error) {
            console.error('Error viewing supplier:', error);
            window.showToast('Error al mostrar los detalles del suplidor.', 'error');
        }
    }

    editSuplidor(id) {
        const suplidor = this.suplidores.find(s => s.id === id);
        if (!suplidor) {
            window.showToast('Suplidor no encontrado.', 'error');
            return;
        }

        this.currentSuplidor = suplidor;
        this.fillForm(suplidor);
        document.getElementById('modalSuplidorTitle').textContent = 'Editar Suplidor';
        document.getElementById('btnSuplidorIcon').className = 'fas fa-save mr-2';
        document.getElementById('btnSuplidorText').textContent = 'Actualizar Suplidor';
        document.getElementById('modalSuplidor').classList.remove('hidden');
    }

    // Método deleteSuplidor eliminado - no se permite eliminar suplidores

    async handleSubmitSuplidor(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const suplidorData = {
            nombre: formData.get('nombre'),
            rnc: formData.get('rnc'),
            telefono: formData.get('telefono'),
            email: formData.get('email'),
            direccion: formData.get('direccion'),
            contacto: formData.get('contacto')
        };

        try {
            if (this.currentSuplidor) {
                await this.transaccionService.updateSuplidor(this.currentSuplidor.id, suplidorData);
                window.showToast('Suplidor actualizado exitosamente.', 'success');
            } else {
                await this.transaccionService.createSuplidor(suplidorData);
                window.showToast('Suplidor creado exitosamente.', 'success');
            }
            
            this.cerrarModalSuplidor();
            this.loadSuplidores();
        } catch (error) {
            console.error('Error saving supplier:', error);
            window.showToast('Error al guardar el suplidor.', 'error');
        }
    }

    clearForm() {
        document.getElementById('formSuplidor').reset();
    }

    fillForm(suplidor) {
        document.getElementById('suplidorNombre').value = suplidor.nombre || '';
        document.getElementById('suplidorRnc').value = suplidor.rnc || '';
        document.getElementById('suplidorTelefono').value = suplidor.telefono || '';
        document.getElementById('suplidorEmail').value = suplidor.email || '';
        document.getElementById('suplidorDireccion').value = suplidor.direccion || '';
        document.getElementById('suplidorContacto').value = suplidor.contacto || '';
    }

    cerrarModalSuplidor() {
        document.getElementById('modalSuplidor').classList.add('hidden');
        this.clearForm();
        this.currentSuplidor = null;
    }

    cerrarModalVerSuplidor() {
        document.getElementById('modalVerSuplidor').classList.add('hidden');
        this.currentSuplidor = null;
    }

    editarSuplidorDesdeDetalle() {
        if (this.currentSuplidor) {
            this.cerrarModalVerSuplidor();
            this.editSuplidor(this.currentSuplidor.id);
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

// Funciones globales para los event handlers de los modales
window.cerrarModalSuplidor = () => suplidoresManager.cerrarModalSuplidor();
window.cerrarModalVerSuplidor = () => suplidoresManager.cerrarModalVerSuplidor();
window.editarSuplidorDesdeDetalle = () => suplidoresManager.editarSuplidorDesdeDetalle();
