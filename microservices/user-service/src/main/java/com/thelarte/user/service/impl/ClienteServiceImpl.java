package com.thelarte.user.service.impl;

import com.thelarte.user.model.Cliente;
import com.thelarte.user.repository.ClienteRepository;
import com.thelarte.user.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDate;

/**
 * Implementación de ClienteService.
 */
@Service
@Transactional
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;

    @Autowired
    public ClienteServiceImpl(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Override
    public Cliente crearCliente(Cliente cliente) {
        if (cliente.getFechaRegistro() == null) {
            cliente.setFechaRegistro(LocalDate.now());
        }
        return clienteRepository.save(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public Cliente obtenerClientePorCedula(String cedula) {
        return clienteRepository.findById(cedula)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con cédula: " + cedula));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    @Override
    public Cliente actualizarCliente(String cedula, Cliente datosActualizados) {
        Cliente clienteExistente = obtenerClientePorCedula(cedula);
        
        // Actualizar los campos
        if (datosActualizados.getNombre() != null) {
            clienteExistente.setNombre(datosActualizados.getNombre());
        }
        if (datosActualizados.getApellido() != null) {
            clienteExistente.setApellido(datosActualizados.getApellido());
        }
        if (datosActualizados.getTelefono() != null) {
            clienteExistente.setTelefono(datosActualizados.getTelefono());
        }
        if (datosActualizados.getEmail() != null) {
            clienteExistente.setEmail(datosActualizados.getEmail());
        }
        if (datosActualizados.getDireccion() != null) {
            clienteExistente.setDireccion(datosActualizados.getDireccion());
        }
        
        return clienteRepository.save(clienteExistente);
    }

    @Override
    public void eliminarCliente(String cedula) {
        if (!clienteRepository.existsById(cedula)) {
            throw new RuntimeException("Cliente no encontrado con cédula: " + cedula);
        }
        clienteRepository.deleteById(cedula);
    }
}
