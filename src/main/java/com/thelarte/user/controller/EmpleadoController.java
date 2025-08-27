package com.thelarte.user.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.thelarte.user.model.Empleado;
import com.thelarte.user.service.EmpleadoService;
import com.thelarte.user.dto.EmpleadoCreateDTO;
import com.thelarte.user.dto.EmpleadoUpdateDTO;
import com.thelarte.user.util.Rol;
import com.thelarte.shared.exception.EntityNotFoundException;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @Autowired
    public EmpleadoController(EmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    @PostMapping
    public ResponseEntity<Empleado> crearEmpleado(@Valid @RequestBody EmpleadoCreateDTO dto) {
        try {
            Empleado empleado = new Empleado();
            empleado.setCedula(dto.getCedula());
            empleado.setNombre(dto.getNombre());
            empleado.setApellido(dto.getApellido());
            empleado.setTelefono(dto.getTelefono());
            empleado.setEmail(dto.getEmail());
            empleado.setRol(Rol.valueOf(dto.getRol()));
            empleado.setSalario(dto.getSalario());
            empleado.setComision(dto.getComision());
            // fechaContratacion se asigna en @PrePersist

            Empleado creado = empleadoService.crearEmpleado(empleado);
            URI ubicacion = URI.create("/api/empleados/" + creado.getCedula());
            return ResponseEntity.created(ubicacion).body(creado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Empleado>> listarEmpleados() {
        List<Empleado> lista = empleadoService.listarEmpleados();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/todos")
    public ResponseEntity<List<Empleado>> listarTodosLosEmpleados() {
        List<Empleado> lista = empleadoService.listarTodosLosEmpleados();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{cedula}")
    public ResponseEntity<Empleado> obtenerEmpleado(@PathVariable String cedula) {
        Empleado empleado = empleadoService.obtenerEmpleadoPorCedula(cedula);
        return ResponseEntity.ok(empleado);
    }

    @PutMapping("/{cedula}")
    public ResponseEntity<Empleado> actualizarEmpleado(
            @PathVariable String cedula,
            @Valid @RequestBody EmpleadoUpdateDTO dto) {

        Empleado datos = new Empleado();
        datos.setNombre(dto.getNombre());
        datos.setApellido(dto.getApellido());
        datos.setTelefono(dto.getTelefono());
        datos.setRol(Rol.valueOf(dto.getRol()));
        datos.setSalario(dto.getSalario());
        datos.setEmail(dto.getEmail());
        datos.setComision(dto.getComision());

        Empleado actualizado = empleadoService.actualizarEmpleado(cedula, datos);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{cedula}")
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable String cedula) {
        empleadoService.eliminarEmpleadoLogico(cedula);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{cedula}/restaurar")
    public ResponseEntity<Void> restaurarEmpleado(@PathVariable String cedula) {
        try {
            empleadoService.restaurarEmpleado(cedula);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
