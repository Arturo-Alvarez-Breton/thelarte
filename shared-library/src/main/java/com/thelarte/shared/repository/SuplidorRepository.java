package com.thelarte.shared.repository;

import com.thelarte.shared.model.Suplidor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para entidad Suplidor.
 * Extiende JpaRepository<Suplidor, Long> para proporcionar operaciones CRUD estándar.
 */
@Repository
public interface SuplidorRepository extends JpaRepository<Suplidor, Long> {
    /**
     * Busca suplidor por nombre.
     * @param nombre Nombre del suplidor
     * @return Optional con el suplidor si existe
     */
    Optional<Suplidor> findByNombre(String nombre);
    
    /**
     * Busca suplidor por RNC.
     * @param rnc RNC del suplidor
     * @return Optional con el suplidor si existe
     */
    Optional<Suplidor> findByRNC(String rnc);
    
    /**
     * Busca suplidores por ciudad.
     * @param ciudad Ciudad de los suplidores
     * @return Lista de suplidores de una ciudad específica
     */
    List<Suplidor> findByCiudad(String ciudad);
    
    /**
     * Verifica si existe un suplidor con el RNC proporcionado.
     * @param rnc RNC a verificar
     * @return true si existe, false en caso contrario
     */
    boolean existsByRNC(String rnc);
}
