package com.thelarte.transacciones.service;

import com.thelarte.transacciones.model.PaymentRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class CardnetService {
    private final String baseUrl = "https://lab.cardnet.com.do"; // Ambiente de pruebas
    private final String merchantNumber = "349041263";
    private final String merchantTerminal = "58585858"; // Terminal físico
    private final String merchantType = "7997"; // Categoría comercio
    private final String acquiringInstitutionCode = "349";

    private final RestTemplate restTemplate;

    public CardnetService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Crea una sesión de pago en CardNet para pagos web
     */
    public Map<String, String> createSession(PaymentRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");

            Map<String, Object> payload = new HashMap<>();
            payload.put("TransactionType", "0200");  // Venta normal
            payload.put("CurrencyCode", "214");      // RD Peso
            payload.put("MerchantNumber", merchantNumber);
            payload.put("MerchantTerminal", merchantTerminal);
            payload.put("MerchantType", merchantType);
            payload.put("AcquiringInstitutionCode", acquiringInstitutionCode);

            // URLs de retorno
            payload.put("ReturnUrl", "http://localhost:8080/api/payments/success");
            payload.put("CancelUrl", "http://localhost:8080/api/payments/cancel");

            // Datos de la transacción
            payload.put("PageLanguaje", "ESP");
            payload.put("OrdenId", request.getOrdenId());
            payload.put("TransactionId", String.format("%06d", (int)(Math.random() * 999999)));
            payload.put("Amount", formatAmount(request.getTotal()));
            payload.put("Tax", formatAmount(request.getImpuestos() != null ? request.getImpuestos() : 0));
            payload.put("MerchantName", "THELARTE MUEBLES DOMINICANA DO");

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/sessions",
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error al crear sesión: " + e.getMessage(), e);
        }
    }

    /**
     * Crea una sesión de pago en CardNet vinculada al terminal físico
     */
    public Map<String, String> createPhysicalTerminalSession(PaymentRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");

            Map<String, Object> payload = new HashMap<>();
            payload.put("TransactionType", "200");  // Tipo de transacción para terminal
            payload.put("CurrencyCode", "214");      // RD Peso
            payload.put("MerchantNumber", merchantNumber);
            payload.put("MerchantTerminal", merchantTerminal);
            payload.put("MerchantType", merchantType);
            payload.put("AcquiringInstitutionCode", acquiringInstitutionCode);

            // URLs de retorno (se mantienen para notificación aunque sea terminal físico)
            payload.put("ReturnUrl", "http://localhost:8080/api/payments/success");
            payload.put("CancelUrl", "http://localhost:8080/api/payments/cancel");

            // Datos de la transacción
            payload.put("PageLanguaje", "ESP");
            payload.put("OrdenId", request.getOrdenId());
            payload.put("TransactionId", String.format("%06d", (int)(Math.random() * 999999)));
            payload.put("Amount", formatAmount(request.getTotal()));
            payload.put("Tax", formatAmount(request.getImpuestos() != null ? request.getImpuestos() : 0));
            payload.put("MerchantName", "THELARTE MUEBLES DOMINICANA DO");

            // Parámetros específicos para terminal físico
            payload.put("InitiatedBy", "MERCHANT");  // Indica que es iniciada desde el comercio
            payload.put("TerminalType", "PHYSICAL"); // Indica que se usará terminal físico
            payload.put("RequiresConfirmation", true); // El terminal debe confirmar la transacción

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/sessions",
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error al crear sesión para terminal físico: " + e.getMessage(), e);
        }
    }

    /**
     * Verifica el resultado de una transacción
     */
    public Map<String, Object> verifyTransaction(String sessionId, String sessionKey) {
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/sessions/" + sessionId + "?sk=" + sessionKey,
                    HttpMethod.GET,
                    null,
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar transacción: " + e.getMessage(), e);
        }
    }

    /**
     * Consulta el estado actual de una transacción (útil para terminal físico)
     */
    public Map<String, Object> checkTransactionStatus(String sessionId) {
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + "/sessions/" + sessionId + "/status",
                    HttpMethod.GET,
                    null,
                    Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error al consultar estado de la transacción: " + e.getMessage(), e);
        }
    }

    private String formatAmount(Double amount) {
        long amountInCents = Math.round(amount * 100);
        return String.format("%012d", amountInCents);
    }
}