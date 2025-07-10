package com.thelarte.inventory.controller;

import com.thelarte.inventory.model.Unidad;
import com.thelarte.inventory.util.EstadoUnidad;
import com.thelarte.inventory.service.UnidadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/unidades")
public class UnidadController {

    @Autowired
    private UnidadService unidadService;

    // Registrar una nueva unidad
    @PostMapping
    public ResponseEntity<Unidad> registrarUnidad(@RequestBody Unidad unidad) {
        Unidad nueva = unidadService.registrarUnidad(
                unidad.getProducto().getId(),
                unidad.getEstado(),
                unidad.isStock()
        );
        return ResponseEntity.ok(nueva);
    }

    // Cambiar el estado de una unidad
    @PutMapping("/{idUnidad}/estado")
    public ResponseEntity<Unidad> cambiarEstado(
            @PathVariable Long idUnidad,
            @RequestParam EstadoUnidad estado,
            @RequestParam(required = false) Boolean disponible
    ) {
        Unidad unidad = unidadService.cambiarEstado(idUnidad, estado);
        return ResponseEntity.ok(unidad);
    }

    // Mover unidad entre stock y almacén
    @PutMapping("/{idUnidad}/mover")
    public ResponseEntity<Unidad> moverUnidad(
            @PathVariable Long idUnidad,
            @RequestParam boolean stock
    ) {
        Unidad unidad = unidadService.moverUnidad(idUnidad, stock);
        return ResponseEntity.ok(unidad);
    }

    // Consultar todas las unidades de un producto
    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<List<Unidad>> unidadesPorProducto(@PathVariable Long idProducto) {
        List<Unidad> lista = unidadService.unidadesPorProducto(idProducto);
        return ResponseEntity.ok(lista);
    }

    // Consultar unidades por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Unidad>> unidadesPorEstado(@PathVariable EstadoUnidad estado) {
        List<Unidad> lista = unidadService.unidadesPorEstado(estado);
        return ResponseEntity.ok(lista);
    }


    // Consultar unidades por stock/almacén
    @GetMapping("/stock/{stock}")
    public ResponseEntity<List<Unidad>> unidadesPorStock(@PathVariable boolean stock) {
        List<Unidad> lista = unidadService.unidadesPorStock(stock);
        return ResponseEntity.ok(lista);
    }

    // Buscar una unidad por id
    @GetMapping("/{idUnidad}")
    public ResponseEntity<Unidad> buscarPorId(@PathVariable Long idUnidad) {
        Optional<Unidad> unidadOpt = unidadService.buscarPorId(idUnidad);
        return unidadOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Eliminar una unidad
    @DeleteMapping("/{idUnidad}")
    public ResponseEntity<Void> eliminarUnidad(@PathVariable Long idUnidad) {
        unidadService.eliminarUnidad(idUnidad);
        return ResponseEntity.noContent().build();
    }

    // Actualizar una unidad (edición completa)
    @PutMapping("/{idUnidad}")
    public ResponseEntity<Unidad> actualizarUnidad(@PathVariable Long idUnidad, @RequestBody Unidad unidad) {
        Unidad actualizada = unidadService.actualizarUnidad(idUnidad, unidad);
        return ResponseEntity.ok(actualizada);
    }
}