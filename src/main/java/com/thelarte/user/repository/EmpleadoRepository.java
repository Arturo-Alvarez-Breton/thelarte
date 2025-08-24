package com.thelarte.user.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.thelarte.user.model.Empleado;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para Empleado.
 * Extiende JpaRepository<Empleado, String> porque la PK (cedula) es String.
 */
@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, String> {
    boolean existsById(String cedula);

    // Métodos que excluyen empleados eliminados lógicamente
    List<Empleado> findByDeletedFalse();

    Optional<Empleado> findByCedulaAndDeletedFalse(String cedula);

    Optional<Empleado> findByEmailAndDeletedFalse(String email);

    boolean existsByCedulaAndDeletedFalse(String cedula);

    Page<Empleado> findByDeletedFalse(Pageable pageable);

    Page<Empleado> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCaseAndDeletedFalse(
            String nombre, String apellido, Pageable pageable);

    // Método adicional para buscar en todos los empleados (activos y eliminados)
    Page<Empleado> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(
            String nombre, String apellido, Pageable pageable);
}