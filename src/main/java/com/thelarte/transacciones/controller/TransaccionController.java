package com.thelarte.transacciones.controller;

import com.thelarte.transacciones.dto.TransaccionDTO;
import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.service.TransaccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
    public ResponseEntity<TransaccionDTO> crearTransaccion(@RequestBody Transaccion transaccion) {
        try {
            // Validar campos obligatorios
            if (transaccion.getContraparteId() == null) {
                throw new IllegalArgumentException("contraparteId es obligatorio");
            }
            if (transaccion.getTipo() == null) {
                throw new IllegalArgumentException("tipo de transacción es obligatorio");
            }

            System.out.println("Recibida petición para crear transacción: " + transaccion.getTipo());
            System.out.println("ContraparteId: " + transaccion.getContraparteId());
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

    @PutMapping("/{id}/completar")
    public ResponseEntity<TransaccionDTO> completarTransaccion(@PathVariable Long id) {
        try {
            Transaccion transaccionCompletada = transaccionService.completarTransaccion(id);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionCompletada), HttpStatus.OK);
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

    @PutMapping("/{id}/cobrar")
    public ResponseEntity<TransaccionDTO> marcarComoCobrada(@PathVariable Long id) {
        try {
            Transaccion transaccionCobrada = transaccionService.marcarComoCobrada(id);
            return new ResponseEntity<>(transaccionService.toDTO(transaccionCobrada), HttpStatus.OK);
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
}