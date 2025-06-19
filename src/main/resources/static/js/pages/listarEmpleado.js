// Datos estáticos de ejemplo; reemplazar cuando haya fetch real
const empleadosData = [
    // { id: 1, nombre: "Ana", apellido: "López", cedula: "001-0000001-0", telefono: "809-123-4567", rol: "EMPLEADO", salario: 35000 },
    // { id: 2, nombre: "Pedro", apellido: "Martínez", cedula: "002-0000002-0", telefono: "829-987-6543", rol: "GERENTE", salario: 55000 },
];

function renderEmpleados(data) {
    const tbody = document.getElementById('empleadosBody');
    const emptyMsg = document.getElementById('emptyMessage');
    tbody.innerHTML = '';
    if (!data || data.length === 0) {
        emptyMsg.classList.remove('hidden');
        return;
    }
    emptyMsg.classList.add('hidden');
    data.forEach(emp => {
        const tr = document.createElement('tr');
        tr.classList.add('border-b');
        tr.innerHTML = `
          <td class="px-4 py-2">${emp.id}</td>
          <td class="px-4 py-2">${emp.nombre}</td>
          <td class="px-4 py-2">${emp.apellido}</td>
          <td class="px-4 py-2">${emp.cedula}</td>
          <td class="px-4 py-2">${emp.telefono || '-'}</td>
          <td class="px-4 py-2">${emp.rol}</td>
          <td class="px-4 py-2">${emp.salario != null ? emp.salario : '-'}</td>
          <td class="px-4 py-2 space-x-2">
            <button data-id="${emp.id}" class="editar-btn text-blue-500 hover:underline">Editar</button>
            <button data-id="${emp.id}" class="eliminar-btn text-red-500 hover:underline">Eliminar</button>
          </td>
        `;
        tbody.appendChild(tr);
    });
    document.querySelectorAll('.editar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            editEmpleado(id);
        });
    });
    document.querySelectorAll('.eliminar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            deleteEmpleado(id);
        });
    });
}

function editEmpleado(id) {
    console.log("Editar empleado ID:", id);
    // Aquí redirigir o abrir modal de edición
    // ej: window.location.href = `/empleados/edit.html?id=${id}`;
}

function deleteEmpleado(id) {
    if (confirm("¿Seguro que deseas eliminar el empleado ID " + id + "?")) {
        console.log("Eliminar empleado ID:", id);
        // Ejemplo:
        // fetch(`/api/empleados/${id}`, { method: 'DELETE' }).then(...)
    }
}

async function loadEmpleados() {
    // Si hay endpoint real, descomentar y ajustar:
    // try {
    //   const resp = await fetch('/api/empleados');
    //   if (resp.ok) {
    //     const data = await resp.json();
    //     renderEmpleados(data);
    //   } else {
    //     console.error('Error al obtener empleados');
    //     renderEmpleados([]);
    //   }
    // } catch (err) {
    //   console.error('Error de red al cargar empleados', err);
    //   renderEmpleados([]);
    // }
    renderEmpleados(empleadosData);
}

document.getElementById('btnNuevoEmpleado').addEventListener('click', () => {
    console.log("Nuevo empleado");
    // Ejemplo de redirección: window.location.href = '/empleados/nuevo.html';
});

document.addEventListener('DOMContentLoaded', loadEmpleados);