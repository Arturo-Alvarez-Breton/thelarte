// src/main/resources/static/js/services/cardnetService.js
export class CardnetService {
    constructor() {
        this.apiUrl = '/api/payments'; // URL a tu API backend
    }

    /**
     * Crea una sesión de pago usando el backend
     * @param {Object} paymentData - Datos de la transacción
     * @param {boolean} useTerminal - Indica si se debe usar terminal físico
     * @returns {Promise<Object>} - Respuesta con SESSION y session-key
     */
    async createSession(paymentData, useTerminal = false) {
        try {
            // Añade bandera para indicar si es para terminal físico
            const requestData = {
                ...this.preparePaymentData(paymentData),
                usePhysicalTerminal: useTerminal
            };

            const response = await fetch(`${this.apiUrl}/create-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`Error al crear sesión de pago: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en CardnetService.createSession:', error);
            throw error;
        }
    }

    /**
     * Consulta el estado de una transacción en el terminal físico
     * @param {string} sessionId - ID de sesión
     * @returns {Promise<Object>} - Estado actual de la transacción
     */
    async checkStatus(sessionId) {
        try {
            const response = await fetch(`${this.apiUrl}/status/${sessionId}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Error al consultar estado: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en CardnetService.checkStatus:', error);
            throw error;
        }
    }

    /**
     * Verifica el resultado de una transacción usando el backend
     * @param {string} sessionId - ID de sesión
     * @param {string} sessionKey - Clave de sesión
     * @returns {Promise<Object>} - Resultado de la transacción
     */
    async verifyTransaction(sessionId, sessionKey) {
        try {
            const response = await fetch(`${this.apiUrl}/verify?sessionId=${sessionId}&sessionKey=${sessionKey}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Error al verificar transacción: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en CardnetService.verifyTransaction:', error);
            throw error;
        }
    }

    /**
     * Prepara los datos para el backend
     * @param {Object} data - Datos de la transacción
     * @returns {Object} - Datos preparados
     */
    preparePaymentData(data) {
        return {
            ordenId: data.ordenId || `ORD-${Date.now()}`,
            total: data.total,
            impuestos: data.impuestos || 0,
            clienteNombre: data.nombre || "",
            clienteEmail: data.email || "",
            clienteTelefono: data.telefono || "",
            descripcion: data.descripcion || "Compra en Thelarte"
        };
    }
}