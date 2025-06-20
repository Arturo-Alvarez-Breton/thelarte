package com.thelarte.inventory.repository;

import com.thelarte.inventory.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para entidad Producto.
 * Extiende JpaRepository<Producto, Long> para proporcionar operaciones CRUD estándar.
 */
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    /**
     * Busca producto por nombre.
     * @param nombre Nombre del producto
     * @return Optional con el producto si existe
     */
    Optional<Producto> findByNombre(String nombre);

    /**
     * Busca productos por tipo.
     * @param tipo Tipo del producto
     * @return Lista de productos del tipo especificado
     */
    List<Producto> findByTipo(String tipo);

    /**
     * Verifica si existe un producto con el nombre proporcionado.
     * @param nombre Nombre a verificar
     * @return true si existe, false en caso contrario
     */
    boolean existsByNombre(String nombre);
}