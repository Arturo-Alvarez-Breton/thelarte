package com.thelarte.config;

import com.thelarte.auth.entity.UserRole;
import com.thelarte.auth.service.UserService;
import com.thelarte.inventory.model.Producto;
import com.thelarte.inventory.repository.ProductoRepository;
import com.thelarte.shared.repository.SuplidorRepository;
import com.thelarte.shared.model.Suplidor;
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

import java.math.BigDecimal;
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

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private SuplidorRepository suplidorRepository;

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
        seedProductos();
        seedSuplidores();
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
            emp.setDeleted(false); // Empleado activo
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
            
            if (!userService.existsByUsername("edwinb")) {
                userService.createUser(
                    "edwinb",
                    "1234",
                    Arrays.asList(UserRole.VENDEDOR),
                    null
                );
                logger.info("Usuario creado: edwinb (VENDEDOR, sin empleado)");
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
            emp.setDeleted(false); // Empleado activo
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

        // Juan Pérez - Usuario (antes TI)
        if (!empleadoRepository.existsById("40222022003")) {
            Empleado emp = new Empleado();
            emp.setCedula("40222022003");
            emp.setNombre("Juan");
            emp.setApellido("Pérez");
            emp.setTelefono("809-555-3003");
            emp.setEmail("juan.perez@ejemplo.com");
            emp.setRol(Rol.COMERCIAL); // Cambiado de TI a USER
            emp.setSalario(32000f);
            emp.setComision(null);
            emp.setDeleted(false); // Empleado activo
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
            
            if (!userService.existsByUsername("jeanp")) {
                userService.createUser(
                    "jeanp",
                    "1234",
                    Arrays.asList(UserRole.TI),
                    null
                );
                logger.info("Usuario creado: jeanp (TI, sin empleado)");
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
            emp.setDeleted(false); // Empleado activo
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
        
        // Arturo Breton - Empleado adicional
        if (!empleadoRepository.existsById("40222022005")) {
            Empleado emp = new Empleado();
            emp.setCedula("40222022005");
            emp.setNombre("Arturo");
            emp.setApellido("Breton");
            emp.setTelefono("809-555-5005");
            emp.setEmail("arturo.breton@ejemplo.com");
            emp.setRol(Rol.COMERCIAL);
            emp.setSalario(24000f);
            emp.setComision(8.0f);
            emp.setDeleted(false); // Empleado activo
            empleadoRepository.save(emp);

            if (!userService.existsByUsername("arturob")) {
                userService.createUser(
                    "arturob",
                    "1234",
                    Arrays.asList(UserRole.VENDEDOR),
                    emp.getCedula()
                );
                logger.info("Usuario creado: arturob (VENDEDOR, empleado: 40222022005)");
            }
        }

        // Agregar un empleado eliminado para pruebas del borrado lógico
        if (!empleadoRepository.existsById("40222022099")) {
            Empleado emp = new Empleado();
            emp.setCedula("40222022099");
            emp.setNombre("Carlos");
            emp.setApellido("Eliminado");
            emp.setTelefono("809-555-9999");
            emp.setEmail("carlos.eliminado@ejemplo.com");
            emp.setRol(Rol.COMERCIAL);
            emp.setSalario(20000f);
            emp.setComision(null);
            emp.setDeleted(true); // Empleado eliminado lógicamente
            empleadoRepository.save(emp);
            logger.info("Empleado de prueba creado y eliminado lógicamente: Carlos Eliminado");
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
            c.setDeleted(false); // Cliente activo
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
            c.setDeleted(false); // Cliente activo
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
            c.setDeleted(false); // Cliente activo
            clienteRepository.save(c);
        }

        // Agregar un cliente eliminado para pruebas
        if (!clienteRepository.existsById("001-0000000-1")) {
            Cliente c = new Cliente();
            c.setCedula("001-0000000-1");
            c.setNombre("María");
            c.setApellido("López");
            c.setTelefono("829-555-4444");
            c.setEmail("maria.lopez@dominio.com");
            c.setDireccion("Calle Principal #20, San Pedro");
            c.setDeleted(true); // Cliente eliminado lógicamente
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

    private void seedProductos() {
        // Producto 1: Sofá moderno - activo
        if (productoRepository.findByNombre("Sofá Moderno 3 Plazas").isEmpty()) {
            Producto producto1 = new Producto(
                "Sofá Moderno 3 Plazas",
                "Muebles",
                "Sofá contemporáneo de 3 plazas en tela gris, perfecto para salas de estar modernas",
                18.0f, // ITBIS
                new BigDecimal("15000.00"), // Precio compra
                new BigDecimal("25000.00"), // Precio venta
                null, // URL de foto
                5, // Cantidad disponible
                0, // Cantidad reservada
                0, // Cantidad dañada
                0, // Cantidad devuelta
                5  // Cantidad almacén
            );
            producto1.setEliminado(false);
            productoRepository.save(producto1);
            logger.info("Producto creado: Sofá Moderno 3 Plazas (activo)");
        }

        // Producto 2: Mesa de comedor - activo
        if (productoRepository.findByNombre("Mesa de Comedor Rectangular").isEmpty()) {
            Producto producto2 = new Producto(
                "Mesa de Comedor Rectangular",
                "Muebles",
                "Mesa de comedor en madera de roble para 6 personas, con acabado natural",
                18.0f,
                new BigDecimal("8000.00"),
                new BigDecimal("14000.00"),
                null,
                3,
                1,
                0,
                0,
                4
            );
            producto2.setEliminado(false);
            productoRepository.save(producto2);
            logger.info("Producto creado: Mesa de Comedor Rectangular (activo)");
        }

        // Producto 3: Lámpara de pie - activo
        if (productoRepository.findByNombre("Lámpara de Pie LED").isEmpty()) {
            Producto producto3 = new Producto(
                "Lámpara de Pie LED",
                "Iluminación",
                "Lámpara de pie con tecnología LED, regulable y con base en metal cromado",
                18.0f,
                new BigDecimal("2500.00"),
                new BigDecimal("4200.00"),
                null,
                10,
                2,
                0,
                1,
                13
            );
            producto3.setEliminado(false);
            productoRepository.save(producto3);
            logger.info("Producto creado: Lámpara de Pie LED (activo)");
        }

        // Producto 4: Silla ejecutiva - activo
        if (productoRepository.findByNombre("Silla Ejecutiva Ergonómica").isEmpty()) {
            Producto producto4 = new Producto(
                "Silla Ejecutiva Ergonómica",
                "Oficina",
                "Silla ejecutiva con soporte lumbar, apoyabrazos ajustables y base giratoria",
                18.0f,
                new BigDecimal("3200.00"),
                new BigDecimal("5800.00"),
                null,
                8,
                0,
                1,
                0,
                9
            );
            producto4.setEliminado(false);
            productoRepository.save(producto4);
            logger.info("Producto creado: Silla Ejecutiva Ergonómica (activo)");
        }

        // Producto 5: Estantería - activo
        if (productoRepository.findByNombre("Estantería Modular 5 Niveles").isEmpty()) {
            Producto producto5 = new Producto(
                "Estantería Modular 5 Niveles",
                "Muebles",
                "Estantería modular de 5 niveles en melamina blanca, ideal para libros y decoración",
                18.0f,
                new BigDecimal("1800.00"),
                new BigDecimal("3200.00"),
                null,
                6,
                1,
                0,
                0,
                7
            );
            producto5.setEliminado(false);
            productoRepository.save(producto5);
            logger.info("Producto creado: Estantería Modular 5 Niveles (activo)");
        }

        // Producto 6: Mesa de centro - eliminado lógicamente para pruebas
        if (productoRepository.findByNombre("Mesa de Centro Vintage").isEmpty()) {
            Producto producto6 = new Producto(
                "Mesa de Centro Vintage",
                "Muebles",
                "Mesa de centro estilo vintage con gavetas laterales y acabado en madera oscura",
                18.0f,
                new BigDecimal("4500.00"),
                new BigDecimal("7200.00"),
                null,
                0,
                0,
                2,
                1,
                3
            );
            producto6.setEliminado(true); // Producto eliminado lógicamente
            productoRepository.save(producto6);
            logger.info("Producto creado y eliminado lógicamente: Mesa de Centro Vintage");
        }

        // Producto 7: Escritorio ejecutivo - activo
        if (productoRepository.findByNombre("Escritorio Ejecutivo L-Shape").isEmpty()) {
            Producto producto7 = new Producto(
                "Escritorio Ejecutivo L-Shape",
                "Oficina",
                "Escritorio ejecutivo en forma de L con múltiples cajones y superficie amplia",
                18.0f,
                new BigDecimal("12000.00"),
                new BigDecimal("18500.00"),
                null,
                2,
                0,
                0,
                0,
                2
            );
            producto7.setEliminado(false);
            productoRepository.save(producto7);
            logger.info("Producto creado: Escritorio Ejecutivo L-Shape (activo)");
        }

        // Producto 8: Cómoda - eliminado lógicamente para pruebas
        if (productoRepository.findByNombre("Cómoda 4 Gavetas").isEmpty()) {
            Producto producto8 = new Producto(
                "Cómoda 4 Gavetas",
                "Muebles",
                "Cómoda de dormitorio con 4 gavetas amplias y tiradores metálicos",
                18.0f,
                new BigDecimal("5500.00"),
                new BigDecimal("8800.00"),
                null,
                0,
                0,
                1,
                0,
                1
            );
            producto8.setEliminado(true); // Producto eliminado lógicamente
            productoRepository.save(producto8);
            logger.info("Producto creado y eliminado lógicamente: Cómoda 4 Gavetas");
        }
    }

    private void seedSuplidores() {
        // Suplidor 1: Muebles Dominicanos - Activo
        if (suplidorRepository.findByNombre("Muebles Dominicanos S.A.").isEmpty()) {
            Suplidor s1 = new Suplidor();
            s1.setNombre("Muebles Dominicanos S.A.");
            s1.setCiudad("Santo Domingo");
            s1.setPais("República Dominicana");
            s1.setDireccion("Av. John F. Kennedy #1425, Sector Los Cacicazgos");
            s1.setEmail("ventas@mueblesdom.com.do");
            s1.setRNC("130-12345-6");
            s1.setTelefonos(Arrays.asList("+1-809-567-8900", "+1-809-567-8901"));
            s1.setLongitud(-69.9312117);
            s1.setLatitud(18.4860575);
            s1.setActivo(true);
            suplidorRepository.save(s1);
            logger.info("Suplidor creado: Muebles Dominicanos S.A. (activo)");
        }

        // Suplidor 2: Importaciones del Caribe - Activo
        if (suplidorRepository.findByNombre("Importaciones del Caribe").isEmpty()) {
            Suplidor s2 = new Suplidor();
            s2.setNombre("Importaciones del Caribe");
            s2.setCiudad("Santiago");
            s2.setPais("República Dominicana");
            s2.setDireccion("Calle Mella #45, Centro de Santiago");
            s2.setEmail("info@importcaribe.do");
            s2.setRNC("130-98765-4");
            s2.setTelefonos(Arrays.asList("+1-809-582-3456"));
            s2.setLongitud(-70.6969664);
            s2.setLatitud(19.4517447);
            s2.setActivo(true);
            suplidorRepository.save(s2);
            logger.info("Suplidor creado: Importaciones del Caribe (activo)");
        }

        // Suplidor 3: Textiles Tropicales - Activo
        if (suplidorRepository.findByNombre("Textiles Tropicales EIRL").isEmpty()) {
            Suplidor s3 = new Suplidor();
            s3.setNombre("Textiles Tropicales EIRL");
            s3.setCiudad("La Vega");
            s3.setPais("República Dominicana");
            s3.setDireccion("Autopista Duarte Km 125, Zona Industrial");
            s3.setEmail("contacto@textilestropicales.com");
            s3.setRNC("130-55555-5");
            s3.setTelefonos(Arrays.asList("+1-809-573-7890", "+1-809-573-7891"));
            s3.setLongitud(-70.5286778);
            s3.setLatitud(19.2227407);
            s3.setActivo(true);
            suplidorRepository.save(s3);
            logger.info("Suplidor creado: Textiles Tropicales EIRL (activo)");
        }

        // Suplidor 4: Maderas Premium - Activo
        if (suplidorRepository.findByNombre("Maderas Premium Internacional").isEmpty()) {
            Suplidor s4 = new Suplidor();
            s4.setNombre("Maderas Premium Internacional");
            s4.setCiudad("San Pedro de Macorís");
            s4.setPais("República Dominicana");
            s4.setDireccion("Carretera Mella Km 67, Parque Industrial");
            s4.setEmail("ventas@maderaspremium.do");
            s4.setRNC("130-77777-7");
            s4.setTelefonos(Arrays.asList("+1-809-529-1234"));
            s4.setLongitud(-69.2975306);
            s4.setLatitud(18.4539274);
            s4.setActivo(true);
            suplidorRepository.save(s4);
            logger.info("Suplidor creado: Maderas Premium Internacional (activo)");
        }

        // Suplidor 5: Global Furniture Miami - Activo (Internacional)
        if (suplidorRepository.findByNombre("Global Furniture Miami Corp").isEmpty()) {
            Suplidor s5 = new Suplidor();
            s5.setNombre("Global Furniture Miami Corp");
            s5.setCiudad("Miami");
            s5.setPais("Estados Unidos");
            s5.setDireccion("8550 NW 17th Street, Doral, FL 33126");
            s5.setEmail("exports@globalfurniture.us");
            s5.setRNC(null); // No tiene RNC dominicano
            s5.setTelefonos(Arrays.asList("+1-305-592-8800", "+1-305-592-8801"));
            s5.setLongitud(-80.3374393);
            s5.setLatitud(25.7907628);
            s5.setActivo(true);
            suplidorRepository.save(s5);
            logger.info("Suplidor creado: Global Furniture Miami Corp (activo, internacional)");
        }

        // Suplidor 6: Distribuidora Central - Inactivo (para pruebas de borrado lógico)
        if (suplidorRepository.findByNombre("Distribuidora Central Ltda").isEmpty()) {
            Suplidor s6 = new Suplidor();
            s6.setNombre("Distribuidora Central Ltda");
            s6.setCiudad("Santo Domingo");
            s6.setPais("República Dominicana");
            s6.setDireccion("Calle Mercedes #89, Zona Colonial");
            s6.setEmail("info@distcentral.do");
            s6.setRNC("130-99999-9");
            s6.setTelefonos(Arrays.asList("+1-809-221-9999"));
            s6.setLongitud(-69.8849595);
            s6.setLatitud(18.4655394);
            s6.setActivo(false); // Inactivo para pruebas
            suplidorRepository.save(s6);
            logger.info("Suplidor creado: Distribuidora Central Ltda (inactivo - para pruebas)");
        }

        // Suplidor 7: Tech Solutions China - Inactivo (para pruebas de borrado lógico)
        if (suplidorRepository.findByNombre("Tech Solutions China Ltd").isEmpty()) {
            Suplidor s7 = new Suplidor();
            s7.setNombre("Tech Solutions China Ltd");
            s7.setCiudad("Shenzhen");
            s7.setPais("China");
            s7.setDireccion("Futian District, Shenzhen, Guangdong Province");
            s7.setEmail("export@techsolutions.cn");
            s7.setRNC(null);
            s7.setTelefonos(Arrays.asList("+86-755-8888-9999"));
            s7.setLongitud(114.0579909);
            s7.setLatitud(22.5445741);
            s7.setActivo(false); // Inactivo para pruebas
            suplidorRepository.save(s7);
            logger.info("Suplidor creado: Tech Solutions China Ltd (inactivo - para pruebas)");
        }
    }
}
