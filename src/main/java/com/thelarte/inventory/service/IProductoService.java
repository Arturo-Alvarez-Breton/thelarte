package com.thelarte.inventory.service;

import com.thelarte.inventory.dto.ProductoDTO;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface IProductoService {
    /**
     * Lista todos los productos
     * @return Lista de DTOs de productos
     */
    List<ProductoDTO> listarTodos();

    /**
     * Busca un producto por su ID
     * @param id ID del producto
     * @return Optional con el DTO si existe
     */

    @Transactional(readOnly = true)
    Optional<ProductoDTO> buscarPorId(Long id);

    /**
     * Busca un producto por su nombre
     * @param nombre Nombre del producto
     * @return Optional con el DTO si existe
     */
    Optional<ProductoDTO> buscarPorNombre(String nombre);

    /**
     * Guarda o actualiza un producto
     * @param productoDTO DTO con los datos del producto
     * @return DTO con los datos guardados
     */
    ProductoDTO guardar(ProductoDTO productoDTO);

    /**
     * Elimina un producto por su ID
     * @param id ID del producto a eliminar
     */

    void eliminar(Long id);

    /**
     * Busca productos por tipo
     * @param tipo Tipo para filtrar
     * @return Lista de productos del tipo especificado
     */
    List<ProductoDTO> listarPorTipo(String tipo);
}