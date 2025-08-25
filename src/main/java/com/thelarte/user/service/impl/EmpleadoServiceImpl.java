package com.thelarte.user.service.impl;

import com.thelarte.user.service.EmpleadoService;
import com.thelarte.shared.exception.EntityNotFoundException;
import com.thelarte.user.util.Rol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
        if (empleado.getRol() != Rol.VENDEDOR) {
            empleado.setComision(null);
        }
        return empleadoRepository.save(empleado);
    }

    @Override
    public Empleado obtenerEmpleadoPorCedula(String cedula) {
        return empleadoRepository.findByCedulaAndDeletedFalse(cedula)
                .orElseThrow(() ->
                        new EntityNotFoundException("Empleado no encontrado con cédula: " + cedula));
    }

    @Override
    public List<Empleado> listarEmpleados() {
        return empleadoRepository.findByDeletedFalse();
    }

    @Override
    public Empleado actualizarEmpleado(String cedula, Empleado datosActualizados) {
        Empleado existente = empleadoRepository.findByCedulaAndDeletedFalse(cedula)
                .orElseThrow(() ->
                        new EntityNotFoundException("Empleado no encontrado con cédula: " + cedula));

        existente.setNombre(datosActualizados.getNombre());
        existente.setApellido(datosActualizados.getApellido());
        existente.setTelefono(datosActualizados.getTelefono());
        existente.setEmail(datosActualizados.getEmail());
        existente.setRol(datosActualizados.getRol());
        existente.setSalario(datosActualizados.getSalario());

        if (datosActualizados.getRol() == Rol.VENDEDOR) {
            existente.setComision(datosActualizados.getComision());
        } else {
            existente.setComision(null);
        }

        // fechaContratacion se mantiene tal cual fue establecida en la creación

        return empleadoRepository.save(existente);
    }

    @Override
    public void eliminarEmpleado(String cedula) {
        Empleado existente = empleadoRepository.findByCedulaAndDeletedFalse(cedula)
                .orElseThrow(() ->
                        new EntityNotFoundException("Empleado no encontrado con cédula: " + cedula));
        empleadoRepository.delete(existente);
    }

    // Métodos para borrado lógico
    @Override
    public void eliminarEmpleadoLogico(String cedula) {
        Empleado empleado = empleadoRepository.findById(cedula)
                .orElseThrow(() -> new EntityNotFoundException("Empleado no encontrado con cédula: " + cedula));

        if (empleado.isDeleted()) {
            throw new IllegalStateException("El empleado ya está eliminado");
        }

        empleado.setDeleted(true);
        empleadoRepository.save(empleado);
    }

    @Override
    public void restaurarEmpleado(String cedula) {
        Empleado empleado = empleadoRepository.findById(cedula)
                .orElseThrow(() -> new EntityNotFoundException("Empleado no encontrado con cédula: " + cedula));

        if (!empleado.isDeleted()) {
            throw new IllegalStateException("El empleado no está eliminado");
        }

        empleado.setDeleted(false);
        empleadoRepository.save(empleado);
    }

    // Métodos para obtener TODOS los empleados (activos y eliminados)
    @Override
    public List<Empleado> listarTodosLosEmpleados() {
        return empleadoRepository.findAll();
    }

    @Override
    public List<Empleado> getTodosLosEmpleadosFiltered(String busqueda, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        if (busqueda != null && !busqueda.isEmpty()) {
            Page<Empleado> pageResult = empleadoRepository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(
                    busqueda, busqueda, pageable);
            return pageResult.getContent();
        } else {
            Page<Empleado> pageResult = empleadoRepository.findAll(pageable);
            return pageResult.getContent();
        }
    }

    @Override
    public Empleado getEmpleadoByCedula(String cedula) {
        return empleadoRepository.findByCedulaAndDeletedFalse(cedula)
                .orElseThrow(() -> new EntityNotFoundException("Empleado no encontrado con cédula: " + cedula));
    }

    @Override
    public List<Empleado> getEmpleadosFiltered(String busqueda, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        if (busqueda != null && !busqueda.isEmpty()) {
            Page<Empleado> pageResult = empleadoRepository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCaseAndDeletedFalse(
                    busqueda, busqueda, pageable);
            return pageResult.getContent();
        } else {
            Page<Empleado> pageResult = empleadoRepository.findByDeletedFalse(pageable);
            return pageResult.getContent();
        }
    }
}
