package com.thelarte.inventory.controller;

import com.thelarte.inventory.dto.ProductoDTO;
import com.thelarte.inventory.service.IProductoService;
import com.thelarte.inventory.service.ProductoService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private static final Logger logger = LoggerFactory.getLogger(ProductoController.class);
    private final IProductoService productoService;
    private final ProductoService productoServiceImpl;

    @Autowired
    public ProductoController(IProductoService productoService, ProductoService productoServiceImpl) {
        this.productoService = productoService;
        this.productoServiceImpl = productoServiceImpl;
    }

    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listarProductos() {
        List<ProductoDTO> productoDTOs = productoService.listarTodos();
        return ResponseEntity.ok(productoDTOs);
    }

    @GetMapping("/all-inclusive")
    public ResponseEntity<List<ProductoDTO>> listarTodosInclusiveEliminados() {
        List<ProductoDTO> productoDTOs = productoServiceImpl.listarTodosInclusiveEliminados();
        return ResponseEntity.ok(productoDTOs);
    }

    @GetMapping("/deleted")
    public ResponseEntity<List<ProductoDTO>> listarEliminados() {
        List<ProductoDTO> productoDTOs = productoServiceImpl.listarEliminados();
        return ResponseEntity.ok(productoDTOs);
    }

    @GetMapping("/tipos")
    public ResponseEntity<List<String>> obtenerTiposUnicos() {
        List<String> tipos = productoService.obtenerTiposUnicos();
        return ResponseEntity.ok(tipos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerProducto(@PathVariable Long id) {
        return productoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<ProductoDTO> buscarPorNombre(@PathVariable String nombre) {
        return productoService.buscarPorNombre(nombre)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<ProductoDTO>> listarPorTipo(@PathVariable String tipo) {
        List<ProductoDTO> productos = productoService.listarPorTipo(tipo);
        return ResponseEntity.ok(productos);
    }

    @PostMapping
    public ResponseEntity<ProductoDTO> crearProducto(@RequestBody ProductoDTO productoDTO) {
        try {
            ProductoDTO nuevoProducto = productoService.guardar(productoDTO);
            return ResponseEntity.ok(nuevoProducto);
        } catch (IllegalArgumentException e) {
            logger.error("Error al crear producto: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizarProducto(@PathVariable Long id, @RequestBody ProductoDTO productoDTO) {
        try {
            productoDTO.setId(id);
            ProductoDTO productoActualizado = productoService.guardar(productoDTO);
            return ResponseEntity.ok(productoActualizado);
        } catch (IllegalArgumentException e) {
            logger.error("Error al actualizar producto: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error al actualizar producto con ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        try {
            productoService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error al eliminar producto con ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reactivate")
    public ResponseEntity<ProductoDTO> reactivarProducto(@PathVariable Long id) {
        try {
            ProductoDTO productoReactivado = productoServiceImpl.reactivar(id);
            return ResponseEntity.ok(productoReactivado);
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.error("Error al reactivar producto: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error al reactivar producto con ID {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}