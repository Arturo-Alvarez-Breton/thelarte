// Carga de provincias con fallback local en caso de error de red
async function cargarProvincias() {
    const provinciaSelect = document.getElementById('clienteProvincia');
    if (!provinciaSelect) return;
    provinciaSelect.innerHTML = '<option value="">Cargando provincias...</option>';
    provinciaSelect.disabled = true;
    try {
        let resp = await fetch('https://api.digital.gob.do/v1/territories/provinces', { cache: "no-store" });
        let data;
        if (resp.ok) {
            const json = await resp.json();
            data = Array.isArray(json.data) ? json.data : [];
        } else {
            data = [];
        }
        // Si la API falla o no hay datos, fallback local
        if (!data.length) {
            data = [
                { name: 'Distrito Nacional' }, { name: 'Santo Domingo' }, { name: 'Santiago' },
                { name: 'La Vega' }, { name: 'Puerto Plata' }, { name: 'San Cristóbal' },
                { name: 'La Romana' }, { name: 'San Pedro de Macorís' }, { name: 'Duarte' }
            ];
        }
        provinciaSelect.innerHTML = '<option value="">Seleccione una provincia</option>';
        data.forEach(prov => {
            const opt = document.createElement('option');
            opt.value = prov.name;
            opt.textContent = prov.name;
            provinciaSelect.appendChild(opt);
        });
        provinciaSelect.disabled = false;
    } catch (err) {
        provinciaSelect.innerHTML = '<option value="">Seleccione una provincia</option>';
        [
            'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Vega', 'Puerto Plata',
            'San Cristóbal', 'La Romana', 'San Pedro de Macorís', 'Duarte'
        ].forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            provinciaSelect.appendChild(opt);
        });
        provinciaSelect.disabled = false;
        console.error("Error cargando provincias:", err);
    }
}

// Formateo inteligente de cédula o RNC en tiempo real
function formatCedula(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '');

    // Determinar si es RNC (9 dígitos) o Cédula (11 dígitos)
    if (digits.length <= 9) {
        // Formato RNC: XXX-XXXXX-X
        digits = digits.slice(0, 9);
        let part1 = digits.slice(0, 3);
        let part2 = digits.slice(3, 8);
        let part3 = digits.slice(8, 9);
        let formatted = part1;
        if (part2) formatted += '-' + part2;
        if (part3) formatted += '-' + part3;
        input.value = formatted;
    } else {
        // Formato Cédula: XXX-XXXXXXX-X
        digits = digits.slice(0, 11);
        let part1 = digits.slice(0, 3);
        let part2 = digits.slice(3, 10);
        let part3 = digits.slice(10, 11);
        let formatted = part1;
        if (part2) formatted += '-' + part2;
        if (part3) formatted += '-' + part3;
        input.value = formatted;
    }
}

// Formateo de teléfono en tiempo real
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

// Validación de cédula o RNC
function validateCedulaOrRNC(cedula) {
    if (!cedula) return { valid: false, message: 'La cédula o RNC es obligatorio' };

    const digits = cedula.replace(/\D/g, '');

    if (digits.length === 9) {
        // Validación RNC
        if (!/^\d{3}-\d{5}-\d{1}$/.test(cedula)) {
            return { valid: false, message: 'Formato de RNC inválido (debe ser XXX-XXXXX-X)' };
        }
        return { valid: true, type: 'RNC' };
    } else if (digits.length === 11) {
        // Validación Cédula
        if (!/^\d{3}-\d{7}-\d{1}$/.test(cedula)) {
            return { valid: false, message: 'Formato de cédula inválido (debe ser XXX-XXXXXXX-X)' };
        }
        return { valid: true, type: 'Cédula' };
    } else {
        return {
            valid: false,
            message: 'Formato inválido. Debe ser una cédula (11 dígitos) o RNC (9 dígitos)'
        };
    }
}

// Validación de formulario
function validateFormCliente(data) {
    let valid = true;
    ['clienteCedula', 'clienteNombre', 'clienteApellido', 'clienteTelefono', 'clienteEmail', 'clienteProvincia', 'clienteDireccion'].forEach(field => {
        clearError(field);
    });

    // Validación de cédula o RNC
    const cedulaValidation = validateCedulaOrRNC(data.cedula);
    if (!cedulaValidation.valid) {
        showError('clienteCedula', cedulaValidation.message);
        valid = false;
    }

    if (!data.nombre) {
        showError('clienteNombre', 'El nombre es obligatorio');
        valid = false;
    }
    if (!data.apellido) {
        showError('clienteApellido', 'El apellido es obligatorio');
        valid = false;
    }
    if (!data.telefono) {
        showError('clienteTelefono', 'El teléfono es obligatorio');
        valid = false;
    } else {
        const telDigits = data.telefono.replace(/\D/g, '');
        if (telDigits.length !== 10) {
            showError('clienteTelefono', 'Formato de teléfono inválido');
            valid = false;
        }
    }
    if (!data.email) {
        showError('clienteEmail', 'El correo es obligatorio');
        valid = false;
    } else {
        const re = /\S+@\S+\.\S+/;
        if (!re.test(data.email)) {
            showError('clienteEmail', 'Formato de correo inválido');
            valid = false;
        }
    }
    if (!data.provincia) {
        showError('clienteProvincia', 'La provincia es obligatoria');
        valid = false;
    }
    if (!data.direccion) {
        showError('clienteDireccion', 'La dirección detallada es obligatoria');
        valid = false;
    }
    return valid;
}

// Asocia formateo y validación al DOM y al abrir el modal de cliente
document.addEventListener('DOMContentLoaded', async () => {
    await cargarProvincias();

    // Si el modal se abre dinámicamente, vuelve a asociar los listeners tras cada apertura
    function bindInputFormatters() {
        document.getElementById('clienteCedula')?.removeEventListener('input', formatCedula);
        document.getElementById('clienteTelefono')?.removeEventListener('input', formatTelefono);
        document.getElementById('clienteCedula')?.addEventListener('input', formatCedula);
        document.getElementById('clienteTelefono')?.addEventListener('input', formatTelefono);
    }
    bindInputFormatters();

    // Si tu app cierra y vuelve a abrir el modal varias veces, re-asocia los listeners cada vez:
    window.showNuevoClienteModal = () => {
        document.getElementById('modalCliente').classList.remove('hidden');
        bindInputFormatters();
    };

    // Para compatibilidad, también refuérzalo al abrir con el botón de nuevo
    document.getElementById('nuevoClienteBtn')?.addEventListener('click', bindInputFormatters);

    // Validación al enviar
    const form = document.getElementById('formCliente');
    if (form) {
        form.addEventListener('submit', function (e) {
            const data = {
                cedula: document.getElementById('clienteCedula').value.trim(),
                nombre: document.getElementById('clienteNombre').value.trim(),
                apellido: document.getElementById('clienteApellido').value.trim(),
                telefono: document.getElementById('clienteTelefono').value.trim(),
                email: document.getElementById('clienteEmail').value.trim(),
                provincia: document.getElementById('clienteProvincia').value,
                direccion: document.getElementById('clienteDireccion').value.trim()
            };
            if (!validateFormCliente(data)) {
                e.preventDefault();
                return false;
            }
            // (el submit real lo maneja clientes.js)
        });
    }
});