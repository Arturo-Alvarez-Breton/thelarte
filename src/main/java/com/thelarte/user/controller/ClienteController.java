package com.thelarte.user.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.thelarte.user.model.Empleado;
import com.thelarte.user.service.EmpleadoService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    private final EmpleadoService empleadoService;

    @Autowired
    public ClienteController(EmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    @PostMapping
    public ResponseEntity<Empleado> crearCliente(@Valid @RequestBody Empleado cliente) {
        Empleado creado = empleadoService.crearEmpleado(cliente);
        URI ubicacion = URI.create("/api/clientes/" + creado.getCedula());
        return ResponseEntity.created(ubicacion).body(creado);
    }

    @GetMapping
    public ResponseEntity<List<Empleado>> listarClientes() {
        List<Empleado> lista = empleadoService.listarEmpleados();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{cedula}")
    public ResponseEntity<Empleado> obtenerCliente(@PathVariable String cedula) {
        Empleado e = empleadoService.obtenerEmpleadoPorCedula(cedula);
        return ResponseEntity.ok(e);
    }
}
