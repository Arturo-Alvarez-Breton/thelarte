// Validación y formateo para formulario de empleado

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