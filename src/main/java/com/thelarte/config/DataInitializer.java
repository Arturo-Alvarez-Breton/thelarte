package com.thelarte.config;

import com.thelarte.auth.entity.UserRole;
import com.thelarte.auth.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.sql.SQLException;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        // Iniciar H2 TCP Server si no está ejecutándose
        startH2ServerIfNeeded();
        
        // Pequeña pausa para que el servidor se establezca
        Thread.sleep(2000);
        
        // Crear usuarios por defecto si no existen
        if (!userService.existsByUsername("edwinb")) {
            userService.createUser("edwinb", "1234", java.util.Collections.singletonList(UserRole.VENDEDOR));
            logger.info("Usuario creado: edwinb / 1234");
        }
        
        if (!userService.existsByUsername("jeanp")) {
            userService.createUser("jeanp", "1234");
            logger.info("Usuario creado: jeanp / 1234");
        }
        
        if (!userService.existsByUsername("arturob")) {
            userService.createUser("arturob", "1234");
            logger.info("Usuario creado: arturob / 1234");
        }
        
        // Crear usuarios con roles específicos
        if (!userService.existsByUsername("egerente")) {
            userService.createUser("egerente", "1234", java.util.Collections.singletonList(UserRole.GERENTE));
            logger.info("Usuario creado: egerente / 1234 (GERENTE)");
        }
        
        if (!userService.existsByUsername("eti")) {
            userService.createUser("eti", "1234", java.util.Collections.singletonList(UserRole.TI));
            logger.info("Usuario creado: eti / 1234 (TI)");
        }
        
        if (!userService.existsByUsername("evendedor")) {
            userService.createUser("evendedor", "1234", java.util.Collections.singletonList(UserRole.VENDEDOR));
            logger.info("Usuario creado: evendedor / 1234 (VENDEDOR)");
        }
        
        if (!userService.existsByUsername("econtabilidad")) {
            userService.createUser("econtabilidad", "1234", java.util.Collections.singletonList(UserRole.CONTABILIDAD));
            logger.info("Usuario creado: econtabilidad / 1234 (CONTABILIDAD)");
        }
        
        if (!userService.existsByUsername("ecompras")) {
            userService.createUser("ecompras", "1234", java.util.Collections.singletonList(UserRole.COMPRAS_SUPLIDOR));
            logger.info("Usuario creado: ecompras / 1234 (COMPRAS_SUPLIDOR)");
        }
    }
    
    private void startH2ServerIfNeeded() {
        try {
            // Verificar si el servidor ya está ejecutándose
            boolean serverRunning = isH2ServerRunning();
            
            if (!serverRunning) {
                logger.info("Iniciando H2 TCP Server...");
                // Crear y iniciar el servidor H2 TCP
                org.h2.tools.Server server = org.h2.tools.Server.createTcpServer(
                    "-tcp", 
                    "-tcpPort", "9092", 
                    "-tcpAllowOthers", 
                    "-ifNotExists"
                );
                server.start();
                logger.info("H2 TCP Server iniciado exitosamente en puerto 9092");
            } else {
                logger.info("H2 TCP Server ya está ejecutándose");
            }
        } catch (SQLException e) {
            logger.error("Error al iniciar H2 TCP Server: " + e.getMessage());
            logger.info("Intentando continuar sin servidor TCP...");
        } catch (Exception e) {
            logger.warn("No se pudo iniciar H2 TCP Server automáticamente: " + e.getMessage());
            logger.info("Asegúrate de que el servidor H2 esté ejecutándose manualmente o verifica la configuración");
        }
    }
    
    private boolean isH2ServerRunning() {
        try {
            // Intentar crear una conexión de prueba
            java.sql.Connection testConnection = java.sql.DriverManager.getConnection(
                "jdbc:h2:tcp://localhost:9092/~/thelarte", "sa", "");
            testConnection.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}