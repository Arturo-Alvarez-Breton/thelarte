package com.thelarte.user.service.impl;

import com.thelarte.shared.exception.EntityNotFoundException;
import com.thelarte.user.model.Persona;
import com.thelarte.user.repository.PersonaRepository;
import com.thelarte.user.service.PersonaService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PersonaServiceImpl implements PersonaService {

    private final PersonaRepository personaRepository;

    public PersonaServiceImpl(PersonaRepository personaRepository) {
        this.personaRepository = personaRepository;
    }

    @Override
    public List<Persona> listarPersonas() {
        return personaRepository.findAll();
    }

    @Override
    public Persona obtenerPersonaPorCedula(String cedula) {
        return personaRepository.findById(cedula)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró la persona con cédula: " + cedula));
    }
}
