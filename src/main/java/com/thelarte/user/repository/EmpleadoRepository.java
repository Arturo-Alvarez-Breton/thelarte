package com.thelarte.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.thelarte.user.model.Empleado;

/**
 * Repositorio para Empleado.
 * Extiende JpaRepository<Empleado, String> porque la PK (cedula) es String.
 */
@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, String> {
    // Removed findByEmail method as it's not used and causing query creation errors
    // If needed in the future, ensure the email property is accessible from Empleado entity
}