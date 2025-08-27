package com.thelarte.shared.controller;

import com.thelarte.shared.dto.SuplidorDTO;
import com.thelarte.shared.service.ISuplidorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/suplidores")
@CrossOrigin(origins = "*")
public class SuplidorController {

    @Autowired
    private ISuplidorService suplidorService;

    /**
     * Obtiene todos los suplidores (solo activos por defecto)
     */
    @GetMapping
    public ResponseEntity<List<SuplidorDTO>> getAllSuplidores() {
        try {
            List<SuplidorDTO> suplidores = suplidorService.listarTodos();
            return ResponseEntity.ok(suplidores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene todos los suplidores (activos e inactivos)
     */
    @GetMapping("/todos")
    public ResponseEntity<List<SuplidorDTO>> getAllSuplidoresConInactivos() {
        try {
            List<SuplidorDTO> suplidores = suplidorService.listarTodosConInactivos();
            return ResponseEntity.ok(suplidores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene solo los suplidores inactivos
     */
    @GetMapping("/inactivos")
    public ResponseEntity<List<SuplidorDTO>> getSuplidoresInactivos() {
        try {
            List<SuplidorDTO> suplidores = suplidorService.listarInactivos();
            return ResponseEntity.ok(suplidores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene un suplidor por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SuplidorDTO> getSuplidorById(@PathVariable Long id) {
        try {
            Optional<SuplidorDTO> suplidor = suplidorService.buscarPorId(id);
            return suplidor.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Crea un nuevo suplidor
     */
    @PostMapping
    public ResponseEntity<SuplidorDTO> createSuplidor(@RequestBody SuplidorDTO suplidorDTO) {
        try {
            SuplidorDTO nuevoSuplidor = suplidorService.guardar(suplidorDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoSuplidor);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Actualiza un suplidor existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<SuplidorDTO> updateSuplidor(@PathVariable Long id, @RequestBody SuplidorDTO suplidorDTO) {
        try {
            suplidorDTO.setId(id);
            SuplidorDTO suplidorActualizado = suplidorService.guardar(suplidorDTO);
            return ResponseEntity.ok(suplidorActualizado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Desactiva un suplidor (eliminación lógica)
     */
    @PutMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivarSuplidor(@PathVariable Long id) {
        try {
            suplidorService.desactivar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Activa un suplidor
     */
    @PutMapping("/{id}/activar")
    public ResponseEntity<Void> activarSuplidor(@PathVariable Long id) {
        try {
            suplidorService.activar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Elimina físicamente un suplidor (solo para casos especiales)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSuplidor(@PathVariable Long id) {
        try {
            suplidorService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Busca suplidores por nombre
     */
    @GetMapping("/buscar/nombre/{nombre}")
    public ResponseEntity<SuplidorDTO> getSuplidorByNombre(@PathVariable String nombre) {
        try {
            Optional<SuplidorDTO> suplidor = suplidorService.buscarPorNombre(nombre);
            return suplidor.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca suplidores por RNC
     */
    @GetMapping("/buscar/rnc/{rnc}")
    public ResponseEntity<SuplidorDTO> getSuplidorByRNC(@PathVariable String rnc) {
        try {
            Optional<SuplidorDTO> suplidor = suplidorService.buscarPorRNC(rnc);
            return suplidor.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca suplidores por ciudad
     */
    @GetMapping("/ciudad/{ciudad}")
    public ResponseEntity<List<SuplidorDTO>> getSuplidoresByCiudad(@PathVariable String ciudad) {
        try {
            List<SuplidorDTO> suplidores = suplidorService.listarPorCiudad(ciudad);
            return ResponseEntity.ok(suplidores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
