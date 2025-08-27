package com.thelarte.user.service;

import com.thelarte.user.model.Empleado;

import java.util.List;

/**
 * Interfaz que define operaciones de negocio para Empleado.
 */
public interface EmpleadoService {
    Empleado crearEmpleado(Empleado empleado);
    Empleado obtenerEmpleadoPorCedula(String cedula);
    List<Empleado> listarEmpleados();
    Empleado actualizarEmpleado(String cedula, Empleado datosActualizados);
    void eliminarEmpleado(String cedula);

    // Métodos para borrado lógico
    void eliminarEmpleadoLogico(String cedula);
    void restaurarEmpleado(String cedula);

    // Métodos para obtener TODOS los empleados (activos y eliminados)
    List<Empleado> listarTodosLosEmpleados();
    List<Empleado> getTodosLosEmpleadosFiltered(String busqueda, int page, int size);

    // Métodos adicionales para filtrado
    Empleado getEmpleadoByCedula(String cedula);
    List<Empleado> getEmpleadosFiltered(String busqueda, int page, int size);
}
