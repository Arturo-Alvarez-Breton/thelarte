// src/main/resources/static/js/contabilidad/suplidores.js

import { TransaccionService } from '../services/transaccionService.js';
import { TableViewManager } from '../components/tableView.js';

class SuplidoresManager {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.suplidores = [];
        this.filteredSuplidores = [];
        this.currentPage = 0;
        this.suplidoresPerPage = 15; // Increased from 10 to 15 like clients
        this.totalPages = 1;
        this.totalSuplidores = 0;
        this.currentSuplidor = null;
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        // Geo cache
        this.countries = [];
        this.citiesByIso2 = new Map();

        // Tel input instances
        this.telInputs = new Map(); // Map<HTMLInputElement, intlTelInputInstance>

        // Initialize table view manager with responsive columns
        this.tableViewManager = new TableViewManager('#suplidoresListContainer', {
            columns: this.getResponsiveColumns(),
            actions: [
                {
                    icon: 'fas fa-eye',
                    handler: 'suplidoresManager.verSuplidor',
                    className: 'text-brand-brown hover:text-brand-light-brown',
                    title: 'Ver detalles'
                },
                {
                    icon: 'fas fa-edit',
                    handler: 'suplidoresManager.editSuplidor',
                    className: 'text-green-600 hover:text-green-700',
                    title: 'Editar'
                },
                {
                    icon: 'fas fa-trash-alt',
                    handler: 'suplidoresManager.deleteSuplidor',
                    className: 'text-red-600 hover:text-red-700',
                    title: 'Eliminar'
                }
            ],
            searchFields: ['nombre', 'ciudad', 'pais', 'email', 'rNC'],
            idField: 'id',
            emptyIcon: 'fas fa-truck'
        });

        this.init();
    }

    getResponsiveColumns() {
        const isVerticalScreen = window.innerHeight > window.innerWidth;

        if (isVerticalScreen || this.isMobile) {
            // Vertical screen or mobile: only show name and location
            return [
                {
                    header: 'Suplidor',
                    field: 'nombre',
                    formatter: (value, item) => {
                        const ubicacion = [item.ciudad, item.pais].filter(Boolean).join(', ') || 'N/A';
                        return `${value}<br><small class="text-gray-500">${ubicacion}</small>`;
                    }
                }
            ];
        } else {
            // Horizontal screen: show all info
            return [
                { header: 'Nombre', field: 'nombre' },
                {
                    header: 'Ubicación',
                    field: 'ciudad',
                    formatter: (value, item) => {
                        return [item.ciudad, item.pais].filter(Boolean).join(', ') || 'N/A';
                    }
                },
                { header: 'RNC', field: 'rNC', formatter: (value) => value || 'N/A' },
                { header: 'Email', field: 'email', formatter: (value) => value || 'N/A' },
                {
                    header: 'Teléfono',
                    field: 'telefonos',
                    formatter: (value) => {
                        if (value && Array.isArray(value) && value.length > 0) {
                            return value[0];
                        }
                        return 'N/A';
                    }
                }
            ];
        }
    }

    async init() {
        this.setupEventListeners();
        this.setupResponsiveHandlers();
        await this.loadCountries();
        await this.loadSuplidores();
    }

    setupEventListeners() {
        document.getElementById('nuevoSuplidorBtn')?.addEventListener('click', () => this.newSuplidor());
        document.getElementById('suplidorSearchInput')?.addEventListener('input', () => this.filterSuplidores());
        document.getElementById('formSuplidor')?.addEventListener('submit', (e) => this.handleSubmitSuplidor(e));

        document.getElementById('suplidoresListContainer')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            if (btn.classList.contains('ver-btn')) {
                const id = btn.dataset.id;
                this.verSuplidor(id);
            } else if (btn.classList.contains('edit-btn')) {
                const id = btn.dataset.id;
                this.editSuplidor(id);
            } else if (btn.classList.contains('delete-btn')) {
                const id = btn.dataset.id;
                this.deleteSuplidor(id);
            }
        });

        document.getElementById('btnEditarDesdeDetalle')?.addEventListener('click', () => this.editarSuplidorDesdeDetalle());

        // País -> Carga ciudades + actualiza formato telefónico
        document.getElementById('suplidorPaisSelect')?.addEventListener('change', async (e) => {
            const iso2 = e.target.value;
            await this.populateCities(iso2);
            this.updateAllTelInputsCountry(iso2 || 'DO');
        });

        window.cerrarModalSuplidor = () => this.cerrarModalSuplidor();
        window.cerrarModalVerSuplidor = () => this.cerrarModalVerSuplidor();
        window.agregarTelefono = () => {
            const container = document.getElementById('telefonosContainer');
            const iso2 = document.getElementById('suplidorPaisSelect')?.value || 'DO';

            const wrapper = document.createElement('div');
            wrapper.className = 'flex items-center gap-2 mb-2';

            const input = document.createElement('input');
            input.type = 'tel';
            input.placeholder = 'Ej: +1-809-123-4567';
            input.className = 'flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown telefono-input';

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = () => {
                this.destroyTelInput(input);
                wrapper.remove();
            };

            wrapper.appendChild(input);
            wrapper.appendChild(deleteBtn);
            container.appendChild(wrapper);

            this.initTelInput(input, iso2);
        };
        window.eliminarTelefono = (button) => this.eliminarTelefono(button);
    }

    setupResponsiveHandlers() {
        // Mobile sidebar controls
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const closeSidebarBtn = document.getElementById('closeSidebarBtn');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const sidebar = document.getElementById('sidebar');

        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => this.toggleMobileSidebar());
        }

        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => this.closeMobileSidebar());
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => this.closeMobileSidebar());
        }

        // Handle window resize
        window.addEventListener('resize', () => this.handleWindowResize());

        // Handle escape key for sidebar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !sidebar.classList.contains('-translate-x-full')) {
                this.closeMobileSidebar();
            }
        });
    }

    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');

        // Prevent body scroll when sidebar is open
        document.body.classList.toggle('overflow-hidden', !sidebar.classList.contains('-translate-x-full'));
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }

    handleWindowResize() {
        const wasTablet = this.isTablet;
        const wasMobile = this.isMobile;

        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        // Close mobile sidebar on desktop resize
        if (window.innerWidth >= 1024) {
            this.closeMobileSidebar();
        }

        // Update table columns based on screen orientation
        this.tableViewManager.updateColumns(this.getResponsiveColumns());

        // Re-render suppliers if breakpoint changed significantly
        if ((wasMobile !== this.isMobile) || (wasTablet !== this.isTablet)) {
            this.renderSuplidores();
        }
    }

    // ---------------- GEO ----------------

    async loadCountries() {
        try {
            const res = await fetch('/api/geo/countries');
            this.countries = await res.json();
            const sel = document.getElementById('suplidorPaisSelect');
            if (!sel) return;
            sel.innerHTML = '<option value="">Seleccione un país...</option>' + this.countries
                .map(c => `<option value="${c.iso2}">${c.name}</option>`)
                .join('');
        } catch (e) {
            console.error('Error cargando países:', e);
            window.showToast?.('No se pudieron cargar los países.', 'error');
        }
    }

    async populateCities(iso2, preselectCity = '') {
        const citySelect = document.getElementById('suplidorCiudadSelect');
        if (!citySelect) return;

        if (!iso2) {
            citySelect.disabled = true;
            citySelect.innerHTML = '<option value="">Seleccione un país primero...</option>';
            return;
        }

        citySelect.disabled = true;
        citySelect.innerHTML = '<option value="">Cargando ciudades...</option>';

        try {
            let cities = this.citiesByIso2.get(iso2);
            if (!cities) {
                const res = await fetch(`/api/geo/countries/${encodeURIComponent(iso2)}/cities`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                cities = await res.json();
                this.citiesByIso2.set(iso2, cities);
            }

            if (!Array.isArray(cities) || cities.length === 0) {
                citySelect.innerHTML = '<option value="">No hay ciudades disponibles</option>';
                citySelect.disabled = false;
                return;
            }

            citySelect.innerHTML = '<option value="">Seleccione una ciudad...</option>' + cities
                .map(city => `<option value="${city}">${city}</option>`)
                .join('');
            citySelect.disabled = false;

            if (preselectCity) {
                const opt = Array.from(citySelect.options).find(o => o.value.toLowerCase() === preselectCity.toLowerCase());
                if (opt) {
                    citySelect.value = opt.value;
                }
            }
        } catch (e) {
            console.error('Error cargando ciudades:', e);
            window.showToast?.('No se pudieron cargar las ciudades.', 'error');
            citySelect.innerHTML = '<option value="">Error cargando ciudades</option>';
            citySelect.disabled = false;
        }
    }

    // ---------------- Teléfono (intl-tel-input) ----------------

    initTelInput(input, initialIso2 = 'DO', presetValue = '') {
        if (!window.intlTelInput) return;
        // Asegura ISO2 en minúscula para la librería
        const iso2 = (initialIso2 || 'DO').toLowerCase();

        const iti = window.intlTelInput(input, {
            initialCountry: iso2,
            allowDropdown: false,           // El país lo controla el select de País
            autoPlaceholder: 'polite',      // Muestra ejemplo para guiar al usuario
            formatOnDisplay: true,
            nationalMode: false,            // Muestra +código país y valida internacional
            utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/22.0.2/js/utils.min.js',
            separateDialCode: false,
            strictMode: true
        });

        // Si había valor preestablecido, colócalo mediante la API
        if (presetValue) {
            try { iti.setNumber(String(presetValue)); } catch {}
        }

        // Guarda la instancia
        this.telInputs.set(input, iti);

        // Limpia mensajes de error al escribir
        input.addEventListener('input', () => {
            const err = input.nextElementSibling?.classList?.contains('text-red-500') ? input.nextElementSibling : null;
            input.classList.remove('border-red-500');
            if (err) { err.classList.add('hidden'); err.textContent = ''; }
        });
    }

    destroyTelInput(input) {
        const iti = this.telInputs.get(input);
        if (iti) {
            try { iti.destroy(); } catch {}
            this.telInputs.delete(input);
        }
    }

    destroyAllTelInputs() {
        this.telInputs.forEach((iti, input) => {
            try { iti.destroy(); } catch {}
        });
        this.telInputs.clear();
    }

    updateAllTelInputsCountry(iso2) {
        const country = (iso2 || 'DO').toLowerCase();
        this.telInputs.forEach((iti) => {
            try { iti.setCountry(country); } catch {}
        });
    }

    getValidatedPhonesE164OrErrors() {
        const results = [];
        let firstInvalid = null;

        this.telInputs.forEach((iti, input) => {
            const raw = input.value.trim();
            if (!raw) return; // permitir vacíos (se filtran luego)
            const valid = iti.isValidNumber();
            if (!valid && !firstInvalid) {
                firstInvalid = { input, message: 'Número de teléfono inválido para el país seleccionado' };
            }
            const e164 = valid ? iti.getNumber(intlTelInputUtils.numberFormat.E164) : raw;
            results.push({ e164, valid, input });
        });

        return { results, firstInvalid };
    }

    // ---------------- CRUD Suplidores ----------------

    async loadSuplidores() {
        this.showLoading();
        try {
            const searchTerm = document.getElementById('suplidorSearchInput')?.value || null;
            // Get all filtered suppliers
            const allSuplidores = await this.transaccionService.getSuplidores(searchTerm);
            this.totalSuplidores = allSuplidores.length;
            this.totalPages = Math.ceil(this.totalSuplidores / this.suplidoresPerPage);
            // Paginate on frontend
            const start = this.currentPage * this.suplidoresPerPage;
            const end = start + this.suplidoresPerPage;
            this.suplidores = allSuplidores.slice(start, end);
            this.filteredSuplidores = [...this.suplidores];

            // Update table view with all data
            this.tableViewManager.setData(allSuplidores);

            this.renderSuplidores();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading suppliers:', error);
            this.suplidores = [];
            this.filteredSuplidores = [];
            this.totalSuplidores = 0;
            this.totalPages = 1;
            this.tableViewManager.setData([]);
            this.renderSuplidores();
            this.renderPagination();
        } finally {
            this.hideLoading();
        }
    }

    renderSuplidores() {
        const container = document.getElementById('suplidoresListContainer');
        if (!container) return;

        if (this.filteredSuplidores.length === 0) {
            const searchTerm = document.getElementById('suplidorSearchInput')?.value;
            const emptyMessage = searchTerm ?
                `No se encontraron suplidores que coincidan con "${searchTerm}".` :
                'No hay suplidores registrados.';
            container.innerHTML = `
                <div class="text-center py-8 md:py-12 col-span-full">
                    <div class="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-truck text-2xl md:text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-base md:text-lg font-medium text-gray-900 mb-2">Sin suplidores</h3>
                    <p class="text-gray-600 mb-4 md:mb-6 text-sm md:text-base px-4">${emptyMessage}</p>
                    ${!searchTerm ? `
                        <button onclick="suplidoresManager.newSuplidor()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown text-sm md:text-base">
                            <i class="fas fa-plus mr-2"></i>Agregar Primer Suplidor
                        </button>
                    ` : `
                        <button onclick="document.getElementById('suplidorSearchInput').value = ''; suplidoresManager.filterSuplidores();" class="text-brand-brown hover:text-brand-light-brown text-sm md:text-base">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    `}
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredSuplidores.map(suplidor => this.renderSuplidorCard(suplidor)).join('');
    }

    renderSuplidorCard(suplidor) {
        // Adaptive button rendering based on screen size
        const buttonsHtml = this.isMobile ? this.renderMobileButtons(suplidor) :
                           this.isTablet ? this.renderTabletButtons(suplidor) :
                           this.renderDesktopButtons(suplidor);

        const ubicacion = [suplidor.ciudad, suplidor.pais].filter(Boolean).join(', ') || 'N/A';
        const ubicacionTrunc = this.truncate(ubicacion, 24);
        const emailTrunc = this.truncate(suplidor.email || 'N/A', 24);

        return `
            <div class="suplidor-card flex flex-col h-full w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-h-[220px] 
                sm:min-h-[240px] md:min-h-[260px] lg:min-h-[280px] xl:min-h-[300px] 
                ${this.isMobile ? 'max-w-full' : 'max-w-[420px] xl:max-w-[480px]'}
                ">
                <div class="flex-1 flex flex-col p-3 sm:p-4 md:p-5">
                    <div class="flex items-start justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-900 truncate max-w-[70%] flex items-center gap-2">
                            <i class='fas fa-truck text-brand-brown'></i>
                            ${this.truncate(suplidor.nombre, 28)}
                        </h3>
                    </div>
                    <div class="flex-1 flex flex-col gap-2 mt-1">
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-map-marker-alt text-gray-400"></i>
                            </span>
                            <span class="truncate text-xs" title="${ubicacion}">${ubicacionTrunc}</span>
                        </div>
                        ${!this.isMobile ? `
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-envelope text-gray-400"></i>
                            </span>
                            <span class="truncate text-xs" title="${suplidor.email || ''}">${emailTrunc}</span>
                        </div>
                        ${suplidor.telefonos && suplidor.telefonos.length > 0 ? `
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-phone text-gray-400"></i>
                            </span>
                            <span class="truncate text-xs">${this.truncate(suplidor.telefonos[0], 20)}</span>
                        </div>
                        ` : `
                        <div class="flex items-center text-sm text-gray-600">
                            <span class="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">
                                <i class="fas fa-phone text-gray-400"></i>
                            </span>
                            <span class="text-xs">Sin teléfono</span>
                        </div>
                        `}
                        ` : ''}
                    </div>
                    <div class="mt-4 pt-3 border-t border-gray-100">
                        ${buttonsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    renderMobileButtons(suplidor) {
        return `
            <div class="space-y-2">
                <div class="grid grid-cols-2 gap-2">
                    <button 
                        data-id="${suplidor.id}" 
                        class="ver-btn flex items-center justify-center gap-1.5 bg-brand-brown text-white px-3 py-2.5 rounded-lg hover:bg-brand-light-brown transition-colors text-sm font-medium"
                        title="Ver detalles"
                        type="button"
                    >
                        <i class="fas fa-eye text-xs"></i>
                        <span>Ver</span>
                    </button>
                    <button 
                        data-id="${suplidor.id}" 
                        class="edit-btn flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        title="Editar suplidor"
                        type="button"
                    >
                        <i class="fas fa-edit text-xs"></i>
                        <span>Editar</span>
                    </button>
                </div>
                <div class="grid grid-cols-1 gap-2">
                    <button 
                        data-id="${suplidor.id}" 
                        class="delete-btn flex items-center justify-center gap-1.5 bg-red-600 text-white px-3 py-2.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        title="Eliminar suplidor"
                        type="button"
                    >
                        <i class="fas fa-trash-alt text-xs"></i>
                        <span>Eliminar</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderTabletButtons(suplidor) {
        return `
            <div class="flex flex-wrap gap-1.5 justify-center">
                <button 
                    data-id="${suplidor.id}" 
                    class="ver-btn flex items-center gap-1 bg-brand-brown text-white px-2.5 py-1.5 rounded-md hover:bg-brand-light-brown transition-colors text-xs font-medium"
                    title="Ver detalles"
                    type="button"
                >
                    <i class="fas fa-eye"></i>
                    <span>Ver</span>
                </button>
                <button 
                    data-id="${suplidor.id}" 
                    class="edit-btn flex items-center gap-1 bg-green-600 text-white px-2.5 py-1.5 rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                    title="Editar suplidor"
                    type="button"
                >
                    <i class="fas fa-edit"></i>
                    <span>Edit</span>
                </button>
                <button 
                    data-id="${suplidor.id}" 
                    class="delete-btn flex items-center gap-1 bg-red-600 text-white px-2.5 py-1.5 rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                    title="Eliminar suplidor"
                    type="button"
                >
                    <i class="fas fa-trash-alt"></i>
                    <span>Del</span>
                </button>
            </div>
        `;
    }

    renderDesktopButtons(suplidor) {
        return `
            <div class="flex flex-wrap gap-2">
                <button 
                    data-id="${suplidor.id}" 
                    class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-sm font-medium"
                    title="Ver detalles"
                    type="button"
                >
                    <i class="fas fa-eye"></i>
                    <span>Detalles</span>
                </button>
                <button 
                    data-id="${suplidor.id}" 
                    class="edit-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
                    title="Editar suplidor"
                    type="button"
                >
                    <i class="fas fa-edit"></i>
                    <span>Editar</span>
                </button>
                <button 
                    data-id="${suplidor.id}" 
                    class="delete-btn flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm font-medium"
                    title="Eliminar suplidor"
                    type="button"
                >
                    <i class="fas fa-trash-alt"></i>
                    <span>Eliminar</span>
                </button>
            </div>
        `;
    }

    renderPagination() {
        let pagContainer = document.getElementById('suplidoresPagination');
        if (!pagContainer) {
            pagContainer = document.createElement('div');
            pagContainer.id = 'suplidoresPagination';
            pagContainer.className = 'flex justify-center mt-6';
            document.getElementById('suplidoresListContainer').after(pagContainer);
        }

        if (this.totalPages <= 1) {
            pagContainer.innerHTML = '';
            return;
        }

        let html = '<nav class="inline-flex rounded-md shadow-sm" aria-label="Pagination">';

        // Previous button
        html += `<button class="px-2 md:px-3 py-1 border border-gray-300 bg-white text-brand-brown rounded-l-lg hover:bg-brand-light-brown hover:text-white font-medium disabled:opacity-50 text-sm" ${this.currentPage === 0 ? 'disabled' : ''} data-page="prev">&laquo;</button>`;

        // Page numbers - responsive display
        if (this.isMobile) {
            // Mobile: only show current page
            html += `<span class="px-3 py-1 border-t border-b border-gray-300 bg-brand-brown text-white font-medium text-sm">${this.currentPage + 1} / ${this.totalPages}</span>`;
        } else if (this.isTablet) {
            // Tablet: show limited page numbers
            const maxPages = 3;
            let startPage = Math.max(0, this.currentPage - 1);
            let endPage = Math.min(this.totalPages - 1, startPage + maxPages - 1);

            if (endPage - startPage < maxPages - 1) {
                startPage = Math.max(0, endPage - maxPages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                html += `<button class="px-2 py-1 border-t border-b border-gray-300 bg-white text-brand-brown hover:bg-brand-light-brown hover:text-white font-medium text-sm ${i === this.currentPage ? 'bg-brand-brown text-white' : ''}" data-page="${i}">${i + 1}</button>`;
            }
        } else {
            // Desktop: show all page numbers (up to reasonable limit)
            const maxDisplayPages = Math.min(this.totalPages, 10);
            for (let i = 0; i < maxDisplayPages; i++) {
                html += `<button class="px-3 py-1 border-t border-b border-gray-300 bg-white text-brand-brown hover:bg-brand-light-brown hover:text-white font-medium text-sm ${i === this.currentPage ? 'bg-brand-brown text-white' : ''}" data-page="${i}">${i + 1}</button>`;
            }
        }

        // Next button
        html += `<button class="px-2 md:px-3 py-1 border border-gray-300 bg-white text-brand-brown rounded-r-lg hover:bg-brand-light-brown hover:text-white font-medium disabled:opacity-50 text-sm" ${this.currentPage === this.totalPages - 1 ? 'disabled' : ''} data-page="next">&raquo;</button>`;
        html += '</nav>';

        pagContainer.innerHTML = html;
        pagContainer.querySelectorAll('button[data-page]').forEach(btn => {
            btn.onclick = (e) => {
                const val = btn.getAttribute('data-page');
                if (val === 'prev' && this.currentPage > 0) {
                    this.currentPage--;
                    this.loadSuplidores();
                } else if (val === 'next' && this.currentPage < this.totalPages - 1) {
                    this.currentPage++;
                    this.loadSuplidores();
                } else if (!isNaN(val)) {
                    const page = parseInt(val);
                    if (page !== this.currentPage) {
                        this.currentPage = page;
                        this.loadSuplidores();
                    }
                }
            };
        });
    }

    truncate(str, max) {
        if (!str) return '';
        return str.length > max ? str.slice(0, max - 1) + '…' : str;
    }

    filterSuplidores() {
        const searchTerm = document.getElementById('suplidorSearchInput')?.value || '';
        this.tableViewManager.filterData(searchTerm);
        this.currentPage = 0;
        this.loadSuplidores();
    }

    showLoading() {
        const container = document.getElementById('suplidoresListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12 col-span-full">
                    <div class="animate-spin h-10 w-10 border-4 border-brand-brown border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Consultando información de suplidores...</p>
                    <p class="text-gray-500 text-sm mt-2">Un momento, por favor</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Content will replace the loading spinner, no need for explicit hiding
    }

    showError(message) {
        const container = document.getElementById('suplidoresListContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12 col-span-full">
                    <div class="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="suplidoresManager.loadSuplidores()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                        <i class="fas fa-refresh mr-2"></i>Reintentar
                    </button>
                </div>
            `;
        }
    }

    // ---------------- FORMULARIO ----------------

    newSuplidor() {
        this.currentSuplidor = null;
        this.clearForm();

        document.getElementById('modalSuplidorTitle').textContent = 'Nuevo Suplidor';
        document.getElementById('btnSuplidorIcon').className = 'fas fa-plus mr-2';
        document.getElementById('btnSuplidorText').textContent = 'Crear Suplidor';
        document.getElementById('modalSuplidor').classList.remove('hidden');

        // País por defecto: Dominican Republic (DO)
        const paisSel = document.getElementById('suplidorPaisSelect');
        if (paisSel && this.countries.length > 0) {
            paisSel.value = 'DO';
            this.populateCities('DO');
        }
        // Inicializa los inputs de teléfono con DO
        this.initAllCurrentTelInputs('DO');
    }

    async verSuplidor(id) {
        try {
            const suplidor = this.suplidores.find(s => String(s.id) === String(id));
            if (!suplidor) {
                window.showToast?.('Suplidor no encontrado.', 'error');
                return;
            }

            document.getElementById('detallesSuplidor').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Nombre</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.nombre}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">País</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.pais || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Ciudad</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.ciudad || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">RNC</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.rNC || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">NCF</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.nCF || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.email || 'N/A'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Teléfonos</label>
                        <div class="mt-1 text-sm text-gray-900">
                            ${suplidor.telefonos && suplidor.telefonos.length > 0 ?
                suplidor.telefonos.map(tel => `<p>${tel}</p>`).join('') :
                '<p>Sin teléfonos registrados</p>'
            }
                        </div>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Dirección</label>
                        <p class="mt-1 text-sm text-gray-900">${suplidor.direccion || 'N/A'}</p>
                    </div>
                </div>
            `;

            this.currentSuplidor = suplidor;
            document.getElementById('modalVerSuplidor').classList.remove('hidden');
        } catch (error) {
            console.error('Error viewing supplier:', error);
            window.showToast?.('Error al mostrar los detalles del suplidor.', 'error');
        }
    }

    async editSuplidor(id) {
        const suplidor = this.suplidores.find(s => String(s.id) === String(id));
        if (!suplidor) {
            window.showToast?.('Suplidor no encontrado.', 'error');
            return;
        }

        this.currentSuplidor = suplidor;
        await this.fillForm(suplidor);

        document.getElementById('modalSuplidorTitle').textContent = 'Editar Suplidor';
        document.getElementById('btnSuplidorIcon').className = 'fas fa-save mr-2';
        document.getElementById('btnSuplidorText').textContent = 'Actualizar Suplidor';
        document.getElementById('modalSuplidor').classList.remove('hidden');
    }

    async handleSubmitSuplidor(e) {
        e.preventDefault();

        const nombre = document.getElementById('suplidorNombre').value.trim();
        const paisSelect = document.getElementById('suplidorPaisSelect');
        const ciudadSelect = document.getElementById('suplidorCiudadSelect');
        const paisIso2 = paisSelect.value;
        const paisNombre = paisSelect.options[paisSelect.selectedIndex]?.text?.trim() || '';
        const ciudad = ciudadSelect.value;
        const direccion = document.getElementById('suplidorDireccion').value.trim();

        if (!nombre) return this.showFieldError('suplidorNombre', 'El nombre es requerido');
        if (!paisIso2) return this.showFieldError('suplidorPaisSelect', 'El país es requerido');
        if (!ciudad) return this.showFieldError('suplidorCiudadSelect', 'La ciudad es requerida');
        if (!direccion) return this.showFieldError('suplidorDireccion', 'La dirección es requerida');

        // Validar/formatear teléfonos a E.164
        const { results, firstInvalid } = this.getValidatedPhonesE164OrErrors();
        if (firstInvalid) {
            const { input, message } = firstInvalid;
            this.showCustomFieldError(input, message);
            return;
        }
        const telefonos = results.map(r => r.e164);

        const suplidorData = {
            nombre: nombre,
            pais: paisNombre,
            ciudad: ciudad,
            direccion: direccion,
            email: document.getElementById('suplidorEmail').value.trim() || null,
            rNC: document.getElementById('suplidorRNC').value.trim() || null,
            nCF: document.getElementById('suplidorNCF').value.trim() || null,
            telefonos: telefonos.length > 0 ? telefonos : null,
            longitud: null,
            latitud: null
        };

        try {
            if (this.currentSuplidor) {
                await this.transaccionService.updateSuplidor(this.currentSuplidor.id, suplidorData);
                window.showToast?.('Suplidor actualizado exitosamente.', 'success');
            } else {
                await this.transaccionService.createSuplidor(suplidorData);
                window.showToast?.('Suplidor creado exitosamente.', 'success');
            }
            this.cerrarModalSuplidor();
            this.loadSuplidores();
        } catch (error) {
            console.error('Error saving supplier:', error);
            window.showToast?.('Error al guardar el suplidor.', 'error');
        }
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = field?.nextElementSibling;
        field?.classList.add('border-red-500');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
        field?.focus();
    }

    showCustomFieldError(inputEl, message) {
        let errorElement = inputEl.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('text-red-500')) {
            errorElement = document.createElement('p');
            errorElement.className = 'text-xs text-red-500 mt-1';
            inputEl.after(errorElement);
        }
        inputEl.classList.add('border-red-500');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        inputEl.focus();
    }

    clearFieldErrors() {
        document.querySelectorAll('.border-red-500').forEach(field => field.classList.remove('border-red-500'));
        document.querySelectorAll('#formSuplidor p.text-red-500').forEach(error => {
            error.classList.add('hidden');
            error.textContent = '';
        });
    }

    clearForm() {
        this.destroyAllTelInputs();
        document.getElementById('formSuplidor').reset();
        this.clearFieldErrors();
        const ciudadSel = document.getElementById('suplidorCiudadSelect');
        if (ciudadSel) {
            ciudadSel.innerHTML = '<option value="">Seleccione un país primero...</option>';
            ciudadSel.disabled = true;
        }
        const container = document.getElementById('telefonosContainer');
        container.innerHTML = `
            <div class="flex gap-2 mb-2">
                <input type="tel"
                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown telefono-input">
                <button type="button" onclick="agregarTelefono()" class="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
    }

    async fillForm(suplidor) {
        this.clearForm();

        document.getElementById('suplidorNombre').value = suplidor.nombre || '';
        document.getElementById('suplidorEmail').value = suplidor.email || '';
        document.getElementById('suplidorRNC').value = suplidor.rNC || '';
        document.getElementById('suplidorNCF').value = suplidor.nCF || '';
        document.getElementById('suplidorDireccion').value = suplidor.direccion || '';

        const paisSel = document.getElementById('suplidorPaisSelect');
        const ciudadSel = document.getElementById('suplidorCiudadSelect');

        let iso2ToUse = 'DO';
        if (suplidor.pais) {
            const matchCountry = this.countries.find(c => c.name.toLowerCase() === String(suplidor.pais).toLowerCase());
            if (matchCountry) {
                paisSel.value = matchCountry.iso2;
                iso2ToUse = matchCountry.iso2;
                await this.populateCities(matchCountry.iso2, suplidor.ciudad || '');
            } else {
                paisSel.value = '';
                ciudadSel.innerHTML = '<option value="">Seleccione un país primero...</option>';
                ciudadSel.disabled = true;
            }
        }

        const container = document.getElementById('telefonosContainer');
        container.innerHTML = '';
        if (suplidor.telefonos && suplidor.telefonos.length > 0) {
            suplidor.telefonos.forEach((telefono, index) => {
                this.addTelefonoField(telefono, index === 0, iso2ToUse);
            });
        } else {
            this.addTelefonoField('', true, iso2ToUse);
        }
    }

    agregarTelefono() {
        const iso2 = document.getElementById('suplidorPaisSelect')?.value || 'DO';
        this.addTelefonoField('', false, iso2);
    }

    addTelefonoField(value = '', isFirst = false, iso2 = 'DO') {
        const container = document.getElementById('telefonosContainer');
        const telefonoDiv = document.createElement('div');
        telefonoDiv.className = 'flex gap-2 mb-2 items-center';

        telefonoDiv.innerHTML = `
            <div class="flex-1 flex items-center gap-2">
                <input type="tel"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown telefono-input h-10" style="min-width:0;">
                <p class="text-xs text-red-500 mt-1 hidden"></p>
            </div>
            ${isFirst ? `
                <button type="button" onclick="agregarTelefono()" class="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center h-10 w-10 min-w-[2.5rem]">
                    <i class="fas fa-plus"></i>
                </button>
            ` : `
                <button type="button" onclick="eliminarTelefono(this)" class="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center h-10 w-10 min-w-[2.5rem]">
                    <i class="fas fa-minus"></i>
                </button>
            `}
        `;

        container.appendChild(telefonoDiv);

        const input = telefonoDiv.querySelector('input.telefono-input');
        this.initTelInput(input, iso2, value);
    }

    initAllCurrentTelInputs(iso2 = 'DO') {
        const inputs = document.querySelectorAll('#telefonosContainer input.telefono-input');
        inputs.forEach(input => {
            if (!this.telInputs.has(input)) {
                this.initTelInput(input, iso2, input.value || '');
            } else {
                const iti = this.telInputs.get(input);
                try { iti.setCountry((iso2 || 'DO').toLowerCase()); } catch {}
            }
        });
    }

    eliminarTelefono(button) {
        const wrapper = button.closest('.flex');
        if (!wrapper) return;
        const input = wrapper.querySelector('input.telefono-input');
        if (input) this.destroyTelInput(input);
        wrapper.remove();
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

    async deleteSuplidor(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este suplidor?')) return;
        try {
            await this.transaccionService.deleteSuplidor(id);
            window.showToast?.('Suplidor eliminado exitosamente.', 'success');
            await this.loadSuplidores();
        } catch (error) {
            window.showToast?.('Error al eliminar el suplidor.', 'error');
        }
    }
}

const suplidoresManager = new SuplidoresManager();
window.suplidoresManager = suplidoresManager;
window.tableViewManager = suplidoresManager.tableViewManager;
window.cerrarModalSuplidor = () => suplidoresManager.cerrarModalSuplidor();
window.cerrarModalVerSuplidor = () => suplidoresManager.cerrarModalVerSuplidor();
window.editarSuplidorDesdeDetalle = () => suplidoresManager.editarSuplidorDesdeDetalle();

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('suplidorRNC')?.addEventListener('input', formatCedulaRnc);
});

function formatCedulaRnc(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 9) {
        input.value = digits;
        return;
    }
    let part1 = digits.slice(0, 3);
    let part2 = digits.slice(3, 10);
    let part3 = digits.slice(10, 11);
    let formatted = part1;
    if (part2) formatted += '-' + part2;
    if (part3) formatted += '-' + part3;
    input.value = formatted;
}