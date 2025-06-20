package com.thelarte.user.service;

import com.thelarte.user.model.Cliente;
import java.util.List;

public interface ClienteService {
    Cliente crearCliente(Cliente cliente);
    Cliente obtenerClientePorCedula(String cedula);
    List<Cliente> listarClientes();
    Cliente actualizarCliente(String cedula, Cliente datosActualizados);
    void eliminarCliente(String cedula);
}
