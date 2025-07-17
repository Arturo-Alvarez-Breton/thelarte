let transaccionService;
let suplidorService;
let productoService;
let suplidorSeleccionado = null;
let productosSeleccionados = [];
let productos = [];
let suplidores = [];

// Configuración de moneda dominicana
const CURRENCY_CONFIG = {
    locale: 'es-DO',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
};

function formatearMonedaDominicana(cantidad) {
    if (!cantidad && cantidad !== 0) return 'RD$ 0,00';
    
    const numero = Math.abs(cantidad);
    const partes = numero.toFixed(2).split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimal = partes[1];
    
    return `RD$ ${entero},${decimal}`;
}

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticación y permisos
    if (!verificarAutenticacion()) {
        return;
    }
    
    transaccionService = new TransaccionService();
    suplidorService = new SuplidorService();
    productoService = new ProductoService();
    
    inicializarFormulario();
    await cargarDatos();
});

function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    
    if (!token) {
        window.location.href = '/pages/login.html';
        return false;
    }
    
    if (!userRoles.includes('COMPRAS_SUPLIDOR')) {
        mostrarError('No tienes permisos para acceder a este módulo');
        setTimeout(() => {
            window.location.href = '/pages/dashboard.html';
        }, 2000);
        return false;
    }
    
    return true;
}

function inicializarFormulario() {
    // Configurar fecha actual
    const fechaActual = new Date().toISOString().slice(0, 16);
    document.getElementById('fecha').value = fechaActual;
    
    // Event listeners
    document.getElementById('buscarSuplidor').addEventListener('click', buscarSuplidor);
    document.getElementById('agregarProducto').addEventListener('click', agregarProducto);
    document.getElementById('btnGuardar').addEventListener('click', guardarCompra);
    document.getElementById('btnCancelar').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Calculadora automática
    document.getElementById('subtotal').addEventListener('input', calcularTotales);
    document.getElementById('impuestos').addEventListener('input', calcularTotales);
    document.getElementById('descuento').addEventListener('input', calcularTotales);
}

async function cargarDatos() {
    try {
        // Cargar datos iniciales
        [suplidores, productos] = await Promise.all([
            suplidorService.obtenerTodos(),
            productoService.obtenerTodos()
        ]);
        
        llenarSelectores();
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarError('Error al cargar los datos iniciales');
    }
}

function llenarSelectores() {
    // Llenar select de suplidores
    const selectSuplidor = document.getElementById('suplidorId');
    selectSuplidor.innerHTML = '<option value="">Seleccione un suplidor</option>';
    
    suplidores.forEach(suplidor => {
        const option = document.createElement('option');
        option.value = suplidor.id;
        option.textContent = suplidor.nombre;
        selectSuplidor.appendChild(option);
    });
    
    // Llenar select de productos
    const selectProducto = document.getElementById('productoId');
    selectProducto.innerHTML = '<option value="">Seleccione un producto</option>';
    
    productos.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.id;
        option.textContent = `${producto.nombre} - ${formatearMonedaDominicana(producto.precio)}`;
        selectProducto.appendChild(option);
    });
}

function buscarSuplidor() {
    const suplidorId = document.getElementById('suplidorId').value;
    
    if (!suplidorId) {
        mostrarError('Seleccione un suplidor');
        return;
    }
    
    suplidorSeleccionado = suplidores.find(s => s.id == suplidorId);
    
    if (suplidorSeleccionado) {
        document.getElementById('suplidorInfo').innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${suplidorSeleccionado.nombre}</h5>
                    <p class="card-text">
                        <strong>Teléfono:</strong> ${suplidorSeleccionado.telefono || 'No especificado'}<br>
                        <strong>Email:</strong> ${suplidorSeleccionado.email || 'No especificado'}<br>
                        <strong>Dirección:</strong> ${suplidorSeleccionado.direccion || 'No especificada'}
                    </p>
                </div>
            </div>
        `;
        
        // Habilitar sección de productos
        document.getElementById('productosSection').style.display = 'block';
    }
}

function agregarProducto() {
    const productoId = document.getElementById('productoId').value;
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const precio = parseFloat(document.getElementById('precio').value);
    
    if (!productoId || !cantidad || !precio) {
        mostrarError('Complete todos los campos del producto');
        return;
    }
    
    if (cantidad <= 0) {
        mostrarError('La cantidad debe ser mayor a 0');
        return;
    }
    
    if (precio <= 0) {
        mostrarError('El precio debe ser mayor a 0');
        return;
    }
    
    const producto = productos.find(p => p.id == productoId);
    
    if (!producto) {
        mostrarError('Producto no encontrado');
        return;
    }
    
    // Verificar si el producto ya está en la lista
    const productoExistente = productosSeleccionados.find(p => p.productoId == productoId);
    if (productoExistente) {
        mostrarError('El producto ya está agregado a la lista');
        return;
    }
    
    const subtotal = cantidad * precio;
    const impuesto = subtotal * 0.18; // 18% ITBIS
    const total = subtotal + impuesto;
    
    const productoSeleccionado = {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: cantidad,
        precioUnitario: precio,
        subtotal: subtotal,
        impuestoPorcentaje: 18,
        impuestoMonto: impuesto,
        total: total
    };
    
    productosSeleccionados.push(productoSeleccionado);
    
    // Actualizar tabla de productos
    actualizarTablaProductos();
    
    // Limpiar formulario de producto
    document.getElementById('productoId').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('precio').value = '';
    
    // Calcular totales
    calcularTotales();
}

function actualizarTablaProductos() {
    const tbody = document.getElementById('productosSeleccionados');
    tbody.innerHTML = '';
    
    productosSeleccionados.forEach((producto, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.productoNombre}</td>
            <td>${producto.cantidad}</td>
            <td>${formatearMonedaDominicana(producto.precioUnitario)}</td>
            <td>${formatearMonedaDominicana(producto.subtotal)}</td>
            <td>${formatearMonedaDominicana(producto.impuestoMonto)}</td>
            <td>${formatearMonedaDominicana(producto.total)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Mostrar tabla si hay productos
    const tablaContainer = document.getElementById('tablaProductosContainer');
    tablaContainer.style.display = productosSeleccionados.length > 0 ? 'block' : 'none';
}

function eliminarProducto(index) {
    productosSeleccionados.splice(index, 1);
    actualizarTablaProductos();
    calcularTotales();
}

function calcularTotales() {
    const subtotalProductos = productosSeleccionados.reduce((sum, p) => sum + p.subtotal, 0);
    const impuestosProductos = productosSeleccionados.reduce((sum, p) => sum + p.impuestoMonto, 0);
    
    // Descuento adicional
    const descuentoAdicional = parseFloat(document.getElementById('descuento').value) || 0;
    
    const subtotalFinal = subtotalProductos - descuentoAdicional;
    const totalFinal = subtotalFinal + impuestosProductos;
    
    document.getElementById('subtotalCalculado').textContent = formatearMonedaDominicana(subtotalFinal);
    document.getElementById('impuestosCalculados').textContent = formatearMonedaDominicana(impuestosProductos);
    document.getElementById('totalCalculado').textContent = formatearMonedaDominicana(totalFinal);
}

async function guardarCompra() {
    if (!suplidorSeleccionado) {
        mostrarError('Seleccione un suplidor');
        return;
    }
    
    if (productosSeleccionados.length === 0) {
        mostrarError('Agregue al menos un producto');
        return;
    }
    
    const transaccion = {
        tipo: 'COMPRA',
        fecha: document.getElementById('fecha').value,
        contraparteId: suplidorSeleccionado.id,
        tipoContraparte: 'SUPLIDOR',
        contraparteNombre: suplidorSeleccionado.nombre,
        numeroOrdenCompra: document.getElementById('numeroOrdenCompra').value,
        fechaEntregaEsperada: document.getElementById('fechaEntregaEsperada').value,
        condicionesPago: document.getElementById('condicionesPago').value,
        observaciones: document.getElementById('observaciones').value,
        lineas: productosSeleccionados.map(p => ({
            productoId: p.productoId,
            productoNombre: p.productoNombre,
            cantidad: p.cantidad,
            precioUnitario: p.precioUnitario,
            subtotal: p.subtotal,
            impuestoPorcentaje: p.impuestoPorcentaje,
            impuestoMonto: p.impuestoMonto,
            total: p.total
        }))
    };
    
    try {
        const response = await transaccionService.crear(transaccion);
        mostrarExito('Compra creada exitosamente');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error creando compra:', error);
        mostrarError('Error al crear la compra');
    }
}

function mostrarError(mensaje) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `;
    alertContainer.scrollIntoView({ behavior: 'smooth' });
}

function mostrarExito(mensaje) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `;
    alertContainer.scrollIntoView({ behavior: 'smooth' });
}

// Service classes
class TransaccionService {
    constructor() {
        this.baseUrl = '/api/transacciones';
    }
    
    async crear(transaccion) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transaccion)
        });
        if (!response.ok) throw new Error('Error al crear transacción');
        return await response.json();
    }
}

class SuplidorService {
    constructor() {
        this.baseUrl = '/api/suplidores';
    }
    
    async obtenerTodos() {
        const response = await fetch(this.baseUrl);
        if (!response.ok) throw new Error('Error al obtener suplidores');
        return await response.json();
    }
}

class ProductoService {
    constructor() {
        this.baseUrl = '/api/productos';
    }
    
    async obtenerTodos() {
        const response = await fetch(this.baseUrl);
        if (!response.ok) throw new Error('Error al obtener productos');
        return await response.json();
    }
}