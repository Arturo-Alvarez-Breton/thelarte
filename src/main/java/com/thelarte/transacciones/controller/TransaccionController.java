package com.thelarte.transacciones.controller;

import com.thelarte.transacciones.dto.LineaTransaccionDTO;
import com.thelarte.transacciones.dto.TransaccionDTO;
import com.thelarte.transacciones.model.LineaTransaccion;
import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.service.TransaccionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transacciones")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class TransaccionController {

    @Autowired
    private TransaccionService transaccionService;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        System.out.println("Test endpoint called successfully");
        return new ResponseEntity<>("API de transacciones funcionando correctamente", HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<TransaccionDTO> crearTransaccion(@RequestBody Map<String, Object> payload) {
        try {
            // Validar campos obligatorios
            if (!payload.containsKey("tipo")) {
                throw new IllegalArgumentException("tipo de transacción es obligatorio");
            }

            // Crear objeto Transaccion con los datos básicos
            Transaccion transaccion = new Transaccion();

            // Asignar tipo de transacción
            String tipo = (String) payload.get("tipo");
            transaccion.setTipo(Transaccion.TipoTransaccion.valueOf(tipo));

            // Asignar fecha (por defecto ahora si no se proporciona)
            if (payload.containsKey("fecha")) {
                String fechaStr = (String) payload.get("fecha");
                Instant instant = Instant.parse(fechaStr);
                transaccion.setFecha(LocalDateTime.ofInstant(instant, ZoneId.systemDefault()));
            } else {
                transaccion.setFecha(LocalDateTime.now());
            }

            // Asignar contraparte
            if (payload.containsKey("contraparteId")) {
                Object contraparteId = payload.get("contraparteId");
                if (contraparteId instanceof Number) {
                    transaccion.setContraparteId(((Number) contraparteId).longValue());
                } else if (contraparteId instanceof String) {
                    transaccion.setContraparteId(Long.valueOf((String) contraparteId));
                }
            }

            if (payload.containsKey("contraparteNombre")) {
                transaccion.setContraparteNombre((String) payload.get("contraparteNombre"));
            }

            if (payload.containsKey("tipoContraparte")) {
                transaccion.setTipoContraparte(Transaccion.TipoContraparte.valueOf((String) payload.get("tipoContraparte")));
            }

            // Asignar otros campos básicos
            if (payload.containsKey("vendedorId")) {
                Object vendedorId = payload.get("vendedorId");
                if (vendedorId != null) {
                    if (vendedorId instanceof Number) {
                        transaccion.setVendedorId(((Number) vendedorId).longValue());
                    } else if (vendedorId instanceof String) {
                        transaccion.setVendedorId(Long.valueOf((String) vendedorId));
                    }
                }
            }

            if (payload.containsKey("observaciones")) {
                transaccion.setObservaciones((String) payload.get("observaciones"));
            }

            if (payload.containsKey("metodoPago")) {
                transaccion.setMetodoPago((String) payload.get("metodoPago"));
            }

            // Asignar montos
            if (payload.containsKey("subtotal")) {
                Object subtotal = payload.get("subtotal");
                if (subtotal instanceof Number) {
                    transaccion.setSubtotal(new BigDecimal(subtotal.toString()));
                }
            }

            if (payload.containsKey("impuestos")) {
                Object impuestos = payload.get("impuestos");
                if (impuestos instanceof Number) {
                    transaccion.setImpuestos(new BigDecimal(impuestos.toString()));
                }
            }

            if (payload.containsKey("total")) {
                Object total = payload.get("total");
                if (total instanceof Number) {
                    transaccion.setTotal(new BigDecimal(total.toString()));
                }
            }

            // Asignar campos específicos para pagos a plazos
            if (payload.containsKey("tipoPago")) {
                String tipoPago = (String) payload.get("tipoPago");
                transaccion.setTipoPago(Transaccion.TipoPago.valueOf(tipoPago));

                // Si es en cuotas, procesar montoInicial y saldoPendiente
                if (tipoPago.equals("ENCUOTAS") && payload.containsKey("planPagos")) {
                    Map<String, Object> planPagos = (Map<String, Object>) payload.get("planPagos");

                    if (planPagos.containsKey("montoInicial")) {
                        Object montoInicial = planPagos.get("montoInicial");
                        if (montoInicial instanceof Number) {
                            transaccion.setMontoInicial(new BigDecimal(montoInicial.toString()));
                        }
                    }

                    if (planPagos.containsKey("saldoPendiente")) {
                        Object saldoPendiente = planPagos.get("saldoPendiente");
                        if (saldoPendiente instanceof Number) {
                            transaccion.setSaldoPendiente(new BigDecimal(saldoPendiente.toString()));
                        }
                    }
                }
            }

            // Guardar los metadatos de pago si existen
            if (payload.containsKey("metadatosPago")) {
                transaccion.setMetadatosPago(payload.get("metadatosPago").toString());
            }

            // === ARREGLO: Asignar transaccionOrigenId correctamente y loguear ===
            if (payload.containsKey("transaccionOrigenId")) {
                Object transaccionOrigenId = payload.get("transaccionOrigenId");
                Long id = null;
                try {
                    if (transaccionOrigenId instanceof Number) {
                        id = ((Number) transaccionOrigenId).longValue();
                    } else if (transaccionOrigenId instanceof String) {
                        String val = ((String) transaccionOrigenId).trim();
                        if (!val.isEmpty()) id = Long.valueOf(val);
                    }
                } catch (Exception e) {
                    System.err.println("Error parseando transaccionOrigenId: " + transaccionOrigenId + " - " + e.getMessage());
                }
                transaccion.setTransaccionOrigenId(id);
            } else {
                transaccion.setTransaccionOrigenId(null);
            }

            // LOG DEBUG ROBUSTO
            System.out.println("=== DEBUG transaccionOrigenId en Controller ===");
            System.out.println("payload.get(transaccionOrigenId): " + payload.get("transaccionOrigenId"));
            System.out.println("transaccion.getTransaccionOrigenId(): " + transaccion.getTransaccionOrigenId());

            // Procesar líneas
            if (payload.containsKey("lineas")) {
                List<Map<String, Object>> lineasData = (List<Map<String, Object>>) payload.get("lineas");
                List<LineaTransaccion> lineas = new ArrayList<>();

                for (Map<String, Object> lineaData : lineasData) {
                    LineaTransaccion linea = new LineaTransaccion();

                    if (lineaData.containsKey("productoId")) {
                        Object productoId = lineaData.get("productoId");
                        if (productoId instanceof Number) {
                            linea.setProductoId(((Number) productoId).longValue());
                        }
                    }

                    if (lineaData.containsKey("productoNombre")) {
                        linea.setProductoNombre((String) lineaData.get("productoNombre"));
                    }

                    if (lineaData.containsKey("cantidad")) {
                        Object cantidad = lineaData.get("cantidad");
                        if (cantidad instanceof Number) {
                            linea.setCantidad(((Number) cantidad).intValue());
                        }
                    }

                    if (lineaData.containsKey("precioUnitario")) {
                        Object precio = lineaData.get("precioUnitario");
                        if (precio instanceof Number) {
                            linea.setPrecioUnitario(new BigDecimal(precio.toString()));
                        }
                    }

                    if (lineaData.containsKey("subtotal")) {
                        Object subtotal = lineaData.get("subtotal");
                        if (subtotal instanceof Number) {
                            linea.setSubtotal(new BigDecimal(subtotal.toString()));
                        }
                    }

                    if (lineaData.containsKey("impuestoPorcentaje")) {
                        Object impuestoPorcentaje = lineaData.get("impuestoPorcentaje");
                        if (impuestoPorcentaje instanceof Number) {
                            linea.setImpuestoPorcentaje(new BigDecimal(impuestoPorcentaje.toString()));
                        }
                    }

                    if (lineaData.containsKey("impuestoMonto")) {
                        Object impuestoMonto = lineaData.get("impuestoMonto");
                        if (impuestoMonto instanceof Number) {
                            linea.setImpuestoMonto(new BigDecimal(impuestoMonto.toString()));
                        }
                    }

                    if (lineaData.containsKey("total")) {
                        Object total = lineaData.get("total");
                        if (total instanceof Number) {
                            linea.setTotal(new BigDecimal(total.toString()));
                        }
                    }

                    if (lineaData.containsKey("descuentoPorcentaje")) {
                        Object descuentoPorcentaje = lineaData.get("descuentoPorcentaje");
                        if (descuentoPorcentaje instanceof Number) {
                            linea.setDescuentoPorcentaje(new BigDecimal(descuentoPorcentaje.toString()));
                        }
                    }

                    if (lineaData.containsKey("descuentoMonto")) {
                        Object descuentoMonto = lineaData.get("descuentoMonto");
                        if (descuentoMonto instanceof Number) {
                            linea.setDescuentoMonto(new BigDecimal(descuentoMonto.toString()));
                        }
                    }

                    if (lineaData.containsKey("observaciones")) {
                        linea.setObservaciones((String) lineaData.get("observaciones"));
                    }

                    lineas.add(linea);
                }

                transaccion.setLineas(lineas);
            }

            System.out.println("Creando transacción: " + transaccion.getTipo() +
                    ", montoInicial=" + transaccion.getMontoInicial() +
                    ", tipoPago=" + transaccion.getTipoPago());

            Transaccion nuevaTransaccion = transaccionService.crearTransaccion(transaccion);
            return new ResponseEntity<>(transaccionService.toDTO(nuevaTransaccion), HttpStatus.CREATED);

        } catch (Exception e) {
            System.err.println("Error al crear transacción: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    @GetMapping
    public ResponseEntity<List<TransaccionDTO>> obtenerTodas() {
        List<TransaccionDTO> dtos = transaccionService.obtenerTodas()
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    // Nuevo endpoint para transacciones filtradas y paginadas
    @GetMapping("/filtered")
    public ResponseEntity<List<TransaccionDTO>> obtenerTransaccionesFiltradas(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String busqueda,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        try {
            System.out.println("=== DEBUG: Obteniendo transacciones filtradas ===");
            System.out.println("Tipo: " + tipo + ", Estado: " + estado + ", Busqueda: " + busqueda);
            System.out.println("Page: " + page + ", Size: " + size);
            
            List<Transaccion> transacciones = transaccionService.getTransaccionesFiltered(
                tipo, estado, null, null, page, size);
            
            System.out.println("=== DEBUG: Transacciones obtenidas: " + transacciones.size() + " ===");
            
            List<TransaccionDTO> dtos = transacciones.stream()
                    .map(transaccion -> {
                        try {
                            return transaccionService.toDTO(transaccion);
                        } catch (Exception e) {
                            System.err.println("Error al convertir transacción " + transaccion.getId() + ": " + e.getMessage());
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            
            System.out.println("=== DEBUG: DTOs creados: " + dtos.size() + " ===");
            
            return new ResponseEntity<>(dtos, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error al obtener transacciones filtradas: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransaccionDTO> obtenerPorId(@PathVariable Long id) {
        Optional<Transaccion> transaccion = transaccionService.obtenerPorId(id);
        return transaccion
                .map(t -> ResponseEntity.ok(transaccionService.toDTO(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/compras")
    public ResponseEntity<List<TransaccionDTO>> obtenerCompras() {
        List<TransaccionDTO> compras = transaccionService.obtenerCompras()
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(compras, HttpStatus.OK);
    }

    @GetMapping("/ventas")
    public ResponseEntity<List<TransaccionDTO>> obtenerVentas() {
        List<TransaccionDTO> ventas = transaccionService.obtenerVentas()
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @GetMapping("/devoluciones-compra")
    public ResponseEntity<List<TransaccionDTO>> obtenerDevolucionesCompra() {
        List<TransaccionDTO> devoluciones = transaccionService.obtenerDevolucionesCompra()
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(devoluciones, HttpStatus.OK);
    }

    @GetMapping("/devoluciones-venta")
    public ResponseEntity<List<TransaccionDTO>> obtenerDevolucionesVenta() {
        List<TransaccionDTO> devoluciones = transaccionService.obtenerDevolucionesVenta()
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(devoluciones, HttpStatus.OK);
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<TransaccionDTO>> obtenerPorTipo(@PathVariable String tipo) {
        try {
            Transaccion.TipoTransaccion tipoTransaccion = Transaccion.TipoTransaccion.valueOf(tipo.toUpperCase());
            List<TransaccionDTO> transacciones = transaccionService.obtenerPorTipo(tipoTransaccion)
                    .stream()
                    .map(transaccionService::toDTO)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(transacciones, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<TransaccionDTO>> obtenerPorEstado(@PathVariable String estado) {
        try {
            Transaccion.EstadoTransaccion estadoTransaccion = Transaccion.EstadoTransaccion.valueOf(estado.toUpperCase());
            List<TransaccionDTO> transacciones = transaccionService.obtenerPorEstado(estadoTransaccion)
                    .stream()
                    .map(transaccionService::toDTO)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(transacciones, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/suplidor/{suplidorId}")
    public ResponseEntity<List<TransaccionDTO>> obtenerComprasPorSuplidor(@PathVariable Long suplidorId) {
        List<TransaccionDTO> compras = transaccionService.obtenerComprasPorSuplidor(suplidorId)
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(compras, HttpStatus.OK);
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<TransaccionDTO>> obtenerVentasPorCliente(@PathVariable Long clienteId) {
        List<TransaccionDTO> ventas = transaccionService.obtenerVentasPorCliente(clienteId)
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<TransaccionDTO>> obtenerVentasPorVendedor(@PathVariable Long vendedorId) {
        List<TransaccionDTO> ventas = transaccionService.obtenerVentasPorVendedor(vendedorId)
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @GetMapping("/periodo")
    public ResponseEntity<List<TransaccionDTO>> obtenerEnPeriodo(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        try {
            LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
            LocalDateTime fin = LocalDateTime.parse(fechaFin);
            List<TransaccionDTO> transacciones = transaccionService.obtenerEnPeriodo(inicio, fin)
                    .stream()
                    .map(transaccionService::toDTO)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(transacciones, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/compras/periodo")
    public ResponseEntity<List<TransaccionDTO>> obtenerComprasEnPeriodo(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        try {
            LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
            LocalDateTime fin = LocalDateTime.parse(fechaFin);
            List<TransaccionDTO> compras = transaccionService.obtenerComprasEnPeriodo(inicio, fin)
                    .stream()
                    .map(transaccionService::toDTO)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(compras, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarTransaccion(@PathVariable Long id, @RequestBody Transaccion transaccion) {
        try {
            Optional<Transaccion> existingTransaction = transaccionService.obtenerPorId(id);
            if (existingTransaction.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Check if transaction can be edited
            Transaccion currentTransaction = existingTransaction.get();
            if (!transaccionService.canEditTransaction(currentTransaction)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No se puede editar una transacción con estado: " + currentTransaction.getEstado());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            Transaccion transaccionActualizada = transaccionService.actualizarTransaccion(id, transaccion);
            return ResponseEntity.ok(transaccionService.toDTO(transaccionActualizada));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if a transaction can be edited based on its status
     */
    @GetMapping("/{id}/can-edit")
    public ResponseEntity<Map<String, Object>> canEditTransaction(@PathVariable Long id) {
        Optional<Transaccion> transaccionOpt = transaccionService.obtenerPorId(id);

        if (transaccionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Transaccion transaccion = transaccionOpt.get();
        boolean canEdit = transaccionService.canEditTransaction(transaccion);

        Map<String, Object> response = new HashMap<>();
        response.put("canEdit", canEdit);

        if (!canEdit) {
            response.put("reason", "No se puede editar una transacción con estado: " + transaccion.getEstado());
            response.put("estado", transaccion.getEstado().toString());
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<TransaccionDTO> actualizarEstado(@PathVariable Long id, @RequestParam String estado) {
        try {
            Transaccion.EstadoTransaccion nuevoEstado = Transaccion.EstadoTransaccion.valueOf(estado.toUpperCase());
            Transaccion transaccionActualizada = transaccionService.actualizarEstado(id, nuevoEstado);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionActualizada), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<TransaccionDTO> confirmarCompra(@PathVariable Long id) {
        try {
            Transaccion transaccionConfirmada = transaccionService.confirmarCompra(id);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionConfirmada), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<TransaccionDTO> cancelarTransaccion(@PathVariable Long id) {
        try {
            Transaccion transaccionCancelada = transaccionService.cancelarTransaccion(id);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionCancelada), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/recibir")
    public ResponseEntity<TransaccionDTO> marcarComoRecibida(@PathVariable Long id) {
        try {
            Transaccion transaccionRecibida = transaccionService.marcarComoRecibida(id);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionRecibida), HttpStatus.OK);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/pagar")
    public ResponseEntity<TransaccionDTO> marcarComoPagada(@PathVariable Long id) {
        try {
            Transaccion transaccionPagada = transaccionService.marcarComoPagada(id);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionPagada), HttpStatus.OK);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/entregar")
    public ResponseEntity<TransaccionDTO> marcarComoEntregada(@PathVariable Long id) {
        try {
            Transaccion transaccionEntregada = transaccionService.marcarComoEntregada(id);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionEntregada), HttpStatus.OK);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/completar")
    public ResponseEntity<TransaccionDTO> marcarComoCompletada(@PathVariable Long id) {
        try {
            Transaccion transaccionCompletada = transaccionService.marcarComoCompletada(id);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionCompletada), HttpStatus.OK);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PutMapping("/{id}/facturar")
    public ResponseEntity<TransaccionDTO> facturarVenta(@PathVariable Long id, @RequestParam String numeroFactura) {
        try {
            Transaccion transaccionFacturada = transaccionService.facturarVenta(id, numeroFactura);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionFacturada), HttpStatus.OK);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTransaccion(@PathVariable Long id) {
        try {
            transaccionService.eliminarTransaccion(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @PostMapping("/{id}/restaurar")
    public ResponseEntity<Void> restaurarTransaccion(@PathVariable Long id) {
        try {
            transaccionService.restaurarTransaccion(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/estadisticas/compras/total")
    public ResponseEntity<Double> obtenerTotalCompras(@RequestParam String fechaInicio, @RequestParam String fechaFin) {
        try {
            LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
            LocalDateTime fin = LocalDateTime.parse(fechaFin);
            Double total = transaccionService.obtenerTotalComprasEnPeriodo(inicio, fin);
            return new ResponseEntity<>(total != null ? total : 0.0, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/estadisticas/ventas/total")
    public ResponseEntity<Double> obtenerTotalVentas(@RequestParam String fechaInicio, @RequestParam String fechaFin) {
        try {
            LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
            LocalDateTime fin = LocalDateTime.parse(fechaFin);
            Double total = transaccionService.obtenerTotalVentasEnPeriodo(inicio, fin);
            return new ResponseEntity<>(total != null ? total : 0.0, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/estadisticas/devoluciones-compra/total")
    public ResponseEntity<Double> obtenerTotalDevolucionesCompra(@RequestParam String fechaInicio, @RequestParam String fechaFin) {
        try {
            LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
            LocalDateTime fin = LocalDateTime.parse(fechaFin);
            Double total = transaccionService.obtenerTotalDevolucionesCompraEnPeriodo(inicio, fin);
            return new ResponseEntity<>(total != null ? total : 0.0, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/estadisticas/devoluciones-venta/total")
    public ResponseEntity<Double> obtenerTotalDevolucionesVenta(@RequestParam String fechaInicio, @RequestParam String fechaFin) {
        try {
            LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
            LocalDateTime fin = LocalDateTime.parse(fechaFin);
            Double total = transaccionService.obtenerTotalDevolucionesVentaEnPeriodo(inicio, fin);
            return new ResponseEntity<>(total != null ? total : 0.0, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/origen/{transaccionOrigenId}")
    public ResponseEntity<List<TransaccionDTO>> obtenerTransaccionesPorOrigen(@PathVariable Long transaccionOrigenId) {
        List<TransaccionDTO> transacciones = transaccionService.obtenerTransaccionesPorOrigen(transaccionOrigenId)
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(transacciones, HttpStatus.OK);
    }

    @GetMapping("/estadisticas/contar")
    public ResponseEntity<Long> contarTransacciones(@RequestParam String tipo, @RequestParam String estado) {
        try {
            Transaccion.TipoTransaccion tipoTransaccion = Transaccion.TipoTransaccion.valueOf(tipo.toUpperCase());
            Transaccion.EstadoTransaccion estadoTransaccion = Transaccion.EstadoTransaccion.valueOf(estado.toUpperCase());
            long count = transaccionService.contarTransaccionesPorTipoYEstado(tipoTransaccion, estadoTransaccion);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/compras/pendientes")
    public ResponseEntity<List<TransaccionDTO>> obtenerComprasPendientes() {
        List<TransaccionDTO> compras = transaccionService.obtenerComprasPendientes()
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(compras, HttpStatus.OK);
    }

    @GetMapping("/compras/pendientes-recepcion")
    public ResponseEntity<List<TransaccionDTO>> obtenerComprasPendientesRecepcion() {
        List<TransaccionDTO> compras = transaccionService.obtenerComprasPendientesRecepcion()
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(compras, HttpStatus.OK);
    }

    @GetMapping("/compras/pendientes-pago")
    public ResponseEntity<List<TransaccionDTO>> obtenerComprasPendientesPago() {
        List<TransaccionDTO> compras = transaccionService.obtenerComprasPendientesPago()
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(compras, HttpStatus.OK);
    }

    @GetMapping("/ventas/pendientes-entrega")
    public ResponseEntity<List<TransaccionDTO>> obtenerVentasPendientesEntrega() {
        List<TransaccionDTO> ventas = transaccionService.obtenerVentasPendientesEntrega()
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @GetMapping("/ventas/pendientes-cobro")
    public ResponseEntity<List<TransaccionDTO>> obtenerVentasPendientesCobro() {
        List<TransaccionDTO> ventas = transaccionService.obtenerVentasPendientesCobro()
                .stream()
                .map(transaccionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @PostMapping("/{id}/lineas")
    public ResponseEntity<?> agregarLineaATransaccion(@PathVariable Long id, @RequestBody LineaTransaccionDTO lineaDto) {
        try {
            Transaccion transaccion = transaccionService.obtenerPorId(id)
                    .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));

            // Lógica para agregar la línea a la transacción
            Transaccion updated = transaccionService.agregarLineaATransaccion(transaccion, lineaDto);
            return ResponseEntity.ok(transaccionService.toDTO(updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
    // NUEVO: Marcar transacción como DEVUELTA o PARCIALMENTE_DEVUELTA
    @PutMapping("/{id}/devuelta")
    public ResponseEntity<TransaccionDTO> marcarComoDevuelta(
            @PathVariable Long id,
            @RequestBody List<LineaTransaccionDTO> productosDevueltos,
            @RequestParam(required = false) String motivo
    ) {
        try {
            Transaccion transaccionDevuelta = transaccionService.marcarComoDevueltaTotal(id, productosDevueltos, motivo);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionDevuelta), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/devuelta-parcial")
    public ResponseEntity<TransaccionDTO> marcarComoDevueltaParcial(
            @PathVariable Long id,
            @RequestBody List<LineaTransaccionDTO> productosDevueltos,
            @RequestParam(required = false) String motivo
    ) {
        try {
            Transaccion transaccionParcial = transaccionService.marcarComoDevueltaParcial(id, productosDevueltos, motivo);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionParcial), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // === ENDPOINTS PARA REPORTES ===

    @GetMapping("/reportes/ventas-dia")
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

    @GetMapping("/reportes/productos-mas-vendidos")
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