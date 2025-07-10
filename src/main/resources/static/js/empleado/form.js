// /js/empleado/form.js

// Formateo de cédula y teléfono
function formatCedula(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '').slice(0, 11);
    let part1 = digits.slice(0, 3);
    let part2 = digits.slice(3, 10);
    let part3 = digits.slice(10, 11);
    let formatted = part1;
    if (part2) formatted += '-' + part2;
    if (part3) formatted += '-' + part3;
    input.value = formatted;
}
function formatTelefono(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '').slice(0, 10);
    let part1 = digits.slice(0, 3);
    let part2 = digits.slice(3, 6);
    let part3 = digits.slice(6, 10);
    let formatted = part1;
    if (part2) formatted += '-' + part2;
    if (part3) formatted += '-' + part3;
    input.value = formatted;
}

// Mostrar/limpiar errores
function showError(fieldId, message) {
    const el = document.getElementById(fieldId + 'Error');
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
}
function clearError(fieldId) {
    const el = document.getElementById(fieldId + 'Error');
    if (el) {
        el.textContent = '';
        el.classList.add('hidden');
    }
}

// Validación local
function validateForm(data) {
    let valid = true;
    ['cedula','nombre','apellido','telefono','rol','salario','email'].forEach(f => clearError(f));

    if (!data.cedula) {
        showError('cedula','La cédula es obligatoria'); valid = false;
    } else {
        const digits = data.cedula.replace(/\D/g,'');
        if (digits.length !== 11) {
            showError('cedula','Formato de cédula inválido'); valid = false;
        }
    }
    if (!data.nombre) {
        showError('nombre','El nombre es obligatorio'); valid = false;
    }
    if (!data.apellido) {
        showError('apellido','El apellido es obligatorio'); valid = false;
    }
    if (!data.telefono) {
        showError('telefono','El teléfono es obligatorio'); valid = false;
    } else {
        const telDigits = data.telefono.replace(/\D/g,'');
        if (telDigits.length !== 10) {
            showError('telefono','Formato de teléfono inválido'); valid = false;
        }
    }
    if (!data.rol) {
        showError('rol','El rol es obligatorio'); valid = false;
    }
    if (data.salario == null) {
        showError('salario','El salario es obligatorio'); valid = false;
    } else if (isNaN(data.salario) || data.salario < 0) {
        showError('salario','El salario debe ser ≥ 0'); valid = false;
    }
    if (!data.email) {
        showError('email', 'El correo electrónico es obligatorio'); valid = false;
    } else {
        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showError('email', 'El correo electrónico no es válido'); valid = false;
        }
    }
    return valid;
}

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
    } catch (err) {
        console.error('Error validating token:', err);
        return false;
    }
}

const form = document.getElementById('empleadoForm');
const titleEl = document.getElementById('formTitle');
const descEl = document.getElementById('formDesc');
const submitBtn = document.getElementById('submitBtn');
const params = new URLSearchParams(window.location.search);
const cedulaParam = params.get('cedula');

function setMode() {
    if (cedulaParam) {
        document.title = 'Editar Empleado - Thelarte';
        titleEl.textContent = 'Editar Empleado';
        descEl.textContent = 'Actualiza la información del empleado';
        submitBtn.textContent = 'Actualizar Empleado';
        document.getElementById('cedula').setAttribute('disabled','disabled');
        loadEmpleado();
    } else {
        document.title = 'Nuevo Empleado - Thelarte';
        titleEl.textContent = 'Nuevo Empleado';
        descEl.textContent = 'Registra un nuevo empleado en el sistema';
        submitBtn.textContent = 'Guardar Empleado';
    }
}

async function loadEmpleado() {
    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch(`/api/empleados/${encodeURIComponent(cedulaParam)}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (resp.status === 404) {
            alert('Empleado no encontrado');
            window.location.href = 'index.html';
            return;
        }
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const e = await resp.json();
        document.getElementById('cedula').value = e.cedula || '';
        document.getElementById('nombre').value = e.nombre || '';
        document.getElementById('apellido').value = e.apellido || '';
        document.getElementById('telefono').value = e.telefono || '';
        if (e.rol) document.getElementById('rol').value = e.rol;
        if (e.salario != null) document.getElementById('salario').value = e.salario;
        if (e.email) document.getElementById('email').value = e.email;
    } catch (err) {
        console.error('Error loading empleado:', err);
        alert('Error al cargar datos del empleado');
        window.location.href = 'index.html';
    }
}

form.addEventListener('submit', async e => {
    e.preventDefault();
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = cedulaParam ? 'Actualizando...' : 'Guardando...';

    // Recoger datos directamente de los elementos del formulario
    const cedula = document.getElementById('cedula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const rol = document.getElementById('rol').value;
    const salarioVal = document.getElementById('salario').value;
    const salario = salarioVal !== '' ? parseFloat(salarioVal) : null;
    const email = document.getElementById('email').value.trim();

    const data = { cedula, nombre, apellido, telefono, rol, salario, email };

    if (!validateForm(data)) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }

    const token = localStorage.getItem('authToken');
    const url = cedulaParam
        ? `/api/empleados/${encodeURIComponent(cedulaParam)}`
        : '/api/empleados';
    const method = cedulaParam ? 'PUT' : 'POST';

    let bodyPayload;
    if (cedulaParam) {
        bodyPayload = {
            nombre,
            apellido,
            telefono,
            rol,
            salario,
            email
        };
    } else {
        bodyPayload = {
            cedula,
            nombre,
            apellido,
            telefono,
            rol,
            salario,
            email
        };
    }

    // Si es alta, pedir la contraseña antes de enviar
    if (!cedulaParam) {
        // Mostrar popout simple (puedes usar SweetAlert2, aquí un prompt básico)
        let contrasena = prompt("Digite la contraseña para el usuario de este empleado:");
        if (!contrasena || contrasena.length < 8) {
            alert("Debe ingresar una contraseña de al menos 8 caracteres.");
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        try {
            // 1. Crear empleado
            const resp = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bodyPayload)
            });
            if (resp.status === 400) {
                const errors = await resp.json();
                Object.entries(errors).forEach(([field, msg]) => {
                    showError(field, msg);
                });
                throw new Error('Validation error');
            }
            if (resp.status === 403) {
                alert('No autorizado para esta acción');
                throw new Error('Forbidden');
            }
            if (!resp.ok) {
                throw new Error(`HTTP error! status: ${resp.status}`);
            }
            // 2. Crear usuario asociado
            const username = (nombre + apellido).replace(/\s+/g, '');
            const userPayload = {
                username: username,
                password: contrasena,
                roles: [rol]
            };
            const userResp = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userPayload)
            });
            if (!userResp.ok) {
                alert('Empleado creado, pero hubo un problema creando el usuario. Puedes crearlo manualmente.');
                window.location.href = 'index.html';
                return;
            }
            alert('Empleado y usuario creados exitosamente!');
            window.location.href = 'index.html';
        } catch (err) {
            if (err.message !== 'Validation error') {
                console.error('Error:', err);
                alert('Error al crear el empleado y usuario.');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
        return; // ¡No continuar al flujo de edición!
    }

    // Si es edición, flujo normal
    try {
        const resp = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bodyPayload)
        });
        if (resp.status === 400) {
            const errors = await resp.json();
            Object.entries(errors).forEach(([field, msg]) => {
                showError(field, msg);
            });
            throw new Error('Validation error');
        }
        if (resp.status === 403) {
            alert('No autorizado para esta acción');
            throw new Error('Forbidden');
        }
        if (resp.status === 404) {
            alert('Empleado no encontrado');
            window.location.href = 'index.html';
            return;
        }
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        alert('Empleado actualizado exitosamente!');
        window.location.href = 'index.html';
    } catch (err) {
        if (err.message !== 'Validation error') {
            console.error('Error saving empleado:', err);
            alert('Error al actualizar el empleado.');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }
    verifyToken(token);

    const welcomeMessage = document.getElementById('welcomeMessage');
    const userEmail = localStorage.getItem('userEmail') || 'Usuario';
    if (welcomeMessage) welcomeMessage.textContent = `Bienvenido, ${userEmail}`;
    const roleInfo = document.getElementById('roleInfo');
    if (roleInfo) roleInfo.textContent = 'Usuario';
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Cerrar sesión?')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userEmail');
                window.location.href = '/pages/login.html';
            }
        });
    }

    const cedEl = document.getElementById('cedula');
    const telEl = document.getElementById('telefono');
    if (cedEl) cedEl.addEventListener('input', formatCedula);
    if (telEl) telEl.addEventListener('input', formatTelefono);

    setMode();
});