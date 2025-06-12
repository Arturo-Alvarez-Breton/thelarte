import apiClient from './api';
import { Producto } from '../types/producto';

export class ProductService {
    static async getAll(): Promise<Producto[]> {
        const response = await apiClient.get<Producto[]>('/producto');
        return response.data;
    }
    static async getById(id: string): Promise<Producto> {
        const response = await apiClient.get<Producto>(`/producto/${id}`);
        return response.data;
    }

    static async create(producto: Omit<Producto, 'id'>): Promise<Producto> {
        const response = await apiClient.post<Producto>('/producto', producto);
        return response.data;
    }

    static async update(id: string, producto: Partial<Producto>): Promise<Producto> {
        const response = await apiClient.put<Producto>(`/producto/${id}`, producto);
        return response.data;
    }

    static async delete(id: string): Promise<void> {
        await apiClient.delete(`/producto/${id}`);
    }
}