package com.thelarte.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.thelarte.user.model.Cliente;

import java.util.Optional;

/**
 * Repositorio para Cliente.
 * Extiende JpaRepository<Cliente, String> porque la PK (cedula) es String.
 */
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, String> {
    /**
     * Verifica si existe un cliente por su cédula.
     *
     * @param cedula la cédula del cliente
     * @return true si existe, false en caso contrario
     */
    boolean existsById(String cedula);

    /**
     * Busca un cliente por su cédula.
     *
     * @param cedula la cédula del cliente
     * @return un Optional que contiene el Cliente si se encuentra, o vacío si no
     */
    Optional<Cliente> findById(String cedula);
}
