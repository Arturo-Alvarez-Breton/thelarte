// /js/usuario/form.js
// Estructura y lógica similar a cliente, ajustada a la entidad User de Spring

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

// Validación de formulario de usuario
function validateForm(data) {
    let valid = true;
    ['usuario', 'contrasena', 'rol'].forEach(field => clearError(field));

    if (!data.usuario) {
        showError('usuario', 'El nombre de usuario es obligatorio');
        valid = false;
    }
    if (!data.contrasena && !userParam) {
        showError('contrasena', 'La contraseña es obligatoria');
        valid = false;
    } else if (data.contrasena && data.contrasena.length < 8) {
        showError('contrasena', 'La contraseña debe tener al menos 8 caracteres');
        valid = false;
    }
    if (!data.rol) {
        showError('rol', 'El rol es obligatorio');
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
        const data = await resp.json();
        return data.authorized;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
}

// Parametrización y modo edición/creación
const form       = document.getElementById('usuarioForm');
const titleEl    = document.querySelector('h1.text-2xl');
const descEl     = document.querySelector('p.text-gray-600');
const submitBtn  = form.querySelector('button[type="submit"]');
const params     = new URLSearchParams(window.location.search);
const userParam  = params.get('usuario'); // parámetro para editar

function setMode() {
    if (userParam) {
        document.title       = 'Editar Usuario - Thelarte';
        titleEl.textContent  = 'Editar Usuario';
        descEl.textContent   = 'Actualiza la información del usuario';
        submitBtn.textContent= 'Actualizar Usuario';
        loadUser();
    } else {
        document.title       = 'Registrar Usuario - Thelarte';
        titleEl.textContent  = 'Registrar Usuario';
        descEl.textContent   = 'Complete la información del nuevo usuario';
        submitBtn.textContent= 'Guardar';
    }
}

// Cargar usuario existente en modo edición
async function loadUser() {
    try {
        const token = localStorage.getItem('authToken');
        const resp  = await fetch(`/api/usuarios/${encodeURIComponent(userParam)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (resp.status === 404) {
            alert('Usuario no encontrado');
            window.location.href = 'index.html';
            return;
        }
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const u = await resp.json();
        document.getElementById('usuario').value = u.username || '';
        if (Array.isArray(u.roles) && u.roles.length > 0) {
            document.getElementById('rol').value = u.roles[0];
        }
    } catch (error) {
        console.error('Error loading usuario:', error);
        alert('Error al cargar los datos del usuario');
        window.location.href = 'index.html';
    }
}

// Envío del formulario
form.addEventListener('submit', async e => {
    e.preventDefault();
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = userParam ? 'Actualizando...' : 'Guardando...';

    const usuarioInput = document.getElementById('usuario').value.trim();
    const contrasena   = document.getElementById('contrasena').value;
    const rol          = document.getElementById('rol').value;

    if (!validateForm({ usuario: usuarioInput, contrasena, rol })) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }

    const token = localStorage.getItem('authToken');
    const url   = userParam
        ? `/api/usuarios/${encodeURIComponent(userParam)}`
        : '/register';
    const method = userParam ? 'PUT' : 'POST';

    // Payload: siempre roles; password solo si se proporcionó
    const bodyPayload = {
        username: usuarioInput,
        roles: [rol]
    };
    if (contrasena) {
        bodyPayload.password = contrasena;
    }

    try {
        const resp = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(userParam ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(bodyPayload)
        });

        if (resp.status === 400) {
            const errors = await resp.json();
            Object.entries(errors).forEach(([field, msg]) => showError(field, msg));
            throw new Error('Validation error');
        }
        if (resp.status === 404) {
            alert('Usuario no encontrado para actualizar');
            window.location.href = 'index.html';
            return;
        }
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        alert(userParam
            ? 'Usuario actualizado exitosamente!'
            : 'Usuario creado exitosamente!');
        window.location.href = 'index.html';
    } catch (error) {
        if (error.message !== 'Validation error') {
            console.error('Error saving usuario:', error);
            alert(userParam
                ? 'Error al actualizar el usuario. Por favor, intenta de nuevo.'
                : 'Error al crear el usuario. Por favor, intenta de nuevo.');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Mostrar errores en el DOM y configurar modo
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (token) await verifyToken(token);

    ['usuario', 'contrasena', 'rol'].forEach(field => {
        if (!document.getElementById(field + 'Error')) {
            const input = document.getElementById(field);
            if (input) {
                const p = document.createElement('p');
                p.id = field + 'Error';
                p.className = 'text-xs text-red-500 mt-1 hidden';
                input.parentNode.appendChild(p);
            }
        }
    });

    setMode();
});
