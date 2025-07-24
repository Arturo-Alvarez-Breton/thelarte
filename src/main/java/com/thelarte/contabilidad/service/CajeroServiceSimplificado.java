package com.thelarte.contabilidad.service;

import com.thelarte.contabilidad.dto.*;
import com.thelarte.transacciones.repository.TransaccionRepository;
import com.thelarte.inventory.repository.ProductoRepository;
import com.thelarte.user.repository.ClienteRepository;
import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.model.LineaTransaccion;
import com.thelarte.inventory.model.Producto;
import com.thelarte.user.model.Cliente;
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

    public List<CajeroTransaccionDTO> getTransaccionesFiltered(String tipo, String estado, 
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
            .map(this::convertToCajeroTransaccionDTO)
            .collect(Collectors.toList());
    }

    public CajeroTransaccionDTO getTransaccionById(Long id) {
        Optional<Transaccion> transaccionOpt = transaccionRepository.findById(id);
        if (transaccionOpt.isPresent()) {
            return convertToCajeroTransaccionDTO(transaccionOpt.get());
        }
        throw new RuntimeException("Transacción no encontrada");
    }

    private CajeroTransaccionDTO convertToCajeroTransaccionDTO(Transaccion transaccion) {
        CajeroTransaccionDTO dto = new CajeroTransaccionDTO();
        dto.setId(transaccion.getId());
        dto.setNumeroFactura(transaccion.getNumeroFactura());
        dto.setTipoTransaccion(transaccion.getTipo().toString());
        dto.setFecha(transaccion.getFecha());
        dto.setEstado(transaccion.getEstado().toString());
        
        if (transaccion.getTipoContraparte() == Transaccion.TipoContraparte.CLIENTE) {
            Optional<Cliente> clienteOpt = clienteRepository.findById(transaccion.getContraparteId().toString());
            if (clienteOpt.isPresent()) {
                Cliente cliente = clienteOpt.get();
                CajeroTransaccionDTO.ClienteInfoDTO clienteInfo = new CajeroTransaccionDTO.ClienteInfoDTO();
                clienteInfo.setCedula(cliente.getCedula());
                clienteInfo.setNombre(cliente.getNombre());
                clienteInfo.setApellido(cliente.getApellido());
                clienteInfo.setTelefono(cliente.getTelefono());
                clienteInfo.setEmail(cliente.getEmail());
                clienteInfo.setDireccion(cliente.getDireccion());
                dto.setCliente(clienteInfo);
            }
        }
        
        if (transaccion.getLineas() != null) {
            List<CajeroTransaccionDTO.LineaTransaccionDTO> lineas = transaccion.getLineas().stream()
                .map(this::convertToLineaTransaccionDTO)
                .collect(Collectors.toList());
            dto.setLineas(lineas);
        }
        
        dto.setSubtotal(transaccion.getSubtotal());
        dto.setImpuestos(transaccion.getImpuestos());
        dto.setTotal(transaccion.getTotal());
        dto.setMetodoPago(transaccion.getMetodoPago());
        dto.setNumeroTransaccionPago(transaccion.getNumeroTransaccion());
        dto.setObservaciones(transaccion.getObservaciones());
        
        return dto;
    }

    private CajeroTransaccionDTO.LineaTransaccionDTO convertToLineaTransaccionDTO(LineaTransaccion linea) {
        CajeroTransaccionDTO.LineaTransaccionDTO dto = new CajeroTransaccionDTO.LineaTransaccionDTO();
        
        Optional<Producto> productoOpt = productoRepository.findById(linea.getProductoId());
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            dto.setProductoId(producto.getId());
            dto.setNombreProducto(producto.getNombre());
            dto.setCodigoProducto(producto.getCodigo());
            dto.setCategoria(producto.getTipo());
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
        dto.setEsNuevo(producto.getEsNuevo());
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
        }
        
        transaccion.setMetodoPago(transaccionDTO.getMetodoPago());
        transaccion.setObservaciones(transaccionDTO.getObservaciones());
        
        Transaccion nuevaTransaccion = transaccionRepository.save(transaccion);
        return convertToTransaccionDTO(nuevaTransaccion);
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
        }
        
        dto.setTotal(transaccion.getTotal());
        dto.setSubtotal(transaccion.getSubtotal());
        dto.setImpuestos(transaccion.getImpuestos());
        dto.setMetodoPago(transaccion.getMetodoPago());
        dto.setObservaciones(transaccion.getObservaciones());
        dto.setNumeroFactura(transaccion.getNumeroFactura());
        dto.setImpresa(false); // Por defecto no impresa
        
        return dto;
    }
}