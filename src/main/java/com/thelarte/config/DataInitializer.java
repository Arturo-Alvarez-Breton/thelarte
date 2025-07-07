package com.thelarte.config;

import com.thelarte.auth.entity.UserRole;
import com.thelarte.auth.service.UserService;
import com.thelarte.shared.service.ISuplidorService;
import com.thelarte.shared.dto.SuplidorDTO;
import com.thelarte.inventory.service.IProductoService;
import com.thelarte.inventory.dto.ProductoDTO;
import com.thelarte.transacciones.service.TransaccionService;
import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.model.LineaTransaccion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.sql.SQLException;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserService userService;
    
    @Autowired
    private ISuplidorService suplidorService;
    
    @Autowired
    private IProductoService productoService;
    
    @Autowired
    private TransaccionService transaccionService;

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
        
        // Crear datos de prueba para suplidores
        createTestSuplidores();
        
        // Crear datos de prueba para productos
        createTestProductos();
        
        // Crear datos de prueba para transacciones
        createTestTransacciones();
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

    private void createTestSuplidores() {
        try {
            List<SuplidorDTO> suplidores = suplidorService.listarTodos();
            if (suplidores.isEmpty()) {
                logger.info("Creando suplidores de prueba...");
                
                SuplidorDTO suplidor1 = new SuplidorDTO();
                suplidor1.setNombre("Distribuidora Central");
                suplidor1.setCiudad("Santo Domingo");
                suplidor1.setDireccion("Av. Principal #123, Santo Domingo");
                suplidor1.setEmail("contacto@distcentral.com");
                // Crear lista para teléfonos
                List<String> telefonos1 = new ArrayList<>();
                telefonos1.add("809-555-0001");
                suplidor1.setTelefonos(telefonos1);
                suplidorService.guardar(suplidor1);
                
                SuplidorDTO suplidor2 = new SuplidorDTO();
                suplidor2.setNombre("Importadora del Norte");
                suplidor2.setCiudad("Santiago");
                suplidor2.setDireccion("Zona Industrial, Santiago");
                suplidor2.setEmail("info@impnorte.com");
                List<String> telefonos2 = new ArrayList<>();
                telefonos2.add("809-555-0002");
                suplidor2.setTelefonos(telefonos2);
                suplidorService.guardar(suplidor2);
                
                SuplidorDTO suplidor3 = new SuplidorDTO();
                suplidor3.setNombre("Suministros Globales");
                suplidor3.setCiudad("La Vega");
                suplidor3.setDireccion("Calle Comercio #456, La Vega");
                suplidor3.setEmail("ventas@sumglobales.com");
                List<String> telefonos3 = new ArrayList<>();
                telefonos3.add("809-555-0003");
                suplidor3.setTelefonos(telefonos3);
                suplidorService.guardar(suplidor3);
                
                logger.info("Suplidores de prueba creados exitosamente");
            }
        } catch (Exception e) {
            logger.error("Error creando suplidores de prueba: " + e.getMessage());
        }
    }

    private void createTestProductos() {
        try {
            List<ProductoDTO> productos = productoService.listarTodos();
            if (productos.isEmpty()) {
                logger.info("Creando productos de prueba...");
                
                ProductoDTO producto1 = new ProductoDTO();
                producto1.setNombre("Laptop Dell Inspiron 15");
                producto1.setDescripcion("Laptop con procesador Intel Core i5, 8GB RAM, 256GB SSD");
                producto1.setPrecio(new BigDecimal("45000.00"));
                producto1.setTipo("Electrónicos");
                producto1.setMarca("Dell");
                producto1.setItbis(0.18f);
                productoService.guardar(producto1);
                
                ProductoDTO producto2 = new ProductoDTO();
                producto2.setNombre("Mouse Inalámbrico Logitech");
                producto2.setDescripcion("Mouse óptico inalámbrico con receptor USB");
                producto2.setPrecio(new BigDecimal("1500.00"));
                producto2.setTipo("Accesorios");
                producto2.setMarca("Logitech");
                producto2.setItbis(0.18f);
                productoService.guardar(producto2);
                
                ProductoDTO producto3 = new ProductoDTO();
                producto3.setNombre("Teclado Mecánico RGB");
                producto3.setDescripcion("Teclado mecánico con iluminación RGB y switches azules");
                producto3.setPrecio(new BigDecimal("3500.00"));
                producto3.setTipo("Accesorios");
                producto3.setMarca("Genérico");
                producto3.setItbis(0.18f);
                productoService.guardar(producto3);
                
                ProductoDTO producto4 = new ProductoDTO();
                producto4.setNombre("Monitor LED 24 pulgadas");
                producto4.setDescripcion("Monitor LED Full HD 1920x1080, conexiones HDMI y VGA");
                producto4.setPrecio(new BigDecimal("12000.00"));
                producto4.setTipo("Monitores");
                producto4.setMarca("LG");
                producto4.setItbis(0.18f);
                productoService.guardar(producto4);
                
                ProductoDTO producto5 = new ProductoDTO();
                producto5.setNombre("Impresora Multifuncional HP");
                producto5.setDescripcion("Impresora, escáner y copiadora con conectividad WiFi");
                producto5.setPrecio(new BigDecimal("8500.00"));
                producto5.setTipo("Impresoras");
                producto5.setMarca("HP");
                producto5.setItbis(0.18f);
                productoService.guardar(producto5);
                
                logger.info("Productos de prueba creados exitosamente");
            }
        } catch (Exception e) {
            logger.error("Error creando productos de prueba: " + e.getMessage());
        }
    }

    private void createTestTransacciones() {
        try {
            List<Transaccion> transacciones = transaccionService.obtenerTodas();
            if (transacciones.isEmpty()) {
                logger.info("Creando transacciones de prueba...");
                
                // Obtener algunos productos para las transacciones
                List<ProductoDTO> productos = productoService.listarTodos();
                if (!productos.isEmpty()) {
                    // Transacción 1 - Venta
                    Transaccion venta1 = new Transaccion();
                    venta1.setTipo(Transaccion.TipoTransaccion.VENTA);
                    venta1.setFecha(LocalDateTime.now().minusDays(5));
                    venta1.setEstado(Transaccion.EstadoTransaccion.CONFIRMADA);
                    venta1.setContraparteId(1L);
                    venta1.setTipoContraparte(Transaccion.TipoContraparte.CLIENTE);
                    venta1.setContraparteNombre("Cliente Minorista");
                    venta1.setVendedorId(1L); // ID del usuario vendedor
                    venta1.setObservaciones("Venta de laptop con mouse");
                    venta1.setSubtotal(new BigDecimal("46500.00"));
                    venta1.setImpuestos(new BigDecimal("0.00"));
                    venta1.setTotal(new BigDecimal("46500.00"));
                    
                    List<LineaTransaccion> lineasVenta = new ArrayList<>();
                    
                    // Primera línea
                    if (!productos.isEmpty()) {
                        ProductoDTO producto = productos.get(0);
                        LineaTransaccion linea1 = new LineaTransaccion();
                        linea1.setTransaccion(venta1);
                        linea1.setProductoId(producto.getId());
                        linea1.setProductoNombre(producto.getNombre());
                        linea1.setCantidad(1);
                        linea1.setPrecioUnitario(new BigDecimal("45000.00"));
                        linea1.setImpuestoPorcentaje(new BigDecimal("18.00"));
                        linea1.calcularTotales();
                        lineasVenta.add(linea1);
                    }
                    
                    // Segunda línea
                    if (productos.size() > 1) {
                        ProductoDTO producto = productos.get(1);
                        LineaTransaccion linea2 = new LineaTransaccion();
                        linea2.setTransaccion(venta1);
                        linea2.setProductoId(producto.getId());
                        linea2.setProductoNombre(producto.getNombre());
                        linea2.setCantidad(1);
                        linea2.setPrecioUnitario(new BigDecimal("1500.00"));
                        linea2.setImpuestoPorcentaje(new BigDecimal("18.00"));
                        linea2.calcularTotales();
                        lineasVenta.add(linea2);
                    }
                    
                    venta1.setLineas(lineasVenta);
                    transaccionService.crearTransaccion(venta1);
                    
                    // Transacción 2 - Compra
                    Transaccion compra1 = new Transaccion();
                    compra1.setTipo(Transaccion.TipoTransaccion.COMPRA);
                    compra1.setFecha(LocalDateTime.now().minusDays(10));
                    compra1.setEstado(Transaccion.EstadoTransaccion.CONFIRMADA);
                    compra1.setContraparteId(1L);
                    compra1.setTipoContraparte(Transaccion.TipoContraparte.SUPLIDOR);
                    compra1.setContraparteNombre("Distribuidora Central");
                    compra1.setVendedorId(4L); // ID del usuario contabilidad
                    compra1.setObservaciones("Compra de inventario - monitores");
                    compra1.setSubtotal(new BigDecimal("36000.00"));
                    compra1.setImpuestos(new BigDecimal("0.00"));
                    compra1.setTotal(new BigDecimal("36000.00"));
                    
                    List<LineaTransaccion> lineasCompra = new ArrayList<>();
                    
                    if (productos.size() > 3) {
                        ProductoDTO producto = productos.get(3);
                        LineaTransaccion lineaCompra = new LineaTransaccion();
                        lineaCompra.setTransaccion(compra1);
                        lineaCompra.setProductoId(producto.getId());
                        lineaCompra.setProductoNombre(producto.getNombre());
                        lineaCompra.setCantidad(3);
                        lineaCompra.setPrecioUnitario(new BigDecimal("12000.00"));
                        lineaCompra.setImpuestoPorcentaje(new BigDecimal("18.00"));
                        lineaCompra.calcularTotales();
                        lineasCompra.add(lineaCompra);
                    }
                    
                    compra1.setLineas(lineasCompra);
                    transaccionService.crearTransaccion(compra1);
                    
                    logger.info("Transacciones de prueba creadas exitosamente");
                } else {
                    logger.warn("No se pueden crear transacciones sin productos");
                }
            }
        } catch (Exception e) {
            logger.error("Error creando transacciones de prueba: " + e.getMessage(), e);
        }
    }
}