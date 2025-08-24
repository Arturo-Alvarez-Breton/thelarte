export class ProductoService {
    async getProductos() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/productos`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching productos:', error);
            throw error;
        }
    }

    // Método para obtener todos los productos (incluyendo eliminados) para administración
    async getAllProductosIncludeDeleted() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/productos/all-inclusive`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching all productos:', error);
            throw error;
        }
    }

    // Método para obtener solo productos eliminados
    async getDeletedProductos() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/productos/deleted`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching deleted productos:', error);
            throw error;
        }
    }

    // Método para reactivar un producto eliminado
    async reactivateProducto(id) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/productos/${encodeURIComponent(id)}/reactivate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error reactivating producto:', error);
            throw error;
        }
    }

    async getProductoById(id) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/productos/${encodeURIComponent(id)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 404) return null;
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching producto by id:', error);
            throw error;
        }
    }

    async createProducto(productoData) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productoData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating producto:', error);
            throw error;
        }
    }

    async updateProducto(id, productoData) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/productos/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productoData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating producto:', error);
            throw error;
        }
    }

    async deleteProducto(id) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/productos/${encodeURIComponent(id)}`, {
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
            console.error('Error deleting producto:', error);
            throw error;
        }
    }
}