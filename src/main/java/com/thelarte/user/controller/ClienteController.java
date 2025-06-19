package com.thelarte.user.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.thelarte.user.model.Cliente;
import com.thelarte.user.service.ClienteService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    private final ClienteService clienteService;

    @Autowired
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @PostMapping
    public ResponseEntity<Cliente> crearCliente(@Valid @RequestBody Cliente cliente) {
        Cliente creado = clienteService.crearCliente(cliente);
        URI ubicacion = URI.create("/api/clientes/" + creado.getCedula());
        return ResponseEntity.created(ubicacion).body(creado);
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listarClientes() {
        List<Cliente> lista = clienteService.listarClientes();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{cedula}")
    public ResponseEntity<Cliente> obtenerCliente(@PathVariable String cedula) {
        Cliente c = clienteService.obtenerClientePorCedula(cedula);
        return ResponseEntity.ok(c);
    }

}
