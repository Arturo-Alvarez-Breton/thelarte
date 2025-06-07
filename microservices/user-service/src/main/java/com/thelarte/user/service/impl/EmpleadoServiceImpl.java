package com.thelarte.user.service.impl;

import com.thelarte.user.model.Empleado;
import com.thelarte.user.repository.EmpleadoRepository;
import com.thelarte.user.service.EmpleadoService;
import com.thelarte.user.util.Rol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDate;

/**
 * Implementación de EmpleadoService.
 */
@Service
@Transactional
public class EmpleadoServiceImpl implements EmpleadoService {

    private final EmpleadoRepository empleadoRepository;

    @Autowired
    public EmpleadoServiceImpl(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
    }

    @Override
    public Empleado crearEmpleado(Empleado empleado) {
        if (empleado.getFechaContratacion() == null) {
            empleado.setFechaContratacion(LocalDate.now());
        }
        return empleadoRepository.save(empleado);
    }

    @Override
    @Transactional(readOnly = true)
    public Empleado obtenerEmpleadoPorCedula(String cedula) {
        return empleadoRepository.findById(cedula)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado con cédula: " + cedula));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Empleado> listarEmpleados() {
        return empleadoRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Empleado> listarEmpleadosPorRol(Rol rol) {
        return empleadoRepository.findByRol(rol);
    }

    @Override
    public Empleado actualizarEmpleado(String cedula, Empleado datosActualizados) {
        Empleado empleadoExistente = obtenerEmpleadoPorCedula(cedula);
        
        // Actualizar los campos
        if (datosActualizados.getNombre() != null) {
            empleadoExistente.setNombre(datosActualizados.getNombre());
        }
        if (datosActualizados.getApellido() != null) {
            empleadoExistente.setApellido(datosActualizados.getApellido());
        }
        if (datosActualizados.getTelefono() != null) {
            empleadoExistente.setTelefono(datosActualizados.getTelefono());
        }
        if (datosActualizados.getRol() != null) {
            empleadoExistente.setRol(datosActualizados.getRol());
        }
        if (datosActualizados.getSalario() > 0) {
            empleadoExistente.setSalario(datosActualizados.getSalario());
        }
        
        return empleadoRepository.save(empleadoExistente);
    }

    @Override
    public void eliminarEmpleado(String cedula) {
        if (!empleadoRepository.existsById(cedula)) {
            throw new RuntimeException("Empleado no encontrado con cédula: " + cedula);
        }
        empleadoRepository.deleteById(cedula);
    }
}
