// src/main/resources/static/js/services/transaccionService.js

export class TransaccionService {
    constructor() {
        this.baseUrl = '/api/cajero'; // Base URL for the API
    }

    async obtenerTransacciones(filters = {}) {
        console.log('Fetching transactions with filters:', filters);
        // const response = await fetch(`${this.baseUrl}/transacciones?${new URLSearchParams(filters)}`);
        // const data = await response.json();
        // return data;

        return [
            {
                id: 1,
                numeroFactura: 'F001',
                tipo: 'VENTA',
                fecha: '2025-07-24T10:00:00',
                estado: 'COMPLETADA',
                contraparteNombre: 'Cliente A',
                total: 150.00,
                metodoPago: 'EFECTIVO',
                lineas: [{ productoId: 1, nombreProducto: 'Producto X', cantidad: 1, precioUnitario: 150.00 }]
            },
            {
                id: 2,
                numeroFactura: 'F002',
                tipo: 'COMPRA',
                fecha: '2025-07-23T14:30:00',
                estado: 'PENDIENTE',
                contraparteNombre: 'Suplidor B',
                total: 500.00,
                metodoPago: 'TRANSFERENCIA',
                lineas: [{ productoId: 2, nombreProducto: 'Materia Prima Y', cantidad: 10, precioUnitario: 50.00 }]
            },
            {
                id: 3,
                numeroFactura: 'F003',
                tipo: 'VENTA',
                fecha: '2025-07-22T11:15:00',
                estado: 'CANCELADA',
                contraparteNombre: 'Cliente C',
                total: 75.00,
                metodoPago: 'TARJETA',
                lineas: [{ productoId: 3, nombreProducto: 'Servicio Z', cantidad: 1, precioUnitario: 75.00 }]
            },
        ];
    }

    async obtenerTransaccionPorId(id) {
        console.log('Fetching transaction by ID:', id);
        // const response = await fetch(`${this.baseUrl}/transacciones/${id}`);
        // const data = await response.json();
        // return data;

        const transactions = await this.obtenerTransacciones();
        return transactions.find(t => t.id === id);
    }

    async crearTransaccion(transactionData) {
        console.log('Creating transaction:', transactionData);
        // const response = await fetch(`${this.baseUrl}/transacciones`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(transactionData)
        // });
        // const data = await response.json();
        // return data;

        return { ...transactionData, id: Math.floor(Math.random() * 1000) + 100 };
    }

    async actualizarTransaccion(id, transactionData) {
        console.log('Updating transaction:', id, transactionData);
        // const response = await fetch(`${this.baseUrl}/transacciones/${id}`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(transactionData)
        // });
        // const data = await response.json();
        // return data;

        return { ...transactionData, id: id };
    }

    async eliminarTransaccion(id) {
        console.log('Deleting transaction:', id);
        // const response = await fetch(`${this.baseUrl}/transacciones/${id}`, {
        //     method: 'DELETE'
        // });
        // if (!response.ok) throw new Error('Failed to delete');
        return { success: true };
    }

    async getClienteByCedula(cedula) {
        console.log('Fetching client by cedula:', cedula);
        // const response = await fetch(`${this.baseUrl}/clientes/${cedula}`);
        // if (!response.ok) {
        //     if (response.status === 404) return null; // Client not found
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const data = await response.json();
        // return data;

        // Mock data
        const mockClients = [
            { cedula: '123456789', nombre: 'Juan', apellido: 'Perez', telefono: '809-111-2222', email: 'juan@example.com', direccion: 'Calle A #1' },
            { cedula: '987654321', nombre: 'Maria', apellido: 'Gomez', telefono: '809-333-4444', email: 'maria@example.com', direccion: 'Calle B #2' },
        ];
        return mockClients.find(client => client.cedula === cedula) || null;
    }

    async getProductoByCodigo(codigo) {
        console.log('Fetching product by code:', codigo);
        // const response = await fetch(`${this.baseUrl}/productos/codigo/${codigo}`);
        // if (!response.ok) {
        //     if (response.status === 404) return null; // Product not found
        //     throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const data = await response.json();
        // return data;

        // Mock data
        const mockProducts = [
            { id: 1, codigo: 'PROD001', nombre: 'Laptop XYZ', descripcion: 'Potente laptop para trabajo', categoria: 'Electronica', precioVenta: 1200.00, cantidadDisponible: 10, disponible: true, fotoURL: '', itbis: 0.18, esNuevo: false },
            { id: 2, codigo: 'PROD002', nombre: 'Mouse Inalambrico', descripcion: 'Mouse ergonomico', categoria: 'Electronica', precioVenta: 25.00, cantidadDisponible: 50, disponible: true, fotoURL: '', itbis: 0.18, esNuevo: false },
            { id: 3, codigo: 'SERV001', nombre: 'Servicio de Consultoria', descripcion: 'Consultoria IT', categoria: 'Servicios', precioVenta: 100.00, cantidadDisponible: 999, disponible: true, fotoURL: '', itbis: 0.00, esNuevo: false },
        ];
        return mockProducts.find(product => product.codigo === codigo) || null;
    }
}