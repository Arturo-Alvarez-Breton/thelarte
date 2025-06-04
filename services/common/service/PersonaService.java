package thelarte.services.common.service;

import thelarte.services.common.model.Persona;

import java.util.List;

/**
 * Interfaz de servicio para operaciones genéricas sobre Persona.
 */
public interface PersonaService {
    /**
     * Retorna la lista de todas las personas (empleados y clientes).
     */
    List<Persona> listarPersonas();

    /**
     * Obtiene una Persona (Empleado o Cliente) por su cédula.
     * Si no existe, lanza ResourceNotFoundException.
     */
    Persona obtenerPersonaPorCedula(String cedula);
}
