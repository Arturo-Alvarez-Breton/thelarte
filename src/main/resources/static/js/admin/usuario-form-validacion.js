// Mostrar/limpiar errores de campos
export function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}
export function clearError(fieldId) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
    }
}

// Validación de formulario de usuario
export function validateFormUsuario(data, isEdit = false) {
    let valid = true;
    ['usuarioNombre', 'usuarioContrasena', 'usuarioRol', 'usuarioEmpleado'].forEach(field => clearError(field));

    if (!data.usuario) {
        showError('usuarioNombre', 'El nombre de usuario es obligatorio');
        valid = false;
    }
    if (!isEdit && (!data.contrasena || data.contrasena.length < 8)) {
        showError('usuarioContrasena', 'La contraseña es obligatoria y debe tener al menos 8 caracteres');
        valid = false;
    }
    if (isEdit && data.contrasena && data.contrasena.length < 8) {
        showError('usuarioContrasena', 'La contraseña debe tener al menos 8 caracteres');
        valid = false;
    }
    if (!data.rol) {
        showError('usuarioRol', 'El rol es obligatorio');
        valid = false;
    }
    if (!data.empleadoCedula) {
        showError('usuarioEmpleado', 'Debes seleccionar un empleado válido');
        valid = false;
    }
    return valid;
}