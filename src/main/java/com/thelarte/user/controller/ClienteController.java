package com.thelarte.user.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.thelarte.user.model.Cliente;
import com.thelarte.user.service.ClienteService;
import com.thelarte.user.dto.ClienteCreateDTO;
import com.thelarte.user.dto.ClienteUpdateDTO;

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
    public ResponseEntity<Cliente> crearCliente(@Valid @RequestBody ClienteCreateDTO dto) {
        // Mapear DTO a entidad
        Cliente cliente = new Cliente();
        cliente.setCedula(dto.getCedula());
        cliente.setNombre(dto.getNombre());
        cliente.setApellido(dto.getApellido());
        cliente.setTelefono(dto.getTelefono());
        cliente.setEmail(dto.getEmail());
        cliente.setDireccion(dto.getDireccion());
        // fechaRegistro se asigna en @PrePersist

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

    @PutMapping("/{cedula}")
    public ResponseEntity<Cliente> actualizarCliente(
            @PathVariable String cedula,
            @Valid @RequestBody ClienteUpdateDTO dto) {

        // Mapear DTO a entidad parcial
        Cliente datos = new Cliente();
        // No seteamos cedula en datos, pues se usa la ruta para encontrar existente
        datos.setNombre(dto.getNombre());
        datos.setApellido(dto.getApellido());
        datos.setTelefono(dto.getTelefono());
        datos.setEmail(dto.getEmail());
        datos.setDireccion(dto.getDireccion());
        // fechaRegistro no se toca

        Cliente actualizado = clienteService.actualizarCliente(cedula, datos);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{cedula}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable String cedula) {
        clienteService.eliminarCliente(cedula);
        return ResponseEntity.noContent().build();
    }
}
