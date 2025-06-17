package com.thelarte.user.controller;

import com.thelarte.user.model.Persona;
import com.thelarte.user.service.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para operaciones sobre Persona (generico).
 * Ruta base: /api/personas
 */
@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    private final PersonaService personaService;

    @Autowired
    public PersonaController(PersonaService personaService) {
        this.personaService = personaService;
    }

    /**
     * GET /api/personas
     * Obtiene lista de todas las personas (empleados y clientes).
     */
    @GetMapping
    public ResponseEntity<List<Persona>> listarPersonas() {
        List<Persona> personas = personaService.listarPersonas();
        return ResponseEntity.ok(personas);
    }

    /**
     * GET /api/personas/{cedula}
     * Obtiene una persona por su cédula.
     */
    @GetMapping("/{cedula}")
    public ResponseEntity<Persona> obtenerPersonaPorCedula(@PathVariable String cedula) {
        Persona persona = personaService.obtenerPersonaPorCedula(cedula);
        return ResponseEntity.ok(persona);
    }
}
