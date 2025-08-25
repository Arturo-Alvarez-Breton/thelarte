// src/main/resources/static/js/contabilidad/suplidores.js

import { SuplidorService } from '../services/suplidorService.js';
import { TableViewManager } from '../components/tableView.js';

class SuplidoresManager {
    constructor() {
        this.suplidorService = new SuplidorService();
        this.allSuplidores = []; // Todos los suplidores (activos e inactivos)
        this.suplidoresActivos = [];
        this.suplidoresInactivos = [];
        this.filteredSuplidores = [];
        this.currentSuplidor = null;
        this.currentPage = 0;
        this.suplidoresPerPage = 15;
        this.totalPages = 1;
        this.totalSuplidores = 0;
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        this.currentView = 'activos'; // 'activos' o 'inactivos'

        // Geo cache
        this.countries = [];
        this.citiesByIso2 = new Map();

        // Tel input instances
        this.telInputs = new Map(); // Map<HTMLInputElement, intlTelInputInstance>

        // Initialize table view manager
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
                    icon: 'fas fa-user-slash',
                    handler: 'suplidoresManager.toggleSuplidorStatus',
                    className: 'text-red-600 hover:text-red-700',
                    title: 'Desactivar/Activar suplidor'
                }
            ],
            searchFields: ['nombre', 'ciudad', 'pais', 'email', 'rNC'],
            idField: 'id',
            emptyIcon: 'fas fa-truck'
        });

        this.init();
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

        // Filter buttons for active/inactive suppliers
        document.getElementById('btnSuplidoresActivos')?.addEventListener('click', () => this.switchToActiveSuplidores());
        document.getElementById('btnSuplidoresInactivos')?.addEventListener('click', () => this.switchToInactiveSuplidores());

        document.getElementById('suplidoresListContainer')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;
            if (btn.classList.contains('ver-btn')) {
                this.verSuplidor(id);
            } else if (btn.classList.contains('edit-btn')) {
                this.editSuplidor(id);
            } else if (btn.classList.contains('delete-btn')) {
                this.toggleSuplidorStatus(id);
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

    getResponsiveColumns() {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            return [
                { header: 'Nombre', field: 'nombre' },
                {
                    header: 'Ubicación',
                    field: 'ciudad',
                    formatter: (value, item) => {
                        return [item.ciudad, item.pais].filter(Boolean).join(', ') || 'N/A';
                    }
                }
            ];
        } else {
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
            const busqueda = document.getElementById('suplidorSearchInput')?.value || null;
            // Obtener todos los suplidores (activos e inactivos)
            const allSuplidores = await this.suplidorService.getSuplidores();

            // Separar suplidores activos e inactivos basado en el campo 'activo'
            this.suplidoresActivos = allSuplidores.filter(s => s.activo !== false);
            this.suplidoresInactivos = allSuplidores.filter(s => s.activo === false);

            // Actualizar contadores
            this.updateCounters();

            // Actualizar estilos de los botones según la vista actual
            this.updateFilterButtons();

            // Determinar qué suplidores mostrar según la vista actual
            const currentSuplidores = this.currentView === 'activos' ? this.suplidoresActivos : this.suplidoresInactivos;

            // Aplicar filtro de búsqueda si existe
            let filtered = currentSuplidores;
            if (busqueda) {
                filtered = currentSuplidores.filter(s =>
                    (s.nombre && s.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
                    (s.ciudad && s.ciudad.toLowerCase().includes(busqueda.toLowerCase())) ||
                    (s.pais && s.pais.toLowerCase().includes(busqueda.toLowerCase())) ||
                    (s.email && s.email.toLowerCase().includes(busqueda.toLowerCase())) ||
                    (s.rNC && s.rNC.toLowerCase().includes(busqueda.toLowerCase()))
                );
            }

            // Configurar paginación
            this.totalSuplidores = filtered.length;
            this.totalPages = Math.ceil(this.totalSuplidores / this.suplidoresPerPage) || 1;

            // Aplicar paginación
            const start = this.currentPage * this.suplidoresPerPage;
            const end = start + this.suplidoresPerPage;
            this.filteredSuplidores = filtered.slice(start, end);

            // Guardar referencia a todos los suplidores
            this.allSuplidores = allSuplidores;

            // Update table view with current data
            this.tableViewManager.setData(this.filteredSuplidores);

            this.renderSuplidores();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading suppliers:', error);
            this.suplidoresActivos = [];
            this.suplidoresInactivos = [];
            this.filteredSuplidores = [];
            this.totalSuplidores = 0;
            this.totalPages = 1;
            this.updateCounters();
            this.updateFilterButtons();
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
                <div class="text-center py-12 col-span-full">
                    <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-truck text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Sin suplidores</h3>
                    <p class="text-gray-600 mb-6">${emptyMessage}</p>
                    ${!searchTerm ? `
                        <button onclick="suplidoresManager.newSuplidor()" class="bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                            <i class="fas fa-plus mr-2"></i>Agregar Primer Suplidor
                        </button>
                    ` : `
                        <button onclick="document.getElementById('suplidorSearchInput').value = ''; suplidoresManager.filterSuplidores();" class="text-brand-brown hover:text-brand-light-brown">
                            <i class="fas fa-times mr-2"></i>Limpiar búsqueda
                        </button>
                    `}
                </div>
            `;
            return;
        }

        function truncate(str, max) {
            if (!str) return '';
            return str.length > max ? str.slice(0, max - 1) + '…' : str;
        }

        container.innerHTML = this.filteredSuplidores.map(s => {
            const ubicacion = [s.ciudad, s.pais].filter(Boolean).join(', ') || 'N/A';
            const ubicacionTrunc = truncate(ubicacion, 24);
            const emailTrunc = truncate(s.email || 'N/A', 24);

            // Determinar si el suplidor está activo o inactivo
            const isActive = s.activo !== false;
            const actionButtonText = isActive ? 'Eliminar' : 'Restaurar';
            const actionButtonIcon = isActive ? 'fas fa-trash-alt' : 'fas fa-undo';
            const actionButtonClass = isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

            return `
                <div class="suplidor-card bg-white rounded-lg shadow-md p-4 flex flex-col justify-between min-h-[220px] max-w-full mx-auto ${!isActive ? 'opacity-75 border-l-4 border-red-400' : ''}">
                    <h3 class="text-lg font-semibold flex items-center gap-2 mb-3">
                        <i class='fas fa-truck ${isActive ? 'text-brand-brown' : 'text-gray-400'}'></i> 
                        ${truncate(s.nombre, 32)}
                        ${!isActive ? '<span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full ml-2">Inactivo</span>' : ''}
                    </h3>
                    <div class="space-y-2 text-sm text-gray-600 mb-4">
                        <p title="${ubicacion}"><i class="fas fa-map-marker-alt w-4"></i> ${ubicacionTrunc}</p>
                        <p title="${s.email || ''}"><i class="fas fa-envelope w-4"></i> ${emailTrunc}</p>
                        ${s.telefonos && s.telefonos.length > 0 ?
            `<p><i class="fas fa-phone w-4"></i> ${truncate(s.telefonos[0], 20)}</p>` :
            '<p><i class="fas fa-phone w-4"></i> Sin teléfono</p>'
        }
                    </div>
                    <div class="flex flex-wrap gap-2 mt-auto">
                        <button data-id="${s.id}" class="ver-btn flex items-center gap-2 bg-brand-brown text-white px-3 py-2 rounded-lg hover:bg-brand-light-brown transition-colors shadow-sm text-xs">
                            <i class="fas fa-eye"></i> Detalles
                        </button>
                        ${isActive ? `
                            <button data-id="${s.id}" class="edit-btn flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-xs">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                        ` : ''}
                        <button data-id="${s.id}" class="delete-btn flex items-center gap-2 ${actionButtonClass} text-white px-3 py-2 rounded-lg transition-colors shadow-sm text-xs">
                            <i class="${actionButtonIcon}"></i> 
                            <span>${actionButtonText}</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterSuplidores() {
        const searchTerm = document.getElementById('suplidorSearchInput')?.value || '';
        this.tableViewManager.filterData(searchTerm);
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
            const suplidor = this.allSuplidores.find(s => String(s.id) === String(id));
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
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Estado</label>
                        <p class="mt-1 text-sm text-gray-900">
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${suplidor.activo !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                ${suplidor.activo !== false ? 'Activo' : 'Inactivo'}
                            </span>
                        </p>
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
        const suplidor = this.allSuplidores.find(s => String(s.id) === String(id));
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
            telefonos: telefonos.length > 0 ? telefonos : null,
            longitud: null,
            latitud: null
        };

        try {
            if (this.currentSuplidor) {
                await this.suplidorService.updateSuplidor(this.currentSuplidor.id, suplidorData);
                window.showToast?.('Suplidor actualizado exitosamente.', 'success');
            } else {
                await this.suplidorService.createSuplidor(suplidorData);
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

    async toggleSuplidorStatus(id) {
        if (!confirm('¿Estás seguro de que deseas cambiar el estado de este suplidor?')) return;
        try {
            const suplidor = this.allSuplidores.find(s => String(s.id) === String(id));
            if (!suplidor) throw new Error('Suplidor no encontrado');

            const newStatus = suplidor.activo === false;
            if (newStatus) {
                await this.suplidorService.activarSuplidor(id);
            } else {
                await this.suplidorService.desactivarSuplidor(id);
            }

            window.showToast?.(`Suplidor ${newStatus ? 'activado' : 'desactivado'} exitosamente.`, 'success');
            this.loadSuplidores();
        } catch (error) {
            console.error('Error toggling supplier status:', error);
            window.showToast?.('Error al cambiar el estado del suplidor.', 'error');
        }
    }

    showLoading() {
        document.getElementById('suplidoresListContainer').innerHTML = '<div class="flex items-center justify-center py-12 col-span-full"><div class="animate-spin h-8 w-8 border-4 border-brand-brown border-t-transparent rounded-full"></div></div>';
    }

    hideLoading() { }

    updateCounters() {
        const activos = this.suplidoresActivos.length;
        const inactivos = this.suplidoresInactivos.length;

        const countActivosEl = document.getElementById('countActivos');
        const countInactivosEl = document.getElementById('countInactivos');

        if (countActivosEl) {
            countActivosEl.textContent = activos;
        }
        if (countInactivosEl) {
            countInactivosEl.textContent = inactivos;
        }
    }

    updateFilterButtons() {
        const btnActivos = document.getElementById('btnSuplidoresActivos');
        const btnInactivos = document.getElementById('btnSuplidoresInactivos');

        if (!btnActivos || !btnInactivos) return;

        if (this.currentView === 'activos') {
            btnActivos.classList.add('active');
            btnInactivos.classList.remove('active');
        } else {
            btnActivos.classList.remove('active');
            btnInactivos.classList.add('active');
        }
    }

    switchToActiveSuplidores() {
        this.currentView = 'activos';
        this.currentPage = 0;
        this.loadSuplidores();
    }

    switchToInactiveSuplidores() {
        this.currentView = 'inactivos';
        this.currentPage = 0;
        this.loadSuplidores();
    }

    renderPagination() {
        const container = document.getElementById('paginationContainer');
        if (!container) return;

        // Limpiar contenido anterior
        container.innerHTML = '';

        // No renderizar si hay menos de 1 página
        if (this.totalPages < 1) return;

        // Botón "Anterior"
        if (this.currentPage > 0) {
            const btnAnterior = document.createElement('button');
            btnAnterior.textContent = '« Anterior';
            btnAnterior.className = 'px-4 py-2 bg-brand-brown text-white rounded-l-lg hover:bg-brand-light-brown';
            btnAnterior.onclick = () => {
                this.currentPage--;
                this.loadSuplidores();
            };
            container.appendChild(btnAnterior);
        }

        // Paginación numérica
        for (let i = 0; i < this.totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i + 1;
            pageBtn.className = `px-4 py-2 border rounded-lg mx-1 transition-all duration-300 ease-in-out ${i === this.currentPage ? 'bg-brand-brown text-white' : 'bg-white text-brand-brown hover:bg-brand-light-brown'}`;
            pageBtn.onclick = () => {
                this.currentPage = i;
                this.loadSuplidores();
            };
            container.appendChild(pageBtn);
        }

        // Botón "Siguiente"
        if (this.currentPage < this.totalPages - 1) {
            const btnSiguiente = document.createElement('button');
            btnSiguiente.textContent = 'Siguiente »';
            btnSiguiente.className = 'px-4 py-2 bg-brand-brown text-white rounded-r-lg hover:bg-brand-light-brown';
            btnSiguiente.onclick = () => {
                this.currentPage++;
                this.loadSuplidores();
            };
            container.appendChild(btnSiguiente);
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
        document.getElementById('suplidorRNC')?.addEventListener('input', formatCedula);
});

function formatCedula(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '');

    // Determinar si es RNC (9 dígitos) o Cédula (11 dígitos)
    if (digits.length <= 9) {
        // Formato RNC: XXX-XXXXX-X
        digits = digits.slice(0, 9);
        let part1 = digits.slice(0, 3);
        let part2 = digits.slice(3, 8);
        let part3 = digits.slice(8, 9);
        let formatted = part1;
        if (part2) formatted += '-' + part2;
        if (part3) formatted += '-' + part3;
        input.value = formatted;
    } else {
        // Formato Cédula: XXX-XXXXXXX-X
        digits = digits.slice(0, 11);
        let part1 = digits.slice(0, 3);
        let part2 = digits.slice(3, 10);
        let part3 = digits.slice(10, 11);
        let formatted = part1;
        if (part2) formatted += '-' + part2;
        if (part3) formatted += '-' + part3;
        input.value = formatted;
    }
}
