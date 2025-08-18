// src/main/resources/static/js/components/transactionWizard.js

import { TransaccionService } from '../services/transaccionService.js';

export class TransactionWizard {
    constructor() {
        this.transaccionService = new TransaccionService();
        this.wizardModal = document.getElementById('transactionWizard');
        this.wizardContent = document.getElementById('wizardContent');
        this.wizardSubtitle = document.getElementById('wizardSubtitle');
        this.wizardPrevBtn = document.getElementById('wizardPrevBtn');
        this.wizardNextBtn = document.getElementById('wizardNextBtn');
        this.currentStep = 0;
        this.transactionData = {
            tipoTransaccion: '',
            cliente: null,
            proveedor: null,
            metodoPago: '',
            observaciones: '',
            lineas: [],
            subtotal: 0,
            impuestos: 0,
            // === Devolución-specific fields ===
            transaccionOrigen: null, // transacción seleccionada para devolución
            productosADevolver: [],  // productos seleccionados a devolver
        };
        this.steps = [];
        // Para devoluciones
        this.transacciones = [];
        this.transaccionesFiltradas = [];

        this.initSteps();
        this.setupEventListeners();
    }

    initSteps() {
        // Default steps - will be customized based on transaction type
        this.steps = [
            {
                title: 'Selecciona el tipo de transacción',
                content: this.getStep1Content(),
                onNext: () => this.validateStep1()
            }
        ];
    }

    initStepsForType(type) {
        switch (type) {
            case 'VENTA':
                this.steps = [
                    {
                        title: 'Datos del Cliente',
                        content: this.getVentaStep1Content(),
                        onNext: () => this.validateVentaStep1(),
                        onLoad: () => this.loadVentaStep1Data()
                    },
                    {
                        title: 'Productos a Vender',
                        content: this.getVentaStep2Content(),
                        onNext: () => this.validateVentaStep2(),
                        onLoad: () => this.loadVentaStep2Data()
                    },
                    {
                        title: 'Método de Pago',
                        content: this.getVentaStep3Content(),
                        onNext: () => this.validateVentaStep3(),
                        onLoad: () => this.loadVentaStep3Data && this.loadVentaStep3Data() // Optional, in case you need listeners
                    },
                    {
                        title: 'Confirmación de Venta',
                        content: this.getVentaStep4Content(),
                        onNext: () => this.finalizeVenta(),
                        onLoad: () => {
                            // Siempre actualiza totales y renderiza el resumen al entrar al paso 4
                            this.updateVentaTotals && this.updateVentaTotals();
                            if (this.wizardContent && typeof this.getVentaStep4Content === 'function') {
                                this.wizardContent.innerHTML = this.getVentaStep4Content();
                            }
                        }
                    }
                ];
                break;
            case 'COMPRA':
                this.steps = [
                    {
                        title: 'Datos del Proveedor',
                        content: this.getCompraStep1Content(),
                        onNext: () => this.validateCompraStep1(),
                        onLoad: () => this.loadCompraStep1Data()
                    },
                    {
                        title: 'Productos a Comprar',
                        content: this.getCompraStep2Content(),
                        onNext: () => this.validateCompraStep2(),
                        onLoad: () => this.loadCompraStep2Data()
                    },
                    {
                        title: 'Confirmación de Compra',
                        content: this.getCompraStep3Content(),
                        onNext: () => this.finalizeCompra(),
                        onLoad: () => {
                            // Siempre actualiza totales y renderiza el resumen al entrar al paso 3 (confirmación)
                            this.updateCompraTotals && this.updateCompraTotals();
                            if (this.wizardContent && typeof this.getCompraStep3Content === 'function') {
                                this.wizardContent.innerHTML = this.getCompraStep3Content();
                            }
                        }
                    }
                ];
                break;
            case 'DEVOLUCION_VENTA':
            case 'DEVOLUCION_COMPRA':
                this.steps = [
                    {
                        title: 'Tipo de Devolución',
                        content: this.getDevolucionStep1Content(),
                        onNext: () => this.validateDevolucionStep1()
                    },
                    {
                        title: 'Selecciona la transacción origen',
                        content: this.getDevolucionStep2Content(),
                        onNext: () => this.validateDevolucionStep2(),
                        onLoad: () => this.loadDevolucionStep2Data()
                    },
                    {
                        title: 'Selecciona los productos a devolver',
                        content: this.getDevolucionStep3Content(),
                        onNext: () => this.validateDevolucionStep3(),
                        onLoad: () => this.loadDevolucionStep3Data()
                    },
                    {
                        title: 'Confirmación de la Devolución',
                        content: this.getDevolucionStep4Content(),
                        onNext: () => this.finalizeDevolucion(),
                        onLoad: () => this.loadDevolucionStep4Data()
                    }
                ];
                break;
            default:
                this.initSteps();
        }
    }

    setupEventListeners() {
        if (this.wizardPrevBtn) {
            this.wizardPrevBtn.onclick = () => this.prevStep();
        }
        if (this.wizardNextBtn) {
            this.wizardNextBtn.onclick = async () => {
                if (this.currentStep === this.steps.length - 1) {
                    const currentStepHandler = this.steps[this.currentStep];
                    if (currentStepHandler.onNext) {
                        await currentStepHandler.onNext();
                    }
                } else {
                    this.nextStep();
                }
            };
        }
        // Close button on the wizard header
        const closeButton = this.wizardModal.querySelector('button[onclick*="closeTransactionWizard"]');
        if (closeButton) {
            closeButton.onclick = () => this.close();
        }
    }

    open(type = null) {
        this.transactionData = {
            tipoTransaccion: type || '',
            cliente: null,
            proveedor: null,
            metodoPago: '',
            observaciones: '',
            lineas: [],
            subtotal: 0,
            impuestos: 0,
            total: 0,
            transaccionOrigen: null,
            productosADevolver: [],
        };

        // Initialize steps based on transaction type
        if (type) {
            this.initStepsForType(type);
        } else {
            this.initSteps();
        }

        this.currentStep = 0;
        this.updateWizardUI();
        this.wizardModal.classList.remove('hidden');
    }

    close() {
        this.wizardModal.classList.add('hidden');
    }

    async nextStep() {
        const currentStepHandler = this.steps[this.currentStep];
        if (currentStepHandler.onNext) {
            const isValid = await currentStepHandler.onNext();
            if (!isValid) {
                return; // Stop if validation fails
            }
        }

        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateWizardUI();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateWizardUI();
        }
    }

    async updateWizardUI() {
        const currentStepData = this.steps[this.currentStep];
        if (this.wizardSubtitle) {
            this.wizardSubtitle.textContent = currentStepData.title;
        }
        if (this.wizardContent) {
            this.wizardContent.innerHTML = currentStepData.content;
            if (currentStepData.onLoad) {
                await currentStepData.onLoad();
            }
        }

        // Update step indicators
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            if (index === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update navigation buttons
        if (this.wizardPrevBtn) {
            this.wizardPrevBtn.classList.toggle('hidden', this.currentStep === 0);
        }
        if (this.wizardNextBtn) {
            if (this.currentStep === this.steps.length - 1) {
                this.wizardNextBtn.innerHTML = 'Finalizar <i class="fas fa-check ml-1"></i>';
            } else {
                this.wizardNextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right ml-1"></i>';
            }
        }
    }

    // --- Step 1: Select Transaction Type ---
    getStep1Content() {
        return `
            <div class="space-y-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Tipo de Transacción:</label>
                <div class="flex flex-col space-y-2">
                    <label class="inline-flex items-center">
                        <input type="radio" name="transactionType" value="DEVOLUCION_VENTA" class="form-radio text-brand-brown" ${this.transactionData.tipoTransaccion === 'DEVOLUCION_VENTA' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700">Devolución de Venta</span>
                    </label>
                    <label class="inline-flex items-center">
                        <input type="radio" name="transactionType" value="DEVOLUCION_COMPRA" class="form-radio text-brand-brown" ${this.transactionData.tipoTransaccion === 'DEVOLUCION_COMPRA' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700">Devolución de Compra</span>
                    </label>
                </div>
            </div>
        `;
    }
    // src/main/resources/static/js/components/transactionWizard.js

// ... (código anterior igual)

    // =============== VENTA WIZARD METHODS ===============
    getVentaStep1Content() {
        return `
    <div class="space-y-4">
        <h3 class="text-lg font-semibold text-brand-brown">Información del Cliente</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Cliente</label>
                <input type="text" id="ventaClienteSearch" placeholder="Buscar por nombre o cédula..." 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select id="ventaClienteSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    <option value="">Consumidor Final</option>
                </select>
            </div>
        </div>
        <div>
            <button type="button" id="btnNuevoCliente" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                <i class="fas fa-plus mr-2"></i>Nuevo Cliente
            </button>
        </div>
        <!-- Formulario para nuevo cliente (oculto inicialmente) -->
        <div id="nuevoClienteForm" class="hidden mt-4 border p-4 rounded-lg bg-gray-50">
            <h4 class="text-md font-bold mb-2">Registrar Nuevo Cliente</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Cédula *</label>
                    <input type="text" id="nuevoClienteCedula" class="w-full px-3 py-2 border rounded" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input type="text" id="nuevoClienteNombre" class="w-full px-3 py-2 border rounded" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                    <input type="text" id="nuevoClienteApellido" class="w-full px-3 py-2 border rounded" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                    <input type="text" id="nuevoClienteTelefono" class="w-full px-3 py-2 border rounded" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="nuevoClienteEmail" class="w-full px-3 py-2 border rounded">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input type="text" id="nuevoClienteDireccion" class="w-full px-3 py-2 border rounded">
                </div>
            </div>
            <div class="mt-4 flex space-x-2">
                <button type="button" id="guardarNuevoCliente" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar Cliente</button>
                <button type="button" id="cancelarNuevoCliente" class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancelar</button>
            </div>
        </div>
    </div>
    `;
    }

    async loadVentaStep1Data() {
        try {
            const clientes = await this.transaccionService.getClientes();
            const select = document.getElementById('ventaClienteSelect');
            const searchInput = document.getElementById('ventaClienteSearch');
            const btnNuevoCliente = document.getElementById('btnNuevoCliente');
            const nuevoClienteForm = document.getElementById('nuevoClienteForm');
            const guardarBtn = document.getElementById('guardarNuevoCliente');
            const cancelarBtn = document.getElementById('cancelarNuevoCliente');

            // Inicializa el select con todos los clientes
            if (select) {
                select.innerHTML = '<option value="">Consumidor Final</option>';
                clientes.forEach(cliente => {
                    select.innerHTML += `<option value="${cliente.cedula}">${cliente.nombre} ${cliente.apellido} (${cliente.cedula})</option>`;
                });
            }

            // Filtro dinámico por input
            if (searchInput && select) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filtered = clientes.filter(cliente =>
                        cliente.nombre.toLowerCase().includes(searchTerm) ||
                        cliente.apellido.toLowerCase().includes(searchTerm) ||
                        cliente.cedula.toLowerCase().includes(searchTerm)
                    );
                    select.innerHTML = '<option value="">Consumidor Final</option>';
                    filtered.forEach(cliente => {
                        select.innerHTML += `<option value="${cliente.cedula}">${cliente.nombre} ${cliente.apellido} (${cliente.cedula})</option>`;
                    });
                });
            }

            // Mostrar/ocultar formulario de nuevo cliente
            if (btnNuevoCliente && nuevoClienteForm) {
                btnNuevoCliente.onclick = () => nuevoClienteForm.classList.toggle('hidden');
            }
            if (cancelarBtn && nuevoClienteForm) {
                cancelarBtn.onclick = () => nuevoClienteForm.classList.add('hidden');
            }

            // Guardar el nuevo cliente
            if (guardarBtn && select && nuevoClienteForm) {
                guardarBtn.onclick = async () => {
                    const cedula = document.getElementById('nuevoClienteCedula').value.trim();
                    const nombre = document.getElementById('nuevoClienteNombre').value.trim();
                    const apellido = document.getElementById('nuevoClienteApellido').value.trim();
                    const telefono = document.getElementById('nuevoClienteTelefono').value.trim();
                    const email = document.getElementById('nuevoClienteEmail').value.trim();
                    const direccion = document.getElementById('nuevoClienteDireccion').value.trim();

                    if (!cedula || !nombre || !apellido || !telefono) {
                        window.showToast('Completa los campos obligatorios (*) del cliente.', 'error');
                        return;
                    }

                    try {
                        const nuevoCliente = await this.transaccionService.createCliente({
                            cedula, nombre, apellido, telefono, email, direccion
                        });
                        window.showToast('Cliente creado exitosamente.', 'success');
                        // Añade el nuevo cliente al select y selecciónalo
                        const option = document.createElement('option');
                        option.value = nuevoCliente.cedula;
                        option.textContent = `${nuevoCliente.nombre} ${nuevoCliente.apellido} (${nuevoCliente.cedula})`;
                        select.appendChild(option);
                        select.value = nuevoCliente.cedula;
                        this.transactionData.cliente = nuevoCliente;
                        nuevoClienteForm.classList.add('hidden');
                    } catch (err) {
                        window.showToast('Error al crear cliente: ' + (err.message || err), 'error');
                    }
                };
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            window.showToast('Error al cargar clientes.', 'error');
        }
    }

    validateStep1() {
        const selectedType = document.querySelector('input[name="transactionType"]:checked');
        if (!selectedType) {
            window.showToast('Por favor, selecciona un tipo de transacción.', 'error');
            return false;
        }
        this.transactionData.tipoTransaccion = selectedType.value;
        return true;
    }

    // --- Step 2: Transaction Details ---
// --- Step 3: Add Products ---
// --- Step 4: Confirmation ---
// ========== DEVOLUCIONES ==========

    getDevolucionStep1Content() {
        return `
            <div class="space-y-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Tipo de Devolución:</label>
                <div class="flex flex-col space-y-2">
                    <label class="inline-flex items-center">
                        <input type="radio" name="tipoDevolucion" value="DEVOLUCION_VENTA" class="form-radio text-brand-brown" ${this.transactionData.tipoTransaccion === 'DEVOLUCION_VENTA' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700">Devolución de Venta</span>
                    </label>
                    <label class="inline-flex items-center">
                        <input type="radio" name="tipoDevolucion" value="DEVOLUCION_COMPRA" class="form-radio text-brand-brown" ${this.transactionData.tipoTransaccion === 'DEVOLUCION_COMPRA' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700">Devolución de Compra</span>
                    </label>
                </div>
            </div>
        `;
    }

    validateDevolucionStep1() {
        const selectedType = document.querySelector('input[name="tipoDevolucion"]:checked');
        if (!selectedType) {
            window.showToast('Selecciona el tipo de devolución', 'error');
            return false;
        }
        this.transactionData.tipoTransaccion = selectedType.value;
        return true;
    }

    getDevolucionStep2Content() {
        return `
            <div class="space-y-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Transacción origen:</label>
                <div id="devolucionTransaccionesContainer">
                    <div class="text-gray-500">Cargando transacciones...</div>
                </div>
            </div>
        `;
    }

    async loadDevolucionStep2Data() {
        // Obtener transacciones para filtrar según tipo
        const tipo = this.transactionData.tipoTransaccion === 'DEVOLUCION_COMPRA' ? 'COMPRA' : 'VENTA';
        try {
            this.transacciones = await this.transaccionService.getTransacciones();
            this.transaccionesFiltradas = this.transacciones.filter(
                t => t.tipo === tipo && t.estado !== 'CANCELADA'
            );
            const container = document.getElementById('devolucionTransaccionesContainer');
            if (!container) return;
            if (!this.transaccionesFiltradas.length) {
                container.innerHTML = `<div class="text-gray-500">No hay transacciones para devolución.</div>`;
                return;
            }
            container.innerHTML = this.transaccionesFiltradas.map((t, idx) => `
                <div class="border rounded px-4 py-2 mb-2 cursor-pointer ${this.transactionData.transaccionOrigen && this.transactionData.transaccionOrigen.id === t.id ? "bg-brand-light-brown text-white" : ""}"
                    onclick="window.transactionWizard.selectTransaccionOrigen(${t.id})">
                    <strong>${t.contraparteNombre}</strong> #${t.id} - ${t.estado} <span class="ml-2 text-xs text-gray-500">${new Date(t.fecha).toLocaleDateString('es-DO')}</span>
                    <br>
                    <span class="text-sm text-gray-600">Total: ${this.formatCurrency(t.total)}</span>
                </div>
            `).join('');
        } catch (e) {
            window.showToast('Error cargando transacciones.', 'error');
        }
    }

    selectTransaccionOrigen(id) {
        this.transactionData.transaccionOrigen = this.transaccionesFiltradas.find(t => t.id === id);
        // Reset productos seleccionados si cambia la transacción
        this.transactionData.productosADevolver = [];
        this.updateWizardUI();
    }

    validateDevolucionStep2() {
        if (!this.transactionData.transaccionOrigen) {
            window.showToast('Selecciona una transacción origen', 'error');
            return false;
        }
        return true;
    }

    getDevolucionStep3Content() {
        return `
            <div class="space-y-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Selecciona los productos a devolver:</label>
                <div id="productosADevolverContainer">
                    <div class="text-gray-500">Cargando productos...</div>
                </div>
            </div>
        `;
    }

    async loadDevolucionStep3Data() {
        const container = document.getElementById('productosADevolverContainer');
        const trans = this.transactionData.transaccionOrigen;
        if (!trans || !container) return;
        // Mostrar líneas como checkbox
        container.innerHTML = trans.lineas.map((linea, idx) => `
            <div class="flex items-center mb-2">
                <input type="checkbox" id="prodADevolver-${idx}" ${this.transactionData.productosADevolver.includes(idx) ? "checked" : ""} onchange="window.transactionWizard.toggleProductoADevolver(${idx})">
                <label for="prodADevolver-${idx}" class="ml-2">${linea.nombreProducto || linea.productoNombre} (x${linea.cantidad})</label>
            </div>
        `).join('');
    }

    toggleProductoADevolver(idx) {
        const productos = this.transactionData.productosADevolver;
        if (productos.includes(idx)) {
            this.transactionData.productosADevolver = productos.filter(i => i !== idx);
        } else {
            this.transactionData.productosADevolver = [...productos, idx];
        }
        this.updateWizardUI();
    }

    validateDevolucionStep3() {
        if (!this.transactionData.productosADevolver.length) {
            window.showToast('Selecciona al menos un producto a devolver', 'error');
            return false;
        }
        return true;
    }

    getDevolucionStep4Content() {
        const t = this.transactionData.transaccionOrigen;
        const seleccionados = this.transactionData.productosADevolver.map(idx => t.lineas[idx]);
        return `
            <div>
                <h4 class="font-bold mb-2">Resumen de la Devolución</h4>
                <p><strong>Tipo:</strong> ${this.formatTransactionType(this.transactionData.tipoTransaccion)}</p>
                <p><strong>Transacción Origen:</strong> #${t?.id} - ${t?.contraparteNombre}</p>
                <div class="mt-2">
                    <h5 class="font-semibold">Productos a Devolver:</h5>
                    ${seleccionados.map(l =>
            `<div>${l.nombreProducto || l.productoNombre} (x${l.cantidad})</div>`
        ).join('')}
                </div>
                <div class="mt-3">
                    <label class="block text-gray-700 text-sm font-bold mb-2">Observaciones:</label>
                    <textarea id="devolucionObservaciones" rows="2" class="w-full border rounded px-2 py-1">${this.transactionData.observaciones || ""}</textarea>
                </div>
            </div>
        `;
    }

    loadDevolucionStep4Data() {
        // Nada por ahora
    }

    async finalizeDevolucion() {
        try {
            const t = this.transactionData.transaccionOrigen;
            const observaciones = document.getElementById('devolucionObservaciones')?.value || "";
            const lineas = this.transactionData.productosADevolver.map(idx => {
                const linea = { ...t.lineas[idx] };
                return {
                    productoId: linea.productoId,
                    nombreProducto: linea.nombreProducto || linea.productoNombre,
                    cantidad: linea.cantidad,
                    precioUnitario: linea.precioUnitario,
                    subtotalLinea: linea.cantidad * linea.precioUnitario,
                };
            });
            // Puedes adaptar el payload como necesites
            const payload = {
                tipoTransaccion: this.transactionData.tipoTransaccion,
                transaccionOrigenId: t.id,
                contraparteId: t.clienteId || t.suplidorId,
                observaciones,
                lineas,
            };
            await this.transaccionService.createDevolucion(payload);
            window.showToast('Devolución procesada exitosamente.', 'success');
            this.close();
            if (window.transaccionesManager) window.transaccionesManager.loadTransactions();
        } catch (error) {
            window.showToast('Error al procesar la devolución: ' + (error.message || error), 'error');
        }
    }


    async finalizeVenta() {
        try {
            this.updateTotals && this.updateTotals();
            if (this.transactionData.cliente && !this.transactionData.cliente.cedula) {
                const nuevoCliente = await this.transaccionService.createCliente(this.transactionData.cliente);
                if (!nuevoCliente || !nuevoCliente.cedula) {
                    window.showToast('No se pudo crear el cliente.', 'error');
                    return false;
                }
                this.transactionData.cliente.cedula = nuevoCliente.cedula;
            }
            const cedulaLong = this.transactionData.cliente
                ? cedulaToLong(this.transactionData.cliente.cedula)
                : null;

            // Validación extra para nombreProducto
            const lineaInvalida = this.transactionData.lineas.find(
                line => !(line.nombreProducto || line.nombre)
            );
            if (lineaInvalida) {
                window.showToast('Hay un producto sin nombre. Corrige antes de continuar.', 'error');
                return;
            }

            const payload = {
                tipo: 'VENTA',
                cliente: this.transactionData.cliente ? {
                    cedula: this.transactionData.cliente.cedula,
                    nombre: this.transactionData.cliente.nombre,
                    apellido: this.transactionData.cliente.apellido
                } : null,
                proveedor: null,
                metodoPago: this.transactionData.metodoPago,
                observaciones: this.transactionData.observaciones,
                lineas: this.transactionData.lineas.map(line => ({
                    productoId: line.productoId,
                    productoNombre: line.nombreProducto || line.nombre, // ¡usa productoNombre!
                    cantidad: line.cantidad,
                    precioUnitario: line.precioUnitario,
                    subtotal: line.subtotalLinea,      // asegúrate que sea el monto correcto
                    impuestoPorcentaje: line.impuestoPorcentaje ?? 0,
                    impuestoMonto: line.impuestoMonto ?? 0,
                    total: line.totalLinea ?? line.subtotalLinea,
                    descuentoPorcentaje: line.descuentoPorcentaje ?? 0,
                    descuentoMonto: line.descuentoMonto ?? 0,
                    observaciones: line.observaciones ?? ""
                })),
                subtotal: this.transactionData.subtotal,
                impuestos: this.transactionData.impuestos,
                total: this.transactionData.total,
                contraparteId: cedulaLong,
                contraparteNombre: this.transactionData.cliente
                    ? (this.transactionData.cliente.nombre + " " + this.transactionData.cliente.apellido)
                    : null,
                tipoContraparte: "CLIENTE",
                vendedorId: 1,
            };
            console.log("Payload de venta:", JSON.stringify(payload, null, 2));
            await this.transaccionService.crearTransaccion(payload);
            window.showToast('Venta procesada exitosamente.', 'success');
            this.close();
            if (window.transaccionesManager) window.transaccionesManager.loadTransactions();
        } catch (error) {
            console.error('Error al procesar venta:', error);
            window.showToast('Error al procesar la venta: ' + (error.message || error), 'error');
        }
    }
    async finalizeCompra() {
        try {
            this.updateTotals && this.updateTotals();

            // Validación extra: asegúrate que el proveedor y su nombre existen
            if (!this.transactionData.proveedor || !this.transactionData.proveedor.nombre) {
                window.showToast('El nombre del proveedor es obligatorio para la compra.', 'error');
                return false;
            }
            // Si el proveedor no tiene id, es un nuevo suplidor, así que créalo
            if (!this.transactionData.proveedor?.id) {
                // Debes tener un método real para crear suplidor en tu transaccionService o uno extra
                const nuevoSuplidor = await this.transaccionService.createSuplidor(this.transactionData.proveedor);
                if (!nuevoSuplidor || !nuevoSuplidor.id) {
                    window.showToast('No se pudo crear el proveedor.', 'error');
                    return false;
                }
                this.transactionData.proveedor.id = nuevoSuplidor.id;
            }
            for (let line of this.transactionData.lineas) {
                if (!line.productoId) {
                    const nuevoProducto = await this.transaccionService.createProducto({
                        nombre: line.nombreProducto,
                        precioVenta: line.precioUnitario,
                        // ...otros campos requeridos
                    });
                    if (nuevoProducto && nuevoProducto.id) {
                        line.productoId = nuevoProducto.id;
                        // puedes ajustar otros datos si lo deseas
                    } else {
                        window.showToast('No se pudo crear el producto.', 'error');
                        return false;
                    }
                }
            }

            const payload = {
                tipo: 'COMPRA', // Solo este campo, no tipoTransaccion
                cliente: null,
                proveedor: this.transactionData.proveedor ? {
                    id: this.transactionData.proveedor.id,
                    nombre: this.transactionData.proveedor.nombre,
                    rnc: this.transactionData.proveedor.rnc,
                    telefono: this.transactionData.proveedor.telefono,
                    email: this.transactionData.proveedor.email
                } : null,
                contraparteId: this.transactionData.proveedor?.id,
                contraparteNombre: this.transactionData.proveedor?.nombre, // ¡Este campo es obligatorio!
                tipoContraparte: 'SUPLIDOR',
                metodoPago: this.transactionData.metodoPago || 'EFECTIVO',
                observaciones: this.transactionData.observaciones ||
                    (this.transactionData.proveedor ? `Compra de proveedor: ${this.transactionData.proveedor.nombre}` : ''),
                lineas: this.transactionData.lineas.map(line => ({
                    productoId: line.productoId,
                    productoNombre: line.nombreProducto,
                    cantidad: line.cantidad,
                    precioUnitario: line.precioUnitario,
                    subtotal: line.subtotalLinea // nombre esperado por backend
                })),
                subtotal: this.transactionData.subtotal,
                impuestos: this.transactionData.impuestos,
                total: this.transactionData.total
            };

            // Depuración: muestra el payload
            console.log("Payload enviado:", JSON.stringify(payload, null, 2));

            await this.transaccionService.crearTransaccion(payload);
            window.showToast('Compra procesada exitosamente.', 'success');
            this.close();
            if (window.transaccionesManager) window.transaccionesManager.loadTransactions();
        } catch (error) {
            console.error('Error al procesar compra:', error);
            window.showToast('Error al procesar la compra: ' + (error.message || error), 'error');
        }
    }

    // --- Utility Functions ---
    updateTotals() {
        let subtotal = 0;
        let impuestos = 0;
        let total = 0;

        this.transactionData.lineas.forEach(line => {
            subtotal += line.subtotalLinea;
            // Assuming a fixed ITBIS for now, or fetch from product
            // For simplicity, let's assume 18% ITBIS on subtotalLinea for now if product.itbis is not available
            const productItbisRate = line.itbis || 0.18; // Use 18% if not specified
            impuestos += line.subtotalLinea * productItbisRate;
        });

        total = subtotal + impuestos;

        this.transactionData.subtotal = subtotal;
        this.transactionData.impuestos = impuestos;
        this.transactionData.total = total;

        // Update displayed totals
        const subtotalElement = this.wizardContent.querySelector('p:has(strong)'); // Find the subtotal paragraph
        if (subtotalElement) {
            subtotalElement.innerHTML = `Subtotal: <strong>${this.formatCurrency(this.transactionData.subtotal)}</strong>`;
            subtotalElement.nextElementSibling.innerHTML = `Impuestos: <strong>${this.formatCurrency(this.transactionData.impuestos)}</strong>`;
            subtotalElement.nextElementSibling.nextElementSibling.innerHTML = `Total: <strong>${this.formatCurrency(this.transactionData.total)}</strong>`;
        }
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

    formatTransactionType(type) {
        const types = {
            'COMPRA': 'Compra',
            'VENTA': 'Venta',
            'DEVOLUCION_COMPRA': 'Devolución Compra',
            'DEVOLUCION_VENTA': 'Devolución Venta'
        };
        return types[type] || type;
    }

    // =============== VENTA WIZARD METHODS ===============
    async validateVentaStep1() {
        // Cliente is optional for sales (can be "Consumidor Final")
        const clienteCedula = document.getElementById('ventaClienteSelect')?.value;
        if (clienteCedula) {
            try {
                // Get full client data
                const cliente = await this.transaccionService.getClienteByCedula(clienteCedula);
                if (cliente) {
                    this.transactionData.cliente = cliente;
                } else {
                    this.transactionData.cliente = {cedula: clienteCedula};
                }
            } catch (error) {
                console.error('Error loading client:', error);
                this.transactionData.cliente = {cedula: clienteCedula};
            }
        } else {
            this.transactionData.cliente = null;
        }
        return true;
    }

    getVentaStep2Content() {
        return `
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-brand-brown">Productos a Vender</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Producto</label>
                        <input type="text" id="ventaProductoSearch" placeholder="Buscar por nombre o código..." 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                        <select id="ventaProductoSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <option value="">Seleccionar producto</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <div class="flex">
                            <input type="number" id="ventaCantidad" min="1" value="1" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <button type="button" onclick="window.transactionWizard.addVentaProduct()" 
                                    class="ml-2 bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div id="ventaProductsList" class="space-y-2">
                    <!-- Selected products will appear here -->
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex justify-between items-center">
                        <span class="font-medium">Subtotal:</span>
                        <span id="ventaSubtotal" class="font-bold">${this.formatCurrency(0)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-medium">Impuestos:</span>
                        <span id="ventaImpuestos" class="font-bold">${this.formatCurrency(0)}</span>
                    </div>
                    <div class="flex justify-between items-center text-lg">
                        <span class="font-bold">Total:</span>
                        <span id="ventaTotal" class="font-bold text-brand-brown">${this.formatCurrency(0)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async loadVentaStep2Data() {
        try {
            const productos = await this.transaccionService.getProductosParaVenta();
            const select = document.getElementById('ventaProductoSelect');
            const searchInput = document.getElementById('ventaProductoSearch');

            if (select) {
                select.innerHTML = '<option value="">Seleccionar producto</option>';
                productos.forEach(producto => {
                    select.innerHTML += `<option value="${producto.id}">${producto.nombre} - ${this.formatCurrency(producto.precioVenta)} (Stock: ${producto.cantidadDisponible})</option>`;
                });
            }

            // Setup search functionality
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredProducts = productos.filter(producto =>
                        producto.nombre.toLowerCase().includes(searchTerm) ||
                        producto.codigo.toLowerCase().includes(searchTerm)
                    );

                    select.innerHTML = '<option value="">Seleccionar producto</option>';
                    filteredProducts.forEach(producto => {
                        select.innerHTML += `<option value="${producto.id}">${producto.nombre} - ${this.formatCurrency(producto.precioVenta)} (Stock: ${producto.cantidadDisponible})</option>`;
                    });
                });
            }

            this.updateVentaProductsList();
            this.updateVentaTotals();
        } catch (error) {
            console.error('Error loading products:', error);
            window.showToast('Error al cargar productos.', 'error');
        }
    }

    async addVentaProduct() {
        const productSelect = document.getElementById('ventaProductoSelect');
        const cantidadInput = document.getElementById('ventaCantidad');

        if (!productSelect.value || !cantidadInput.value) {
            window.showToast('Selecciona un producto y cantidad válida.', 'error');
            return;
        }

        const cantidad = parseInt(cantidadInput.value);
        if (cantidad <= 0) {
            window.showToast('La cantidad debe ser mayor a 0.', 'error');
            return;
        }

        // Find product details from the loaded products
        const productId = parseInt(productSelect.value);
        try {
            const productos = await this.transaccionService.getProductosParaVenta();
            const selectedProduct = productos.find(p => p.id === productId);

            if (!selectedProduct) {
                window.showToast('Producto no encontrado.', 'error');
                return;
            }

            if (cantidad > selectedProduct.cantidadDisponible) {
                window.showToast('Cantidad excede la disponibilidad del producto.', 'error');
                return;
            }

            const existingLineIndex = this.transactionData.lineas.findIndex(line => line.productoId === selectedProduct.id);

            if (existingLineIndex > -1) {
                // Update existing line
                const existingLine = this.transactionData.lineas[existingLineIndex];
                existingLine.cantidad += cantidad;
                existingLine.subtotalLinea = existingLine.precioUnitario * existingLine.cantidad;
            } else {
                // Add new line
                this.transactionData.lineas.push({
                    productoId: selectedProduct.id,
                    nombreProducto: selectedProduct.nombre,
                    codigoProducto: selectedProduct.codigo,
                    cantidad: cantidad,
                    precioUnitario: selectedProduct.precioVenta,
                    descuento: 0,
                    subtotalLinea: selectedProduct.precioVenta * cantidad,
                    categoria: selectedProduct.categoria
                });
            }

            cantidadInput.value = 1;
            productSelect.value = '';
            this.updateVentaProductsList();
            this.updateVentaTotals();
            window.showToast('Producto agregado exitosamente.', 'success');
        } catch (error) {
            console.error('Error adding product:', error);
            window.showToast('Error al agregar producto.', 'error');
        }
    }

    updateVentaProductsList() {
        const container = document.getElementById('ventaProductsList');
        if (!container) return;

        if (this.transactionData.lineas.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay productos seleccionados</p>';
            return;
        }

        container.innerHTML = this.transactionData.lineas.map((linea, index) => `
            <div class="flex justify-between items-center bg-white p-3 border border-gray-200 rounded-lg">
                <div>
                    <span class="font-medium">${linea.nombreProducto}</span>
                    <span class="text-gray-600 ml-2">(${linea.cantidad} x ${this.formatCurrency(linea.precioUnitario)})</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="font-bold">${this.formatCurrency(linea.subtotalLinea)}</span>
                    <!-- Botón eliminar removido -->
                </div>
            </div>
        `).join('');
    }
    updateVentaTotals() {
        let subtotal = 0;
        let impuestos = 0;

        this.transactionData.lineas.forEach(line => {
            subtotal += line.subtotalLinea;
            // Assuming 18% ITBIS
            impuestos += line.subtotalLinea * 0.18;
        });

        this.transactionData.subtotal = subtotal;
        this.transactionData.impuestos = impuestos;
        this.transactionData.total = subtotal + impuestos;

        // Update display
        const subtotalElement = document.getElementById('ventaSubtotal');
        const impuestosElement = document.getElementById('ventaImpuestos');
        const totalElement = document.getElementById('ventaTotal');

        if (subtotalElement) subtotalElement.textContent = this.formatCurrency(this.transactionData.subtotal);
        if (impuestosElement) impuestosElement.textContent = this.formatCurrency(this.transactionData.impuestos);
        if (totalElement) totalElement.textContent = this.formatCurrency(this.transactionData.total);
    }

    validateVentaStep2() {
        if (this.transactionData.lineas.length === 0) {
            window.showToast('Debe agregar al menos un producto a la venta.', 'error');
            return false;
        }
        return true;
    }

    getVentaStep3Content() {
        return `
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-brand-brown">Método de Pago</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar método:</label>
                        <div class="space-y-2">
                            <label class="inline-flex items-center">
                                <input type="radio" name="ventaMetodoPago" value="EFECTIVO" class="form-radio text-brand-brown" checked>
                                <span class="ml-2">Efectivo</span>
                            </label>
                            <label class="inline-flex items-center">
                                <input type="radio" name="ventaMetodoPago" value="TARJETA" class="form-radio text-brand-brown">
                                <span class="ml-2">Tarjeta</span>
                            </label>
                            <label class="inline-flex items-center">
                                <input type="radio" name="ventaMetodoPago" value="TRANSFERENCIA" class="form-radio text-brand-brown">
                                <span class="ml-2">Transferencia</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                        <textarea id="ventaObservaciones" rows="4" placeholder="Observaciones adicionales..." 
                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown"></textarea>
                    </div>
                </div>
            </div>
        `;
    }

    validateVentaStep3() {
        const metodoPago = document.querySelector('input[name="ventaMetodoPago"]:checked')?.value;
        if (!metodoPago) {
            window.showToast('Selecciona un método de pago.', 'error');
            return false;
        }

        this.transactionData.metodoPago = metodoPago;
        this.transactionData.observaciones = document.getElementById('ventaObservaciones')?.value || '';
        return true;
    }

    getVentaStep4Content() {
        const clienteInfo = this.transactionData.cliente ?
            `${this.transactionData.cliente.nombre} ${this.transactionData.cliente.apellido} (${this.transactionData.cliente.cedula})` :
            'Consumidor Final';

        return `
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-brand-brown">Confirmación de Venta</h3>
                <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Cliente:</strong> ${clienteInfo}</p>
                    <p><strong>Método de Pago:</strong> ${this.transactionData.metodoPago}</p>
                    <p><strong>Total de Productos:</strong> ${this.transactionData.lineas.length}</p>
                    <p><strong>Subtotal:</strong> ${this.formatCurrency(this.transactionData.subtotal)}</p>
                    <p><strong>Impuestos:</strong> ${this.formatCurrency(this.transactionData.impuestos)}</p>
                    <p class="text-xl"><strong>Total a Cobrar:</strong> <span class="text-brand-brown">${this.formatCurrency(this.transactionData.total)}</span></p>
                </div>
                
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p class="text-sm text-yellow-700">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Revisa toda la información antes de procesar la venta. Una vez confirmada, no se podrá modificar.
                    </p>
                </div>
            </div>
        `;
    }



    // =============== COMPRA WIZARD METHODS ===============
    getCompraStep1Content() {
        return `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold text-brand-brown">Información del Proveedor</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Suplidor</label>
                    <input type="text" id="compraSuplidorSearch" placeholder="Buscar por nombre o RNC/Cédula..." 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar Suplidor</label>
                    <select id="compraSuplidorSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                        <option value="">Seleccione un suplidor</option>
                    </select>
                </div>
            </div>
            <div>
                <button type="button" id="btnNuevoSuplidor" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                    <i class="fas fa-plus mr-2"></i>Nuevo Suplidor
                </button>
            </div>
            <div id="compraProveedorForm" class="hidden space-y-4 border-t pt-4 mt-4">
                <p class="text-sm text-gray-600">Complete la información del proveedor para esta compra.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Proveedor *</label>
                        <input type="text" id="compraNombreProveedor" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">RNC/Cédula</label>
                        <input type="text" id="compraRncProveedor"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input type="tel" id="compraTelefonoProveedor"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="compraEmailProveedor"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                </div>
            </div>
        </div>
    `;
    }
    async loadCompraStep1Data() {
        try {
            const suplidores = await this.transaccionService.getSuplidores();
            const select = document.getElementById('compraSuplidorSelect');
            const searchInput = document.getElementById('compraSuplidorSearch');
            const form = document.getElementById('compraProveedorForm');
            const btnNuevoSuplidor = document.getElementById('btnNuevoSuplidor');

            // Inicializa el select con todos los suplidores
            if (select) {
                select.innerHTML = '<option value="">Seleccione un suplidor</option>';
                suplidores.forEach(suplidor => {
                    select.innerHTML += `<option value="${suplidor.id}">${suplidor.nombre} (${suplidor.rnc || 'Sin RNC'})</option>`;
                });
            }

            // Filtro dinámico por input
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filtered = suplidores.filter(suplidor =>
                        (suplidor.nombre && suplidor.nombre.toLowerCase().includes(searchTerm)) ||
                        (suplidor.rnc && suplidor.rnc.toLowerCase().includes(searchTerm)) ||
                        (suplidor.cedula && suplidor.cedula.toLowerCase().includes(searchTerm))
                    );
                    select.innerHTML = '<option value="">Seleccione un suplidor</option>';
                    filtered.forEach(suplidor => {
                        select.innerHTML += `<option value="${suplidor.id}">${suplidor.nombre} (${suplidor.rnc || 'Sin RNC'})</option>`;
                    });
                });
            }

            if (btnNuevoSuplidor) {
                btnNuevoSuplidor.addEventListener('click', () => {
                    form.classList.toggle('hidden');
                });
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
            window.showToast('Error al cargar suplidores.', 'error');
        }
    }

    validateCompraStep1() {
        const suplidorSelect = document.getElementById('compraSuplidorSelect');
        const nombreInput = document.getElementById('compraNombreProveedor');
        const rncInput = document.getElementById('compraRncProveedor');
        const telefonoInput = document.getElementById('compraTelefonoProveedor');
        const emailInput = document.getElementById('compraEmailProveedor');

        if (suplidorSelect.value && suplidorSelect.value !== 'new') {
            const selectedOption = suplidorSelect.options[suplidorSelect.selectedIndex];
            this.transactionData.proveedor = {
                id: suplidorSelect.value,
                nombre: selectedOption.text,
                rnc: '',
                telefono: '',
                email: ''
            };
        } else {
            const nombre = nombreInput?.value;
            if (!nombre || !nombre.trim()) {
                window.showToast('El nombre del proveedor es requerido.', 'error');
                return false;
            }
            this.transactionData.proveedor = {
                nombre: nombre.trim(),
                rnc: rncInput?.value || '',
                telefono: telefonoInput?.value || '',
                email: emailInput?.value || ''
            };
        }

        console.log('=== DEBUG: Proveedor data saved ===');
        console.log('Proveedor completo:', this.transactionData.proveedor);
        console.log('Nombre:', this.transactionData.proveedor?.nombre);
        console.log('ID:', this.transactionData.proveedor?.id);
        return true;
    }

    getCompraStep2Content() {
        return `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold text-brand-brown">Productos a Comprar</h3>
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p class="text-sm text-blue-700">
                    <i class="fas fa-info-circle mr-2"></i>
                    Registra los productos que vas a comprar. Estos se agregarán al inventario.
                </p>
            </div>
            
            <!-- BUSCADOR DE PRODUCTOS EXISTENTES -->
            <div class="border border-gray-200 rounded-lg p-4 mb-2">
                <h4 class="font-semibold text-brand-brown mb-2">Agregar producto existente</h4>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Producto</label>
                        <input type="text" id="compraBuscarProductoExistente" placeholder="Nombre o código..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                        <select id="compraProductoExistenteSelect"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <option value="">Seleccionar producto</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                        <input type="number" id="compraCantidadExistente" min="1" value="1"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                        <button type="button" id="btnAgregarProductoExistente"
                            class="w-full bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                            <i class="fas fa-plus mr-2"></i>Agregar
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- BOTÓN PARA FORMULARIO DE NUEVO PRODUCTO -->
            <div class="mb-2">
                <button type="button" id="btnToggleNuevoProducto"
                    class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                    <i class="fas fa-plus mr-2"></i>Registrar nuevo producto
                </button>
            </div>
            
            <!-- FORMULARIO PARA NUEVO PRODUCTO (OCULTO INICIALMENTE) -->
            <div id="compraProductsForm" class="space-y-4 border border-gray-200 rounded-lg p-4 hidden">
                <h4 class="font-semibold text-brand-brown mb-2">Registrar producto nuevo</h4>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
                        <input type="text" id="compraNombreProducto" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                        <input type="number" id="compraCantidad" min="1" value="1" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Precio Unitario *</label>
                        <input type="number" id="compraPrecioUnitario" step="0.01" min="0" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                        <button type="button" onclick="addCompraProduct()" 
                                class="w-full bg-brand-brown text-white px-4 py-2 rounded-lg hover:bg-brand-light-brown">
                            <i class="fas fa-plus mr-2"></i>Agregar
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="compraProductsList" class="space-y-2">
                <!-- Selected products will appear here -->
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between items-center text-lg">
                    <span class="font-bold">Total de Compra:</span>
                    <span id="compraTotal" class="font-bold text-brand-brown">${this.formatCurrency(0)}</span>
                </div>
            </div>
        </div>
    `;
    }
    async loadCompraStep2Data() {
        // Inicializa productos existentes
        if (!this._productosParaCompra) {
            this._productosParaCompra = await this.transaccionService.getProductosParaVenta();
        }
        const productos = this._productosParaCompra || [];
        const select = document.getElementById('compraProductoExistenteSelect');
        const searchInput = document.getElementById('compraBuscarProductoExistente');
        const cantidadInput = document.getElementById('compraCantidadExistente');
        const btnAgregar = document.getElementById('btnAgregarProductoExistente');
        const btnToggleNuevo = document.getElementById('btnToggleNuevoProducto');
        const formNuevo = document.getElementById('compraProductsForm');

        // Inicializa el select con todos los productos
        if (select) {
            select.innerHTML = '<option value="">Seleccionar producto</option>';
            productos.forEach(producto => {
                select.innerHTML += `<option value="${producto.id}">${producto.nombre} - ${this.formatCurrency(producto.precioVenta)} (Stock: ${producto.cantidadDisponible})</option>`;
            });
        }

        // Filtro dinámico por input
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = productos.filter(producto =>
                    producto.nombre.toLowerCase().includes(searchTerm) ||
                    producto.codigo.toLowerCase().includes(searchTerm)
                );
                select.innerHTML = '<option value="">Seleccionar producto</option>';
                filtered.forEach(producto => {
                    select.innerHTML += `<option value="${producto.id}">${producto.nombre} - ${this.formatCurrency(producto.precioVenta)} (Stock: ${producto.cantidadDisponible})</option>`;
                });
            });
        }

        // Toggle formulario para nuevo producto
        if (btnToggleNuevo && formNuevo) {
            btnToggleNuevo.onclick = () => formNuevo.classList.toggle('hidden');
        }

        // Evento para agregar producto EXISTENTE
        if (btnAgregar) {
            btnAgregar.onclick = () => {
                const id = parseInt(select.value);
                const cantidad = parseInt(cantidadInput.value);
                if (!id || !cantidad || cantidad <= 0) {
                    window.showToast('Selecciona un producto y cantidad válida.', 'error');
                    return;
                }
                const producto = productos.find(p => p.id === id);
                if (!producto) {
                    window.showToast('Producto no encontrado.', 'error');
                    return;
                }
                // Agrega a las líneas (puedes adaptar la lógica según tu modelo)
                this.transactionData.lineas.push({
                    productoId: producto.id,
                    nombreProducto: producto.nombre,
                    cantidad: cantidad,
                    precioUnitario: producto.precioVenta,
                    subtotalLinea: producto.precioVenta * cantidad,
                    categoria: producto.categoria,
                });
                cantidadInput.value = 1;
                select.value = '';
                this.updateCompraProductsList();
                this.updateCompraTotals();
                window.showToast('Producto agregado exitosamente.', 'success');
            };
        }

        // Inicializa totales
        this.updateCompraTotals();
    }

    addCompraProduct() {
        const nombre = document.getElementById('compraNombreProducto')?.value;
        const cantidad = parseInt(document.getElementById('compraCantidad')?.value);
        const precio = parseFloat(document.getElementById('compraPrecioUnitario')?.value);

        if (!nombre || !nombre.trim()) {
            window.showToast('El nombre del producto es requerido.', 'error');
            return;
        }

        if (!cantidad || cantidad <= 0) {
            window.showToast('La cantidad debe ser mayor a 0.', 'error');
            return;
        }

        if (!precio || precio <= 0) {
            window.showToast('El precio debe ser mayor a 0.', 'error');
            return;
        }

        const subtotal = cantidad * precio;
        const lineaCompra = {
            nombreProducto: nombre.trim(),
            cantidad: cantidad,
            precioUnitario: precio,
            subtotalLinea: subtotal
        };

        this.transactionData.lineas.push(lineaCompra);

        // Clear form
        document.getElementById('compraNombreProducto').value = '';
        document.getElementById('compraCantidad').value = '1';
        document.getElementById('compraPrecioUnitario').value = '';

        this.updateCompraProductsList();
        this.updateCompraTotals();
        window.showToast('Producto agregado exitosamente.', 'success');
    }

    updateCompraProductsList() {
        const container = document.getElementById('compraProductsList');
        if (!container) return;

        container.innerHTML = this.transactionData.lineas.map((linea, index) => `
            <div class="grid grid-cols-6 gap-4 items-center bg-white p-3 border border-gray-200 rounded-lg">
                <div class="col-span-2 font-medium">${linea.nombreProducto}</div>
                <div>
                    <label class="text-sm">Cant:</label>
                    <input type="number" value="${linea.cantidad}" onchange="window.transactionWizard.updateCompraProduct(${index}, 'cantidad', this.value)" class="w-full p-1 border rounded">
                </div>
                <div>
                    <label class="text-sm">Precio:</label>
                    <input type="number" value="${linea.precioUnitario}" onchange="window.transactionWizard.updateCompraProduct(${index}, 'precioUnitario', this.value)" class="w-full p-1 border rounded">
                </div>
                <div class="font-bold text-right">${this.formatCurrency(linea.subtotalLinea)}</div>
                <div>
                    <!-- Botón eliminar removido -->
                </div>
            </div>
        `).join('');
    }

    removeCompraProduct(index) {
        this.transactionData.lineas.splice(index, 1);
        this.updateCompraProductsList();
        this.updateCompraTotals();
    }

    updateCompraProduct(index, field, value) {
        const linea = this.transactionData.lineas[index];
        if (linea) {
            if (field === 'cantidad') {
                linea.cantidad = parseInt(value) || 0;
            } else if (field === 'precioUnitario') {
                linea.precioUnitario = parseFloat(value) || 0;
            }
            linea.subtotalLinea = linea.cantidad * linea.precioUnitario;
            this.updateCompraProductsList();
            this.updateCompraTotals();
        }
    }

    updateCompraTotals() {
        const total = this.transactionData.lineas.reduce((sum, linea) => sum + linea.subtotalLinea, 0);
        this.transactionData.subtotal = total;
        this.transactionData.impuestos = 0; // No taxes on purchases for this simple case
        this.transactionData.total = total;

        const totalElement = document.getElementById('compraTotal');
        if (totalElement) {
            totalElement.textContent = this.formatCurrency(total);
        }
    }

    validateCompraStep2() {
        if (this.transactionData.lineas.length === 0) {
            window.showToast('Debe agregar al menos un producto a la compra.', 'error');
            return false;
        }
        return true;
    }

    getCompraStep3Content() {
        return `
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-brand-brown">Confirmación de Compra</h3>
                <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Proveedor:</strong> ${this.transactionData.proveedor?.nombre}</p>
                    <p><strong>RNC:</strong> ${this.transactionData.proveedor?.rnc || 'N/A'}</p>
                    <p><strong>Total de Productos:</strong> ${this.transactionData.lineas.length}</p>
                    <p class="text-xl"><strong>Total a Pagar:</strong> <span class="text-brand-brown">${this.formatCurrency(this.transactionData.total)}</span></p>
                </div>
                
                <div class="space-y-2">
                    <h4 class="font-medium">Productos:</h4>
                    ${this.transactionData.lineas.map(linea => `
                        <div class="flex justify-between items-center bg-white p-2 border border-gray-200 rounded">
                            <span>${linea.nombreProducto} (x${linea.cantidad})</span>
                            <span class="font-medium">${this.formatCurrency(linea.subtotalLinea)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p class="text-sm text-yellow-700">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Revisa toda la información antes de procesar la compra. Los productos se agregarán al inventario.
                    </p>
                </div>
            </div>
        `;
    }
}

function cedulaToLong(cedula) {
    if (!cedula) return null;
    // Quita cualquier caracter que no sea dígito
    const soloNumeros = cedula.replace(/\D/g, '');
    // Si está vacío, regresa null
    if (!soloNumeros) return null;
    return Number(soloNumeros);
}

// Make wizard globally accessible for HTML onclicks
window.transactionWizard = new TransactionWizard();
window.openTransactionWizard = (type) => window.transactionWizard.open(type);
window.closeTransactionWizard = () => window.transactionWizard.close();
window.wizardNextStep = () => window.transactionWizard.nextStep();
window.wizardPrevStep = () => window.transactionWizard.prevStep();
window.addCompraProduct = () => window.transactionWizard.addCompraProduct();
window.removeCompraProduct = (index) => window.transactionWizard.removeCompraProduct(index);
window.updateCompraProduct = (index, field, value) => window.transactionWizard.updateCompraProduct(index, field, value);
// Para devoluciones
window.selectTransaccionOrigen = (id) => window.transactionWizard.selectTransaccionOrigen(id);
window.toggleProductoADevolver = (idx) => window.transactionWizard.toggleProductoADevolver(idx);