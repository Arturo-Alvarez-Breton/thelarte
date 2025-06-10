package com.thelarte.user.service;

import com.thelarte.user.model.Empleado;
import com.thelarte.user.util.Rol;
import java.util.List;

/**
 * Interfaz que define operaciones de negocio para Empleado.
 */
public interface EmpleadoService {
    /**
     * Crea un nuevo empleado en la base de datos.
     */
    Empleado crearEmpleado(Empleado empleado);
    
    /**
     * Obtiene un empleado por su cédula.
     */
    Empleado obtenerEmpleadoPorCedula(String cedula);
    
    /**
     * Lista todos los empleados.
     */
    List<Empleado> listarEmpleados();
    
    /**
     * Lista empleados por su rol.
     */
    List<Empleado> listarEmpleadosPorRol(Rol rol);
    
    /**
     * Actualiza los datos de un empleado existente.
     */
    Empleado actualizarEmpleado(String cedula, Empleado datosActualizados);
    
    /**
     * Elimina un empleado por su cédula.
     */
    void eliminarEmpleado(String cedula);
}
