package com.thelarte.user.service.impl;

import com.thelarte.user.service.ClienteService;
import com.thelarte.user.util.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.thelarte.user.model.Cliente;
import com.thelarte.user.repository.ClienteRepository;

import java.util.List;

@Service
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;

    @Autowired
    public ClienteServiceImpl(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Override
    public Cliente crearCliente(Cliente cliente) {
        // fechaRegistro se asigna automáticamente en @PrePersist
        // Si quisieras, podrías validar duplicados antes de save (email, cedula ya PK)
        return clienteRepository.save(cliente);
    }

    @Override
    public Cliente obtenerClientePorCedula(String cedula) {
        return clienteRepository.findById(cedula)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cliente no encontrado con cédula: " + cedula));
    }

    @Override
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    @Override
    public Cliente actualizarCliente(String cedula, Cliente datosActualizados) {
        Cliente existente = clienteRepository.findById(cedula)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cliente no encontrado con cédula: " + cedula));

        // Actualizar solo campos permisibles; NO modificar fechaRegistro
        existente.setNombre(datosActualizados.getNombre());
        existente.setApellido(datosActualizados.getApellido());
        existente.setTelefono(datosActualizados.getTelefono());
        existente.setEmail(datosActualizados.getEmail());
        existente.setDireccion(datosActualizados.getDireccion());
        // NO: existente.setFechaRegistro(datosActualizados.getFechaRegistro());

        return clienteRepository.save(existente);
    }

    @Override
    public void eliminarCliente(String cedula) {
        Cliente existente = clienteRepository.findById(cedula)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cliente no encontrado con cédula: " + cedula));
        clienteRepository.delete(existente);
    }
}
