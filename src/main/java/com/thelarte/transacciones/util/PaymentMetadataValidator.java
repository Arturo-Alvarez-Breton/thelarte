package com.thelarte.transacciones.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PaymentMetadataValidator {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ValidationResult validatePaymentMetadata(String metodoPago, String metadatosJson) {
        ValidationResult result = new ValidationResult();
        
        if (metadatosJson == null || metadatosJson.trim().isEmpty()) {
            if (isPaymentMethodRequiringMetadata(metodoPago)) {
                result.addError("Los metadatos de pago son requeridos para el método: " + metodoPago);
            }
            return result;
        }

        try {
            JsonNode metadata = objectMapper.readTree(metadatosJson);
            
            switch (metodoPago) {
                case "EFECTIVO":
                    validateEfectivo(metadata, result);
                    break;
                case "TRANSFERENCIA_ACH":
                    validateTransferenciaACH(metadata, result);
                    break;
                case "TRANSFERENCIA_LBTR":
                    validateTransferenciaLBTR(metadata, result);
                    break;
                case "CHEQUE":
                    validateCheque(metadata, result);
                    break;
                case "CREDITO":
                    validateCredito(metadata, result);
                    break;
                case "TRANSFERENCIA_INTERNACIONAL":
                    validateTransferenciaInternacional(metadata, result);
                    break;
                default:
                    result.addError("Método de pago no reconocido: " + metodoPago);
            }
            
        } catch (Exception e) {
            result.addError("Error al procesar metadatos JSON: " + e.getMessage());
        }
        
        return result;
    }

    private boolean isPaymentMethodRequiringMetadata(String metodoPago) {
        return metodoPago != null && !metodoPago.equals("EFECTIVO");
    }

    private void validateEfectivo(JsonNode metadata, ValidationResult result) {
        // Para efectivo, los metadatos son opcionales
        if (metadata.has("recibidoPor") && isNullOrEmpty(metadata.get("recibidoPor"))) {
            result.addWarning("Se recomienda especificar quién recibió el pago en efectivo");
        }
    }

    private void validateTransferenciaACH(JsonNode metadata, ValidationResult result) {
        validateRequired(metadata, "bancoOrigen", "Banco origen es requerido para transferencias ACH", result);
        validateRequired(metadata, "bancoDestino", "Banco destino es requerido para transferencias ACH", result);
        validateRequired(metadata, "numeroCuentaOrigen", "Número de cuenta origen es requerido", result);
        validateRequired(metadata, "numeroReferencia", "Número de referencia es requerido", result);
        
        if (metadata.has("tipoTransferencia") && 
            !metadata.get("tipoTransferencia").asText().equals("ACH")) {
            result.addError("Tipo de transferencia debe ser 'ACH'");
        }
    }

    private void validateTransferenciaLBTR(JsonNode metadata, ValidationResult result) {
        validateRequired(metadata, "bancoOrigen", "Banco origen es requerido para transferencias LBTR", result);
        validateRequired(metadata, "numeroReferencia", "Número de referencia es requerido", result);
        validateRequired(metadata, "fechaHora", "Fecha y hora de transferencia es requerida", result);
        
        if (metadata.has("costoTransferencia")) {
            double costo = metadata.get("costoTransferencia").asDouble();
            if (costo <= 0) {
                result.addWarning("El costo de transferencia LBTR debe ser mayor a 0");
            }
        }
        
        if (metadata.has("tipoTransferencia") && 
            !metadata.get("tipoTransferencia").asText().equals("LBTR")) {
            result.addError("Tipo de transferencia debe ser 'LBTR'");
        }
    }

    private void validateCheque(JsonNode metadata, ValidationResult result) {
        validateRequired(metadata, "numeroCheque", "Número de cheque es requerido", result);
        validateRequired(metadata, "banco", "Banco emisor es requerido", result);
        validateRequired(metadata, "titular", "Titular del cheque es requerido", result);
        validateRequired(metadata, "fechaVencimiento", "Fecha de vencimiento es requerida", result);
    }

    private void validateCredito(JsonNode metadata, ValidationResult result) {
        validateRequired(metadata, "banco", "Banco acreedor es requerido", result);
        validateRequired(metadata, "plazoPagos", "Plazo de pagos es requerido", result);
        validateRequired(metadata, "tasaInteres", "Tasa de interés es requerida", result);
        validateRequired(metadata, "fechaVencimiento", "Fecha de vencimiento es requerida", result);
        
        if (metadata.has("plazoPagos")) {
            int plazo = metadata.get("plazoPagos").asInt();
            if (plazo < 1 || plazo > 72) {
                result.addError("El plazo de pagos debe estar entre 1 y 72 meses");
            }
        }
        
        if (metadata.has("tasaInteres")) {
            double tasa = metadata.get("tasaInteres").asDouble();
            if (tasa < 0 || tasa > 100) {
                result.addError("La tasa de interés debe estar entre 0% y 100%");
            }
        }
    }

    private void validateTransferenciaInternacional(JsonNode metadata, ValidationResult result) {
        validateRequired(metadata, "swiftOrigen", "Código SWIFT origen es requerido", result);
        validateRequired(metadata, "swiftDestino", "Código SWIFT destino es requerido", result);
        validateRequired(metadata, "tasaCambio", "Tasa de cambio es requerida", result);
        validateRequired(metadata, "comisionTransferencia", "Comisión de transferencia es requerida", result);
        
        if (metadata.has("swiftOrigen")) {
            String swift = metadata.get("swiftOrigen").asText();
            if (swift.length() < 8 || swift.length() > 11) {
                result.addError("Código SWIFT origen debe tener entre 8 y 11 caracteres");
            }
        }
        
        if (metadata.has("swiftDestino")) {
            String swift = metadata.get("swiftDestino").asText();
            if (swift.length() < 8 || swift.length() > 11) {
                result.addError("Código SWIFT destino debe tener entre 8 y 11 caracteres");
            }
        }
        
        if (metadata.has("tasaCambio")) {
            double tasa = metadata.get("tasaCambio").asDouble();
            if (tasa <= 0) {
                result.addError("La tasa de cambio debe ser mayor a 0");
            }
        }
    }

    private void validateRequired(JsonNode metadata, String field, String message, ValidationResult result) {
        if (!metadata.has(field) || isNullOrEmpty(metadata.get(field))) {
            result.addError(message);
        }
    }

    private boolean isNullOrEmpty(JsonNode node) {
        return node == null || node.isNull() || 
               (node.isTextual() && node.asText().trim().isEmpty());
    }

    public static class ValidationResult {
        private final List<String> errors = new ArrayList<>();
        private final List<String> warnings = new ArrayList<>();

        public void addError(String error) {
            errors.add(error);
        }

        public void addWarning(String warning) {
            warnings.add(warning);
        }

        public boolean isValid() {
            return errors.isEmpty();
        }

        public List<String> getErrors() {
            return errors;
        }

        public List<String> getWarnings() {
            return warnings;
        }
    }
}