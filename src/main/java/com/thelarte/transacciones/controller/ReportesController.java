package com.thelarte.transacciones.controller;

import com.thelarte.transacciones.service.TransaccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ReportesController {

    @Autowired
    private TransaccionService transaccionService;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/ventas-dia")
    public ResponseEntity<Map<String, Object>> obtenerReporteVentasDelDia(
            @RequestParam(required = false) String fecha) {
        try {
            Map<String, Object> reporte = transaccionService.obtenerReporteVentasDelDia(fecha);
            return new ResponseEntity<>(reporte, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al obtener reporte de ventas diarias: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/productos-mas-vendidos")
    public ResponseEntity<List<Map<String, Object>>> obtenerProductosMasVendidos(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(defaultValue = "5") Integer limite) {
        try {
            List<Map<String, Object>> productos = transaccionService.obtenerProductosMasVendidos(fechaDesde, fechaHasta, limite);
            return new ResponseEntity<>(productos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
