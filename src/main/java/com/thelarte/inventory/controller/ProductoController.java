package com.thelarte.inventory.controller;

import com.thelarte.inventory.dto.ProductoDTO;
import com.thelarte.inventory.service.IProductoService;

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

    @Autowired
    public ProductoController(IProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listarProductos() {
        List<ProductoDTO> productoDTOs = productoService.listarTodos();
        return ResponseEntity.ok(productoDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerProducto(@PathVariable long id) {
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
        // Procesar imagen si viene en base64
        if (productoDTO.getFotoBase64() != null && !productoDTO.getFotoBase64().isBlank()) {
            String url = guardarImagenBase64(productoDTO.getFotoBase64());
            productoDTO.setFotoUrl(url);
        }
        productoDTO.setFotoBase64(null); // Limpia para no guardar base64 en la BD ni devolverlo
        ProductoDTO saved = productoService.guardar(productoDTO);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizarProducto(@PathVariable Long id, @RequestBody ProductoDTO productoDTO) {
        // Si hay fotoBase64, procesa y actualiza la imagen
        if (productoDTO.getFotoBase64() != null && !productoDTO.getFotoBase64().isBlank()) {
            String url = guardarImagenBase64(productoDTO.getFotoBase64());
            productoDTO.setFotoUrl(url);
        } else {
            // Si NO hay fotoBase64, NO cambies el campo fotoUrl:
            // Recupéralo del producto original
            ProductoDTO original = productoService.buscarPorId(id).orElse(null);
            if (original != null) {
                productoDTO.setFotoUrl(original.getFotoUrl());
            }
        }
        productoDTO.setId(id);
        productoDTO.setFotoBase64(null);
        ProductoDTO updated = productoService.guardar(productoDTO);
        return ResponseEntity.ok(updated);
    }

    private String guardarImagenBase64(String base64Data) {
        try {
            // Validación robusta para evitar errores de índice
            if (base64Data == null || base64Data.isEmpty() || !base64Data.contains(",")) {
                // Si no hay coma, el formato es inválido o no hay imagen nueva
                return null;
            }
            String[] parts = base64Data.split(",");
            if (parts.length < 2) {
                throw new RuntimeException("Formato de imagen Base64 inválido");
            }
            String metadata = parts[0]; // data:image/png;base64
            String extension = "png";
            if (metadata.contains("jpeg")) extension = "jpg";
            else if (metadata.contains("gif")) extension = "gif";
            byte[] data = java.util.Base64.getDecoder().decode(parts[1]);
            String fileName = System.currentTimeMillis() + "." + extension;
            java.nio.file.Path dir = java.nio.file.Paths.get("uploads/imagenes");
            java.nio.file.Files.createDirectories(dir);
            java.nio.file.Path path = dir.resolve(fileName);
            java.nio.file.Files.write(path, data);
            return "/uploads/imagenes/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Error guardando imagen", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable long id) {
        if (productoService.buscarPorId(id).isPresent()) {
            productoService.eliminar(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Obtener todos los productos incluyendo eliminados (para administración)
     */
    @GetMapping("/all-inclusive")
    public ResponseEntity<List<ProductoDTO>> listarTodosInclusiveEliminados() {
        List<ProductoDTO> productos = ((com.thelarte.inventory.service.ProductoService) productoService).listarTodosInclusiveEliminados();
        return ResponseEntity.ok(productos);
    }

    /**
     * Obtener solo productos eliminados lógicamente
     */
    @GetMapping("/deleted")
    public ResponseEntity<List<ProductoDTO>> listarEliminados() {
        List<ProductoDTO> productos = ((com.thelarte.inventory.service.ProductoService) productoService).listarEliminados();
        return ResponseEntity.ok(productos);
    }

    /**
     * Reactivar un producto eliminado lógicamente
     */
    @PostMapping("/{id}/reactivate")
    public ResponseEntity<ProductoDTO> reactivarProducto(@PathVariable Long id) {
        try {
            ProductoDTO producto = ((com.thelarte.inventory.service.ProductoService) productoService).reactivar(id);
            return ResponseEntity.ok(producto);
        } catch (Exception e) {
            logger.error("Error reactivating product with id {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}