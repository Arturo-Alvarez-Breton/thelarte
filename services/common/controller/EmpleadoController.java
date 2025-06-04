package thelarte.services.common.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thelarte.services.common.model.Empleado;
import thelarte.services.common.service.EmpleadoService;

import java.net.URI;
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
     * Retorna 201 Created y añade Location: /api/empleados/{cedula}.
     */
    @PostMapping
    public ResponseEntity<Empleado> crearEmpleado(@Valid @RequestBody Empleado empleado) {
        Empleado creado = empleadoService.crearEmpleado(empleado);
        URI ubicacion = URI.create("/api/empleados/" + creado.getCedula());
        return ResponseEntity.created(ubicacion).body(creado);
    }

    /**
     * GET /api/empleados
     * Devuelve la lista de todos los Empleados.
     */
    @GetMapping
    public ResponseEntity<List<Empleado>> listarEmpleados() {
        List<Empleado> lista = empleadoService.listarEmpleados();
        return ResponseEntity.ok(lista);
    }

    /**
     * GET /api/empleados/{cedula}
     * Obtiene un Empleado por su cédula. Si no existe, lanza 404.
     */
    @GetMapping("/{cedula}")
    public ResponseEntity<Empleado> obtenerEmpleado(@PathVariable String cedula) {
        Empleado e = empleadoService.obtenerEmpleadoPorCedula(cedula);
        return ResponseEntity.ok(e);
    }

    /**
     * PUT /api/empleados/{cedula}
     * Actualiza los datos de un Empleado existente.
     * Si no existe, lanza 404.
     */
    @PutMapping("/{cedula}")
    public ResponseEntity<Empleado> actualizarEmpleado(
            @PathVariable String cedula,
            @Valid @RequestBody Empleado datosActualizados) {

        Empleado actualizado = empleadoService.actualizarEmpleado(cedula, datosActualizados);
        return ResponseEntity.ok(actualizado);
    }

    /**
     * DELETE /api/empleados/{cedula}
     * Elimina un Empleado por su cédula. Si no existe, lanza 404.
     */
    @DeleteMapping("/{cedula}")
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable String cedula) {
        empleadoService.eliminarEmpleado(cedula);
        return ResponseEntity.noContent().build();
    }
}