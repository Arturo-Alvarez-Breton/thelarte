package thelarte.services.common.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import thelarte.services.common.model.Cliente;
import thelarte.services.common.service.ClienteService;

import java.net.URI;
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
     * Retorna 201 Created y añade Location: /api/clientes/{cedula}.
     */
    @PostMapping
    public ResponseEntity<Cliente> crearCliente(@Valid @RequestBody Cliente cliente) {
        Cliente creado = clienteService.crearCliente(cliente);
        URI ubicacion = URI.create("/api/clientes/" + creado.getCedula());
        return ResponseEntity.created(ubicacion).body(creado);
    }

    /**
     * GET /api/clientes
     * Devuelve la lista de todos los Clientes.
     */
    @GetMapping
    public ResponseEntity<List<Cliente>> listarClientes() {
        List<Cliente> lista = clienteService.listarClientes();
        return ResponseEntity.ok(lista);
    }

    /**
     * GET /api/clientes/{cedula}
     * Obtiene un Cliente por su cédula. Si no existe, lanza 404.
     */
    @GetMapping("/{cedula}")
    public ResponseEntity<Cliente> obtenerCliente(@PathVariable String cedula) {
        Cliente c = clienteService.obtenerClientePorCedula(cedula);
        return ResponseEntity.ok(c);
    }

    /**
     * PUT /api/clientes/{cedula}
     * Actualiza los datos de un Cliente existente.
     * Si no existe, lanza 404.
     */
    @PutMapping("/{cedula}")
    public ResponseEntity<Cliente> actualizarCliente(
            @PathVariable String cedula,
            @Valid @RequestBody Cliente datosActualizados) {

        Cliente actualizado = clienteService.actualizarCliente(cedula, datosActualizados);
        return ResponseEntity.ok(actualizado);
    }

    /**
     * DELETE /api/clientes/{cedula}
     * Elimina un Cliente por su cédula. Si no existe, lanza 404.
     */
    @DeleteMapping("/{cedula}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable String cedula) {
        clienteService.eliminarCliente(cedula);
        return ResponseEntity.noContent().build();
    }
}
