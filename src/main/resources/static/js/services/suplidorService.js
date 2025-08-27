export class SuplidorService {
    async getSuplidores() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/suplidores/todos`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching suplidores:', error);
            throw error;
        }
    }

    async getSuplidoresActivos() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/suplidores`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching suplidores activos:', error);
            throw error;
        }
    }

    async getSuplidoresInactivos() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/suplidores/inactivos`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching suplidores inactivos:', error);
            throw error;
        }
    }

    async getSuplidorById(id) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/suplidores/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 404) return null;
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching suplidor by id:', error);
            throw error;
        }
    }

    async createSuplidor(suplidorData) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/suplidores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(suplidorData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating suplidor:', error);
            throw error;
        }
    }

    async updateSuplidor(id, suplidorData) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/suplidores/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(suplidorData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating suplidor:', error);
            throw error;
        }
    }

    async deleteSuplidor(id) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/suplidores/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return { success: true };
        } catch (error) {
            console.error('Error deleting suplidor:', error);
            throw error;
        }
    }

    async desactivarSuplidor(id) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/suplidores/${id}/desactivar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return { success: true };
        } catch (error) {
            console.error('Error deactivating suplidor:', error);
            throw error;
        }
    }

    async activarSuplidor(id) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/suplidores/${id}/activar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return { success: true };
        } catch (error) {
            console.error('Error activating suplidor:', error);
            throw error;
        }
    }
}
