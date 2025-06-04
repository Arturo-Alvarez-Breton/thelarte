package com.thelarte.inventory.controller;

import com.thelarte.shared.model.Producto;
import com.thelarte.inventory.service.ProductoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/producto")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<Producto> listarProductos() {
        return productoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProducto(@PathVariable String id) {
        return productoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Producto crearProducto(@RequestBody Producto producto) {
        return productoService.guardar(producto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable String id, @RequestBody Producto nuevo) {
        return productoService.buscarPorId(id)
                .map(productoExistente -> {
                    productoExistente.setNombre(nuevo.getNombre());
                    productoExistente.setTipo(nuevo.getTipo());
                    productoExistente.setDescripcion(nuevo.getDescripcion());
                    productoExistente.setMarca(nuevo.getMarca());
                    productoExistente.setItbis(nuevo.getItbis());
                    productoExistente.setPrecio(nuevo.getPrecio());
                    productoExistente.setActivo(nuevo.isActivo());
                    return ResponseEntity.ok(productoService.guardar(productoExistente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable String id) {
        if (productoService.buscarPorId(id).isPresent()) {
            productoService.eliminar(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
