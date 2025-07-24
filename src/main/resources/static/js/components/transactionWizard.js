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
            total: 0
        };
        this.steps = [];

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
        switch(type) {
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
                        onNext: () => this.validateVentaStep3()
                    },
                    {
                        title: 'Confirmación de Venta',
                        content: this.getVentaStep4Content(),
                        onNext: () => this.finalizeVenta(),
                        onLoad: () => this.loadVentaStep4Data()
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
                        onLoad: () => this.loadCompraStep3Data()
                    }
                ];
                break;
            default:
                // Keep original flow for unspecified types
                this.steps = [
                    {
                        title: 'Selecciona el tipo de transacción',
                        content: this.getStep1Content(),
                        onNext: () => this.validateStep1()
                    },
                    {
                        title: 'Detalles de la Transacción',
                        content: this.getStep2Content(),
                        onNext: () => this.validateStep2(),
                        onLoad: () => this.loadStep2Data()
                    },
                    {
                        title: 'Añadir Productos',
                        content: this.getStep3Content(),
                        onNext: () => this.validateStep3(),
                        onLoad: () => this.loadStep3Data()
                    },
                    {
                        title: 'Confirmación',
                        content: this.getStep4Content(),
                        onNext: () => this.finalizeTransaction(),
                        onLoad: () => this.loadStep4Data()
                    }
                ];
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
            total: 0
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
                        <input type="radio" name="transactionType" value="VENTA" class="form-radio text-brand-brown" ${this.transactionData.tipoTransaccion === 'VENTA' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700">Venta</span>
                    </label>
                    <label class="inline-flex items-center">
                        <input type="radio" name="transactionType" value="COMPRA" class="form-radio text-brand-brown" ${this.transactionData.tipoTransaccion === 'COMPRA' ? 'checked' : ''}>
                        <span class="ml-2 text-gray-700">Compra</span>
                    </label>
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
    getStep2Content() {
        return `
            <div class="space-y-4">
                <div>
                    <label for="clientSearch" class="block text-gray-700 text-sm font-bold mb-2">Cliente:</label>
                    <div class="flex">
                        <input type="text" id="clientSearch" placeholder="Buscar cliente por cédula o nombre" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <button id="searchClientBtn" class="bg-brand-brown hover:bg-brand-light-brown text-white font-bold py-2 px-4 rounded ml-2">Buscar</button>
                    </div>
                    <div id="selectedClientInfo" class="mt-2 p-2 border rounded bg-gray-100 ${this.transactionData.cliente ? '' : 'hidden'}">
                        ${this.transactionData.cliente ? `
                            <p><strong>Nombre:</strong> ${this.transactionData.cliente.nombre} ${this.transactionData.cliente.apellido}</p>
                            <p><strong>Cédula:</strong> ${this.transactionData.cliente.cedula}</p>
                        ` : ''}
                    </div>
                </div>
                <div>
                    <label for="paymentMethod" class="block text-gray-700 text-sm font-bold mb-2">Método de Pago:</label>
                    <select id="paymentMethod" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <option value="">Selecciona un método</option>
                        <option value="EFECTIVO" ${this.transactionData.metodoPago === 'EFECTIVO' ? 'selected' : ''}>Efectivo</option>
                        <option value="TARJETA" ${this.transactionData.metodoPago === 'TARJETA' ? 'selected' : ''}>Tarjeta</option>
                        <option value="TRANSFERENCIA" ${this.transactionData.metodoPago === 'TRANSFERENCIA' ? 'selected' : ''}>Transferencia</option>
                    </select>
                </div>
                <div>
                    <label for="observations" class="block text-gray-700 text-sm font-bold mb-2">Observaciones:</label>
                    <textarea id="observations" rows="3" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">${this.transactionData.observaciones}</textarea>
                </div>
            </div>
        `;
    }

    async loadStep2Data() {
        const searchClientBtn = document.getElementById('searchClientBtn');
        const clientSearchInput = document.getElementById('clientSearch');
        const selectedClientInfoDiv = document.getElementById('selectedClientInfo');
        const paymentMethodSelect = document.getElementById('paymentMethod');
        const observationsTextarea = document.getElementById('observations');

        if (clientSearchInput) {
            clientSearchInput.value = this.transactionData.cliente ? (this.transactionData.cliente.cedula || '') : '';
        }
        if (paymentMethodSelect) {
            paymentMethodSelect.value = this.transactionData.metodoPago;
        }
        if (observationsTextarea) {
            observationsTextarea.value = this.transactionData.observaciones;
        }

        if (searchClientBtn) {
            searchClientBtn.onclick = async () => {
                const searchTerm = clientSearchInput.value.trim();
                if (searchTerm) {
                    try {
                        const client = await this.transaccionService.getClienteByCedula(searchTerm);
                        if (client) {
                            this.transactionData.cliente = client;
                            selectedClientInfoDiv.innerHTML = `
                                <p><strong>Nombre:</strong> ${client.nombre} ${client.apellido}</p>
                                <p><strong>Cédula:</strong> ${client.cedula}</p>
                            `;
                            selectedClientInfoDiv.classList.remove('hidden');
                            window.showToast('Cliente encontrado.', 'success');
                        } else {
                            this.transactionData.cliente = null;
                            selectedClientInfoDiv.classList.add('hidden');
                            window.showToast('Cliente no encontrado.', 'info');
                        }
                    } catch (error) {
                        console.error('Error searching client:', error);
                        window.showToast('Error al buscar cliente.', 'error');
                        this.transactionData.cliente = null;
                        selectedClientInfoDiv.classList.add('hidden');
                    }
                } else {
                    this.transactionData.cliente = null;
                    selectedClientInfoDiv.classList.add('hidden');
                }
            };
        }
    }

    validateStep2() {
        const paymentMethodSelect = document.getElementById('paymentMethod');
        const observationsTextarea = document.getElementById('observations');

        if (!paymentMethodSelect.value) {
            window.showToast('Por favor, selecciona un método de pago.', 'error');
            return false;
        }

        this.transactionData.metodoPago = paymentMethodSelect.value;
        this.transactionData.observaciones = observationsTextarea.value;
        return true;
    }

    // --- Step 3: Add Products ---
    getStep3Content() {
        return `
            <div class="space-y-4">
                <div>
                    <label for="productSearch" class="block text-gray-700 text-sm font-bold mb-2">Producto:</label>
                    <div class="flex">
                        <input type="text" id="productSearch" placeholder="Buscar producto por código o nombre" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <button id="searchProductBtn" class="bg-brand-brown hover:bg-brand-light-brown text-white font-bold py-2 px-4 rounded ml-2">Buscar</button>
                    </div>
                    <div id="foundProductInfo" class="mt-2 p-2 border rounded bg-gray-100 hidden"></div>
                </div>
                <div>
                    <label for="productQuantity" class="block text-gray-700 text-sm font-bold mb-2">Cantidad:</label>
                    <input type="number" id="productQuantity" value="1" min="1" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                </div>
                <button id="addProductBtn" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Añadir Producto</button>
                
                <div class="mt-6">
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Productos en la Transacción:</h3>
                    <div id="transactionProductsList" class="border rounded p-2">
                        <!-- Products will be listed here -->
                        ${this.transactionData.lineas.length > 0 ? this.transactionData.lineas.map((line, index) => `
                            <div class="flex justify-between items-center p-2 border-b last:border-b-0">
                                <span>${line.nombreProducto} (x${line.cantidad}) - ${this.formatCurrency(line.subtotalLinea)}</span>
                                <button data-index="${index}" class="remove-product-btn text-red-500 hover:text-red-700">X</button>
                            </div>
                        `).join('') : '<p class="text-gray-500">No hay productos añadidos.</p>'}
                    </div>
                    <div class="mt-2 text-right">
                        <p>Subtotal: <strong>${this.formatCurrency(this.transactionData.subtotal)}</strong></p>
                        <p>Impuestos: <strong>${this.formatCurrency(this.transactionData.impuestos)}</strong></p>
                        <p class="text-xl font-bold">Total: <strong>${this.formatCurrency(this.transactionData.total)}</strong></p>
                    </div>
                </div>
            </div>
        `;
    }

    async loadStep3Data() {
        const productSearchInput = document.getElementById('productSearch');
        const searchProductBtn = document.getElementById('searchProductBtn');
        const foundProductInfoDiv = document.getElementById('foundProductInfo');
        const productQuantityInput = document.getElementById('productQuantity');
        const addProductBtn = document.getElementById('addProductBtn');
        const transactionProductsList = document.getElementById('transactionProductsList');

        let selectedProduct = null;

        const renderProductList = () => {
            if (this.transactionData.lineas.length > 0) {
                transactionProductsList.innerHTML = this.transactionData.lineas.map((line, index) => `
                    <div class="flex justify-between items-center p-2 border-b last:border-b-0">
                        <span>${line.nombreProducto} (x${line.cantidad}) - ${this.formatCurrency(line.subtotalLinea)}</span>
                        <button data-index="${index}" class="remove-product-btn text-red-500 hover:text-red-700">X</button>
                    </div>
                `).join('');
            } else {
                transactionProductsList.innerHTML = '<p class="text-gray-500">No hay productos añadidos.</p>';
            }
            this.updateTotals();
        };

        if (searchProductBtn) {
            searchProductBtn.onclick = async () => {
                const searchTerm = productSearchInput.value.trim();
                if (searchTerm) {
                    try {
                        const product = await this.transaccionService.getProductoByCodigo(searchTerm); // Assuming search by code
                        if (product) {
                            selectedProduct = product;
                            foundProductInfoDiv.innerHTML = `
                                <p><strong>Nombre:</strong> ${product.nombre}</p>
                                <p><strong>Precio:</strong> ${this.formatCurrency(product.precioVenta)}</p>
                                <p><strong>Disponible:</strong> ${product.cantidadDisponible}</p>
                            `;
                            foundProductInfoDiv.classList.remove('hidden');
                            window.showToast('Producto encontrado.', 'success');
                        } else {
                            selectedProduct = null;
                            foundProductInfoDiv.classList.add('hidden');
                            window.showToast('Producto no encontrado.', 'info');
                        }
                    } catch (error) {
                        console.error('Error searching product:', error);
                        window.showToast('Error al buscar producto.', 'error');
                        selectedProduct = null;
                        foundProductInfoDiv.classList.add('hidden');
                    }
                } else {
                    selectedProduct = null;
                    foundProductInfoDiv.classList.add('hidden');
                }
            };
        }

        if (addProductBtn) {
            addProductBtn.onclick = () => {
                if (!selectedProduct) {
                    window.showToast('Por favor, busca y selecciona un producto.', 'error');
                    return;
                }
                const quantity = parseInt(productQuantityInput.value, 10);
                if (isNaN(quantity) || quantity <= 0) {
                    window.showToast('La cantidad debe ser un número positivo.', 'error');
                    return;
                }
                if (quantity > selectedProduct.cantidadDisponible) {
                    window.showToast('Cantidad excede la disponibilidad del producto.', 'error');
                    return;
                }

                const existingLineIndex = this.transactionData.lineas.findIndex(line => line.productoId === selectedProduct.id);

                if (existingLineIndex > -1) {
                    // Update existing line
                    const existingLine = this.transactionData.lineas[existingLineIndex];
                    existingLine.cantidad += quantity;
                    existingLine.subtotalLinea = existingLine.precioUnitario * existingLine.cantidad; // Simple calculation
                } else {
                    // Add new line
                    this.transactionData.lineas.push({
                        productoId: selectedProduct.id,
                        nombreProducto: selectedProduct.nombre,
                        codigoProducto: selectedProduct.codigo,
                        cantidad: quantity,
                        precioUnitario: selectedProduct.precioVenta,
                        descuento: 0, // For now, no discount
                        subtotalLinea: selectedProduct.precioVenta * quantity, // Simple calculation
                        categoria: selectedProduct.categoria
                    });
                }
                
                productSearchInput.value = '';
                productQuantityInput.value = 1;
                foundProductInfoDiv.classList.add('hidden');
                selectedProduct = null;
                renderProductList();
                window.showToast('Producto añadido.', 'success');
            };
        }

        // Event listener for removing products
        if (transactionProductsList) {
            transactionProductsList.addEventListener('click', (event) => {
                if (event.target.classList.contains('remove-product-btn')) {
                    const index = parseInt(event.target.dataset.index, 10);
                    this.transactionData.lineas.splice(index, 1);
                    renderProductList();
                    window.showToast('Producto eliminado.', 'info');
                }
            });
        }

        renderProductList(); // Initial render of products
    }

    validateStep3() {
        if (this.transactionData.lineas.length === 0) {
            window.showToast('Por favor, añade al menos un producto a la transacción.', 'error');
            return false;
        }
        return true;
    }

    // --- Step 4: Confirmation ---
    getStep4Content() {
        return `
            <div class="space-y-4">
                <h3 class="text-xl font-bold text-gray-800">Resumen de la Transacción</h3>
                <div class="p-4 border rounded bg-gray-50">
                    <p><strong>Tipo:</strong> ${this.formatTransactionType(this.transactionData.tipoTransaccion)}</p>
                    <p><strong>Cliente:</strong> ${this.transactionData.cliente ? `${this.transactionData.cliente.nombre} ${this.transactionData.cliente.apellido} (${this.transactionData.cliente.cedula})` : 'Consumidor Final'}</p>
                    <p><strong>Método de Pago:</strong> ${this.transactionData.metodoPago}</p>
                    <p><strong>Observaciones:</strong> ${this.transactionData.observaciones || 'N/A'}</p>
                </div>
                
                <h4 class="text-lg font-semibold text-gray-700 mt-4">Productos:</h4>
                <div class="border rounded p-2">
                    ${this.transactionData.lineas.length > 0 ? this.transactionData.lineas.map(line => `
                        <div class="flex justify-between items-center p-1 border-b last:border-b-0">
                            <span>${line.nombreProducto} (x${line.cantidad})</span>
                            <span>${this.formatCurrency(line.subtotalLinea)}</span>
                        </div>
                    `).join('') : '<p class="text-gray-500">No hay productos.</p>'}
                </div>

                <div class="mt-4 text-right">
                    <p>Subtotal: <strong>${this.formatCurrency(this.transactionData.subtotal)}</strong></p>
                    <p>Impuestos: <strong>${this.formatCurrency(this.transactionData.impuestos)}</strong></p>
                    <p class="text-2xl font-bold">Total: <strong>${this.formatCurrency(this.transactionData.total)}</strong></p>
                </div>
            </div>
        `;
    }

    loadStep4Data() {
        // Data is already in this.transactionData, just needs to be rendered by getStep4Content
        this.updateTotals(); // Ensure totals are up-to-date before displaying
    }

    async finalizeTransaction() {
        try {
            // Prepare data for API call
            const payload = {
                tipoTransaccion: this.transactionData.tipoTransaccion,
                cliente: this.transactionData.cliente ? {
                    cedula: this.transactionData.cliente.cedula,
                    nombre: this.transactionData.cliente.nombre,
                    apellido: this.transactionData.cliente.apellido
                } : null,
                metodoPago: this.transactionData.metodoPago,
                observaciones: this.transactionData.observaciones,
                lineas: this.transactionData.lineas.map(line => ({
                    productoId: line.productoId,
                    cantidad: line.cantidad,
                    precioUnitario: line.precioUnitario,
                    descuento: line.descuento,
                    subtotalLinea: line.subtotalLinea
                })),
                subtotal: this.transactionData.subtotal,
                impuestos: this.transactionData.impuestos,
                total: this.transactionData.total
            };

            const result = await this.transaccionService.crearTransaccion(payload);
            console.log('Transaction created:', result);
            window.showToast('Transacción creada exitosamente.', 'success');
            this.close();
            // Optionally, refresh the main transaction list or redirect
            // window.location.reload(); // Or a more targeted update
        } catch (error) {
            console.error('Error finalizing transaction:', error);
            window.showToast('Error al crear la transacción.', 'error');
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
    getVentaStep1Content() {
        return `
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-brand-brown">Información del Cliente</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                        <select id="ventaClienteSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <option value="">Consumidor Final</option>
                        </select>
                    </div>
                    <div>
                        <button type="button" onclick="window.showNewClientModal()" class="mt-6 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                            <i class="fas fa-plus mr-2"></i>Nuevo Cliente
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadVentaStep1Data() {
        try {
            const clientes = await this.transaccionService.getClientes();
            const select = document.getElementById('ventaClienteSelect');
            if (select) {
                select.innerHTML = '<option value="">Consumidor Final</option>';
                clientes.forEach(cliente => {
                    select.innerHTML += `<option value="${cliente.cedula}">${cliente.nombre} ${cliente.apellido} (${cliente.cedula})</option>`;
                });
            }
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    }

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
                    this.transactionData.cliente = { cedula: clienteCedula };
                }
            } catch (error) {
                console.error('Error loading client:', error);
                this.transactionData.cliente = { cedula: clienteCedula };
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

    removeVentaProduct(index) {
        this.transactionData.lineas.splice(index, 1);
        this.updateVentaProductsList();
        this.updateVentaTotals();
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

    loadVentaStep4Data() {
        // Data already loaded, just display
    }

    async finalizeVenta() {
        try {
            window.showToast('Procesando venta...', 'info');
            // Process the sale
            const result = await this.transaccionService.crearTransaccion(this.transactionData);
            window.showToast('Venta procesada exitosamente.', 'success');
            this.close();
            // Optionally reload transactions list if on transactions page
            if (window.transaccionesManager) {
                window.transaccionesManager.loadTransactions();
            }
        } catch (error) {
            console.error('Error processing sale:', error);
            window.showToast('Error al procesar la venta.', 'error');
        }
    }

    // =============== COMPRA WIZARD METHODS ===============
    getCompraStep1Content() {
        return `
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-brand-brown">Información del Proveedor</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar Suplidor</label>
                        <select id="compraSuplidorSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown">
                            <option value="">Nuevo Suplidor</option>
                        </select>
                    </div>
                    <div>
                        <button type="button" id="btnNuevoSuplidor" class="mt-6 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                            <i class="fas fa-plus mr-2"></i>Nuevo Suplidor
                        </button>
                    </div>
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
            const form = document.getElementById('compraProveedorForm');
            const btnNuevoSuplidor = document.getElementById('btnNuevoSuplidor');

            if (select) {
                select.innerHTML = '<option value="">Seleccione un suplidor</option>';
                suplidores.forEach(suplidor => {
                    select.innerHTML += `<option value="${suplidor.id}">${suplidor.nombre} (${suplidor.rnc || 'Sin RNC'})</option>`;
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
                
                <div id="compraProductsForm" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg">
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

    loadCompraStep2Data() {
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

    loadCompraStep3Data() {
        // Data already loaded, just display
        console.log('=== DEBUG: Datos en el paso 3 ===');
        console.log('Proveedor:', this.transactionData.proveedor);
        console.log('Líneas:', this.transactionData.lineas);
        console.log('Total:', this.transactionData.total);
    }

    async finalizeCompra() {
        try {
            window.showToast('Procesando compra...', 'info');
            
            // Prepare transaction data for COMPRA
            const transactionData = {
                tipoTransaccion: 'COMPRA',
                cliente: null, // For purchases, cliente is null
                proveedor: this.transactionData.proveedor,
                metodoPago: 'EFECTIVO', // Default for purchases
                observaciones: `Compra de proveedor: ${this.transactionData.proveedor.nombre}`,
                lineas: this.transactionData.lineas,
                subtotal: this.transactionData.subtotal,
                impuestos: this.transactionData.impuestos,
                total: this.transactionData.total
            };
            
            console.log('Sending purchase data:', transactionData);
            const result = await this.transaccionService.crearTransaccion(transactionData);
            window.showToast('Compra procesada exitosamente.', 'success');
            this.close();
            if (window.transaccionesManager) {
                window.transaccionesManager.loadTransactions();
            }
        } catch (error) {
            console.error('Error processing purchase:', error);
            window.showToast('Error al procesar la compra: ' + (error.message || error), 'error');
        }
    }
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