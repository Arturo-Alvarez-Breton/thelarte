package com.thelarte.contabilidad.service;

import com.thelarte.contabilidad.dto.*;
import com.thelarte.inventory.service.ProductoService;
import com.thelarte.transacciones.service.TransaccionService;
import com.thelarte.user.service.ClienteService;
import com.thelarte.inventory.model.Producto;
import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.user.model.Cliente;
import com.thelarte.transacciones.model.LineaTransaccion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CajeroService {

    @Autowired
    private TransaccionService transaccionService;
    
    @Autowired
    private ProductoService productoService;
    
    @Autowired
    private ClienteService clienteService;
    
    @Autowired
    private ImpresionService impresionService;
    
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
        
        LocalDate hoy = LocalDate.now();
        List<Transaccion> transaccionesHoy = transaccionService.getTransaccionesByFecha(hoy, hoy);
        
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
        LocalDate hoy = LocalDate.now();
        List<Transaccion> transacciones = transaccionService.getTransaccionesByFecha(hoy, hoy);
        
        return transacciones.stream()
            .limit(10)
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
        LocalDate hoy = LocalDate.now();
        return getProductosMasVendidos(hoy, hoy, 5).stream()
            .map(this::convertToProductoMasVendido)
            .collect(Collectors.toList());
    }

    private DashboardCajeroDTO.ProductoMasVendidoDTO convertToProductoMasVendido(Map<String, Object> producto) {
        DashboardCajeroDTO.ProductoMasVendidoDTO dto = new DashboardCajeroDTO.ProductoMasVendidoDTO();
        dto.setProductoId((Long) producto.get("productoId"));
        dto.setNombreProducto((String) producto.get("nombreProducto"));
        dto.setCantidadVendida((Integer) producto.get("cantidadVendida"));
        dto.setTotalVendido((BigDecimal) producto.get("totalVendido"));
        dto.setCategoria((String) producto.get("categoria"));
        return dto;
    }

    public List<CajeroTransaccionDTO> getTransaccionesFiltered(String tipo, String estado, 
            LocalDate fechaDesde, LocalDate fechaHasta, int page, int size) {
        
        List<Transaccion> transacciones = transaccionService.getTransaccionesFiltered(
            tipo, estado, fechaDesde, fechaHasta, page, size);
        
        return transacciones.stream()
            .map(this::convertToCajeroTransaccionDTO)
            .collect(Collectors.toList());
    }

    public CajeroTransaccionDTO getTransaccionById(Long id) {
        Transaccion transaccion = transaccionService.getTransaccionById(id);
        return convertToCajeroTransaccionDTO(transaccion);
    }

    private CajeroTransaccionDTO convertToCajeroTransaccionDTO(Transaccion transaccion) {
        CajeroTransaccionDTO dto = new CajeroTransaccionDTO();
        dto.setId(transaccion.getId());
        dto.setNumeroFactura(transaccion.getNumeroFactura());
        dto.setTipoTransaccion(transaccion.getTipo().toString());
        dto.setFecha(transaccion.getFecha());
        dto.setEstado(transaccion.getEstado().toString());
        
        if (transaccion.getTipoContraparte() == Transaccion.TipoContraparte.CLIENTE) {
            Cliente cliente = clienteService.getClienteByCedula(transaccion.getContraparteId().toString());
            if (cliente != null) {
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
        
        Producto producto = productoService.getProductoById(linea.getProductoId());
        if (producto != null) {
            dto.setProductoId(producto.getId());
            dto.setNombreProducto(producto.getNombre());
            dto.setCodigoProducto(producto.getCodigo());
            dto.setCategoria(producto.getTipo());
        }
        
        dto.setCantidad(linea.getCantidad());
        dto.setPrecioUnitario(linea.getPrecioUnitario());
        dto.setDescuento(linea.getDescuento());
        dto.setSubtotalLinea(linea.getSubtotal());
        
        return dto;
    }

    public CajeroTransaccionDTO crearTransaccion(CajeroTransaccionDTO transaccionDTO) {
        if (cajaActual == null || cajaActual.getCerrada()) {
            throw new RuntimeException("La caja debe estar abierta para crear transacciones");
        }
        
        Transaccion transaccion = convertToTransaccion(transaccionDTO);
        Transaccion nuevaTransaccion = transaccionService.crearTransaccion(transaccion);
        
        return convertToCajeroTransaccionDTO(nuevaTransaccion);
    }

    public CajeroTransaccionDTO actualizarTransaccion(Long id, CajeroTransaccionDTO transaccionDTO) {
        Transaccion transaccionExistente = transaccionService.getTransaccionById(id);
        
        if (!transaccionExistente.getEstado().equals(Transaccion.EstadoTransaccion.PENDIENTE)) {
            throw new RuntimeException("Solo se pueden modificar transacciones pendientes");
        }
        
        Transaccion transaccionActualizada = convertToTransaccion(transaccionDTO);
        transaccionActualizada.setId(id);
        
        Transaccion resultado = transaccionService.actualizarTransaccion(id, transaccionActualizada);
        return convertToCajeroTransaccionDTO(resultado);
    }

    public CajeroTransaccionDTO confirmarTransaccion(Long id) {
        Transaccion transaccion = transaccionService.confirmarTransaccion(id);
        
        if (cajaActual != null && !cajaActual.getCerrada()) {
            actualizarTotalesCaja(transaccion);
        }
        
        return convertToCajeroTransaccionDTO(transaccion);
    }

    public CajeroTransaccionDTO cancelarTransaccion(Long id, String motivo) {
        Transaccion transaccion = transaccionService.cancelarTransaccion(id, motivo);
        return convertToCajeroTransaccionDTO(transaccion);
    }

    private Transaccion convertToTransaccion(CajeroTransaccionDTO dto) {
        return null;
    }

    private void actualizarTotalesCaja(Transaccion transaccion) {
        if (cajaActual == null) return;
        
        String metodoPago = transaccion.getMetodoPago();
        BigDecimal total = transaccion.getTotal();
        
        if ("EFECTIVO".equals(metodoPago)) {
            BigDecimal actual = cajaActual.getTotalVentasEfectivo() != null ? cajaActual.getTotalVentasEfectivo() : BigDecimal.ZERO;
            cajaActual.setTotalVentasEfectivo(actual.add(total));
        } else if ("TARJETA".equals(metodoPago)) {
            BigDecimal actual = cajaActual.getTotalVentasTarjeta() != null ? cajaActual.getTotalVentasTarjeta() : BigDecimal.ZERO;
            cajaActual.setTotalVentasTarjeta(actual.add(total));
        } else if ("TRANSFERENCIA".equals(metodoPago)) {
            BigDecimal actual = cajaActual.getTotalVentasTransferencia() != null ? cajaActual.getTotalVentasTransferencia() : BigDecimal.ZERO;
            cajaActual.setTotalVentasTransferencia(actual.add(total));
        }
        
        BigDecimal totalVentas = BigDecimal.ZERO;
        if (cajaActual.getTotalVentasEfectivo() != null) totalVentas = totalVentas.add(cajaActual.getTotalVentasEfectivo());
        if (cajaActual.getTotalVentasTarjeta() != null) totalVentas = totalVentas.add(cajaActual.getTotalVentasTarjeta());
        if (cajaActual.getTotalVentasTransferencia() != null) totalVentas = totalVentas.add(cajaActual.getTotalVentasTransferencia());
        
        cajaActual.setTotalVentas(totalVentas);
        
        Integer transacciones = cajaActual.getNumeroTransacciones() != null ? cajaActual.getNumeroTransacciones() : 0;
        cajaActual.setNumeroTransacciones(transacciones + 1);
    }

    public List<ProductoCajeroDTO> getProductosParaVenta(String busqueda, String categoria, int page, int size) {
        List<Producto> productos = productoService.getProductosDisponibles(busqueda, categoria, page, size);
        
        return productos.stream()
            .map(this::convertToProductoCajeroDTO)
            .collect(Collectors.toList());
    }

    public ProductoCajeroDTO getProductoById(Long id) {
        Producto producto = productoService.getProductoById(id);
        return convertToProductoCajeroDTO(producto);
    }

    public ProductoCajeroDTO getProductoByCodigo(String codigo) {
        Producto producto = productoService.getProductoByCodigo(codigo);
        return convertToProductoCajeroDTO(producto);
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
        List<Cliente> clientes = clienteService.getClientesFiltered(busqueda, page, size);
        
        return clientes.stream()
            .map(this::convertToClienteCajeroDTO)
            .collect(Collectors.toList());
    }

    public ClienteCajeroDTO getClienteByCedula(String cedula) {
        Cliente cliente = clienteService.getClienteByCedula(cedula);
        return convertToClienteCajeroDTO(cliente);
    }

    public ClienteCajeroDTO registrarClienteRapido(ClienteCajeroDTO clienteDTO) {
        Cliente cliente = new Cliente();
        cliente.setCedula(clienteDTO.getCedula());
        cliente.setNombre(clienteDTO.getNombre());
        cliente.setApellido(clienteDTO.getApellido());
        cliente.setTelefono(clienteDTO.getTelefono());
        cliente.setEmail(clienteDTO.getEmail());
        cliente.setDireccion(clienteDTO.getDireccion());
        
        Cliente nuevoCliente = clienteService.crearCliente(cliente);
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
        return impresionService.prepararFactura(transaccionId);
    }

    public void marcarFacturaComoImpresa(Long transaccionId) {
        transaccionService.marcarComoImpresa(transaccionId);
    }

    public Map<String, Object> getReporteVentasDelDia(LocalDate fecha) {
        if (fecha == null) fecha = LocalDate.now();
        
        List<Transaccion> transacciones = transaccionService.getTransaccionesByFecha(fecha, fecha);
        
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
        if (fechaDesde == null) fechaDesde = LocalDate.now().minusDays(30);
        if (fechaHasta == null) fechaHasta = LocalDate.now();
        
        List<Map<String, Object>> productos = new ArrayList<>();
        
        return productos;
    }

    public Map<String, Object> getConfiguracionCaja() {
        return new HashMap<>(configuracionCaja);
    }

    public void actualizarConfiguracionCaja(Map<String, Object> configuracion) {
        this.configuracionCaja.putAll(configuracion);
    }
}