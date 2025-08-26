// Validación de formulario de empleado
function validateFormEmpleado(empleadoData) {
    let isValid = true;

    // Limpiar errores anteriores
    clearEmpleadoErrors();

    // Validar cédula
    if (!empleadoData.cedula || empleadoData.cedula.trim() === '') {
        showEmpleadoError('empleadoCedulaError', 'La cédula es obligatoria');
        isValid = false;
    } else if (!validateCedulaFormat(empleadoData.cedula)) {
        showEmpleadoError('empleadoCedulaError', 'Formato de cédula inválido (XXX-XXXXXXX-X)');
        isValid = false;
    }

    // Validar nombre
    if (!empleadoData.nombre || empleadoData.nombre.trim() === '') {
        showEmpleadoError('empleadoNombreError', 'El nombre es obligatorio');
        isValid = false;
    } else if (empleadoData.nombre.trim().length < 2) {
        showEmpleadoError('empleadoNombreError', 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    }

    // Validar apellido
    if (!empleadoData.apellido || empleadoData.apellido.trim() === '') {
        showEmpleadoError('empleadoApellidoError', 'El apellido es obligatorio');
        isValid = false;
    } else if (empleadoData.apellido.trim().length < 2) {
        showEmpleadoError('empleadoApellidoError', 'El apellido debe tener al menos 2 caracteres');
        isValid = false;
    }

    // Validar teléfono
    if (!empleadoData.telefono || empleadoData.telefono.trim() === '') {
        showEmpleadoError('empleadoTelefonoError', 'El teléfono es obligatorio');
        isValid = false;
    } else if (!validatePhoneFormat(empleadoData.telefono)) {
        showEmpleadoError('empleadoTelefonoError', 'Formato de teléfono inválido (XXX-XXX-XXXX)');
        isValid = false;
    }

    // Validar email (opcional pero debe ser válido si se proporciona)
    if (empleadoData.email && empleadoData.email.trim() !== '') {
        if (!validateEmailFormat(empleadoData.email)) {
            showEmpleadoError('empleadoEmailError', 'Formato de email inválido');
            isValid = false;
        }
    }

    // Validar rol
    if (!empleadoData.rol || empleadoData.rol.trim() === '') {
        showEmpleadoError('empleadoRolError', 'El rol es obligatorio');
        isValid = false;
    } else if (!['ADMINISTRADOR', 'TI', 'VENDEDOR', 'CAJERO', 'CONTABILIDAD'].includes(empleadoData.rol)) {
        showEmpleadoError('empleadoRolError', 'Rol inválido');
        isValid = false;
    }

    // Validar salario
    if (!empleadoData.salario || empleadoData.salario <= 0) {
        showEmpleadoError('empleadoSalarioError', 'El salario debe ser mayor que cero');
        isValid = false;
    }

    // Validar comisión (solo para rol VENDEDOR)
    if (empleadoData.rol === 'VENDEDOR') {
        if (empleadoData.comision !== null && empleadoData.comision !== undefined) {
            if (empleadoData.comision < 0 || empleadoData.comision > 100) {
                showEmpleadoError('empleadoComisionError', 'La comisión debe estar entre 0 y 100');
                isValid = false;
            }
        }
    }

    // Validar fecha de contratación
    if (!empleadoData.fechaContratacion || empleadoData.fechaContratacion.trim() === '') {
        showEmpleadoError('empleadoFechaContratacionError', 'La fecha de contratación es obligatoria');
        isValid = false;
    } else {
        const fecha = new Date(empleadoData.fechaContratacion);
        const hoy = new Date();
        if (fecha > hoy) {
            showEmpleadoError('empleadoFechaContratacionError', 'La fecha de contratación no puede ser futura');
            isValid = false;
        }
    }

    return isValid;
}

function clearEmpleadoErrors() {
    const errorElements = [
        'empleadoCedulaError',
        'empleadoNombreError',
        'empleadoApellidoError',
        'empleadoTelefonoError',
        'empleadoEmailError',
        'empleadoRolError',
        'empleadoSalarioError',
        'empleadoComisionError',
        'empleadoFechaContratacionError',
        'empleadoPasswordError'
    ];

    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '';
            element.classList.add('hidden');
        }
    });

    // Remover bordes rojos de los inputs
    const inputs = document.querySelectorAll('#formEmpleado input, #formEmpleado select');
    inputs.forEach(input => {
        input.classList.remove('border-red-500');
    });
}

function showEmpleadoError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    // Agregar borde rojo al input correspondiente
    const inputId = errorId.replace('Error', '');
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.classList.add('border-red-500');
    }
}

function validateCedulaFormat(cedula) {
    // Formato: XXX-XXXXXXX-X (11 dígitos con guiones)
    const cedulaRegex = /^\d{3}-\d{7}-\d{1}$/;
    return cedulaRegex.test(cedula);
}

function validatePhoneFormat(phone) {
    // Formato: XXX-XXX-XXXX (10 dígitos con guiones)
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
}

function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Hacer la función disponible globalmente
window.validateFormEmpleado = validateFormEmpleado;
