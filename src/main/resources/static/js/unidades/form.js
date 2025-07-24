const form = document.getElementById('unidadForm');
const submitBtn = document.getElementById('submitBtn');
const params = new URLSearchParams(window.location.search);
const productoId = params.get('productoId');
const idUnidad = params.get('idUnidad');
const fechaIngresoInput = document.getElementById('fechaIngreso');
const estadoInput = document.getElementById('estado');
const stockInput = document.getElementById('stock');
const cantidadInput = document.getElementById('cantidad');
const cantidadWrapper = document.getElementById('cantidadWrapper');
const infoUnidad = document.getElementById('infoUnidad');
const infoProducto = document.getElementById('infoProducto');
const fotoProducto = document.getElementById('fotoProducto');
const comprasPendientesWrapper = document.getElementById('comprasPendientesWrapper');
const comprasPendientesBody = document.getElementById('comprasPendientesBody');
let comprasPendientes = [];
let compraSeleccionadaId = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!productoId) {
        alert('Falta el id del producto');
        window.location.href = '/pages/producto/index.html';
        return;
    }
    // Mostrar info unidad y producto
    await mostrarInfoUnidadProducto();

    if (idUnidad) {
        cantidadWrapper.style.display = 'none';
        cargarUnidad();
        submitBtn.textContent = 'Actualizar Unidad';
    } else {
        cantidadWrapper.style.display = '';
        await cargarComprasPendientes();        // <-- AGREGADO
        comprasPendientesWrapper.style.display = ''; // <-- AGREGADO
    }
    form.addEventListener('submit', handleSubmit);
});

async function mostrarInfoUnidadProducto() {
    if (idUnidad) {
        infoUnidad.textContent = `Editando unidad #${idUnidad}`;
    } else {
        infoUnidad.textContent = `Registra nuevas unidades`;
    }
    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch(`/api/productos/${productoId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error();
        const prod = await resp.json();
        infoProducto.textContent = prod.nombre ? `Producto: ${prod.nombre}` : '';
        console.log("Producto:", prod);
        console.log("fotoUrl:", prod.fotoUrl);

        if (prod.fotoUrl && prod.fotoUrl.trim() !== "") {
            fotoProducto.src = prod.fotoUrl;
            fotoProducto.style.display = "";
        } else {
            fotoProducto.style.display = "none";
        }
    } catch {
        infoProducto.textContent = '';
        fotoProducto.style.display = "none";
    }
}

async function cargarUnidad() {
    const token = localStorage.getItem('authToken');
    try {
        const resp = await fetch(`/api/unidades/${idUnidad}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('No se pudo cargar la unidad');
        const unidad = await resp.json();
        if (unidad.fechaIngreso) {
            fechaIngresoInput.value = new Date(unidad.fechaIngreso).toISOString().split('T')[0];
        }
        estadoInput.value = unidad.estado || '';
        stockInput.value = unidad.stock ? 'true' : 'false';
    } catch (err) {
        alert('Error al cargar la unidad. Redirigiendo...');
        window.location.href = `index.html?productoId=${productoId}`;
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = idUnidad ? 'Actualizando...' : 'Guardando...';

    const fechaIngreso = form.fechaIngreso.value ? new Date(form.fechaIngreso.value) : new Date();
    const estado = form.estado.value;
    const stock = form.stock.value === 'true';

    const token = localStorage.getItem('authToken');
    try {
        let url, method, resp;
        if (idUnidad) {
            // Editar (PUT)
            url = `/api/unidades/${idUnidad}`;
            method = 'PUT';
            const unidad = {
                idProducto: Number(productoId),
                fechaIngreso: fechaIngreso,
                estado: estado,
                stock: stock
            };
            resp = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(unidad)
            });
        } else {
            // Validación: requiere compra seleccionada
            if (!compraSeleccionadaId) {
                alert('Debes seleccionar una compra pendiente para asociar la unidad.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Registrar Unidad';
                return;
            }
            // Crear una o varias unidades (POST, cantidad)
            const cantidad = parseInt(cantidadInput.value, 10) || 1;
            for (let i = 0; i < cantidad; i++) {
                const unidad = {
                    idProducto: Number(productoId),
                    fechaIngreso: fechaIngreso,
                    estado: estado,
                    stock: stock,
                    transaccionOrigenId: compraSeleccionadaId // <-- Asocia la compra seleccionada
                };
                resp = await fetch('/api/unidades', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(unidad)
                });
                if (!resp.ok) throw new Error('Error guardando unidad');
                // Agrega la línea a la compra
                await agregarLineaACompra(compraSeleccionadaId, unidad.idProducto);
            }
        }
        if (!resp.ok) throw new Error('Error guardando unidad');
        alert(idUnidad ? 'Unidad actualizada exitosamente!' : 'Unidades registradas exitosamente!');
        window.location.href = `index.html?productoId=${productoId}`;
    } catch (err) {
        alert('Error al registrar la unidad. Por favor, intenta de nuevo.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = idUnidad ? 'Actualizar Unidad' : 'Registrar Unidad';
    }
}

// Función para agregar línea a compra
async function agregarLineaACompra(compraId, productoId) {
    const token = localStorage.getItem('authToken');
    const respProducto = await fetch(`/api/productos/${productoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!respProducto.ok) throw new Error('No se pudo obtener el producto');
    const producto = await respProducto.json();

    const linea = {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: 1,
        precioUnitario: producto.precioCompra,
        total: producto.precioCompra
    };
    const respLinea = await fetch(`/api/transacciones/${compraId}/lineas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(linea)
    });
    if (!respLinea.ok) throw new Error('Error asociando línea de compra');
}

async function cargarComprasPendientes() {
    const token = localStorage.getItem('authToken');
    try {
        const resp = await fetch('/api/transacciones/compras/pendientes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error();
        comprasPendientes = await resp.json();

        comprasPendientesBody.innerHTML = comprasPendientes.map(compra => `
            <tr class="border-b">
              <td class="px-3 py-2">${compra.id}</td>
              <td class="px-3 py-2">${new Date(compra.fecha).toLocaleDateString()}</td>
              <td class="px-3 py-2">${compra.contraparteNombre}</td>
              <td class="px-3 py-2">${compra.total ? `RD$ ${compra.total}` : '-'}</td>
              <td class="px-3 py-2">
                <input type="radio" name="compraSeleccionada" value="${compra.id}" onclick="seleccionarCompra(${compra.id})">
              </td>
            </tr>
        `).join('');
    } catch {
        comprasPendientesBody.innerHTML = '<tr><td colspan="5" class="px-3 py-2 text-red-600">No hay compras pendientes.</td></tr>';
    }
}

// Guardar compra seleccionada
window.seleccionarCompra = function(id) {
    compraSeleccionadaId = id;
};