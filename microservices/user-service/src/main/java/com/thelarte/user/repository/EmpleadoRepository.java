package com.thelarte.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.thelarte.user.model.Empleado;
import com.thelarte.user.util.Rol;

import java.util.List;

/**
 * Repositorio para Empleado.
 * Extiende JpaRepository<Empleado, String> porque la PK (cedula) es String.
 */
@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, String> {
    /**
     * Encuentra empleados por su rol.
     */
    List<Empleado> findByRol(Rol rol);
}
