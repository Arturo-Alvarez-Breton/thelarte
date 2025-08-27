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

    @Override
    @Transactional(readOnly = true)
    public List<SuplidorDTO> listarTodos() {
        return suplidorRepository.findByActivoTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SuplidorDTO> buscarPorId(Long id) {
        return suplidorRepository.findById(id)
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SuplidorDTO> buscarPorNombre(String nombre) {
        return suplidorRepository.findByNombreAndActivoTrue(nombre)
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SuplidorDTO> buscarPorRNC(String rnc) {
        return suplidorRepository.findByRNCAndActivoTrue(rnc)
                .map(this::toDto);
    }

    @Override
    public SuplidorDTO guardar(SuplidorDTO suplidorDTO) {
        Suplidor suplidor;
        if (suplidorDTO.getId() == 0) {
            suplidor = new Suplidor();
            suplidor.setActivo(true); // Set new suppliers as active by default
        } else {
            suplidor = suplidorRepository.findById(suplidorDTO.getId())
                    .orElseThrow(() -> new EntityNotFoundException("No se encontró el suplidor con ID: " + suplidorDTO.getId()));
        }

        suplidor.setNombre(suplidorDTO.getNombre());
        suplidor.setCiudad(suplidorDTO.getCiudad());
        suplidor.setPais(suplidorDTO.getPais());
        suplidor.setDireccion(suplidorDTO.getDireccion());
        suplidor.setEmail(suplidorDTO.getEmail());
        suplidor.setRNC(suplidorDTO.getRNC());
        suplidor.setTelefonos(suplidorDTO.getTelefonos());
        suplidor.setLongitud(suplidorDTO.getLongitud());
        suplidor.setLatitud(suplidorDTO.getLatitud());

        // Only update activo field if it's explicitly provided in the DTO
        if (suplidorDTO.getActivo() != null) {
            suplidor.setActivo(suplidorDTO.getActivo());
        }

        suplidor = suplidorRepository.save(suplidor);
        return toDto(suplidor);
    }

    @Override
    public void eliminar(Long id) {
        if (suplidorRepository.existsById(id)) {
            suplidorRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("No se encontró el suplidor con ID: " + id);
        }
    }

    @Override
    public void eliminarLogico(Long id) {
        Suplidor suplidor = suplidorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el suplidor con ID: " + id));
        suplidor.setActivo(false);
        suplidorRepository.save(suplidor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuplidorDTO> listarPorCiudad(String ciudad) {
        return suplidorRepository.findByCiudadAndActivoTrue(ciudad).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private SuplidorDTO toDto(Suplidor s) {
        return new SuplidorDTO(
                s.getId(),
                s.getNombre(),
                s.getCiudad(),
                s.getPais(),
                s.getDireccion(),
                s.getEmail(),
                s.getRNC(),
                s.getTelefonos(),
                s.getLongitud(),
                s.getLatitud(),
                s.getActivo()
        );
    }

    /**
     * Lista todos los suplidores (activos e inactivos)
     * @return Lista de DTOs de todos los suplidores
     */
    @Override
    @Transactional(readOnly = true)
    public List<SuplidorDTO> listarTodosConInactivos() {
        return suplidorRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Lista solo los suplidores inactivos
     * @return Lista de DTOs de suplidores inactivos
     */
    @Override
    @Transactional(readOnly = true)
    public List<SuplidorDTO> listarInactivos() {
        return suplidorRepository.findByActivoFalse().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Activa un suplidor (cambia activo a true)
     * @param id ID del suplidor a activar
     */
    @Override
    public void activar(Long id) {
        Suplidor suplidor = suplidorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el suplidor con ID: " + id));
        suplidor.setActivo(true);
        suplidorRepository.save(suplidor);
    }

    /**
     * Desactiva un suplidor (cambia activo a false)
     * @param id ID del suplidor a desactivar
     */
    @Override
    public void desactivar(Long id) {
        Suplidor suplidor = suplidorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el suplidor con ID: " + id));
        suplidor.setActivo(false);
        suplidorRepository.save(suplidor);
    }
}