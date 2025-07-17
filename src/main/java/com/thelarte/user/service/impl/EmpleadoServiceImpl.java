package com.thelarte.user.service.impl;

import com.thelarte.user.service.EmpleadoService;
import com.thelarte.shared.exception.EntityNotFoundException;
import com.thelarte.user.util.Rol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.thelarte.user.model.Empleado;
import com.thelarte.user.repository.EmpleadoRepository;

import java.util.List;

@Service
public class EmpleadoServiceImpl implements EmpleadoService {

    private final EmpleadoRepository empleadoRepository;

    @Autowired
    public EmpleadoServiceImpl(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
    }

    @Override
    public Empleado crearEmpleado(Empleado empleado) {
        // Validaciones adicionales si se desean (e.g. duplicados)
        if (empleado.getRol() != Rol.COMERCIAL) {
            empleado.setComision(null);
        }
        return empleadoRepository.save(empleado);
    }

    @Override
    public Empleado obtenerEmpleadoPorCedula(String cedula) {
        return empleadoRepository.findById(cedula)
                .orElseThrow(() ->
                        new EntityNotFoundException("Empleado no encontrado con cédula: " + cedula));
    }

    @Override
    public List<Empleado> listarEmpleados() {
        return empleadoRepository.findAll();
    }

    @Override
    public Empleado actualizarEmpleado(String cedula, Empleado datosActualizados) {
        Empleado existente = empleadoRepository.findById(cedula)
                .orElseThrow(() ->
                        new EntityNotFoundException("Empleado no encontrado con cédula: " + cedula));

        existente.setNombre(datosActualizados.getNombre());
        existente.setApellido(datosActualizados.getApellido());
        existente.setTelefono(datosActualizados.getTelefono());
        existente.setRol(datosActualizados.getRol());
        existente.setSalario(datosActualizados.getSalario());
        existente.setEmail(datosActualizados.getEmail());

        if (datosActualizados.getRol() == Rol.COMERCIAL) {
            existente.setComision(datosActualizados.getComision());
        } else {
            existente.setComision(null);
        }

        // No modificamos fechaContratacion: se mantiene la original establecida en creación
        return empleadoRepository.save(existente);
    }

    @Override
    public void eliminarEmpleado(String cedula) {
        Empleado existente = empleadoRepository.findById(cedula)
                .orElseThrow(() ->
                        new EntityNotFoundException("Empleado no encontrado con cédula: " + cedula));
        empleadoRepository.delete(existente);
    }
}