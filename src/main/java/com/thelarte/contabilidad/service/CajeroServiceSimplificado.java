package com.thelarte.contabilidad.service;

import com.thelarte.contabilidad.dto.*;
import com.thelarte.transacciones.repository.TransaccionRepository;
import com.thelarte.inventory.repository.ProductoRepository;
import com.thelarte.user.repository.ClienteRepository;
import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.model.LineaTransaccion;
import com.thelarte.inventory.model.Producto;
import com.thelarte.user.model.Cliente;
import com.thelarte.shared.model.Suplidor;
import com.thelarte.shared.repository.SuplidorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CajeroServiceSimplificado {

    @Autowired
    private TransaccionRepository transaccionRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private SuplidorRepository suplidorRepository;
    
    private CajaDTO cajaActual;
    private Map<String, Object> configuracionCaja = new HashMap<>();

    public DashboardCajeroDTO getDashboardData() {
        DashboardCajeroDTO dashboard = new DashboardCajeroDTO();
        
        dashboard.setEstadoCaja(getEstadoCajaForDashboard());
        dashboard.setResumenDelDia(getResumenDelDia());
        dashboard.setTransaccionesRecientes(getTransaccionesRecientes());
        dashboard.setProductosMasVendidos(getProductosMasVendidosHoy());
        
        return dashboard;
    }

    private DashboardCajeroDTO.EstadoCaja getEstadoCajaForDashboard() {
        DashboardCajeroDTO.EstadoCaja estado = new DashboardCajeroDTO.EstadoCaja();
        
        if (cajaActual != null && !cajaActual.getCerrada()) {
            estado.setCajaAbierta(true);
            estado.setHoraApertura(cajaActual.getFechaApertura());
            estado.setMontoInicialCaja(cajaActual.getMontoInicialEfectivo());
            estado.setTotalVentasEfectivo(cajaActual.getTotalVentasEfectivo() != null ? cajaActual.getTotalVentasEfectivo() : BigDecimal.ZERO);
            estado.setTotalVentasTarjeta(cajaActual.getTotalVentasTarjeta() != null ? cajaActual.getTotalVentasTarjeta() : BigDecimal.ZERO);
            estado.setTotalVentasTransferencia(cajaActual.getTotalVentasTransferencia() != null ? cajaActual.getTotalVentasTransferencia() : BigDecimal.ZERO);
            estado.setTotalEfectivoEnCaja(cajaActual.getEfectivoEsperado());
            estado.setCajeroActual(cajaActual.getCajero());
        } else {
            estado.setCajaAbierta(false);
        }
        
        return estado;
    }

    private DashboardCajeroDTO.ResumenDelDia getResumenDelDia() {
        DashboardCajeroDTO.ResumenDelDia resumen = new DashboardCajeroDTO.ResumenDelDia();
        
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = inicioHoy.plusDays(1);
        
        List<Transaccion> transaccionesHoy = transaccionRepository.findByFechaBetween(inicioHoy, finHoy);
        
        List<Transaccion> ventas = transaccionesHoy.stream()
            .filter(t -> t.getTipo() == Transaccion.TipoTransaccion.VENTA)
            .collect(Collectors.toList());
            
        List<Transaccion> devoluciones = transaccionesHoy.stream()
            .filter(t -> t.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_VENTA)
            .collect(Collectors.toList());

        BigDecimal totalVentas = ventas.stream()
            .map(Transaccion::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal totalDevoluciones = devoluciones.stream()
            .map(Transaccion::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        resumen.setTotalTransacciones(transaccionesHoy.size());
        resumen.setTotalVentas(totalVentas);
        resumen.setTotalDevoluciones(totalDevoluciones);
        resumen.setVentasNetas(totalVentas.subtract(totalDevoluciones));
        
        Set<Long> clientesUnicos = ventas.stream()
            .map(Transaccion::getContraparteId)
            .collect(Collectors.toSet());
        resumen.setClientesAtendidos(clientesUnicos.size());
        
        if (!clientesUnicos.isEmpty()) {
            resumen.setPromedioVentaPorCliente(totalVentas.divide(new BigDecimal(clientesUnicos.size()), 2, BigDecimal.ROUND_HALF_UP));
        } else {
            resumen.setPromedioVentaPorCliente(BigDecimal.ZERO);
        }
        
        return resumen;
    }

    private List<DashboardCajeroDTO.TransaccionRecienteDTO> getTransaccionesRecientes() {
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = inicioHoy.plusDays(1);
        
        Pageable pageable = PageRequest.of(0, 10);
        List<Transaccion> transacciones = transaccionRepository.findByFechaBetweenOrderByFechaDesc(inicioHoy, finHoy, pageable).getContent();
        
        return transacciones.stream()
            .map(this::convertToTransaccionReciente)
            .collect(Collectors.toList());
    }

    private DashboardCajeroDTO.TransaccionRecienteDTO convertToTransaccionReciente(Transaccion transaccion) {
        DashboardCajeroDTO.TransaccionRecienteDTO dto = new DashboardCajeroDTO.TransaccionRecienteDTO();
        dto.setId(transaccion.getId());
        dto.setNumeroFactura(transaccion.getNumeroFactura());
        dto.setTipoTransaccion(transaccion.getTipo().toString());
        dto.setClienteNombre(transaccion.getContraparteNombre());
        dto.setTotal(transaccion.getTotal());
        dto.setMetodoPago(transaccion.getMetodoPago());
        dto.setFecha(transaccion.getFecha());
        dto.setEstado(transaccion.getEstado().toString());
        return dto;
    }

    private List<DashboardCajeroDTO.ProductoMasVendidoDTO> getProductosMasVendidosHoy() {
        return new ArrayList<>();
    }

    public List<CajeroTransaccionDTO> getTransaccionesFiltered(String tipo, String estado, String busqueda, 
            LocalDate fechaDesde, LocalDate fechaHasta, int page, int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        List<Transaccion> transacciones;
        
        if (fechaDesde != null && fechaHasta != null) {
            transacciones = transaccionRepository.findByFechaBetweenOrderByFechaDesc(
                fechaDesde.atStartOfDay(), 
                fechaHasta.atTime(23, 59, 59), 
                pageable).getContent();
        } else {
            transacciones = transaccionRepository.findAll(pageable).getContent();
        }
        
        return transacciones.stream()
            .map(this::convertToTransaccionDTO)
            .collect(Collectors.toList());
    }

    public CajeroTransaccionDTO getTransaccionById(Long id) {
        try {
            System.out.println("=== DEBUG: Buscando transacción con ID: " + id + " ===");
            Optional<Transaccion> transaccionOpt = transaccionRepository.findById(id);
            if (transaccionOpt.isPresent()) {
                System.out.println("=== DEBUG: Transacción encontrada, convirtiendo a DTO ===");
                return convertToTransaccionDTO(transaccionOpt.get());
            }
            System.out.println("=== DEBUG: Transacción no encontrada ===");
            throw new RuntimeException("Transacción no encontrada");
        } catch (Exception e) {
            System.err.println("=== ERROR: En getTransaccionById ===");
            e.printStackTrace();
            throw new RuntimeException("Error al obtener transacción: " + e.getMessage(), e);
        }
    }

    // Método convertToCajeroTransaccionDTO eliminado - usando convertToTransaccionDTO que incluye proveedores

    private CajeroTransaccionDTO.LineaTransaccionDTO convertToLineaTransaccionDTO(LineaTransaccion linea) {
        CajeroTransaccionDTO.LineaTransaccionDTO dto = new CajeroTransaccionDTO.LineaTransaccionDTO();
        
        // Si el producto ID es -1 (temporal) o no existe, usar la información guardada en la línea
        if (linea.getProductoId() != null && linea.getProductoId() != -1L) {
            try {
                Optional<Producto> productoOpt = productoRepository.findById(linea.getProductoId());
                if (productoOpt.isPresent()) {
                    Producto producto = productoOpt.get();
                    dto.setProductoId(producto.getId());
                    dto.setNombreProducto(producto.getNombre());
                    dto.setCodigoProducto(producto.getCodigo());
                    dto.setCategoria(producto.getTipo());
                } else {
                    // Producto no encontrado, usar datos de la línea
                    dto.setProductoId(linea.getProductoId());
                    dto.setNombreProducto(linea.getProductoNombre());
                    dto.setCodigoProducto("N/A");
                }
            } catch (Exception e) {
                // En caso de error, usar datos de la línea
                dto.setProductoId(linea.getProductoId());
                dto.setNombreProducto(linea.getProductoNombre());
                dto.setCodigoProducto("N/A");
            }
        } else {
            // Producto temporal o sin ID, usar datos de la línea
            dto.setProductoId(linea.getProductoId());
            dto.setNombreProducto(linea.getProductoNombre());
            dto.setCodigoProducto("TEMP");
        }
        
        dto.setCantidad(linea.getCantidad());
        dto.setPrecioUnitario(linea.getPrecioUnitario());
        dto.setDescuento(linea.getDescuentoMonto() != null ? linea.getDescuentoMonto() : BigDecimal.ZERO);
        dto.setSubtotalLinea(linea.getSubtotal());
        
        return dto;
    }

    public List<ProductoCajeroDTO> getProductosParaVenta(String busqueda, String categoria, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<Producto> productos;
        
        if (busqueda != null && !busqueda.trim().isEmpty()) {
            productos = productoRepository.findByNombreContainingIgnoreCase(busqueda, pageable).getContent();
        } else {
            productos = productoRepository.findAll(pageable).getContent();
        }
        
        return productos.stream()
            .map(this::convertToProductoCajeroDTO)
            .collect(Collectors.toList());
    }

    public ProductoCajeroDTO getProductoById(Long id) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isPresent()) {
            return convertToProductoCajeroDTO(productoOpt.get());
        }
        throw new RuntimeException("Producto no encontrado");
    }

    public ProductoCajeroDTO getProductoByCodigo(String codigo) {
        Optional<Producto> productoOpt = productoRepository.findByCodigo(codigo);
        if (productoOpt.isPresent()) {
            return convertToProductoCajeroDTO(productoOpt.get());
        }
        throw new RuntimeException("Producto no encontrado");
    }

    private ProductoCajeroDTO convertToProductoCajeroDTO(Producto producto) {
        ProductoCajeroDTO dto = new ProductoCajeroDTO();
        dto.setId(producto.getId());
        dto.setCodigo(producto.getCodigo());
        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        dto.setCategoria(producto.getTipo());
        dto.setPrecioVenta(producto.getPrecioVenta());
        dto.setCantidadDisponible(producto.getCantidadDisponible());
        dto.setDisponible(producto.getEstado() == Producto.EstadoProducto.DISPONIBLE);
        dto.setFotoURL(producto.getFotoURL());
        dto.setItbis(producto.getItbis());
        dto.setCantidadAlmacen(producto.getCantidadAlmacen());
        dto.setCantidadDanada(producto.getCantidadDanada());
        dto.setCantidadDevuelta(producto.getCantidadDevuelta());
        dto.setCantidadReservada(producto.getCantidadReservada());
        return dto;
    }

    public List<ClienteCajeroDTO> getClientes(String busqueda, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<Cliente> clientes;
        
        if (busqueda != null && !busqueda.trim().isEmpty()) {
            clientes = clienteRepository.findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(
                busqueda, busqueda, pageable).getContent();
        } else {
            clientes = clienteRepository.findAll(pageable).getContent();
        }
        
        return clientes.stream()
            .map(this::convertToClienteCajeroDTO)
            .collect(Collectors.toList());
    }

    public ClienteCajeroDTO getClienteByCedula(String cedula) {
        Optional<Cliente> clienteOpt = clienteRepository.findById(cedula);
        if (clienteOpt.isPresent()) {
            return convertToClienteCajeroDTO(clienteOpt.get());
        }
        throw new RuntimeException("Cliente no encontrado");
    }

    public List<SuplidorDTO> getSuplidores() {
        List<Suplidor> suplidores = suplidorRepository.findByActivoTrue();
        return suplidores.stream().map(suplidor -> 
            new SuplidorDTO(suplidor.getId(), suplidor.getNombre(), suplidor.getRNC())
        ).collect(Collectors.toList());
    }

    public ClienteCajeroDTO registrarClienteRapido(ClienteCajeroDTO clienteDTO) {
        Cliente cliente = new Cliente();
        cliente.setCedula(clienteDTO.getCedula());
        cliente.setNombre(clienteDTO.getNombre());
        cliente.setApellido(clienteDTO.getApellido());
        cliente.setTelefono(clienteDTO.getTelefono());
        cliente.setEmail(clienteDTO.getEmail());
        cliente.setDireccion(clienteDTO.getDireccion());
        
        Cliente nuevoCliente = clienteRepository.save(cliente);
        return convertToClienteCajeroDTO(nuevoCliente);
    }

    private ClienteCajeroDTO convertToClienteCajeroDTO(Cliente cliente) {
        ClienteCajeroDTO dto = new ClienteCajeroDTO();
        dto.setCedula(cliente.getCedula());
        dto.setNombre(cliente.getNombre());
        dto.setApellido(cliente.getApellido());
        dto.setTelefono(cliente.getTelefono());
        dto.setEmail(cliente.getEmail());
        dto.setDireccion(cliente.getDireccion());
        dto.setFechaRegistro(cliente.getFechaRegistro());
        
        return dto;
    }

    public CajaDTO abrirCaja(BigDecimal montoInicial) {
        if (cajaActual != null && !cajaActual.getCerrada()) {
            throw new RuntimeException("Ya hay una caja abierta");
        }
        
        cajaActual = new CajaDTO();
        cajaActual.setId(System.currentTimeMillis());
        cajaActual.setCajero("Usuario Actual");
        cajaActual.setFechaApertura(LocalDateTime.now());
        cajaActual.setMontoInicialEfectivo(montoInicial);
        cajaActual.setTotalVentasEfectivo(BigDecimal.ZERO);
        cajaActual.setTotalVentasTarjeta(BigDecimal.ZERO);
        cajaActual.setTotalVentasTransferencia(BigDecimal.ZERO);
        cajaActual.setTotalVentas(BigDecimal.ZERO);
        cajaActual.setTotalDevoluciones(BigDecimal.ZERO);
        cajaActual.setVentasNetas(BigDecimal.ZERO);
        cajaActual.setNumeroTransacciones(0);
        cajaActual.setCerrada(false);
        
        return cajaActual;
    }

    public CajaDTO cerrarCaja(BigDecimal montoEfectivoCierre, String observaciones) {
        if (cajaActual == null || cajaActual.getCerrada()) {
            throw new RuntimeException("No hay una caja abierta para cerrar");
        }
        
        cajaActual.setFechaCierre(LocalDateTime.now());
        cajaActual.setMontoCierreEfectivo(montoEfectivoCierre);
        cajaActual.setObservaciones(observaciones);
        cajaActual.setCerrada(true);
        
        BigDecimal efectivoEsperado = cajaActual.getEfectivoEsperado();
        BigDecimal diferencia = montoEfectivoCierre.subtract(efectivoEsperado);
        cajaActual.setDiferenciaCaja(diferencia);
        
        return cajaActual;
    }

    public CajaDTO getEstadoCajaActual() {
        return cajaActual;
    }

    public FacturaImprimibleDTO prepararFacturaParaImprimir(Long transaccionId) {
        Optional<Transaccion> transaccionOpt = transaccionRepository.findById(transaccionId);
        if (!transaccionOpt.isPresent()) {
            throw new RuntimeException("Transacción no encontrada");
        }
        
        Transaccion transaccion = transaccionOpt.get();
        FacturaImprimibleDTO factura = new FacturaImprimibleDTO();
        
        factura.setEmpresa(crearDatosEmpresa());
        factura.setFactura(crearDatosFactura(transaccion));
        factura.setCliente(crearDatosCliente(transaccion));
        factura.setLineas(crearLineasFactura(transaccion));
        factura.setResumen(crearResumenFactura(transaccion));
        
        return factura;
    }

    private FacturaImprimibleDTO.DatosEmpresa crearDatosEmpresa() {
        FacturaImprimibleDTO.DatosEmpresa empresa = new FacturaImprimibleDTO.DatosEmpresa();
        empresa.setNombre("Thelarte");
        empresa.setRnc("130-12345-6");
        empresa.setDireccion("Calle Principal #123, Santo Domingo");
        empresa.setTelefono("(809) 123-4567");
        empresa.setEmail("info@thelarte.com");
        return empresa;
    }

    private FacturaImprimibleDTO.DatosFactura crearDatosFactura(Transaccion transaccion) {
        FacturaImprimibleDTO.DatosFactura factura = new FacturaImprimibleDTO.DatosFactura();
        factura.setNumeroFactura(transaccion.getNumeroFactura());
        factura.setTipo("FACTURA DE VENTA");
        factura.setFecha(transaccion.getFecha());
        factura.setCajero("Cajero Actual");
        factura.setMetodoPago(transaccion.getMetodoPago());
        return factura;
    }

    private FacturaImprimibleDTO.DatosCliente crearDatosCliente(Transaccion transaccion) {
        FacturaImprimibleDTO.DatosCliente clienteDTO = new FacturaImprimibleDTO.DatosCliente();
        
        if (transaccion.getTipoContraparte() == Transaccion.TipoContraparte.CLIENTE) {
            Optional<Cliente> clienteOpt = clienteRepository.findById(transaccion.getContraparteId().toString());
            if (clienteOpt.isPresent()) {
                Cliente cliente = clienteOpt.get();
                clienteDTO.setCedula(cliente.getCedula());
                clienteDTO.setNombre(cliente.getNombre());
                clienteDTO.setApellido(cliente.getApellido());
            }
        }
        
        return clienteDTO;
    }

    private List<FacturaImprimibleDTO.LineaFacturaDTO> crearLineasFactura(Transaccion transaccion) {
        if (transaccion.getLineas() == null) {
            return new ArrayList<>();
        }
        
        return transaccion.getLineas().stream()
            .map(this::convertirLineaFactura)
            .collect(Collectors.toList());
    }

    private FacturaImprimibleDTO.LineaFacturaDTO convertirLineaFactura(LineaTransaccion linea) {
        FacturaImprimibleDTO.LineaFacturaDTO lineaDTO = new FacturaImprimibleDTO.LineaFacturaDTO();
        
        Optional<Producto> productoOpt = productoRepository.findById(linea.getProductoId());
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            lineaDTO.setCodigo(producto.getCodigo());
            lineaDTO.setDescripcion(producto.getNombre());
        }
        
        lineaDTO.setCantidad(linea.getCantidad());
        lineaDTO.setPrecioUnitario(linea.getPrecioUnitario());
        lineaDTO.setDescuento(linea.getDescuentoMonto() != null ? linea.getDescuentoMonto() : BigDecimal.ZERO);
        lineaDTO.setSubtotal(linea.getSubtotal());
        
        return lineaDTO;
    }

    private FacturaImprimibleDTO.ResumenFactura crearResumenFactura(Transaccion transaccion) {
        FacturaImprimibleDTO.ResumenFactura resumen = new FacturaImprimibleDTO.ResumenFactura();
        resumen.setSubtotal(transaccion.getSubtotal() != null ? transaccion.getSubtotal() : BigDecimal.ZERO);
        resumen.setTotalItbis(transaccion.getImpuestos() != null ? transaccion.getImpuestos() : BigDecimal.ZERO);
        resumen.setTotal(transaccion.getTotal());
        resumen.setMontoPagado(transaccion.getTotal());
        resumen.setCambio(BigDecimal.ZERO);
        return resumen;
    }

    public Map<String, Object> getReporteVentasDelDia(LocalDate fecha) {
        if (fecha == null) fecha = LocalDate.now();
        
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = inicio.plusDays(1);
        
        List<Transaccion> transacciones = transaccionRepository.findByFechaBetween(inicio, fin);
        
        Map<String, Object> reporte = new HashMap<>();
        reporte.put("fecha", fecha);
        reporte.put("totalTransacciones", transacciones.size());
        
        BigDecimal totalVentas = transacciones.stream()
            .filter(t -> t.getTipo() == Transaccion.TipoTransaccion.VENTA)
            .map(Transaccion::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        reporte.put("totalVentas", totalVentas);
        
        return reporte;
    }

    public List<Map<String, Object>> getProductosMasVendidos(LocalDate fechaDesde, LocalDate fechaHasta, int limite) {
        return new ArrayList<>();
    }

    public Map<String, Object> getConfiguracionCaja() {
        return new HashMap<>(configuracionCaja);
    }

    public void actualizarConfiguracionCaja(Map<String, Object> configuracion) {
        this.configuracionCaja.putAll(configuracion);
    }

    public CajeroTransaccionDTO crearTransaccion(CajeroTransaccionDTO transaccionDTO) {
        try {
            System.out.println("=== DEBUG: Creando transacci\u00f3n ===");
            System.out.println("Tipo: " + transaccionDTO.getTipoTransaccion());
            System.out.println("Cliente: " + transaccionDTO.getCliente());  
            System.out.println("Proveedor: " + transaccionDTO.getProveedor());
            System.out.println("Total: " + transaccionDTO.getTotal());
            System.out.println("L\u00edneas: " + (transaccionDTO.getLineas() != null ? transaccionDTO.getLineas().size() : "null"));
            
            // Crear nueva transacción basada en el DTO
            Transaccion transaccion = new Transaccion();
        transaccion.setTipo(Transaccion.TipoTransaccion.valueOf(transaccionDTO.getTipoTransaccion()));
        transaccion.setFecha(LocalDateTime.now());
        transaccion.setEstado(Transaccion.EstadoTransaccion.PENDIENTE);
        
        if (transaccionDTO.getCliente() != null && transaccionDTO.getCliente().getCedula() != null) {
            try {
                transaccion.setContraparteId(Long.valueOf(transaccionDTO.getCliente().getCedula()));
                transaccion.setTipoContraparte(Transaccion.TipoContraparte.CLIENTE);
                transaccion.setContraparteNombre(transaccionDTO.getCliente().getNombreCompleto());
            } catch (NumberFormatException e) {
                // Si la cédula no es numérica, usar hash code
                transaccion.setContraparteId((long) transaccionDTO.getCliente().getCedula().hashCode());
                transaccion.setTipoContraparte(Transaccion.TipoContraparte.CLIENTE);
                transaccion.setContraparteNombre(transaccionDTO.getCliente().getNombreCompleto());
            }
        } else if (transaccionDTO.getProveedor() != null) {
            // Si el proveedor no tiene ID, crearlo primero
            Long suplidorId = transaccionDTO.getProveedor().getId();
            
            if (suplidorId == null) {
                System.out.println("=== DEBUG: Creando nuevo suplidor ===");
                Suplidor nuevoSuplidor = new Suplidor();
                nuevoSuplidor.setNombre(transaccionDTO.getProveedor().getNombre());
                nuevoSuplidor.setRNC(transaccionDTO.getProveedor().getRnc() != null ? transaccionDTO.getProveedor().getRnc() : "");
                nuevoSuplidor.setEmail(transaccionDTO.getProveedor().getEmail());
                nuevoSuplidor.setDireccion(transaccionDTO.getProveedor().getDireccion());
                nuevoSuplidor.setCiudad(transaccionDTO.getProveedor().getCiudad());
                
                if (transaccionDTO.getProveedor().getTelefono() != null && !transaccionDTO.getProveedor().getTelefono().isEmpty()) {
                    nuevoSuplidor.setTelefonos(Arrays.asList(transaccionDTO.getProveedor().getTelefono()));
                }
                
                Suplidor suplidorGuardado = suplidorRepository.save(nuevoSuplidor);
                suplidorId = suplidorGuardado.getId();
                System.out.println("=== DEBUG: Suplidor creado con ID: " + suplidorId + " ===");
            }
            
            transaccion.setContraparteId(suplidorId);
            transaccion.setTipoContraparte(Transaccion.TipoContraparte.SUPLIDOR);
            transaccion.setContraparteNombre(transaccionDTO.getProveedor().getNombre());
        }
        
        transaccion.setMetodoPago(transaccionDTO.getMetodoPago());
        transaccion.setObservaciones(transaccionDTO.getObservaciones());
        transaccion.setSubtotal(transaccionDTO.getSubtotal());
        transaccion.setImpuestos(transaccionDTO.getImpuestos());
        transaccion.setTotal(transaccionDTO.getTotal());
        
            // Primero guardamos la transacción
            Transaccion nuevaTransaccion = transaccionRepository.save(transaccion);
            
            // Luego procesamos las líneas de transacción
            if (transaccionDTO.getLineas() != null && !transaccionDTO.getLineas().isEmpty()) {
                System.out.println("=== DEBUG: Procesando " + transaccionDTO.getLineas().size() + " líneas ===");
                List<LineaTransaccion> lineas = new ArrayList<>();
                
                for (CajeroTransaccionDTO.LineaTransaccionDTO lineaDTO : transaccionDTO.getLineas()) {
                    System.out.println("=== DEBUG: Procesando línea: " + lineaDTO.getNombreProducto() + " ===");
                    
                    // Si el producto no existe, crearlo
                    Long productoId = lineaDTO.getProductoId();
                    if (productoId == null) {
                        System.out.println("=== DEBUG: Creando nuevo producto: " + lineaDTO.getNombreProducto() + " ===");
                        // Aquí necesitarías crear el producto en el inventario
                        // Por ahora usaremos un ID temporal
                        productoId = -1L; // Marca que es un producto temporal
                    }
                    
                    LineaTransaccion linea = new LineaTransaccion();
                    linea.setTransaccion(nuevaTransaccion);
                    linea.setProductoId(productoId);
                    linea.setProductoNombre(lineaDTO.getNombreProducto());
                    linea.setCantidad(lineaDTO.getCantidad());
                    linea.setPrecioUnitario(lineaDTO.getPrecioUnitario());
                    linea.setSubtotal(lineaDTO.getSubtotalLinea());
                    
                    // Calcular totales
                    linea.calcularTotales();
                    lineas.add(linea);
                }
                
                // Asignar las líneas a la transacción
                nuevaTransaccion.setLineas(lineas);
                nuevaTransaccion = transaccionRepository.save(nuevaTransaccion);
                System.out.println("=== DEBUG: Transacción guardada con " + lineas.size() + " líneas ===");
            }
            System.out.println("=== DEBUG: Transacci\u00f3n guardada con ID: " + nuevaTransaccion.getId() + " ===");
            return convertToTransaccionDTO(nuevaTransaccion);
        } catch (Exception e) {
            System.err.println("=== ERROR: Creando transacci\u00f3n ===");
            e.printStackTrace();
            throw new RuntimeException("Error al crear transacci\u00f3n: " + e.getMessage(), e);
        }
    }

    public CajeroTransaccionDTO actualizarTransaccion(Long id, CajeroTransaccionDTO transaccionDTO) {
        Optional<Transaccion> transaccionOpt = transaccionRepository.findById(id);
        if (!transaccionOpt.isPresent()) {
            throw new RuntimeException("Transacción no encontrada");
        }
        
        Transaccion transaccion = transaccionOpt.get();
        transaccion.setMetodoPago(transaccionDTO.getMetodoPago());
        transaccion.setObservaciones(transaccionDTO.getObservaciones());
        
        Transaccion transaccionActualizada = transaccionRepository.save(transaccion);
        return convertToTransaccionDTO(transaccionActualizada);
    }

    public CajeroTransaccionDTO confirmarTransaccion(Long id) {
        Optional<Transaccion> transaccionOpt = transaccionRepository.findById(id);
        if (!transaccionOpt.isPresent()) {
            throw new RuntimeException("Transacción no encontrada");
        }
        
        Transaccion transaccion = transaccionOpt.get();
        transaccion.setEstado(Transaccion.EstadoTransaccion.CONFIRMADA);
        
        Transaccion transaccionConfirmada = transaccionRepository.save(transaccion);
        return convertToTransaccionDTO(transaccionConfirmada);
    }

    public CajeroTransaccionDTO cancelarTransaccion(Long id, String motivo) {
        Optional<Transaccion> transaccionOpt = transaccionRepository.findById(id);
        if (!transaccionOpt.isPresent()) {
            throw new RuntimeException("Transacción no encontrada");
        }
        
        Transaccion transaccion = transaccionOpt.get();
        transaccion.setEstado(Transaccion.EstadoTransaccion.CANCELADA);
        if (motivo != null && !motivo.isEmpty()) {
            String observacionesActuales = transaccion.getObservaciones() != null ? transaccion.getObservaciones() : "";
            transaccion.setObservaciones(observacionesActuales + " - Cancelada: " + motivo);
        }
        
        Transaccion transaccionCancelada = transaccionRepository.save(transaccion);
        return convertToTransaccionDTO(transaccionCancelada);
    }

    public void marcarFacturaComoImpresa(Long transaccionId) {
        Optional<Transaccion> transaccionOpt = transaccionRepository.findById(transaccionId);
        if (!transaccionOpt.isPresent()) {
            throw new RuntimeException("Transacción no encontrada");
        }
        
        Transaccion transaccion = transaccionOpt.get();
        String observacionesActuales = transaccion.getObservaciones() != null ? transaccion.getObservaciones() : "";
        transaccion.setObservaciones(observacionesActuales + " - Factura impresa en " + LocalDateTime.now());
        
        transaccionRepository.save(transaccion);
    }

    private CajeroTransaccionDTO convertToTransaccionDTO(Transaccion transaccion) {
        CajeroTransaccionDTO dto = new CajeroTransaccionDTO();
        dto.setId(transaccion.getId());
        dto.setTipoTransaccion(transaccion.getTipo().toString());
        dto.setFecha(transaccion.getFecha());
        dto.setEstado(transaccion.getEstado().toString());
        
        if (transaccion.getContraparteId() != null && transaccion.getTipoContraparte() == Transaccion.TipoContraparte.CLIENTE) {
            CajeroTransaccionDTO.ClienteInfoDTO clienteInfo = new CajeroTransaccionDTO.ClienteInfoDTO();
            clienteInfo.setCedula(transaccion.getContraparteId().toString());
            
            // Intentar cargar datos del cliente desde la base de datos
            try {
                Optional<Cliente> clienteOpt = clienteRepository.findById(transaccion.getContraparteId().toString());
                if (clienteOpt.isPresent()) {
                    Cliente cliente = clienteOpt.get();
                    clienteInfo.setNombre(cliente.getNombre());
                    clienteInfo.setApellido(cliente.getApellido());
                    clienteInfo.setTelefono(cliente.getTelefono());
                    clienteInfo.setEmail(cliente.getEmail());
                    clienteInfo.setDireccion(cliente.getDireccion());
                } else {
                    // Usar el nombre de la transacción si no se encuentra el cliente
                    String[] nombres = transaccion.getContraparteNombre() != null ? 
                            transaccion.getContraparteNombre().split(" ", 2) : new String[]{"", ""};
                    clienteInfo.setNombre(nombres.length > 0 ? nombres[0] : "");
                    clienteInfo.setApellido(nombres.length > 1 ? nombres[1] : "");
                }
            } catch (Exception e) {
                // En caso de error, usar datos básicos
                String[] nombres = transaccion.getContraparteNombre() != null ? 
                        transaccion.getContraparteNombre().split(" ", 2) : new String[]{"", ""};
                clienteInfo.setNombre(nombres.length > 0 ? nombres[0] : "");
                clienteInfo.setApellido(nombres.length > 1 ? nombres[1] : "");
            }
            
            dto.setCliente(clienteInfo);
        } else if (transaccion.getContraparteId() != null && transaccion.getTipoContraparte() == Transaccion.TipoContraparte.SUPLIDOR) {
            CajeroTransaccionDTO.SuplidorInfoDTO suplidorInfo = new CajeroTransaccionDTO.SuplidorInfoDTO();
            suplidorInfo.setId(transaccion.getContraparteId());
            
            // Intentar cargar datos del suplidor desde la base de datos
            try {
                Optional<Suplidor> suplidorOpt = suplidorRepository.findById(transaccion.getContraparteId());
                if (suplidorOpt.isPresent()) {
                    Suplidor suplidor = suplidorOpt.get();
                    suplidorInfo.setNombre(suplidor.getNombre());
                    suplidorInfo.setRnc(suplidor.getRNC());
                    if (suplidor.getTelefonos() != null && !suplidor.getTelefonos().isEmpty()) {
                        suplidorInfo.setTelefono(suplidor.getTelefonos().get(0));
                    }
                    suplidorInfo.setEmail(suplidor.getEmail());
                    suplidorInfo.setDireccion(suplidor.getDireccion());
                    suplidorInfo.setCiudad(suplidor.getCiudad());
                } else {
                    // Usar el nombre de la transacción si no se encuentra el suplidor
                    suplidorInfo.setNombre(transaccion.getContraparteNombre());
                }
            } catch (Exception e) {
                // En caso de error, usar datos básicos
                suplidorInfo.setNombre(transaccion.getContraparteNombre());
            }
            
            dto.setProveedor(suplidorInfo);
        }
        
        dto.setTotal(transaccion.getTotal());
        dto.setSubtotal(transaccion.getSubtotal());
        dto.setImpuestos(transaccion.getImpuestos());
        dto.setMetodoPago(transaccion.getMetodoPago());
        dto.setObservaciones(transaccion.getObservaciones());
        dto.setNumeroFactura(transaccion.getNumeroFactura());
        dto.setImpresa(false); // Por defecto no impresa
        
        // Convertir líneas de transacción
        if (transaccion.getLineas() != null && !transaccion.getLineas().isEmpty()) {
            List<CajeroTransaccionDTO.LineaTransaccionDTO> lineasDTO = new ArrayList<>();
            for (LineaTransaccion linea : transaccion.getLineas()) {
                CajeroTransaccionDTO.LineaTransaccionDTO lineaDTO = new CajeroTransaccionDTO.LineaTransaccionDTO();
                lineaDTO.setProductoId(linea.getProductoId());
                lineaDTO.setNombreProducto(linea.getProductoNombre());
                lineaDTO.setCantidad(linea.getCantidad());
                lineaDTO.setPrecioUnitario(linea.getPrecioUnitario());
                lineaDTO.setSubtotalLinea(linea.getSubtotal());
                lineaDTO.setDescuento(linea.getDescuento());
                lineasDTO.add(lineaDTO);
            }
            dto.setLineas(lineasDTO);
        }
        
        return dto;
    }
}