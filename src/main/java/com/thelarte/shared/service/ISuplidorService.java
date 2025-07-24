package com.thelarte.shared.service;

import com.thelarte.shared.dto.SuplidorDTO;
import java.util.List;
import java.util.Optional;

public interface ISuplidorService {
    /**
     * Lista todos los suplidores
     * @return Lista de DTOs de suplidores
     */
    List<SuplidorDTO> listarTodos();

    /**
     * Busca un suplidor por su ID
     * @param id ID del suplidor
     * @return Optional con el DTO si existe
     */
    Optional<SuplidorDTO> buscarPorId(Long id);

    /**
     * Busca un suplidor por su nombre
     * @param nombre Nombre del suplidor
     * @return Optional con el DTO si existe
     */
    Optional<SuplidorDTO> buscarPorNombre(String nombre);

    /**
     * Busca un suplidor por su RNC
     * @param rnc RNC del suplidor
     * @return Optional con el DTO si existe
     */
    Optional<SuplidorDTO> buscarPorRNC(String rnc);

    /**
     * Guarda o actualiza un suplidor
     * @param suplidorDTO DTO con los datos del suplidor
     * @return DTO con los datos guardados
     */
    SuplidorDTO guardar(SuplidorDTO suplidorDTO);

    /**
     * Elimina un suplidor por su ID
     * @param id ID del suplidor a eliminar
     */
    void eliminar(Long id);

    /**
     * Elimina lógicamente un suplidor por su ID
     * @param id ID del suplidor a eliminar lógicamente
     */
    void eliminarLogico(Long id);

    /**
     * Busca suplidores por ciudad
     * @param ciudad Ciudad para filtrar
     * @return Lista de suplidores de la ciudad especificada
     */
    List<SuplidorDTO> listarPorCiudad(String ciudad);
}
