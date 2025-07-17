package com.thelarte.config;

import com.thelarte.auth.entity.UserRole;
import com.thelarte.auth.service.UserService;
import com.thelarte.user.model.Empleado;
import com.thelarte.user.repository.EmpleadoRepository;
import com.thelarte.user.util.Rol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Override   
    public void run(String... args) throws Exception {
        // EDWIN BRITO
        if (!empleadoRepository.existsById("E001")) {
            Empleado emp = new Empleado();
            emp.setCedula("E001");
            emp.setNombre("Edwin");
            emp.setApellido("Brito");
            emp.setTelefono("8090000000");
            emp.setEmail("edwin@example.com");
            emp.setRol(Rol.COMERCIAL);
            emp.setSalario(25000f);
            empleadoRepository.save(emp);
        }
        if (!userService.existsByUsername("edwinb")) {
            userService.createUser("edwinb", "1234", Collections.singletonList(UserRole.VENDEDOR), "E001");
            System.out.println("Usuario creado: edwinb / 1234 (empleado: E001)");
        }

        // Otro ejemplo usuario sin empleado
        if (!userService.existsByUsername("jeanp")) {
            userService.createUser("jeanp", "1234", Collections.singletonList(UserRole.VENDEDOR), null);
            System.out.println("Usuario creado: jeanp / 1234 (sin empleado)");
        }
    }
}