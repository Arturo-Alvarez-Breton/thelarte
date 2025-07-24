package com.thelarte.inventory.controller;

import com.thelarte.inventory.dto.UnidadDTO;
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
    public ResponseEntity<UnidadDTO> registrarUnidad(@RequestBody UnidadDTO unidad) {
        UnidadDTO nueva = unidadService.registrarUnidad(
                unidad.getIdProducto(),
                unidad.getEstado(),
                unidad.isStock()
        );
        return ResponseEntity.ok(nueva);
    }

    // Cambiar el estado de una unidad
    @PutMapping("/{idUnidad}/estado")
    public ResponseEntity<UnidadDTO> cambiarEstado(
            @PathVariable Long idUnidad,
            @RequestParam EstadoUnidad estado,
            @RequestParam(required = false) Boolean disponible
    ) {
        UnidadDTO unidad = unidadService.cambiarEstado(idUnidad, estado);
        return ResponseEntity.ok(unidad);
    }

    // Mover unidad entre stock y almacén
    @PutMapping("/{idUnidad}/mover")
    public ResponseEntity<UnidadDTO> moverUnidad(
            @PathVariable Long idUnidad,
            @RequestParam boolean stock
    ) {
        UnidadDTO unidad = unidadService.moverUnidad(idUnidad, stock);
        return ResponseEntity.ok(unidad);
    }

    // Consultar todas las unidades de un producto
    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<List<UnidadDTO>> unidadesPorProducto(@PathVariable Long idProducto) {
        List<UnidadDTO> lista = unidadService.unidadesPorProducto(idProducto);
        return ResponseEntity.ok(lista);
    }

    // Consultar unidades por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<UnidadDTO>> unidadesPorEstado(@PathVariable EstadoUnidad estado) {
        List<UnidadDTO> lista = unidadService.unidadesPorEstado(estado);
        return ResponseEntity.ok(lista);
    }

    // Consultar unidades por stock/almacén
    @GetMapping("/stock/{stock}")
    public ResponseEntity<List<UnidadDTO>> unidadesPorStock(@PathVariable boolean stock) {
        List<UnidadDTO> lista = unidadService.unidadesPorStock(stock);
        return ResponseEntity.ok(lista);
    }

    // Buscar una unidad por id
    @GetMapping("/{idUnidad}")
    public ResponseEntity<UnidadDTO> buscarPorId(@PathVariable Long idUnidad) {
        Optional<UnidadDTO> unidadOpt = unidadService.buscarPorId(idUnidad);
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
    public ResponseEntity<UnidadDTO> actualizarUnidad(@PathVariable Long idUnidad, @RequestBody UnidadDTO unidad) {
        UnidadDTO actualizada = unidadService.actualizarUnidad(idUnidad, unidad);
        return ResponseEntity.ok(actualizada);
    }
    @GetMapping("/producto/{idProducto}/disponibles")
    public ResponseEntity<List<UnidadDTO>> unidadesDisponiblesPorProducto(@PathVariable Long idProducto) {
        List<UnidadDTO> lista = unidadService.unidadesDisponiblesPorProducto(idProducto);
        return ResponseEntity.ok(lista);
    }
    @GetMapping("/producto/{idProducto}/estado/{estado}")
    public ResponseEntity<List<UnidadDTO>> unidadesPorEstadoPorProducto(
            @PathVariable Long idProducto,
            @PathVariable EstadoUnidad estado
    ) {
        List<UnidadDTO> lista = unidadService.obtenerUnidadesPorEstado(idProducto, estado);
        return ResponseEntity.ok(lista);
    }

}