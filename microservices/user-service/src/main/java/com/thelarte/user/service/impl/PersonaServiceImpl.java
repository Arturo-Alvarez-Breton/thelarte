package com.thelarte.user.service.impl;

import com.thelarte.user.model.Persona;
import com.thelarte.user.repository.PersonaRepository;
import com.thelarte.user.service.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementación de PersonaService.
 */
@Service
@Transactional
public class PersonaServiceImpl implements PersonaService {

    private final PersonaRepository personaRepository;

    @Autowired
    public PersonaServiceImpl(PersonaRepository personaRepository) {
        this.personaRepository = personaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Persona> listarPersonas() {
        return personaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Persona obtenerPersonaPorCedula(String cedula) {
        return personaRepository.findById(cedula)
                .orElseThrow(() -> new RuntimeException("Persona no encontrada con cédula: " + cedula));
    }
}
