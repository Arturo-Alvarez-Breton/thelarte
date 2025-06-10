package com.thelarte.user.controller;

import com.thelarte.user.model.Empleado;
import com.thelarte.user.service.EmpleadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Controlador REST para operaciones CRUD sobre Empleado.
 * Ruta base: /api/empleados
 */
@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @Autowired
    public EmpleadoController(EmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    /**
     * POST /api/empleados
     * Crea un nuevo Empleado.
     */
    @PostMapping
    public ResponseEntity<Empleado> crearEmpleado(@Valid @RequestBody Empleado empleado) {
        Empleado nuevoEmpleado = empleadoService.crearEmpleado(empleado);
        return new ResponseEntity<>(nuevoEmpleado, HttpStatus.CREATED);
    }

    /**
     * GET /api/empleados
     * Obtiene lista de todos los empleados.
     */
    @GetMapping
    public ResponseEntity<List<Empleado>> listarEmpleados() {
        List<Empleado> empleados = empleadoService.listarEmpleados();
        return ResponseEntity.ok(empleados);
    }

    /**
     * GET /api/empleados/{cedula}
     * Obtiene un empleado por su cédula.
     */
    @GetMapping("/{cedula}")
    public ResponseEntity<Empleado> obtenerEmpleadoPorCedula(@PathVariable String cedula) {
        Empleado empleado = empleadoService.obtenerEmpleadoPorCedula(cedula);
        return ResponseEntity.ok(empleado);
    }

    /**
     * PUT /api/empleados/{cedula}
     * Actualiza un empleado existente.
     */
    @PutMapping("/{cedula}")
    public ResponseEntity<Empleado> actualizarEmpleado(
            @PathVariable String cedula,
            @Valid @RequestBody Empleado empleado) {
        Empleado empleadoActualizado = empleadoService.actualizarEmpleado(cedula, empleado);
        return ResponseEntity.ok(empleadoActualizado);
    }

    /**
     * DELETE /api/empleados/{cedula}
     * Elimina un empleado.
     */
    @DeleteMapping("/{cedula}")
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable String cedula) {
        empleadoService.eliminarEmpleado(cedula);
        return ResponseEntity.noContent().build();
    }
}
