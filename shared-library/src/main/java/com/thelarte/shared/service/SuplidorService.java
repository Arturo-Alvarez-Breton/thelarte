package com.thelarte.shared.service;

import com.thelarte.shared.model.Suplidor;
import com.thelarte.shared.dto.SuplidorDTO;
import com.thelarte.shared.repository.SuplidorRepository;
import com.thelarte.shared.exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SuplidorService implements ISuplidorService {
    
    private final SuplidorRepository suplidorRepository;

    @Autowired
    public SuplidorService(SuplidorRepository suplidorRepository) {
        this.suplidorRepository = suplidorRepository;
    }

    /**
     * Lista todos los suplidores
     * @return Lista de DTOs de suplidores
     */
    @Override
    @Transactional(readOnly = true)
    public List<SuplidorDTO> listarTodos() {
        return suplidorRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Busca un suplidor por su ID
     * @param id ID del suplidor
     * @return Optional con el DTO si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<SuplidorDTO> buscarPorId(Long id) {
        return suplidorRepository.findById(id)
                .map(s -> new SuplidorDTO(s.getId(), s.getNombre(), s.getCiudad(), s.getDireccion(), 
                        s.getEmail(), s.getRNC(), s.getNCF(), s.getTelefonos()));
    }
    
    /**
     * Busca un suplidor por su nombre
     * @param nombre Nombre del suplidor
     * @return Optional con el DTO si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<SuplidorDTO> buscarPorNombre(String nombre) {
        return suplidorRepository.findByNombre(nombre)
                .map(s -> new SuplidorDTO(s.getId(), s.getNombre(), s.getCiudad(), s.getDireccion(), 
                        s.getEmail(), s.getRNC(), s.getNCF(), s.getTelefonos()));
    }
    
    /**
     * Busca un suplidor por su RNC
     * @param rnc RNC del suplidor
     * @return Optional con el DTO si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<SuplidorDTO> buscarPorRNC(String rnc) {
        return suplidorRepository.findByRNC(rnc)
                .map(s -> new SuplidorDTO(s.getId(), s.getNombre(), s.getCiudad(), s.getDireccion(), 
                        s.getEmail(), s.getRNC(), s.getNCF(), s.getTelefonos()));
    }
    
    /**
     * Guarda o actualiza un suplidor
     * @param suplidorDTO DTO con los datos del suplidor
     * @return DTO con los datos guardados
     */
    @Override
    public SuplidorDTO guardar(SuplidorDTO suplidorDTO) {
        Suplidor suplidor;
        
        if (suplidorDTO.getId() == 0) {
            // Es un nuevo suplidor
            suplidor = new Suplidor();
        } else {
            // Actualizar suplidor existente
            suplidor = suplidorRepository.findById(suplidorDTO.getId())
                    .orElseThrow(() -> new EntityNotFoundException("No se encontró el suplidor con ID: " + suplidorDTO.getId()));
        }
        
        suplidor.setNombre(suplidorDTO.getNombre());
        suplidor.setCiudad(suplidorDTO.getCiudad());
        suplidor.setDireccion(suplidorDTO.getDireccion());
        suplidor.setEmail(suplidorDTO.getEmail());
        suplidor.setRNC(suplidorDTO.getRNC());
        suplidor.setNCF(suplidorDTO.getNCF());
        suplidor.setTelefonos(suplidorDTO.getTelefonos());
        
        suplidor = suplidorRepository.save(suplidor);
        
        return new SuplidorDTO(
            suplidor.getId(), 
            suplidor.getNombre(),
            suplidor.getCiudad(),
            suplidor.getDireccion(),
            suplidor.getEmail(),
            suplidor.getRNC(),
            suplidor.getNCF(),
            suplidor.getTelefonos()
        );
    }
    
    /**
     * Elimina un suplidor por su ID
     * @param id ID del suplidor a eliminar
     */
    @Override
    public void eliminar(Long id) {
        if (suplidorRepository.existsById(id)) {
            suplidorRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("No se encontró el suplidor con ID: " + id);
        }
    }
    
    /**
     * Busca suplidores por ciudad
     * @param ciudad Ciudad para filtrar
     * @return Lista de suplidores de la ciudad especificada
     */
    @Override
    @Transactional(readOnly = true)
    public List<SuplidorDTO> listarPorCiudad(String ciudad) {
        return suplidorRepository.findByCiudad(ciudad).stream()
                .map(s -> new SuplidorDTO(s.getId(), s.getNombre(), s.getCiudad(), s.getDireccion(), 
                        s.getEmail(), s.getRNC(), s.getNCF(), s.getTelefonos()))
                .collect(Collectors.toList());
    }
}
