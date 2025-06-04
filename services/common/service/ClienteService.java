package thelarte.services.common.service;

import thelarte.services.common.model.Cliente;

import java.util.List;

/**
 * Interfaz que define operaciones de negocio para Cliente.
 */
public interface ClienteService {
    Cliente crearCliente(Cliente cliente);
    Cliente obtenerClientePorCedula(String cedula);
    List<Cliente> listarClientes();
    Cliente actualizarCliente(String cedula, Cliente datosActualizados);
    void eliminarCliente(String cedula);
}
