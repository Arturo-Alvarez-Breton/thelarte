package com.thelarte.config;

import com.thelarte.auth.entity.UserRole;
import com.thelarte.auth.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;    @Override
    public void run(String... args) throws Exception {
        // Crear usuarios por defecto si no existen
        if (!userService.existsByUsername("edwinb")) {
            userService.createUser("edwinb", "1234", java.util.Collections.singletonList(UserRole.VENDEDOR));
            System.out.println("Usuario creado: edwinb / 1234");
        }
        
        if (!userService.existsByUsername("jeanp")) {
            userService.createUser("jeanp", "1234");
            System.out.println("Usuario creado: jeanp / 1234");
        }
        
        if (!userService.existsByUsername("arturob")) {
            userService.createUser("arturob", "1234");
            System.out.println("Usuario creado: arturob / 1234");
        }
    }
}
