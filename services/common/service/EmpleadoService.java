package thelarte.services.common.service;

import thelarte.services.common.model.Empleado;

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
}
