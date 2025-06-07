package com.thelarte.user.controller;

import com.thelarte.user.model.Cliente;
import com.thelarte.user.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Controlador REST para operaciones CRUD sobre Cliente.
 * Ruta base: /api/clientes
 */
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    @Autowired
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    /**
     * POST /api/clientes
     * Crea un nuevo Cliente.
     */
    @PostMapping
    public ResponseEntity<Cliente> crearCliente(@Valid @RequestBody Cliente cliente) {
        Cliente nuevoCliente = clienteService.crearCliente(cliente);
        return new ResponseEntity<>(nuevoCliente, HttpStatus.CREATED);
    }

    /**
     * GET /api/clientes
     * Obtiene lista de todos los clientes.
     */
    @GetMapping
    public ResponseEntity<List<Cliente>> listarClientes() {
        List<Cliente> clientes = clienteService.listarClientes();
        return ResponseEntity.ok(clientes);
    }

    /**
     * GET /api/clientes/{cedula}
     * Obtiene un cliente por su cédula.
     */
    @GetMapping("/{cedula}")
    public ResponseEntity<Cliente> obtenerClientePorCedula(@PathVariable String cedula) {
        Cliente cliente = clienteService.obtenerClientePorCedula(cedula);
        return ResponseEntity.ok(cliente);
    }

    /**
     * PUT /api/clientes/{cedula}
     * Actualiza un cliente existente.
     */
    @PutMapping("/{cedula}")
    public ResponseEntity<Cliente> actualizarCliente(
            @PathVariable String cedula,
            @Valid @RequestBody Cliente cliente) {
        Cliente clienteActualizado = clienteService.actualizarCliente(cedula, cliente);
        return ResponseEntity.ok(clienteActualizado);
    }

    /**
     * DELETE /api/clientes/{cedula}
     * Elimina un cliente.
     */
    @DeleteMapping("/{cedula}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable String cedula) {
        clienteService.eliminarCliente(cedula);
        return ResponseEntity.noContent().build();
    }
}
