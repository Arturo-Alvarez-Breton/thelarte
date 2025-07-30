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

function validateFormEmpleado(data) {
    let valid = true;
    [
        'empleadoCedula', 'empleadoNombre', 'empleadoApellido', 'empleadoTelefono',
        'empleadoEmail', 'empleadoRol', 'empleadoSalario', 'empleadoComision', 'empleadoFechaContratacion'
    ].forEach(f => clearError(f));

    // Validaciones básicas
    if (!data.cedula) {
        showError('empleadoCedula', 'La cédula es obligatoria');
        valid = false;
    } else {
        const digits = data.cedula.replace(/\D/g, '');
        if (digits.length !== 11) {
            showError('empleadoCedula', 'Formato de cédula inválido');
            valid = false;
        }
    }
    if (!data.nombre) { showError('empleadoNombre', 'El nombre es obligatorio'); valid = false; }
    if (!data.apellido) { showError('empleadoApellido', 'El apellido es obligatorio'); valid = false; }
    if (!data.telefono) {
        showError('empleadoTelefono', 'El teléfono es obligatorio');
        valid = false;
    } else {
        const telDigits = data.telefono.replace(/\D/g, '');
        if (telDigits.length !== 10) {
            showError('empleadoTelefono', 'Formato de teléfono inválido');
            valid = false;
        }
    }
    if (!data.rol) { showError('empleadoRol', 'El rol es obligatorio'); valid = false; }
    if (data.salario == null || data.salario === '') {
        showError('empleadoSalario', 'El salario es obligatorio');
        valid = false;
    } else if (isNaN(data.salario) || data.salario < 0) {
        showError('empleadoSalario', 'El salario debe ser mayor o igual a 0');
        valid = false;
    }
    // Comisión sólo para comercial
    if (data.rol === 'COMERCIAL') {
        if (data.comision == null || data.comision === '') {
            showError('empleadoComision', 'La comisión es obligatoria para empleados comerciales');
            valid = false;
        } else if (isNaN(data.comision) || data.comision < 0 || data.comision > 100) {
            showError('empleadoComision', 'La comisión debe estar entre 0 y 100');
            valid = false;
        }
    }
    // Email opcional pero si lo ponen, validar formato
    if (data.email) {
        const re = /\S+@\S+\.\S+/;
        if (!re.test(data.email)) {
            showError('empleadoEmail', 'Formato de correo inválido');
            valid = false;
        }
    }
    if (!data.fechaContratacion) {
        showError('empleadoFechaContratacion', 'La fecha de contratación es obligatoria');
        valid = false;
    }

    return valid;
}

// Asociar formateo y validación al DOM
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('empleadoCedula')?.addEventListener('input', formatCedula);
    document.getElementById('empleadoTelefono')?.addEventListener('input', formatTelefono);

    const form = document.getElementById('formEmpleado');
    if (form) {
        form.addEventListener('submit', function (e) {
            const data = {
                cedula: document.getElementById('empleadoCedula').value.trim(),
                nombre: document.getElementById('empleadoNombre').value.trim(),
                apellido: document.getElementById('empleadoApellido').value.trim(),
                telefono: document.getElementById('empleadoTelefono').value.trim(),
                email: document.getElementById('empleadoEmail').value.trim(),
                rol: document.getElementById('empleadoRol').value,
                salario: document.getElementById('empleadoSalario').value,
                comision: document.getElementById('empleadoComision').value,
                fechaContratacion: document.getElementById('empleadoFechaContratacion').value
            };
            if (!validateFormEmpleado(data)) {
                e.preventDefault();
                return false;
            }
        });
    }
});