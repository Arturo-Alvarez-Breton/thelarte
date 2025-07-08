package com.thelarte.transacciones.controller;

import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.service.TransaccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
    public ResponseEntity<Transaccion> crearTransaccion(@RequestBody Transaccion transaccion) {
        try {
            System.out.println("Recibida petición para crear transacción: " + transaccion.getTipo());
            Transaccion nuevaTransaccion = transaccionService.crearTransaccion(transaccion);
            return new ResponseEntity<>(nuevaTransaccion, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error al crear transacción: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<Transaccion>> obtenerTodas() {
        List<Transaccion> transacciones = transaccionService.obtenerTodas();
        return new ResponseEntity<>(transacciones, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaccion> obtenerPorId(@PathVariable Long id) {
        Optional<Transaccion> transaccion = transaccionService.obtenerPorId(id);
        return transaccion.map(t -> new ResponseEntity<>(t, HttpStatus.OK))
                         .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/compras")
    public ResponseEntity<List<Transaccion>> obtenerCompras() {
        List<Transaccion> compras = transaccionService.obtenerCompras();
        return new ResponseEntity<>(compras, HttpStatus.OK);
    }

    @GetMapping("/ventas")
    public ResponseEntity<List<Transaccion>> obtenerVentas() {
        List<Transaccion> ventas = transaccionService.obtenerVentas();
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @GetMapping("/devoluciones-compra")
    public ResponseEntity<List<Transaccion>> obtenerDevolucionesCompra() {
        List<Transaccion> devoluciones = transaccionService.obtenerDevolucionesCompra();
        return new ResponseEntity<>(devoluciones, HttpStatus.OK);
    }

    @GetMapping("/devoluciones-venta")
    public ResponseEntity<List<Transaccion>> obtenerDevolucionesVenta() {
        List<Transaccion> devoluciones = transaccionService.obtenerDevolucionesVenta();
        return new ResponseEntity<>(devoluciones, HttpStatus.OK);
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Transaccion>> obtenerPorTipo(@PathVariable String tipo) {
        try {
            Transaccion.TipoTransaccion tipoTransaccion = Transaccion.TipoTransaccion.valueOf(tipo.toUpperCase());
            List<Transaccion> transacciones = transaccionService.obtenerPorTipo(tipoTransaccion);
            return new ResponseEntity<>(transacciones, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Transaccion>> obtenerPorEstado(@PathVariable String estado) {
        try {
            Transaccion.EstadoTransaccion estadoTransaccion = Transaccion.EstadoTransaccion.valueOf(estado.toUpperCase());
            List<Transaccion> transacciones = transaccionService.obtenerPorEstado(estadoTransaccion);
            return new ResponseEntity<>(transacciones, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/suplidor/{suplidorId}")
    public ResponseEntity<List<Transaccion>> obtenerComprasPorSuplidor(@PathVariable Long suplidorId) {
        List<Transaccion> compras = transaccionService.obtenerComprasPorSuplidor(suplidorId);
        return new ResponseEntity<>(compras, HttpStatus.OK);
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Transaccion>> obtenerVentasPorCliente(@PathVariable Long clienteId) {
        List<Transaccion> ventas = transaccionService.obtenerVentasPorCliente(clienteId);
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Transaccion>> obtenerVentasPorVendedor(@PathVariable Long vendedorId) {
        List<Transaccion> ventas = transaccionService.obtenerVentasPorVendedor(vendedorId);
        return new ResponseEntity<>(ventas, HttpStatus.OK);
    }

    @GetMapping("/periodo")
    public ResponseEntity<List<Transaccion>> obtenerEnPeriodo(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        try {
            LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
            LocalDateTime fin = LocalDateTime.parse(fechaFin);
            List<Transaccion> transacciones = transaccionService.obtenerEnPeriodo(inicio, fin);
            return new ResponseEntity<>(transacciones, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/compras/periodo")
    public ResponseEntity<List<Transaccion>> obtenerComprasEnPeriodo(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        try {
            LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
            LocalDateTime fin = LocalDateTime.parse(fechaFin);
            List<Transaccion> compras = transaccionService.obtenerComprasEnPeriodo(inicio, fin);
            return new ResponseEntity<>(compras, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaccion> actualizarTransaccion(@PathVariable Long id, @RequestBody Transaccion transaccion) {
        try {
            Transaccion transaccionActualizada = transaccionService.actualizarTransaccion(id, transaccion);
            return new ResponseEntity<>(transaccionActualizada, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Transaccion> actualizarEstado(@PathVariable Long id, @RequestParam String estado) {
        try {
            Transaccion.EstadoTransaccion nuevoEstado = Transaccion.EstadoTransaccion.valueOf(estado.toUpperCase());
            Transaccion transaccionActualizada = transaccionService.actualizarEstado(id, nuevoEstado);
            return new ResponseEntity<>(transaccionActualizada, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<Transaccion> confirmarCompra(@PathVariable Long id) {
        try {
            Transaccion transaccionConfirmada = transaccionService.confirmarCompra(id);
            return new ResponseEntity<>(transaccionConfirmada, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/completar")
    public ResponseEntity<Transaccion> completarTransaccion(@PathVariable Long id) {
        try {
            Transaccion transaccionCompletada = transaccionService.completarTransaccion(id);
            return new ResponseEntity<>(transaccionCompletada, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Transaccion> cancelarTransaccion(@PathVariable Long id) {
        try {
            Transaccion transaccionCancelada = transaccionService.cancelarTransaccion(id);
            return new ResponseEntity<>(transaccionCancelada, HttpStatus.OK);
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
    public ResponseEntity<List<Transaccion>> obtenerTransaccionesPorOrigen(@PathVariable Long transaccionOrigenId) {
        List<Transaccion> transacciones = transaccionService.obtenerTransaccionesPorOrigen(transaccionOrigenId);
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
}