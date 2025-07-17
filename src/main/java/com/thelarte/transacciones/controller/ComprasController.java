package com.thelarte.transacciones.controller;

import com.thelarte.transacciones.service.TransaccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class ComprasController {

    @Autowired
    private TransaccionService transaccionService;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/metricas")
    @PreAuthorize("hasRole('COMPRAS_SUPLIDOR')")
    public ResponseEntity<Map<String, Object>> obtenerMetricasCompras() {
        try {
            // Obtener fechas del período actual (último mes)
            LocalDateTime fechaFin = LocalDateTime.now();
            LocalDateTime fechaInicio = fechaFin.minusMonths(1);
            
            // Obtener métricas de compras
            long totalOrdenes = transaccionService.contarTransaccionesPorTipoYEstado(
                com.thelarte.transacciones.model.Transaccion.TipoTransaccion.COMPRA,
                com.thelarte.transacciones.model.Transaccion.EstadoTransaccion.COMPLETADA
            );
            
            long ordenesPendientes = transaccionService.contarTransaccionesPorTipoYEstado(
                com.thelarte.transacciones.model.Transaccion.TipoTransaccion.COMPRA,
                com.thelarte.transacciones.model.Transaccion.EstadoTransaccion.PENDIENTE
            );
            
            long ordenesConfirmadas = transaccionService.contarTransaccionesPorTipoYEstado(
                com.thelarte.transacciones.model.Transaccion.TipoTransaccion.COMPRA,
                com.thelarte.transacciones.model.Transaccion.EstadoTransaccion.CONFIRMADA
            );
            
            long ordenesRecibidas = transaccionService.contarTransaccionesPorTipoYEstado(
                com.thelarte.transacciones.model.Transaccion.TipoTransaccion.COMPRA,
                com.thelarte.transacciones.model.Transaccion.EstadoTransaccion.RECIBIDA
            );
            
            // Obtener total gastado en el período
            Double totalGastado = transaccionService.obtenerTotalComprasEnPeriodo(fechaInicio, fechaFin);
            if (totalGastado == null) {
                totalGastado = 0.0;
            }
            
            // Preparar respuesta
            Map<String, Object> metricas = new HashMap<>();
            metricas.put("totalOrdenes", totalOrdenes);
            metricas.put("ordenesPendientes", ordenesPendientes);
            metricas.put("ordenesConfirmadas", ordenesConfirmadas);
            metricas.put("ordenesRecibidas", ordenesRecibidas);
            metricas.put("totalGastado", totalGastado);
            metricas.put("fechaInicio", fechaInicio.toString());
            metricas.put("fechaFin", fechaFin.toString());
            metricas.put("periodo", "Últimos 30 días");
            
            return new ResponseEntity<>(metricas, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error obteniendo métricas de compras: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/metricas/resumen")
    @PreAuthorize("hasRole('COMPRAS_SUPLIDOR')")
    public ResponseEntity<Map<String, Object>> obtenerResumenCompras() {
        try {
            // Obtener compras pendientes de recepción
            long pendientesRecepcion = transaccionService.obtenerComprasPendientesRecepcion().size();
            
            // Obtener compras pendientes de pago
            long pendientesPago = transaccionService.obtenerComprasPendientesPago().size();
            
            // Obtener total de compras activas
            long totalComprasActivas = transaccionService.obtenerCompras().size();
            
            Map<String, Object> resumen = new HashMap<>();
            resumen.put("pendientesRecepcion", pendientesRecepcion);
            resumen.put("pendientesPago", pendientesPago);
            resumen.put("totalComprasActivas", totalComprasActivas);
            
            return new ResponseEntity<>(resumen, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error obteniendo resumen de compras: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        System.out.println("Compras test endpoint called successfully");
        return new ResponseEntity<>("API de compras funcionando correctamente", HttpStatus.OK);
    }
}