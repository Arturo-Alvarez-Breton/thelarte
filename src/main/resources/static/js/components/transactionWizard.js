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

    setupEventListeners() {
        if (this.wizardPrevBtn) {
            this.wizardPrevBtn.onclick = () => this.prevStep();
        }
        if (this.wizardNextBtn) {
            this.wizardNextBtn.onclick = () => this.nextStep();
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
            metodoPago: '',
            observaciones: '',
            lineas: [],
            subtotal: 0,
            impuestos: 0,
            total: 0
        };
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
            this.wizardNextBtn.classList.toggle('hidden', this.currentStep === this.steps.length - 1);
            if (this.currentStep === this.steps.length - 1) {
                this.wizardNextBtn.textContent = 'Finalizar';
            } else {
                this.wizardNextBtn.textContent = 'Siguiente';
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
}

// Make wizard globally accessible for HTML onclicks
window.transactionWizard = new TransactionWizard();
window.openTransactionWizard = (type) => window.transactionWizard.open(type);
window.closeTransactionWizard = () => window.transactionWizard.close();
window.wizardNextStep = () => window.transactionWizard.nextStep();
window.wizardPrevStep = () => window.transactionWizard.prevStep();