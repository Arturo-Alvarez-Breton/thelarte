package com.thelarte.user.service.impl;

import com.thelarte.user.service.ClienteService;
import com.thelarte.shared.exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
        return clienteRepository.save(cliente);
    }

    @Override
    public Cliente obtenerClientePorCedula(String cedula) {
        return clienteRepository.findByCedulaAndDeletedFalse(cedula)
                .orElseThrow(() ->
                        new EntityNotFoundException("Cliente no encontrado con cédula: " + cedula));
    }

    @Override
    public List<Cliente> listarClientes() {
        return clienteRepository.findByDeletedFalse();
    }

    @Override
    public Cliente actualizarCliente(String cedula, Cliente datosActualizados) {
        Cliente existente = clienteRepository.findByCedulaAndDeletedFalse(cedula)
                .orElseThrow(() ->
                        new EntityNotFoundException("Cliente no encontrado con cédula: " + cedula));

        existente.setNombre(datosActualizados.getNombre());
        existente.setApellido(datosActualizados.getApellido());
        existente.setTelefono(datosActualizados.getTelefono());
        existente.setEmail(datosActualizados.getEmail());
        existente.setDireccion(datosActualizados.getDireccion());
        return clienteRepository.save(existente);
    }

    @Override
    public void eliminarCliente(String cedula) {
        Cliente existente = clienteRepository.findByCedulaAndDeletedFalse(cedula)
                .orElseThrow(() ->
                        new EntityNotFoundException("Cliente no encontrado con cédula: " + cedula));
        clienteRepository.delete(existente);
    }

    @Override
    public Cliente getClienteByCedula(String cedula) {
        return clienteRepository.findByCedulaAndDeletedFalse(cedula)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con cédula: " + cedula));
    }

    @Override
    public List<Cliente> getClientesFiltered(String busqueda, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        
        if (busqueda != null && !busqueda.isEmpty()) {
            Page<Cliente> pageResult = clienteRepository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCaseAndDeletedFalse(
                    busqueda, busqueda, pageable);
            return pageResult.getContent();
        } else {
            Page<Cliente> pageResult = clienteRepository.findByDeletedFalse(pageable);
            return pageResult.getContent();
        }
    }

    // Métodos para borrado lógico
    @Override
    public void eliminarClienteLogico(String cedula) {
        Cliente cliente = clienteRepository.findById(cedula)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con cédula: " + cedula));

        if (cliente.isDeleted()) {
            throw new IllegalStateException("El cliente ya está eliminado");
        }

        cliente.setDeleted(true);
        clienteRepository.save(cliente);
    }

    @Override
    public void restaurarCliente(String cedula) {
        Cliente cliente = clienteRepository.findById(cedula)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con cédula: " + cedula));

        if (!cliente.isDeleted()) {
            throw new IllegalStateException("El cliente no está eliminado");
        }

        cliente.setDeleted(false);
        clienteRepository.save(cliente);
    }

    // Métodos para obtener TODOS los clientes (activos y eliminados)
    @Override
    public List<Cliente> listarTodosLosClientes() {
        return clienteRepository.findAll();
    }

    @Override
    public List<Cliente> getTodosLosClientesFiltered(String busqueda, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        if (busqueda != null && !busqueda.isEmpty()) {
            Page<Cliente> pageResult = clienteRepository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(
                    busqueda, busqueda, pageable);
            return pageResult.getContent();
        } else {
            Page<Cliente> pageResult = clienteRepository.findAll(pageable);
            return pageResult.getContent();
        }
    }
}