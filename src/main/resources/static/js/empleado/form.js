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
    ['cedula','nombre','apellido','telefono','rol','salario','email','userPassword','comision'].forEach(f => clearError(f));

    if (!data.cedula) {
        showError('cedula','La cédula es obligatoria'); valid = false;
    } else {
        const digits = data.cedula.replace(/\D/g,'');
        if (digits.length !== 11) {
            showError('cedula','Formato de cédula inválido'); valid = false;
        }
    }
    if (!data.nombre) { showError('nombre','El nombre es obligatorio'); valid = false; }
    if (!data.apellido) { showError('apellido','El apellido es obligatorio'); valid = false; }
    if (!data.telefono) {
        showError('telefono','El teléfono es obligatorio'); valid = false;
    } else {
        const telDigits = data.telefono.replace(/\D/g,'');
        if (telDigits.length !== 10) {
            showError('telefono','Formato de teléfono inválido'); valid = false;
        }
    }
    if (!data.rol) { showError('rol','El rol es obligatorio'); valid = false; }
    if (data.salario == null) {
        showError('salario','El salario es obligatorio'); valid = false;
    } else if (isNaN(data.salario) || data.salario < 0) {
        showError('salario','El salario debe ser ≥ 0'); valid = false;
    }
    if (!data.email) {
        showError('email', 'El correo electrónico es obligatorio'); valid = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showError('email', 'El correo electrónico no es válido'); valid = false;
        }
    }
    if (!cedulaParam) {
        if (!data.userPassword) {
            showError('userPassword', 'La contraseña para el usuario es obligatoria'); valid = false;
        } else if (data.userPassword.length < 8) {
            showError('userPassword', 'La contraseña debe tener al menos 8 caracteres'); valid = false;
        }
    }
    if (data.rol === 'COMERCIAL') {
        if (data.comision == null || data.comision === '') {
            showError('comision', 'La comisión es obligatoria para empleados comerciales');
            valid = false;
        } else if (isNaN(data.comision) || data.comision < 0 || data.comision > 100) {
            showError('comision', 'La comisión debe ser un valor numérico entre 0 y 100');
            valid = false;
        }
    }
    return valid;
}

const form = document.getElementById('empleadoForm');
const titleEl = document.getElementById('formTitle');
const descEl = document.getElementById('formDesc');
const submitBtn = document.getElementById('submitBtn');
const params = new URLSearchParams(window.location.search);
const cedulaParam = params.get('cedula');

function setMode() {
    const userPasswordContainer = document.getElementById('userPasswordContainer');
    if (cedulaParam) {
        document.title = 'Editar Empleado - Thelarte';
        titleEl.textContent = 'Editar Empleado';
        descEl.textContent = 'Actualiza la información del empleado';
        submitBtn.textContent = 'Actualizar Empleado';
        document.getElementById('cedula').setAttribute('disabled','disabled');
        loadEmpleado();
        if (userPasswordContainer) userPasswordContainer.classList.add('hidden');
    } else {
        document.title = 'Nuevo Empleado - Thelarte';
        titleEl.textContent = 'Nuevo Empleado';
        descEl.textContent = 'Registra un nuevo empleado en el sistema';
        submitBtn.textContent = 'Guardar Empleado';
        if (userPasswordContainer) userPasswordContainer.classList.remove('hidden');
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

        // Mostrar automáticamente el campo comisión si el empleado ya es COMERCIAL
        const comisionContainer = document.getElementById('comisionContainer');
        if (e.rol === 'COMERCIAL') {
            comisionContainer.classList.remove('hidden');
            document.getElementById('comision').value = e.comision != null ? e.comision : '';
        } else {
            comisionContainer.classList.add('hidden');
            document.getElementById('comision').value = '';
        }

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

    const cedula = document.getElementById('cedula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const rolEmpleado = document.getElementById('rol').value;
    const salarioVal = document.getElementById('salario').value;
    const salario = salarioVal !== '' ? parseFloat(salarioVal) : null;
    const email = document.getElementById('email').value.trim();
    const userPassword = document.getElementById('userPassword').value;
    const comisionVal = document.getElementById('comision').value;
    const comision = comisionVal !== '' ? parseFloat(comisionVal) : null;

    // Username: nombre + apellido sin espacios y en minúsculas
    const usuarioNombre = (nombre + apellido).replace(/\s+/g, '').toLowerCase();

    const data = { cedula, nombre, apellido, telefono, rol: rolEmpleado, salario, email, userPassword, comision };
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
    // Si es alta (modo creación), incluir la cédula en el payload
    if (!cedulaParam) {
        bodyPayload = {
            cedula,
            nombre,
            apellido,
            telefono,
            rol: rolEmpleado,
            salario,
            email,
            comision
        };
    } else {
        bodyPayload = {
            nombre,
            apellido,
            telefono,
            rol: rolEmpleado,
            salario,
            email,
            comision
        };
    }

    // Mapeo de rol empleado → userRole para crear usuario
    function mapEmpleadoRolToUserRole(rol) {
        switch (rol) {
            case "ADMIN": return "GERENTE";
            case "USER": return "TI";
            case "COMERCIAL": return "VENDEDOR";
            case "CAJERO": return "CONTABILIDAD";
            default: return "VENDEDOR";
        }
    }
    const userRole = mapEmpleadoRolToUserRole(rolEmpleado);

    if (!cedulaParam) {
        try {
            // 1. Crear empleado
            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bodyPayload)
            });
            if (resp.status === 400) {
                const errors = await resp.json();
                Object.entries(errors).forEach(([field, msg]) => showError(field, msg));
                throw new Error('Validation error');
            }
            if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

            // 2. Crear usuario vinculado
            const userPayload = {
                username: usuarioNombre,
                password: userPassword,
                roles: [userRole]
            };
            const userResp = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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
        return;
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
            Object.entries(errors).forEach(([field, msg]) => showError(field, msg));
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
    const cedEl = document.getElementById('cedula');
    const telEl = document.getElementById('telefono');
    if (cedEl) cedEl.addEventListener('input', formatCedula);
    if (telEl) telEl.addEventListener('input', formatTelefono);

    setMode();
});

document.getElementById('rol').addEventListener('change', function () {
    const rol = this.value;
    const comisionContainer = document.getElementById('comisionContainer');
    if (rol === 'COMERCIAL') {
        comisionContainer.classList.remove('hidden');
    } else {
        comisionContainer.classList.add('hidden');
        document.getElementById('comision').value = '';
        clearError('comision');
    }
});