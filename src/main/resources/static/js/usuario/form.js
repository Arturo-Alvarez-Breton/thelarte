// Mostrar/limpiar errores
function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}
function clearError(fieldId) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
    }
}

// Validación simple de formulario
function validateForm(data) {
    let valid = true;
    ['usuario', 'contrasena', 'rol'].forEach(f => clearError(f));

    if (!data.usuario) {
        showError('usuario', 'El usuario es obligatorio.');
        valid = false;
    }
    if (!data.contrasena) {
        showError('contrasena', 'La contraseña es obligatoria.');
        valid = false;
    } else if (data.contrasena.length < 8) {
        showError('contrasena', 'La contraseña debe tener al menos 8 caracteres.');
        valid = false;
    }
    if (!data.rol) {
        showError('rol', 'El rol es obligatorio.');
        valid = false;
    }
    return valid;
}

// Verificar token JWT
async function verifyToken(token) {
    try {
        const resp = await fetch('/api/dashboard/validate', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            window.location.href = '/pages/login.html';
            return false;
        }
        const { authorized } = await resp.json();
        return authorized;
    } catch (err) {
        console.error('Error validating token:', err);
        return false;
    }
}

const form = document.getElementById('usuarioForm');
const titleEl = document.getElementById('formTitle');
const descEl = document.getElementById('formDesc');
const submitBtn = document.getElementById('submitBtn');
const params = new URLSearchParams(window.location.search);
const userParam = params.get('usuario');

function setMode() {
    const fechaContainer = document.getElementById('fechaRegistroContainer');
    if (userParam) {
        document.title = 'Editar Usuario - Thelarte';
        titleEl.textContent = 'Editar Usuario';
        descEl.textContent = 'Actualiza la información del usuario';
        submitBtn.textContent = 'Actualizar Usuario';
        fechaContainer.classList.remove('hidden');
        loadUser();
    } else {
        document.title = 'Nuevo Usuario - Thelarte';
        titleEl.textContent = 'Nuevo Usuario';
        descEl.textContent = 'Registra un nuevo usuario';
        submitBtn.textContent = 'Guardar Usuario';
    }
}

async function loadUser() {
    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch(`/api/usuarios/${encodeURIComponent(userParam)}`, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (resp.status === 404) {
            alert('Usuario no encontrado');
            window.location.href = 'index.html';
            return;
        }
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const u = await resp.json();
        document.getElementById('usuario').value = u.usuario || '';
        document.getElementById('rol').value = u.rol || '';
        if (u.fechaRegistro) document.getElementById('fechaRegistroDisplay').textContent = u.fechaRegistro;
    } catch (err) {
        console.error('Error loading usuario:', err);
        alert('Error al cargar los datos del usuario');
        window.location.href = 'index.html';
    }
}

form.addEventListener('submit', async e => {
    e.preventDefault();
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = userParam ? 'Actualizando...' : 'Guardando...';

    const data = {
        usuario: document.getElementById('usuario').value.trim(),
        contrasena: document.getElementById('contrasena').value,
        rol: document.getElementById('rol').value
    };

    if (!validateForm(data)) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }

    const token = localStorage.getItem('authToken');
    const url = userParam ? `/api/usuarios/${encodeURIComponent(userParam)}` : '/api/usuarios';
    const method = userParam ? 'PUT' : 'POST';

    try {
        const resp = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (resp.status === 400) {
            const errors = await resp.json();
            Object.entries(errors).forEach(([f, msg]) => showError(f, msg));
            throw new Error('Validation error');
        }
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        alert(userParam ? 'Usuario actualizado exitosamente!' : 'Usuario creado exitosamente!');
        window.location.href = 'index.html';
    } catch (err) {
        if (err.message !== 'Validation error') {
            console.error('Error saving usuario:', err);
            alert('Error al guardar el usuario. Intenta de nuevo.');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Iniciar
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return window.location.href = '/pages/login.html';
    await verifyToken(token);
    setMode();
});