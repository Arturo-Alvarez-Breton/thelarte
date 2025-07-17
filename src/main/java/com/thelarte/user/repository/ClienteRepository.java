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
     * Busca un cliente por su correo electrónico.
     *
     * @param email el correo electrónico del cliente
     * @return un Optional con el Cliente si existe
     */
    Optional<Cliente> findByEmail(String email);

    /**
     * Verifica si existe un cliente con la cédula dada.
     *
     * @param cedula la cédula del cliente
     * @return true si existe
     */
    boolean existsByCedula(String cedula);
}
