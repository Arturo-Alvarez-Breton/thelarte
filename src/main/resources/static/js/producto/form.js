const form = document.getElementById('productoForm');
const titleEl = document.getElementById('formTitle');
const descEl = document.getElementById('formDesc');
const submitBtn = document.getElementById('submitBtn');
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// Previsualización de imagen (Base64)
document.addEventListener("DOMContentLoaded", function(){
    const input = document.getElementById('fotoInput');
    const preview = document.getElementById('fotoPreview');
    input.addEventListener('change', async function(e) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.classList.remove('hidden');
            }
            reader.readAsDataURL(input.files[0]);
        } else {
            preview.src = "#";
            preview.classList.add('hidden');
        }
    });
});

function setMode() {
    if (id) {
        document.title = 'Editar Producto - Thelarte';
        titleEl.textContent = 'Editar Producto';
        descEl.textContent = 'Actualiza la información del producto';
        submitBtn.textContent = 'Actualizar Producto';
        loadProducto();
    } else {
        document.title = 'Nuevo Producto - Thelarte';
        titleEl.textContent = 'Nuevo Producto';
        descEl.textContent = 'Registra un nuevo producto en el sistema';
        submitBtn.textContent = 'Guardar Producto';
    }
}

async function loadProducto() {
    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch(`/api/productos/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        const p = await resp.json();
        form.nombre.value = p.nombre || '';
        form.tipo.value = p.tipo || '';
        form.descripcion.value = p.descripcion || '';
        form.marca.value = p.marca || '';
        form.precio.value = p.precio || '';
        form.itbis.value = p.itbis || '';
        // Mostrar previsualización si existe foto
        if (p.fotoUrl && document.getElementById('fotoPreview')) {
            document.getElementById('fotoPreview').src = p.fotoUrl;
            document.getElementById('fotoPreview').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading producto:', error);
        alert('Error al cargar los datos del producto');
        location.href = 'index.html';
    }
}

// Convierte archivo a base64 para enviar en JSON
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // data:image/...;base64,...
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

form.addEventListener('submit', async e => {
    e.preventDefault();
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = id ? 'Actualizando...' : 'Guardando...';

    let fotoBase64 = null;
    // Selecciona por ID correcto del input para la foto
    const fotoInput = document.getElementById('fotoInput');
    // Si el usuario selecciona una foto nueva
    if (fotoInput && fotoInput.files.length > 0) {
        try {
            fotoBase64 = await getBase64(fotoInput.files[0]);
        } catch (err) {
            alert('Error leyendo la imagen');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }
        // Si está editando y ya hay una imagen previa cargada
    } else if (
        id &&
        document.getElementById('fotoPreview').src &&
        !document.getElementById('fotoPreview').classList.contains('hidden')
    ) {
        fotoBase64 = document.getElementById('fotoPreview').src;
    }

    // Validación básica
    if (!form.nombre.value.trim() || !form.tipo.value.trim() || !form.precio.value.trim()) {
        alert('Por favor, completa los campos obligatorios (Nombre, Tipo, Precio).');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }

    // Armar el objeto producto
    const producto = {
        nombre: form.nombre.value.trim(),
        tipo: form.tipo.value.trim(),
        descripcion: form.descripcion.value.trim(),
        marca: form.marca.value.trim(),
        precio: parseFloat(form.precio.value) || 0,
        itbis: parseFloat(form.itbis.value) || 0,
        fotoBase64: fotoBase64
    };

    const token = localStorage.getItem('authToken');
    const url = id ? `/api/productos/${id}` : '/api/productos';
    const method = id ? 'PUT' : 'POST';

    try {
        const resp = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(producto)
        });
        if (!resp.ok) throw new Error('Error guardando producto');
        alert(id ? 'Producto actualizado exitosamente!' : 'Producto creado exitosamente!');
        location.href = 'index.html';
    } catch (err) {
        alert(id ? 'Error al actualizar el producto. Por favor, intenta de nuevo.' : 'Error al crear el producto. Por favor, intenta de nuevo.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

setMode();