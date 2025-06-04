package thelarte.services.common.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import thelarte.services.common.model.Persona;

/**
 * Repositorio genérico para cualquier Persona (Empleado o Cliente).
 * Hereda métodos CRUD de JpaRepository<Persona, String>.
 */
@Repository
public interface PersonaRepository extends JpaRepository<Persona, String> {
    // Si en el futuro necesitas consultas genéricas a “Persona”, puedes añadírselas aquí.
}
