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
     * Encuentra un Cliente por su email.
     */
    Optional<Cliente> findByEmail(String email);
    
    /**
     * Verifica si existe un cliente con la cédula dada
     */
    boolean existsByCedula(String cedula);
}
