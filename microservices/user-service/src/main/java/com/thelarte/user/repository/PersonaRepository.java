package com.thelarte.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.thelarte.user.model.Persona;

/**
 * Repositorio genérico para cualquier Persona (Empleado o Cliente).
 * Hereda métodos CRUD de JpaRepository<Persona, String>.
 */
@Repository
public interface PersonaRepository extends JpaRepository<Persona, String> {
    // Si en el futuro necesitas consultas genéricas a "Persona", puedes añadírselas aquí.
}
