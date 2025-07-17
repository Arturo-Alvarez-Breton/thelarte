package com.thelarte.config;

import com.thelarte.auth.entity.UserRole;
import com.thelarte.auth.service.UserService;
import com.thelarte.user.model.Cliente;
import com.thelarte.user.model.Empleado;
import com.thelarte.user.repository.ClienteRepository;
import com.thelarte.user.repository.EmpleadoRepository;
import com.thelarte.user.util.Rol;
import org.h2.tools.Server;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.sql.SQLException;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserService userService;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1) Iniciar H2 TCP Server
        startH2ServerIfNeeded();

        // 2) Pequeña pausa para que arranque bien
        Thread.sleep(2000);

        // 3) Cargar datos de dominio
        seedEmpleados();
        seedClientes();
        seedAdminRoot();
    }

    private void startH2ServerIfNeeded() {
        try {
            if (!isH2ServerRunning()) {
                logger.info("Iniciando H2 TCP Server...");
                Server server = Server.createTcpServer(
                        "-tcp",
                        "-tcpPort", "9092",
                        "-tcpAllowOthers",
                        "-ifNotExists"
                );
                server.start();
                logger.info("H2 TCP Server iniciado en puerto 9092");
            } else {
                logger.info("H2 TCP Server ya está en ejecución");
            }
        } catch (SQLException e) {
            logger.error("Error al iniciar H2 TCP Server: {}", e.getMessage());
            logger.info("Continuando sin servidor TCP H2...");
        } catch (Exception e) {
            logger.warn("No se pudo iniciar H2 automáticamente: {}", e.getMessage());
        }
    }

    private boolean isH2ServerRunning() {
        try {
            // Intentar conexión de prueba
            java.sql.Connection conn = java.sql.DriverManager.getConnection(
                    "jdbc:h2:tcp://localhost:9092/~/thelarte", "sa", ""
            );
            conn.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void seedEmpleados() {
        // Edwin Brito - Comercial
        if (!empleadoRepository.existsById("40222022001")) {
            Empleado emp = new Empleado();
            emp.setCedula("40222022001");
            emp.setNombre("Edwin");
            emp.setApellido("Brito");
            emp.setTelefono("809-555-1001");
            emp.setEmail("edwin.brito@ejemplo.com");
            emp.setRol(Rol.COMERCIAL);
            emp.setSalario(25000f);
            emp.setComision(10.0f);
            empleadoRepository.save(emp);

            if (!userService.existsByUsername("edwinbrito")) {
                userService.createUser(
                    "edwinbrito",
                    "contrasena123",
                    Arrays.asList(UserRole.VENDEDOR),
                    emp.getCedula()
                );
                logger.info("Usuario creado: edwinbrito (VENDEDOR, empleado: 40222022001)");
            }
        }

        // Ana Garcia - Gerente
        if (!empleadoRepository.existsById("40222022002")) {
            Empleado emp = new Empleado();
            emp.setCedula("40222022002");
            emp.setNombre("Ana");
            emp.setApellido("Garcia");
            emp.setTelefono("809-555-2002");
            emp.setEmail("ana.garcia@ejemplo.com");
            emp.setRol(Rol.ADMIN);
            emp.setSalario(40000f);
            emp.setComision(null);
            empleadoRepository.save(emp);

            if (!userService.existsByUsername("anagarcia")) {
                userService.createUser(
                    "anagarcia",
                    "managerpass",
                    Arrays.asList(UserRole.GERENTE),
                    emp.getCedula()
                );
                logger.info("Usuario creado: anagarcia (GERENTE, empleado: 40222022002)");
            }
        }

        // Juan Pérez - TI
        if (!empleadoRepository.existsById("40222022003")) {
            Empleado emp = new Empleado();
            emp.setCedula("40222022003");
            emp.setNombre("Juan");
            emp.setApellido("Pérez");
            emp.setTelefono("809-555-3003");
            emp.setEmail("juan.perez@ejemplo.com");
            emp.setRol(Rol.TI);
            emp.setSalario(32000f);
            emp.setComision(null);
            empleadoRepository.save(emp);

            if (!userService.existsByUsername("juanperez")) {
                userService.createUser(
                    "juanperez",
                    "tipass",
                    Arrays.asList(UserRole.TI),
                    emp.getCedula()
                );
                logger.info("Usuario creado: juanperez (TI, empleado: 40222022003)");
            }
        }

        // Carla Santos - Cajero
        if (!empleadoRepository.existsById("40222022004")) {
            Empleado emp = new Empleado();
            emp.setCedula("40222022004");
            emp.setNombre("Carla");
            emp.setApellido("Santos");
            emp.setTelefono("809-555-4004");
            emp.setEmail("carla.santos@ejemplo.com");
            emp.setRol(Rol.CAJERO);
            emp.setSalario(18000f);
            emp.setComision(null);
            empleadoRepository.save(emp);

            if (!userService.existsByUsername("carlasantos")) {
                userService.createUser(
                    "carlasantos",
                    "cajeropass",
                    Arrays.asList(UserRole.CONTABILIDAD),
                    emp.getCedula()
                );
                logger.info("Usuario creado: carlasantos (CONTABILIDAD, empleado: 40222022004)");
            }
        }
    }

    private void seedClientes() {
        if (!clienteRepository.existsById("001-1234567-1")) {
            Cliente c = new Cliente();
            c.setCedula("001-1234567-1");
            c.setNombre("Pedro");
            c.setApellido("Martínez");
            c.setTelefono("829-555-1111");
            c.setEmail("pedro.martinez@dominio.com");
            c.setDireccion("Av. Independencia #100, Santo Domingo");
            clienteRepository.save(c);
        }
        if (!clienteRepository.existsById("402-9876543-2")) {
            Cliente c = new Cliente();
            c.setCedula("402-9876543-2");
            c.setNombre("Luisa");
            c.setApellido("Fernández");
            c.setTelefono("829-555-2222");
            c.setEmail("luisa.fernandez@dominio.com");
            c.setDireccion("Calle Duarte #55, Santiago");
            clienteRepository.save(c);
        }
        if (!clienteRepository.existsById("003-5555555-3")) {
            Cliente c = new Cliente();
            c.setCedula("003-5555555-3");
            c.setNombre("José");
            c.setApellido("Gómez");
            c.setTelefono("829-555-3333");
            c.setEmail("jose.gomez@dominio.com");
            c.setDireccion("Calle El Sol #10, La Vega");
            clienteRepository.save(c);
        }
    }

    private void seedAdminRoot() {
        if (!userService.existsByUsername("adminroot")) {
            userService.createUser(
                "adminroot",
                "rootsecure",
                Arrays.asList(UserRole.GERENTE),
                null
            );
            logger.info("Usuario creado: adminroot (GERENTE, sin empleado)");
        }
    }
}
