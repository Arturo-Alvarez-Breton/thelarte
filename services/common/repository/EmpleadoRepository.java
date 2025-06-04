package thelarte.services.common.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thelarte.services.common.model.Empleado;

import java.util.Optional;

/**
 * Repositorio para Empleado.
 * Extiende JpaRepository<Empleado, String> porque la PK (cedula) es String.
 */
@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, String> {
    /**
     * Encuentra un Empleado por su email.
     */
    Optional<Empleado> findByEmail(String email);
}
