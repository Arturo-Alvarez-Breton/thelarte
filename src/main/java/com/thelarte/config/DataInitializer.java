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
        
        // Crear usuarios con roles específicos
        if (!userService.existsByUsername("egerente")) {
            userService.createUser("egerente", "1234", java.util.Collections.singletonList(UserRole.GERENTE));
            System.out.println("Usuario creado: egerente / 1234 (GERENTE)");
        }
        
        if (!userService.existsByUsername("eti")) {
            userService.createUser("eti", "1234", java.util.Collections.singletonList(UserRole.TI));
            System.out.println("Usuario creado: eti / 1234 (TI)");
        }
        
        if (!userService.existsByUsername("evendedor")) {
            userService.createUser("evendedor", "1234", java.util.Collections.singletonList(UserRole.VENDEDOR));
            System.out.println("Usuario creado: evendedor / 1234 (VENDEDOR)");
        }
        
        if (!userService.existsByUsername("econtabilidad")) {
            userService.createUser("econtabilidad", "1234", java.util.Collections.singletonList(UserRole.CONTABILIDAD));
            System.out.println("Usuario creado: econtabilidad / 1234 (CONTABILIDAD)");
        }
    }
}
