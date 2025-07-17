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
        Empleado ent = new Empleado();
        ent.setCedula(dto.getCedula());
        ent.setNombre(dto.getNombre());
        ent.setApellido(dto.getApellido());
        ent.setTelefono(dto.getTelefono());
        ent.setRol(Rol.valueOf(dto.getRol()));
        ent.setSalario(dto.getSalario());
        ent.setEmail(dto.getEmail());
        ent.setComision(dto.getComision());

        Empleado creado = empleadoService.crearEmpleado(ent);
        URI uri = URI.create("/api/empleados/" + creado.getCedula());
        return ResponseEntity.created(uri).body(creado);
    }

    @GetMapping
    public ResponseEntity<List<Empleado>> listarEmpleados() {
        return ResponseEntity.ok(empleadoService.listarEmpleados());
    }

    @GetMapping("/{cedula}")
    public ResponseEntity<Empleado> obtenerEmpleado(@PathVariable String cedula) {
        Empleado e = empleadoService.obtenerEmpleadoPorCedula(cedula);
        return ResponseEntity.ok(e);
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
        empleadoService.eliminarEmpleado(cedula);
        return ResponseEntity.noContent().build();
    }
}