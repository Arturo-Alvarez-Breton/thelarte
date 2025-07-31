export class EmpleadoService {
    // Lista todos los empleados desde /api/empleados (sin filtrar/paginar en backend)
    async getEmpleados() {
        try {
            const response = await fetch(`/api/empleados`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching empleados:', error);
            throw error;
        }
    }

    // Obtener un empleado por cédula
    async getEmpleadoByCedula(cedula) {
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