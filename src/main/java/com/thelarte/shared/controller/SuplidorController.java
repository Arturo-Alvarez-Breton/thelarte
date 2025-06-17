package com.thelarte.shared.controller;

import com.thelarte.shared.dto.SuplidorDTO;
import com.thelarte.shared.exception.EntityNotFoundException;
import com.thelarte.shared.service.ISuplidorService; // Import the interface
import com.thelarte.shared.service.SuplidorService; // Keep for existing constructor if needed, or remove if fully switched

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * Controlador REST para operaciones CRUD sobre Suplidor.
 * Ruta base: /api/suplidores
 */
@RestController
@RequestMapping("/api/suplidores")
public class SuplidorController {

    private static final Logger logger = LoggerFactory.getLogger(SuplidorController.class);
    private final ISuplidorService suplidorService; // Change to interface type
    
    @Autowired // Ensure Autowired is present if not already
    public SuplidorController(ISuplidorService suplidorService) { // Change parameter to interface type
        this.suplidorService = suplidorService;
    }
    
    /**
     * GET /api/suplidores
     * Obtiene lista de todos los suplidores.
     * @return Lista de DTOs de suplidores
     */
    @GetMapping
    public ResponseEntity<List<SuplidorDTO>> listarSuplidores() {
        List<SuplidorDTO> suplidorDTOs = suplidorService.listarTodos();
        return ResponseEntity.ok(suplidorDTOs);
    }    /**
     * GET /api/suplidores/{id}
     * Obtiene un suplidor por su ID.
     * @param id ID del suplidor
     * @return DTO del suplidor encontrado o 404 si no existe
     */
    @GetMapping("/{id}")
    public ResponseEntity<SuplidorDTO> obtenerSuplidor(@PathVariable Long id) {
        return suplidorService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * GET /api/suplidores/nombre/{nombre}
     * Busca suplidores por nombre.
     * @param nombre Nombre para filtrar
     * @return DTO del suplidor encontrado o 404 si no existe
     */
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<SuplidorDTO> buscarPorNombre(@PathVariable String nombre) {
        return suplidorService.buscarPorNombre(nombre)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * GET /api/suplidores/rnc/{rnc}
     * Busca suplidores por RNC.
     * @param rnc RNC para filtrar
     * @return DTO del suplidor encontrado o 404 si no existe
     */
    @GetMapping("/rnc/{rnc}")
    public ResponseEntity<SuplidorDTO> buscarPorRNC(@PathVariable String rnc) {
        return suplidorService.buscarPorRNC(rnc)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * GET /api/suplidores/ciudad/{ciudad}
     * Lista suplidores por ciudad.
     * @param ciudad Ciudad para filtrar
     * @return Lista de suplidores filtrados por ciudad
     */
    @GetMapping("/ciudad/{ciudad}")
    public ResponseEntity<List<SuplidorDTO>> listarPorCiudad(@PathVariable String ciudad) {
        List<SuplidorDTO> suplidores = suplidorService.listarPorCiudad(ciudad);
        return ResponseEntity.ok(suplidores);
    }    /**
     * POST /api/suplidores
     * Crea un nuevo suplidor.
     * @param suplidorDTO Datos del suplidor a crear
     * @return DTO del suplidor creado
     */
    @PostMapping
    public ResponseEntity<SuplidorDTO> crearSuplidor(@Valid @RequestBody SuplidorDTO suplidorDTO) {
        try {
            SuplidorDTO createdDto = suplidorService.guardar(suplidorDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDto);
        } catch (Exception e) {
            logger.error("Error al crear suplidor: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuplidorDTO> actualizarSuplidor(@PathVariable Long id, @RequestBody SuplidorDTO suplidorDTO) {
        try {
            // Asegurarse de que el ID en el DTO coincida con el ID en la ruta
            suplidorDTO.setId(id);
            
            // Verificar primero si existe
            if (suplidorService.buscarPorId(id).isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            SuplidorDTO updatedDto = suplidorService.guardar(suplidorDTO);
            return ResponseEntity.ok(updatedDto);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSuplidor(@PathVariable Long id) {
        if (suplidorService.buscarPorId(id).isPresent()) {
            suplidorService.eliminar(id);
            return ResponseEntity.ok().build();
        }
        
        return ResponseEntity.notFound().build();
    }
}
