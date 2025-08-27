package com.thelarte.transacciones.controller;

import com.thelarte.transacciones.model.PaymentRequest;
import com.thelarte.transacciones.service.CardnetService;
import com.thelarte.transacciones.service.TransaccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Controlador para manejar operaciones de pago con CardNet
 */
@RestController
@RequestMapping("/api/payments")
public class CardnetController {
    private static final Logger logger = Logger.getLogger(CardnetController.class.getName());

    private final CardnetService cardnetService;
    private final TransaccionService transaccionService;

    @Autowired
    public CardnetController(CardnetService cardnetService, TransaccionService transaccionService) {
        this.cardnetService = cardnetService;
        this.transaccionService = transaccionService;
    }

    /**
     * Crea una sesión de pago con CardNet
     * @param request Datos de la solicitud de pago
     * @return Datos de la sesión creada (SESSION y session-key)
     */
    @PostMapping("/create-session")
    public ResponseEntity<?> createSession(@RequestBody PaymentRequest request) {
        try {
            logger.info("Creando sesión de pago para ordenId: " + request.getOrdenId());

            // Validar datos mínimos
            if (request.getOrdenId() == null || request.getTotal() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Se requieren ordenId y total para crear una sesión"));
            }

            // Verificar si es para terminal físico
            Map<String, String> sessionData;
            if (request.isUsePhysicalTerminal()) {
                // Usar método específico para terminal físico
                sessionData = cardnetService.createPhysicalTerminalSession(request);
                logger.info("Creando sesión para terminal físico");
            } else {
                // Usar método estándar para web
                sessionData = cardnetService.createSession(request);
                logger.info("Creando sesión para pago web");
            }

            if (sessionData == null || !sessionData.containsKey("SESSION")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "No se pudo crear la sesión de pago"));
            }

            logger.info("Sesión creada exitosamente: " + sessionData.get("SESSION"));
            return ResponseEntity.ok(sessionData);

        } catch (Exception e) {
            logger.severe("Error al crear sesión: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Endpoint para consultar el estado de una transacción en el terminal
     */
    @GetMapping("/status/{sessionId}")
    public ResponseEntity<?> checkStatus(@PathVariable String sessionId) {
        try {
            logger.info("Consultando estado de la transacción: " + sessionId);
            Map<String, Object> statusResponse = cardnetService.checkTransactionStatus(sessionId);

            // Extraer información relevante del estado
            String status = (String) statusResponse.getOrDefault("Status", "PENDING");
            String responseCode = (String) statusResponse.getOrDefault("ResponseCode", "");

            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", sessionId);
            response.put("status", status);
            response.put("responseCode", responseCode);
            response.put("isCompleted", "COMPLETED".equals(status));
            response.put("isPending", "PENDING".equals(status));
            response.put("message", getStatusMessage(status, responseCode));
            response.put("authCode", statusResponse.getOrDefault("AuthorizationCode", ""));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error al consultar estado: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Endpoint para manejar el retorno exitoso desde CardNet
     */
    @GetMapping("/success")
    public RedirectView paymentSuccess(
            @RequestParam(required = false) String SESSION,
            @RequestParam(required = false, name = "session-key") String sessionKey) {

        logger.info("Pago exitoso recibido para SESSION: " + SESSION);

        // Aquí puedes verificar la transacción y actualizar tu base de datos
        try {
            if (SESSION != null && sessionKey != null) {
                Map<String, Object> transactionResult = cardnetService.verifyTransaction(SESSION, sessionKey);
                String responseCode = (String) transactionResult.get("ResponseCode");

                if ("00".equals(responseCode)) {
                    // Actualizar el estado de la transacción
                    String ordenId = (String) transactionResult.get("OrdenId");
                    String authCode = (String) transactionResult.get("AuthorizationCode");

                    // Aquí llamarías a tu servicio de transacciones para actualizar
                    logger.info("Actualizando transacción " + ordenId + " con código de autorización: " + authCode);

                    // Ejemplo: transaccionService.updatePaymentStatus(ordenId, "COMPLETADO", authCode);
                }
            }
        } catch (Exception e) {
            logger.severe("Error al procesar confirmación de pago: " + e.getMessage());
            // Continuar con la redirección a pesar del error para no afectar la experiencia del usuario
        }

        // Redirigir a la página de éxito con los parámetros
        RedirectView redirectView = new RedirectView("/pages/admin/payment-success.html");
        redirectView.addStaticAttribute("session", SESSION);
        redirectView.addStaticAttribute("sessionKey", sessionKey);
        return redirectView;
    }

    /**
     * Endpoint para manejar la cancelación desde CardNet
     */
    @GetMapping("/cancel")
    public RedirectView paymentCancelled() {
        logger.info("Pago cancelado por el usuario");

        // Redirigir a la página de cancelación
        return new RedirectView("/pages/admin/payment-cancelled.html");
    }

    /**
     * Verifica el estado de una transacción existente
     */
    @GetMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestParam String sessionId,
            @RequestParam String sessionKey) {
        try {
            logger.info("Verificando transacción: " + sessionId);

            Map<String, Object> result = cardnetService.verifyTransaction(sessionId, sessionKey);

            // Crear respuesta con información relevante
            Map<String, Object> response = new HashMap<>();
            response.put("status", "00".equals(result.get("ResponseCode")) ? "approved" : "rejected");
            response.put("responseCode", result.get("ResponseCode"));
            response.put("authCode", result.get("AuthorizationCode"));
            response.put("ordenId", result.get("OrdenId"));

            // Si tienes un mensaje específico según el código
            String responseMessage = getResponseMessage((String) result.get("ResponseCode"));
            response.put("message", responseMessage);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.severe("Error al verificar transacción: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtiene un mensaje amigable según el código de respuesta
     */
    private String getResponseMessage(String responseCode) {
        if (responseCode == null) return "Error desconocido";

        return switch (responseCode) {
            case "00" -> "Transacción aprobada";
            case "05" -> "Transacción rechazada";
            case "51" -> "Fondos insuficientes";
            case "54" -> "Tarjeta vencida";
            default -> "Transacción rechazada (código: " + responseCode + ")";
        };
    }

    /**
     * Obtiene un mensaje según el estado de la transacción
     */
    private String getStatusMessage(String status, String responseCode) {
        if ("COMPLETED".equals(status) && "00".equals(responseCode)) {
            return "Transacción completada exitosamente";
        } else if ("PENDING".equals(status)) {
            return "Esperando que el cliente presente su tarjeta en el terminal";
        } else if ("CANCELLED".equals(status)) {
            return "Transacción cancelada en el terminal";
        } else if ("DECLINED".equals(status)) {
            return "Transacción rechazada por el banco";
        } else {
            return "Estado: " + status + " (código: " + responseCode + ")";
        }
    }
}