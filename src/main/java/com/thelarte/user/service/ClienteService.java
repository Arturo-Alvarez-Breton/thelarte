package com.thelarte.user.service;

import com.thelarte.user.model.Cliente;
import java.util.List;

public interface ClienteService {
    Cliente crearCliente(Cliente cliente);
    Cliente obtenerClientePorCedula(String cedula);
    List<Cliente> listarClientes();
    Cliente actualizarCliente(String cedula, Cliente datosActualizados);
    void eliminarCliente(String cedula);
    Cliente getClienteByCedula(String cedula);
    List<Cliente> getClientesFiltered(String busqueda, int page, int size);

    // Métodos para borrado lógico
    void eliminarClienteLogico(String cedula);
    void restaurarCliente(String cedula);

    // Método para obtener TODOS los clientes (activos y eliminados)
    List<Cliente> listarTodosLosClientes();
    List<Cliente> getTodosLosClientesFiltered(String busqueda, int page, int size);
}
