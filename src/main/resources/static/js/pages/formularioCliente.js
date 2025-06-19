// --- Formateo de cédula y teléfono ---
function formatCedula(e) {
    let input = e.target;
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
    let input = e.target;
    let digits = input.value.replace(/\D/g, '').slice(0, 10);
    let part1 = digits.slice(0, 3);
    let part2 = digits.slice(3, 6);
    let part3 = digits.slice(6, 10);
    let formatted = part1;
    if (part2) formatted += '-' + part2;
    if (part3) formatted += '-' + part3;
    input.value = formatted;
}
document.getElementById('cedula').addEventListener('input', formatCedula);
document.getElementById('telefono').addEventListener('input', formatTelefono);

// --- Mostrar/limpiar errores ---
function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + 'Error');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}
function clearError(fieldId) {
    const errorEl = document.getElementById(fieldId + 'Error');
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
}

// --- Validar cédula contra API ---
async function validateCedulaAPI(cedulaFormatted) {
    const digits = cedulaFormatted.replace(/\D/g, '');
    if (digits.length !== 11) {
        return { valid: false, message: 'La cédula debe tener 11 dígitos' };
    }
    const url = `https://api.digital.gob.do/v3/cedulas/${digits}/validate`;
    try {
        const resp = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!resp.ok) {
            // Puede devolver 4xx/5xx si inválida o error; considerar inválida
            return { valid: false, message: 'Error validando cédula' };
        }
        const data = await resp.json();
        // Se asume esquema { valid: true/false, message?: string }
        if (data.valid === true) {
            return { valid: true };
        } else {
            const msg = data.message || 'Cédula no válida según la JCE';
            return { valid: false, message: msg };
        }
    } catch (err) {
        console.error('Error al llamar API de validación de cédula:', err);
        return { valid: false, message: 'No se pudo validar cédula (error de red)' };
    }
}

// Evento blur en cédula para feedback inmediato
document.getElementById('cedula').addEventListener('blur', async function() {
    const cedulaInput = this.value.trim();
    clearError('cedula');
    if (cedulaInput) {
        const errorEl = document.getElementById('cedulaError');
        errorEl.textContent = 'Validando cédula...';
        errorEl.classList.remove('hidden');
        const result = await validateCedulaAPI(cedulaInput);
        if (result.valid) {
            // Limpia mensaje si es válido
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
        } else {
            showError('cedula', result.message);
        }
    }
});

// --- Carga dinámica de provincias y municipios ---
async function cargarProvincias() {
    const provinciaSelect = document.getElementById('provincia');
    provinciaSelect.innerHTML = '<option value="">Cargando provincias...</option>';
    provinciaSelect.disabled = true;
    try {
        const resp = await fetch("https://api.digital.gob.do/v1/territories/provinces");
        if (!resp.ok) throw resp;
        const json = await resp.json();
        provinciaSelect.innerHTML = '<option value="">Seleccione una provincia</option>';
        // Suponiendo json.data es array de { name, regionCode }
        json.data.forEach(prov => {
            const opt = document.createElement('option');
            opt.value = prov.regionCode;
            opt.textContent = prov.name;
            provinciaSelect.appendChild(opt);
        });
        provinciaSelect.disabled = false;
    } catch (err) {
        provinciaSelect.innerHTML = '<option value="">Error al cargar provincias</option>';
        console.error("Error cargando provincias:", err);
    }
}

async function cargarMunicipios(regionCode) {
    const municipioSelect = document.getElementById('municipio');
    municipioSelect.innerHTML = '<option value="">Cargando municipios...</option>';
    municipioSelect.disabled = true;
    try {
        let url = `https://api.digital.gob.do/v1/territories/municipalities?regionCode=${regionCode}`;
        let resp = await fetch(url);

        if (!resp.ok) throw resp;
        const json = await resp.json();
        municipioSelect.innerHTML = '<option value="">Seleccione un municipio</option>';
        json.data.forEach(mun => {
            const opt = document.createElement('option');
            opt.value = mun.municipalityCode || mun.code || mun.id || mun.name;
            opt.textContent = mun.name;
            municipioSelect.appendChild(opt);
        });
        municipioSelect.disabled = false;
    } catch (err) {
        municipioSelect.innerHTML = '<option value="">Error al cargar municipios</option>';
        console.error("Error cargando municipios:", err);
    }
}

document.getElementById('provincia').addEventListener('change', function() {
    clearError('provincia');
    clearError('municipio');
    const regionCode = this.value;
    const municipioSelect = document.getElementById('municipio');
    if (regionCode) {
        cargarMunicipios(regionCode);
    } else {
        municipioSelect.innerHTML = '<option value="">Seleccione primero provincia</option>';
        municipioSelect.disabled = true;
    }
});

// --- Validación y envío del formulario ---
document.getElementById('registroForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = '';
    formMessage.className = '';

    let valid = true;
    ['cedula', 'nombre', 'apellido', 'telefono', 'correo', 'provincia', 'municipio', 'direccionDetallada'].forEach(field => {
        const value = document.getElementById(field).value.trim();
        if (!value) {
            showError(field, `El campo ${field} es obligatorio`);
            valid = false;
        }
    });

    if (!valid) return;

    const cedula = document.getElementById('cedula').value.trim();
    const cedulaResult = await validateCedulaAPI(cedula);
    if (!cedulaResult.valid) {
        showError('cedula', cedulaResult.message);
        return;
    }

    const datos = {
        cedula,
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        provinciaCode: document.getElementById('provincia').value,
        municipioCode: document.getElementById('municipio').value,
        direccionDetallada: document.getElementById('direccionDetallada').value.trim()
    };

    console.log("Datos a enviar:", datos);
    formMessage.textContent = 'Registro exitoso.';
    formMessage.className = 'text-green-600';

    this.reset();
    document.getElementById('municipio').innerHTML = '<option value="">Seleccione primero provincia</option>';
    document.getElementById('municipio').disabled = true;
});
// Iniciar carga de provincias al cargar DOM
document.addEventListener('DOMContentLoaded', cargarProvincias);