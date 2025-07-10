const form = document.getElementById('unidadForm');
const submitBtn = document.getElementById('submitBtn');
const params = new URLSearchParams(window.location.search);
const productoId = params.get('productoId');
const idUnidad = params.get('idUnidad'); // Nuevo: para edición
const fechaIngresoInput = document.getElementById('fechaIngreso');
const estadoInput = document.getElementById('estado');
const stockInput = document.getElementById('stock');

document.addEventListener('DOMContentLoaded', () => {
    if (!productoId) {
        alert('Falta el id del producto');
        window.location.href = '/pages/producto/index.html';
        return;
    }
    if (idUnidad) {
        cargarUnidad();
        submitBtn.textContent = 'Actualizar Unidad';
    }
    form.addEventListener('submit', handleSubmit);
});

// Carga los datos si es edición
async function cargarUnidad() {
    const token = localStorage.getItem('authToken');
    try {
        const resp = await fetch(`/api/unidades/${idUnidad}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('No se pudo cargar la unidad');
        const unidad = await resp.json();
        // Llena los campos del formulario
        if (unidad.fechaIngreso) {
            // Formatea la fecha a yyyy-MM-dd para el input date
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

    const unidad = {
        idProducto: Number(productoId),
        fechaIngreso: fechaIngreso,
        estado: estado,
        stock: stock
    };

    const token = localStorage.getItem('authToken');
    try {
        let url, method;
        if (idUnidad) {
            // Editar (PUT)
            url = `/api/unidades/${idUnidad}`;
            method = 'PUT';
        } else {
            // Crear (POST)
            url = '/api/unidades';
            method = 'POST';
        }
        const resp = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(unidad)
        });
        if (!resp.ok) throw new Error('Error guardando unidad');
        alert(idUnidad ? 'Unidad actualizada exitosamente!' : 'Unidad registrada exitosamente!');
        window.location.href = `index.html?productoId=${productoId}`;
    } catch (err) {
        alert('Error al registrar la unidad. Por favor, intenta de nuevo.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = idUnidad ? 'Actualizar Unidad' : 'Registrar Unidad';
    }
}