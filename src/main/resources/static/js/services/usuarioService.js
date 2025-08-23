export class UsuarioService {
    async getUsuarios() {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/usuarios`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching usuarios:', error);
            throw error;
        }
    }
    async getUsuarioByUsername(username) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/usuarios/${encodeURIComponent(username)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 404) return null;
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching usuario by username:', error);
            throw error;
        }
    }
    async createUsuario(usuarioData) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(usuarioData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating usuario:', error);
            throw error;
        }
    }
    async updateUsuario(username, usuarioData) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/usuarios/${encodeURIComponent(username)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(usuarioData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating usuario:', error);
            throw error;
        }
    }
    async deleteUsuario(username) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/usuarios/${encodeURIComponent(username)}`, {
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
            console.error('Error deleting usuario:', error);
            throw error;
        }
    }
}