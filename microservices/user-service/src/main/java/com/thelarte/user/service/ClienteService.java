package com.thelarte.user.service;

import com.thelarte.user.model.Cliente;
import java.util.List;

/**
 * Interfaz que define operaciones de negocio para Cliente.
 */
public interface ClienteService {
    /**
     * Crea un nuevo cliente en la base de datos.
     */
    Cliente crearCliente(Cliente cliente);
    
    /**
     * Obtiene un cliente por su cédula.
     */
    Cliente obtenerClientePorCedula(String cedula);
    
    /**
     * Lista todos los clientes.
     */
    List<Cliente> listarClientes();
    
    /**
     * Actualiza los datos de un cliente existente.
     */
    Cliente actualizarCliente(String cedula, Cliente datosActualizados);
    
    /**
     * Elimina un cliente por su cédula.
     */
    void eliminarCliente(String cedula);
}
