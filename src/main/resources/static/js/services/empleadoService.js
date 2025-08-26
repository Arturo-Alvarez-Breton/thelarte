export class EmpleadoService {
    constructor() {
        this.baseURL = '/api/empleados';
    }

    async getTodosLosEmpleados(busqueda = null) {
        try {
            let url = `${this.baseURL}/todos`;
            if (busqueda) {
                url += `?busqueda=${encodeURIComponent(busqueda)}`;
            }

            const token = localStorage.getItem('jwt_token');
            if (!token) {
                console.warn('No JWT token found, redirecting to login');
                window.location.href = '/pages/login.html';
                return [];
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 401) {
                console.warn('Authentication failed, redirecting to login');
                window.location.href = '/pages/login.html';
                return [];
            }
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching all empleados:', error);
            throw error;
        }
    }

    async getEmpleados(busqueda = null) {
        try {
            let url = this.baseURL;
            if (busqueda) {
                url += `?busqueda=${encodeURIComponent(busqueda)}`;
            }

            const token = localStorage.getItem('jwt_token');
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching empleados:', error);
            throw error;
        }
    }

    async getEmpleadoByCedula(cedula) {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`${this.baseURL}/${encodeURIComponent(cedula)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Empleado no encontrado');
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching empleado by cedula:', error);
            throw error;
        }
    }

    async createEmpleado(empleadoData) {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(empleadoData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating empleado:', error);
            throw error;
        }
    }

    async updateEmpleado(cedula, empleadoData) {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`${this.baseURL}/${encodeURIComponent(cedula)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(empleadoData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating empleado:', error);
            throw error;
        }
    }

    async deleteEmpleado(cedula) {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`${this.baseURL}/${encodeURIComponent(cedula)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Error ${response.status}: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting empleado:', error);
            throw error;
        }
    }

    async restaurarEmpleado(cedula) {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`${this.baseURL}/${encodeURIComponent(cedula)}/restaurar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || `Error ${response.status}: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('Error restoring empleado:', error);
            throw error;
        }
    }

    // Método de utilidad para validar datos de empleado
    validateEmpleadoData(data) {
        const errors = [];

        if (!data.cedula || data.cedula.trim() === '') {
            errors.push('La cédula es obligatoria');
        }

        if (!data.nombre || data.nombre.trim() === '') {
            errors.push('El nombre es obligatorio');
        }

        if (!data.apellido || data.apellido.trim() === '') {
            errors.push('El apellido es obligatorio');
        }

        if (!data.telefono || data.telefono.trim() === '') {
            errors.push('El teléfono es obligatorio');
        }

        if (!data.rol || data.rol.trim() === '') {
            errors.push('El rol es obligatorio');
        }

        if (!data.salario || data.salario <= 0) {
            errors.push('El salario debe ser mayor que cero');
        }

        if (data.rol === 'COMERCIAL' && data.comision != null) {
            if (data.comision < 0 || data.comision > 100) {
                errors.push('La comisión debe estar entre 0 y 100');
            }
        }

        return errors;
    }

    // Método para formatear empleado para mostrar
    formatEmpleadoForDisplay(empleado) {
        return {
            ...empleado,
            nombreCompleto: `${empleado.nombre} ${empleado.apellido}`,
            salarioFormatted: empleado.salario ? `$${empleado.salario.toLocaleString('es-DO')}` : 'N/A',
            comisionFormatted: empleado.comision != null ? `${empleado.comision}%` : 'N/A',
            fechaContratacionFormatted: empleado.fechaContratacion ?
                new Date(empleado.fechaContratacion).toLocaleDateString('es-DO') : 'N/A'
        };
    }

    async buscarEmpleadosPorNombreApellido(nombre, apellido, pagina = 0, tamaño = 10, incluirEliminados = false) {
        try {
            let url = `${this.baseURL}/buscar?nombre=${encodeURIComponent(nombre)}&apellido=${encodeURIComponent(apellido)}&pagina=${pagina}&tamaño=${tamaño}`;
            if (incluirEliminados) {
                url += '&eliminados=true';
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error buscando empleados por nombre o apellido:', error);
            throw error;
        }
    }
}
