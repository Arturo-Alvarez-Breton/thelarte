package com.thelarte.config;

import com.thelarte.auth.entity.UserRole;
import com.thelarte.auth.service.UserService;
import com.thelarte.user.model.Cliente;
import com.thelarte.user.model.Empleado;
import com.thelarte.user.repository.ClienteRepository;
import com.thelarte.user.repository.EmpleadoRepository;
import com.thelarte.user.util.Rol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Override
    public void run(String... args) throws Exception {
        // ==========================
        // EJEMPLOS DE EMPLEADOS
        // ==========================
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

            // Usuario vinculado
            if (!userService.existsByUsername("edwinbrito")) {
                userService.createUser("edwinbrito", "contrasena123", Arrays.asList(UserRole.VENDEDOR), emp.getCedula());
                System.out.println("Usuario creado: edwinbrito (VENDEDOR, empleado: 40222022001)");
            }
        }

        // Gerente - Ana Garcia
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
                userService.createUser("anagarcia", "managerpass", Arrays.asList(UserRole.GERENTE), emp.getCedula());
                System.out.println("Usuario creado: anagarcia (GERENTE, empleado: 40222022002)");
            }
        }

        // TI - Juan Pérez
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
                userService.createUser("juanperez", "tipass", Arrays.asList(UserRole.TI), emp.getCedula());
                System.out.println("Usuario creado: juanperez (TI, empleado: 40222022003)");
            }
        }

        // Cajero - Carla Santos
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
                userService.createUser("carlasantos", "cajeropass", Arrays.asList(UserRole.CONTABILIDAD), emp.getCedula());
                System.out.println("Usuario creado: carlasantos (CONTABILIDAD, empleado: 40222022004)");
            }
        }

        // ==========================
        // EJEMPLOS DE CLIENTES
        // ==========================
        if (!clienteRepository.existsById("001-1234567-1")) {
            Cliente cliente = new Cliente();
            cliente.setCedula("001-1234567-1");
            cliente.setNombre("Pedro");
            cliente.setApellido("Martínez");
            cliente.setTelefono("829-555-1111");
            cliente.setEmail("pedro.martinez@dominio.com");
            cliente.setDireccion("Av. Independencia #100, Santo Domingo");
            clienteRepository.save(cliente);
        }

        if (!clienteRepository.existsById("402-9876543-2")) {
            Cliente cliente = new Cliente();
            cliente.setCedula("402-9876543-2");
            cliente.setNombre("Luisa");
            cliente.setApellido("Fernández");
            cliente.setTelefono("829-555-2222");
            cliente.setEmail("luisa.fernandez@dominio.com");
            cliente.setDireccion("Calle Duarte #55, Santiago");
            clienteRepository.save(cliente);
        }

        if (!clienteRepository.existsById("003-5555555-3")) {
            Cliente cliente = new Cliente();
            cliente.setCedula("003-5555555-3");
            cliente.setNombre("José");
            cliente.setApellido("Gómez");
            cliente.setTelefono("829-555-3333");
            cliente.setEmail("jose.gomez@dominio.com");
            cliente.setDireccion("Calle El Sol #10, La Vega");
            clienteRepository.save(cliente);
        }

        // ==========================
        // USUARIO independiente (sin empleado)
        // ==========================
        if (!userService.existsByUsername("adminroot")) {
            userService.createUser("adminroot", "rootsecure", Arrays.asList(UserRole.GERENTE), null);
            System.out.println("Usuario creado: adminroot (GERENTE, sin empleado)");
        }
    }
}