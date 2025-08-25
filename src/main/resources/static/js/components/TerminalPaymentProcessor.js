// src/main/resources/static/js/components/TerminalPaymentProcessor.js
export class TerminalPaymentProcessor {
    constructor(cardnetService) {
        this.cardnetService = cardnetService;
        this.pollingInterval = null;
        this.statusCheckFrequency = 3000; // Consultar cada 3 segundos
        this.maxPollingTime = 300000; // 5 minutos máximo
        this.startTime = 0;
        this.onStatusChange = null;
        this.onComplete = null;
        this.onError = null;
    }

    /**
     * Inicia un proceso de pago con terminal físico
     * @param {Object} paymentData - Datos de pago
     * @param {Function} onStatusChange - Callback para cambios de estado
     * @param {Function} onComplete - Callback para pago completado
     * @param {Function} onError - Callback para errores
     */
    async startPayment(paymentData, onStatusChange, onComplete, onError) {
        try {
            // Registrar callbacks
            this.onStatusChange = onStatusChange;
            this.onComplete = onComplete;
            this.onError = onError;

            // Crear sesión
            const sessionData = await this.cardnetService.createSession(paymentData);

            if (!sessionData || !sessionData.SESSION) {
                throw new Error("No se pudo iniciar la sesión de pago");
            }

            const sessionId = sessionData.SESSION;
            const sessionKey = sessionData['session-key'];

            // Notificar que la sesión fue creada
            if (this.onStatusChange) {
                this.onStatusChange({
                    status: 'CREATED',
                    message: 'Sesión de pago creada. Esperando confirmación en terminal.',
                    sessionId,
                    sessionKey
                });
            }

            // Iniciar el polling para consultar estado
            this.startPolling(sessionId);

            return { sessionId, sessionKey };
        } catch (error) {
            console.error("Error iniciando pago en terminal:", error);
            if (this.onError) {
                this.onError(error);
            }
            throw error;
        }
    }

    /**
     * Inicia consultas periódicas al servidor para verificar estado
     */
    startPolling(sessionId) {
        this.startTime = Date.now();

        // Cancelar cualquier polling existente
        this.stopPolling();

        // Iniciar nuevo polling
        this.pollingInterval = setInterval(async () => {
            try {
                const statusData = await this.cardnetService.checkStatus(sessionId);

                // Notificar el cambio de estado
                if (this.onStatusChange) {
                    this.onStatusChange(statusData);
                }

                // Si la transacción está completada
                if (statusData.isCompleted) {
                    this.stopPolling();
                    if (this.onComplete) {
                        this.onComplete(statusData);
                    }
                }

                // Si ha pasado el tiempo máximo, detener
                if (Date.now() - this.startTime > this.maxPollingTime) {
                    this.stopPolling();
                    if (this.onError) {
                        this.onError(new Error("Tiempo de espera agotado para la transacción"));
                    }
                }

            } catch (error) {
                console.error("Error consultando estado:", error);
                if (this.onError) {
                    this.onError(error);
                }
                this.stopPolling();
            }
        }, this.statusCheckFrequency);
    }

    /**
     * Detiene las consultas de estado
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    /**
     * Cancela una transacción en curso
     */
    cancelTransaction() {
        this.stopPolling();
        if (this.onStatusChange) {
            this.onStatusChange({
                status: 'CANCELLED_BY_USER',
                message: 'Transacción cancelada por el usuario'
            });
        }
    }
}