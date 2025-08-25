package com.thelarte.transacciones.controller;

import com.thelarte.transacciones.dto.PagoDTO;
import com.thelarte.transacciones.model.Pago;
import com.thelarte.transacciones.service.TransaccionService;
import com.thelarte.shared.exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controlador para la gestión de pagos de transacciones
 */
@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "*")
public class PagoController {

    @Autowired
    private TransaccionService transaccionService;

    /**
     * Registra un nuevo pago para una transacción
     * @param transaccionId ID de la transacción
     * @param pagoDTO Datos del pago
     * @return El pago registrado
     */
    @PostMapping("/transacciones/{transaccionId}")
    public ResponseEntity<?> registrarPago(
            @PathVariable Long transaccionId,
            @RequestBody PagoDTO pagoDTO) {

        try {
            // Validar datos mínimos
            if (pagoDTO.getMonto() == null || pagoDTO.getMonto().signum() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "El monto del pago es obligatorio y debe ser mayor a cero"));
            }

            // Registrar el pago
            Pago pago = transaccionService.registrarPago(transaccionId, pagoDTO);
            return new ResponseEntity<>(transaccionService.pagoToDTO(pago), HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al procesar el pago: " + e.getMessage()));
        }
    }

    /**
     * Obtiene todos los pagos de una transacción
     * @param transaccionId ID de la transacción
     * @return Lista de pagos
     */
    @GetMapping("/transacciones/{transaccionId}")
    public ResponseEntity<List<PagoDTO>> obtenerPagosPorTransaccion(@PathVariable Long transaccionId) {
        try {
            List<Pago> pagos = transaccionService.obtenerPagosPorTransaccion(transaccionId);
            List<PagoDTO> pagosDTO = pagos.stream()
                    .map(transaccionService::pagoToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(pagosDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obtiene un pago específico por su ID
     * @param pagoId ID del pago
     * @return El pago solicitado
     */
    @GetMapping("/{pagoId}")
    public ResponseEntity<PagoDTO> obtenerPagoPorId(@PathVariable Long pagoId) {
        try {
            Pago pago = transaccionService.obtenerPagoPorId(pagoId);
            return ResponseEntity.ok(transaccionService.pagoToDTO(pago));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Anula un pago existente
     * @param pagoId ID del pago a anular
     * @param motivo Motivo opcional de la anulación
     * @return El pago anulado
     */
    @PutMapping("/{pagoId}/anular")
    public ResponseEntity<?> anularPago(
            @PathVariable Long pagoId,
            @RequestParam(required = false) String motivo) {

        try {
            Pago pagoAnulado = transaccionService.anularPago(pagoId, motivo);
            return ResponseEntity.ok(transaccionService.pagoToDTO(pagoAnulado));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al anular el pago: " + e.getMessage()));
        }
    }

    /**
     * Actualiza el método de pago de un pago existente
     * @param pagoId ID del pago
     * @param metodoPago Nuevo método de pago
     * @return El pago actualizado
     */
    @PutMapping("/{pagoId}/metodo-pago")
    public ResponseEntity<?> actualizarMetodoPago(
            @PathVariable Long pagoId,
            @RequestParam String metodoPago) {

        try {
            Pago pagoActualizado = transaccionService.actualizarMetodoPagoDePago(pagoId, metodoPago);
            return ResponseEntity.ok(transaccionService.pagoToDTO(pagoActualizado));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Actualiza las observaciones de un pago
     * @param pagoId ID del pago
     * @param observaciones Nuevas observaciones
     * @return El pago actualizado
     */
    @PutMapping("/{pagoId}/observaciones")
    public ResponseEntity<?> actualizarObservaciones(
            @PathVariable Long pagoId,
            @RequestParam String observaciones) {

        try {
            Pago pagoActualizado = transaccionService.actualizarObservacionesDePago(pagoId, observaciones);
            return ResponseEntity.ok(transaccionService.pagoToDTO(pagoActualizado));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obtiene pagos realizados en un rango de fechas
     */
    @GetMapping("/periodo")
    public ResponseEntity<List<PagoDTO>> obtenerPagosEnPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        List<Pago> pagos = transaccionService.obtenerPagosEnPeriodo(fechaInicio, fechaFin);
        List<PagoDTO> pagosDTO = pagos.stream()
                .map(transaccionService::pagoToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(pagosDTO);
    }

    /**
     * Obtiene pagos pendientes o vencidos
     */
    @GetMapping("/vencidos")
    public ResponseEntity<List<PagoDTO>> obtenerPagosVencidos() {
        List<Pago> pagosVencidos = transaccionService.obtenerPagosVencidos();
        List<PagoDTO> pagosDTO = pagosVencidos.stream()
                .map(transaccionService::pagoToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(pagosDTO);
    }

    /**
     * Obtiene estadísticas de pagos por método de pago
     */
    @GetMapping("/estadisticas/por-metodo")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasPorMetodo(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        Map<String, Object> estadisticas = transaccionService.obtenerEstadisticasPagosPorMetodo(fechaInicio, fechaFin);
        return ResponseEntity.ok(estadisticas);
    }

    /**
     * Maneja excepciones generales
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}