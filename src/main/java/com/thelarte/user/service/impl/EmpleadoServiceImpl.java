package com.thelarte.user.service.impl;

import com.thelarte.user.service.EmpleadoService;
import com.thelarte.user.util.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.thelarte.user.model.Empleado;
import com.thelarte.user.repository.EmpleadoRepository;

import java.util.List;

/**
 * Implementación de EmpleadoService. Maneja toda la lógica
 * de negocio CRUD para Empleado.
 */
@Service
public class EmpleadoServiceImpl implements EmpleadoService {

    private final EmpleadoRepository empleadoRepository;

    @Autowired
    public EmpleadoServiceImpl(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
    }

    @Override
    public Empleado crearEmpleado(Empleado empleado) {
        // Aquí podrías verificar duplicados (p.ej. mismo email) antes de save()
        return empleadoRepository.save(empleado);
    }

    @Override
    public Empleado obtenerEmpleadoPorCedula(String cedula) {
        return empleadoRepository.findById(cedula)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Empleado no encontrado con cédula: " + cedula));
    }

    @Override
    public List<Empleado> listarEmpleados() {
        return empleadoRepository.findAll();
    }

    @Override
    public Empleado actualizarEmpleado(String cedula, Empleado datosActualizados) {
        Empleado existente = empleadoRepository.findById(cedula)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Empleado no encontrado con cédula: " + cedula));

        // Actualizamos solo los campos permitidos (no cambiamos la cedula)
        existente.setNombre(datosActualizados.getNombre());
        existente.setApellido(datosActualizados.getApellido());
        existente.setTelefono(datosActualizados.getTelefono());
        existente.setRol(datosActualizados.getRol());
        existente.setSalario(datosActualizados.getSalario());
        existente.setFechaContratacion(datosActualizados.getFechaContratacion());

        return empleadoRepository.save(existente);
    }

    @Override
    public void eliminarEmpleado(String cedula) {
        Empleado existente = empleadoRepository.findById(cedula)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Empleado no encontrado con cédula: " + cedula));
        empleadoRepository.delete(existente);
    }
}