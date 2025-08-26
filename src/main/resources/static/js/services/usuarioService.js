export class UsuarioService {
    async getUsuarios() {
        try {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                console.warn('No JWT token found, redirecting to login');
                window.location.href = '/pages/login.html';
                return [];
            }

            const response = await fetch(`/api/usuarios`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                console.warn('Authentication failed, redirecting to login');
                window.location.href = '/pages/login.html';
                return [];
            }
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching usuarios:', error);
            throw error;
        }
    }
    async getUsuarioByUsername(username) {
        try {
            const token = localStorage.getItem('jwt_token');
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
            const token = localStorage.getItem('jwt_token');
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
            const token = localStorage.getItem('jwt_token');
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
            const token = localStorage.getItem('jwt_token');
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
    async deactivateUsuario(username) {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`/api/usuarios/${encodeURIComponent(username)}/deactivate`, {
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
            return await response.json();
        } catch (error) {
            console.error('Error deactivating usuario:', error);
            throw error;
        }
    }
    async activateUsuario(username) {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`/api/usuarios/${encodeURIComponent(username)}/activate`, {
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
            return await response.json();
        } catch (error) {
            console.error('Error activating usuario:', error);
            throw error;
        }
    }
}