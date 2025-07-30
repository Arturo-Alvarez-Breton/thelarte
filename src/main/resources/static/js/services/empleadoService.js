export class EmpladoService {
    // Obtener lista de empleados para el frontend (filtro por nombre, cédula, email, rol, etc)
    async getEmpleados(busqueda = null, page = 0, size = 10) {
        console.log('Fetching empleados with search:', busqueda);
        try {
            const response = await fetch(`/api/empleados`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allEmpleados = await response.json();

            let filteredEmpleados = allEmpleados;
            if (busqueda) {
                const searchTerm = busqueda.toLowerCase();
                filteredEmpleados = allEmpleados.filter(emp =>
                    emp.nombre.toLowerCase().includes(searchTerm) ||
                    emp.apellido.toLowerCase().includes(searchTerm) ||
                    emp.cedula.toLowerCase().includes(searchTerm) ||
                    (emp.email && emp.email.toLowerCase().includes(searchTerm)) ||
                    (emp.rol && emp.rol.toLowerCase().includes(searchTerm))
                );
            }
            // Si quieres paginar en frontend:
            // const start = page * size;
            // return filteredEmpleados.slice(start, start + size);

            return filteredEmpleados;
        } catch (error) {
            console.error('Error fetching empleados:', error);
            throw error;
        }
    }

    // Obtener un empleado por cédula
    async getEmpleadoByCedula(cedula) {
        console.log('Fetching empleado by cedula:', cedula);
        try {
            const response = await fetch(`/api/empleados/${cedula}`);
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching empleado by cedula:', error);
            throw error;
        }
    }

    // Crear un empleado
    async createEmpleado(empleadoData) {
        console.log('Creating empleado:', empleadoData);
        try {
            const response = await fetch(`/api/empleados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empleadoData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating empleado:', error);
            throw error;
        }
    }

    // Actualizar un empleado
    async updateEmpleado(cedula, empleadoData) {
        console.log('Updating empleado:', cedula, empleadoData);
        try {
            const response = await fetch(`/api/empleados/${cedula}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empleadoData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating empleado:', error);
            throw error;
        }
    }

    // Eliminar un empleado (por cédula)
    async deleteEmpleado(cedula) {
        console.log('Deleting empleado:', cedula);
        try {
            const response = await fetch(`/api/empleados/${cedula}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return { success: true };
        } catch (error) {
            console.error('Error deleting empleado:', error);
            throw error;
        }
    }

}