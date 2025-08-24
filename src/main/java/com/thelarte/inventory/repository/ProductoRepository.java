package com.thelarte.inventory.repository;

import com.thelarte.inventory.model.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    /**
     * Busca producto por código.
     * @param codigo Código del producto
     * @return Optional con el producto si existe
     */
    Optional<Producto> findByCodigo(String codigo);

    /**
     * Busca productos por nombre con paginación.
     * @param nombre Nombre del producto (búsqueda parcial)
     * @param pageable Información de paginación
     * @return Página de productos que contienen el nombre
     */
    Page<Producto> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    // Métodos para manejo de eliminación lógica

    /**
     * Busca todos los productos que NO han sido eliminados lógicamente.
     * @return Lista de productos activos
     */
    @Query("SELECT p FROM Producto p WHERE p.eliminado = false")
    List<Producto> findAllActive();

    /**
     * Busca producto por ID solo si NO está eliminado.
     * @param id ID del producto
     * @return Optional con el producto si existe y está activo
     */
    @Query("SELECT p FROM Producto p WHERE p.id = :id AND p.eliminado = false")
    Optional<Producto> findByIdAndNotDeleted(Long id);

    /**
     * Busca producto por nombre solo si NO está eliminado.
     * @param nombre Nombre del producto
     * @return Optional con el producto si existe y está activo
     */
    @Query("SELECT p FROM Producto p WHERE p.nombre = :nombre AND p.eliminado = false")
    Optional<Producto> findByNombreAndNotDeleted(String nombre);

    /**
     * Busca producto por código solo si NO está eliminado.
     * @param codigo Código del producto
     * @return Optional con el producto si existe y está activo
     */
    @Query("SELECT p FROM Producto p WHERE p.codigo = :codigo AND p.eliminado = false")
    Optional<Producto> findByCodigoAndNotDeleted(String codigo);

    /**
     * Busca productos por tipo solo si NO están eliminados.
     * @param tipo Tipo del producto
     * @return Lista de productos del tipo especificado que están activos
     */
    @Query("SELECT p FROM Producto p WHERE p.tipo = :tipo AND p.eliminado = false")
    List<Producto> findByTipoAndNotDeleted(String tipo);

    /**
     * Verifica si existe un producto activo con el nombre proporcionado.
     * @param nombre Nombre a verificar
     * @return true si existe un producto activo con ese nombre, false en caso contrario
     */
    @Query("SELECT COUNT(p) > 0 FROM Producto p WHERE p.nombre = :nombre AND p.eliminado = false")
    boolean existsByNombreAndNotDeleted(String nombre);

    /**
     * Busca productos por nombre con paginación, solo activos.
     * @param nombre Nombre del producto (búsqueda parcial)
     * @param pageable Información de paginación
     * @return Página de productos activos que contienen el nombre
     */
    @Query("SELECT p FROM Producto p WHERE p.nombre LIKE %:nombre% AND p.eliminado = false")
    Page<Producto> findByNombreContainingIgnoreCaseAndNotDeleted(String nombre, Pageable pageable);
}