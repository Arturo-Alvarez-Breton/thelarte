package com.thelarte.shared.exception;

/**
 * Excepción lanzada cuando una entidad no se encuentra en la base de datos.
 */
public class EntityNotFoundException extends RuntimeException {

    /**
     * Constructor de la excepción con un mensaje detallado.
     * @param message Mensaje describiendo la excepción
     */
    public EntityNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructor de la excepción con un mensaje y una causa.
     * @param message Mensaje describiendo la excepción
     * @param cause Causa de la excepción
     */
    public EntityNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
