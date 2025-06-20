// /js/cliente/form.js

// Formato de cédula y teléfono
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
    // Limpiar errores previos
    ['cedula', 'nombre', 'apellido', 'telefono', 'email', 'provincia', 'direccionDetallada'].forEach(field => {
        clearError(field);
    });
    // Validar campos obligatorios
    if (!data.cedula) {
        showError('cedula', 'La cédula es obligatoria');
        valid = false;
    } else {
        const digits = data.cedula.replace(/\D/g, '');
        if (digits.length !== 11) {
            showError('cedula', 'Formato de cédula inválido');
            valid = false;
        }
    }
    if (!data.nombre) {
        showError('nombre', 'El nombre es obligatorio');
        valid = false;
    }
    if (!data.apellido) {
        showError('apellido', 'El apellido es obligatorio');
        valid = false;
    }
    if (!data.telefono) {
        showError('telefono', 'El teléfono es obligatorio');
        valid = false;
    } else {
        const telDigits = data.telefono.replace(/\D/g, '');
        if (telDigits.length !== 10) {
            showError('telefono', 'Formato de teléfono inválido');
            valid = false;
        }
    }
    if (!data.email) {
        showError('email', 'El correo es obligatorio');
        valid = false;
    } else {
        const re = /\S+@\S+\.\S+/;
        if (!re.test(data.email)) {
            showError('email', 'Formato de correo inválido');
            valid = false;
        }
    }
    if (!data.provincia) {
        showError('provincia', 'La provincia es obligatoria');
        valid = false;
    }
    if (!data.direccionDetallada) {
        showError('direccionDetallada', 'La dirección detallada es obligatoria');
        valid = false;
    }
    return valid;
}

/**
 * Verifica si el token es válido haciendo una petición al endpoint de validación
 * @param {string} token Token JWT a verificar
 */
async function verifyToken(token) {
    try {
        const resp = await fetch('/api/dashboard/validate', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
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

// Cargar provincias desde API Digital.gob.do
async function cargarProvincias() {
    const provinciaSelect = document.getElementById('provincia');
    provinciaSelect.innerHTML = '<option value="">Cargando provincias...</option>';
    provinciaSelect.disabled = true;
    try {
        // Ejemplo de endpoint público. Puedes necesitar key u otro endpoint según tu API.
        const resp = await fetch('https://api.digital.gob.do/v1/territories/provinces');
        if (!resp.ok) throw new Error('Error al obtener provincias');
        const json = await resp.json();
        // En este API, asumimos que json.data es array de { name, regionCode } (ajusta si es distinto)
        provinciaSelect.innerHTML = '<option value="">Seleccione una provincia</option>';
        if (Array.isArray(json.data)) {
            json.data.forEach(prov => {
                const opt = document.createElement('option');
                opt.value = prov.name; // guardamos el nombre; si prefieres el código, usa prov.regionCode
                opt.textContent = prov.name;
                provinciaSelect.appendChild(opt);
            });
        }
        provinciaSelect.disabled = false;
    } catch (err) {
        provinciaSelect.innerHTML = '<option value="">Error cargando provincias</option>';
        console.error("Error cargando provincias:", err);
        provinciaSelect.disabled = true;
    }
}

const form = document.getElementById('clienteForm');
const titleEl = document.getElementById('formTitle');
const descEl = document.getElementById('formDesc');
const submitBtn = document.getElementById('submitBtn');
const params = new URLSearchParams(window.location.search);
const cedulaParam = params.get('cedula');

function setMode() {
    const fechaContainer = document.getElementById('fechaRegistroContainer');
    if (cedulaParam) {
        document.title = 'Editar Cliente - Thelarte';
        titleEl.textContent = 'Editar Cliente';
        descEl.textContent = 'Actualiza la información del cliente';
        submitBtn.textContent = 'Actualizar Cliente';
        // Deshabilitar cédula para no permitir cambio de PK
        const cedulaEl = document.getElementById('cedula');
        cedulaEl.setAttribute('disabled', 'disabled');
        // Mostrar contenedor de fechaRegistro cuando se cargue
        fechaContainer.classList.remove('hidden');
        loadCliente();
    } else {
        document.title = 'Nuevo Cliente - Thelarte';
        titleEl.textContent = 'Nuevo Cliente';
        descEl.textContent = 'Registra un nuevo cliente en el sistema';
        submitBtn.textContent = 'Guardar Cliente';
        // Cargar provincias de entrada en modo nuevo
        // fechaRegistro no se muestra
    }
}

async function loadCliente() {
    try {
        const token = localStorage.getItem('authToken');
        const resp = await fetch(`/api/clientes/${encodeURIComponent(cedulaParam)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (resp.status === 404) {
            alert('Cliente no encontrado');
            window.location.href = 'index.html';
            return;
        }
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        const c = await resp.json();
        // Rellenar campos
        document.getElementById('cedula').value = c.cedula || '';
        document.getElementById('nombre').value = c.nombre || '';
        document.getElementById('apellido').value = c.apellido || '';
        document.getElementById('telefono').value = c.telefono || '';
        document.getElementById('email').value = c.email || '';
        // Dirección: dividimos si almacenaste antes "Provincia - Detalle" o similar.
        // Aquí suponemos que en backend guardas como "Provincia: DirecciónDetallada" o "<provincia>||<detalle>"
        // Si no hay forma de separar, muestra todo en detalle:
        let dir = c.direccion || '';
        // Intentemos separar por ": " (ajusta según convención). Si no, deja todo en detalle y provincia vacía:
        let provinciaValue = '';
        let detalleValue = dir;
        if (dir.includes(':')) {
            const parts = dir.split(':');
            provinciaValue = parts[0].trim();
            detalleValue = parts.slice(1).join(':').trim();
        }
        // Después de cargar provincias, seleccionamos la que coincida
        // Esperamos que cargarProvincias ya haya llenado <select>
        const provSelect = document.getElementById('provincia');
        // Si aún no cargó provincias, cargamos primero y luego seleccionamos
        if (provSelect.disabled) {
            await cargarProvincias();
        }
        // Seleccionar la opción que coincida con provinciaValue
        if (provinciaValue) {
            const opt = Array.from(provSelect.options).find(o => o.value === provinciaValue);
            if (opt) {
                provSelect.value = provinciaValue;
            }
        }
        document.getElementById('direccionDetallada').value = detalleValue;
        // Mostrar fechaRegistro en modo solo lectura
        if (c.fechaRegistro) {
            document.getElementById('fechaRegistroDisplay').textContent = c.fechaRegistro;
        }
    } catch (error) {
        console.error('Error loading cliente:', error);
        alert('Error al cargar los datos del cliente');
        window.location.href = 'index.html';
    }
}

form.addEventListener('submit', async e => {
    e.preventDefault();
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = cedulaParam ? 'Actualizando...' : 'Guardando...';

    // Recoger datos
    const cedulaInput = document.getElementById('cedula').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const provincia = document.getElementById('provincia').value;
    const direccionDetallada = document.getElementById('direccionDetallada').value.trim();

    const data = { cedula: cedulaInput, nombre, apellido, telefono, email, provincia, direccionDetallada };

    // Validar localmente
    if (!validateForm(data)) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
    }

    // Combinar provincia y detalle en un solo campo 'direccion'
    const direccionCombinada = provincia + ': ' + direccionDetallada;

    const token = localStorage.getItem('authToken');
    const url = cedulaParam ? `/api/clientes/${encodeURIComponent(cedulaParam)}` : '/api/clientes';
    const method = cedulaParam ? 'PUT' : 'POST';

    try {
        // Construir body. En PUT, omitimos la cédula en body, el path ya la identifica.
        let bodyPayload;
        if (cedulaParam) {
            bodyPayload = {
                nombre,
                apellido,
                telefono,
                email,
                direccion: direccionCombinada
                // no enviamos fechaRegistro
            };
        } else {
            bodyPayload = {
                cedula: cedulaInput,
                nombre,
                apellido,
                telefono,
                email,
                direccion: direccionCombinada
                // no enviamos fechaRegistro
            };
        }

        const resp = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bodyPayload)
        });

        if (resp.status === 400) {
            // Validación del servidor: asumimos que devuelve JSON { campo: mensaje }
            const errors = await resp.json();
            Object.entries(errors).forEach(([field, msg]) => {
                showError(field, msg);
            });
            throw new Error('Validation error');
        }
        if (resp.status === 404) {
            alert('Cliente no encontrado para actualizar');
            window.location.href = 'index.html';
            return;
        }
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        const saved = await resp.json();
        console.log('Cliente guardado/actualizado:', saved);
        alert(cedulaParam ? 'Cliente actualizado exitosamente!' : 'Cliente creado exitosamente!');
        window.location.href = 'index.html';
    } catch (error) {
        if (error.message !== 'Validation error') {
            console.error('Error saving cliente:', error);
            alert(cedulaParam ? 'Error al actualizar el cliente. Por favor, intenta de nuevo.' : 'Error al crear el cliente. Por favor, intenta de nuevo.');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Manejo de formateo y carga de provincias
document.addEventListener('DOMContentLoaded', async () => {
    // Validar token
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }
    verifyToken(token);

    // Mostrar bienvenida si aplica
    const welcomeMessage = document.getElementById('welcomeMessage');
    const userEmail = localStorage.getItem('userEmail') || 'Usuario';
    if (welcomeMessage) {
        welcomeMessage.textContent = `Bienvenido, ${userEmail}`;
    }
    const roleInfo = document.getElementById('roleInfo');
    if (roleInfo) {
        roleInfo.textContent = 'Usuario';
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userEmail');
                window.location.href = '/pages/login.html';
            }
        });
    }

    // Asociar formateo
    const cedulaInputEl = document.getElementById('cedula');
    const telefonoInputEl = document.getElementById('telefono');
    if (cedulaInputEl) cedulaInputEl.addEventListener('input', formatCedula);
    if (telefonoInputEl) telefonoInputEl.addEventListener('input', formatTelefono);

    // Cargar provincias antes de setMode, para que en edición se pueda seleccionar
    await cargarProvincias();

    setMode();
});
