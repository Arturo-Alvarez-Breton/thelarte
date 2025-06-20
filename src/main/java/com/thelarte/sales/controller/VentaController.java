package com.thelarte.sales.controller;

import com.thelarte.sales.model.Venta;
import com.thelarte.sales.service.VentaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/venta")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @GetMapping
    public List<Venta> listarVentas() {
        return ventaService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venta> obtenerVenta(@PathVariable String id) {
        return ventaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Venta crearVenta(@RequestBody Venta venta) {
        return ventaService.guardar(venta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Venta> actualizarVenta(@PathVariable String id, @RequestBody Venta nuevo) {
        return ventaService.buscarPorId(id)
                .map(ventaExistente -> {
                    ventaExistente.setIdArticulos(nuevo.getIdArticulos());
                    ventaExistente.setIdCliente(nuevo.getIdCliente());
                    ventaExistente.setIdVenta(nuevo.getIdVenta());
                    ventaExistente.setIdTransaccion(nuevo.getIdTransaccion());
                    return ResponseEntity.ok(ventaService.guardar(ventaExistente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVenta(@PathVariable String id) {
        if (ventaService.buscarPorId(id).isPresent()) {
            ventaService.eliminar(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
