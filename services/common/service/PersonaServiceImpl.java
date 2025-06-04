package thelarte.services.common.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import thelarte.services.common.exception.ResourceNotFoundException;
import thelarte.services.common.model.Persona;
import thelarte.services.common.repository.PersonaRepository;

import java.util.List;

/**
 * Implementación de PersonaService. Se encarga de listar y
 * obtener cualquier Persona (Empleado o Cliente) por cédula.
 */
@Service
public class PersonaServiceImpl implements PersonaService {

    private final PersonaRepository personaRepository;

    @Autowired
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
                .orElseThrow(() ->
                    new ResourceNotFoundException("Persona no encontrada con cédula: " + cedula));
    }
}
