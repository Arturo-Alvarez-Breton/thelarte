package com.thelarte.transacciones.service;

import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.model.LineaTransaccion;
import com.thelarte.transacciones.repository.TransaccionRepository;
import com.thelarte.transacciones.util.PaymentMetadataValidator;
import com.thelarte.inventory.model.Producto;
import com.thelarte.inventory.model.Unidad;
import com.thelarte.inventory.repository.ProductoRepository;
import com.thelarte.inventory.service.UnidadService;
import com.thelarte.inventory.util.EstadoUnidad;
import com.thelarte.shared.exception.EntityNotFoundException;
import com.thelarte.auth.entity.User;
import com.thelarte.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TransaccionService {

    @Autowired
    private TransaccionRepository transaccionRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private PaymentMetadataValidator paymentMetadataValidator;

    @Autowired
    private UserService userService;

    @Autowired
    private UnidadService unidadService;

    public Transaccion crearTransaccion(Transaccion transaccion) {
        // Asignar vendedor automáticamente para transacciones de venta
        if (transaccion.getTipo() == Transaccion.TipoTransaccion.VENTA || 
            transaccion.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_VENTA) {
            if (transaccion.getVendedorId() == null) {
                try {
                    Long vendedorId = obtenerUsuarioEnSesion();
                    transaccion.setVendedorId(vendedorId);
                } catch (IllegalArgumentException e) {
                    // Si no se puede obtener el usuario de la sesión, lanzar un error más específico
                    throw new IllegalArgumentException("Las ventas requieren un vendedor asignado. " + e.getMessage());
                }
            }
        }
        
        validateTransactionBusinessRules(transaccion);
        validatePaymentMetadata(transaccion);
        procesarLineasTransaccion(transaccion);
        calcularTotalesTransaccion(transaccion);
        return transaccionRepository.save(transaccion);
    }

    public Transaccion crearCompra(Long suplidorId, String suplidorNombre, List<LineaTransaccion> lineas) {
        Transaccion compra = new Transaccion(
            Transaccion.TipoTransaccion.COMPRA,
            suplidorId,
            Transaccion.TipoContraparte.SUPLIDOR,
            suplidorNombre
        );
        
        lineas.forEach(linea -> linea.setTransaccion(compra));
        compra.setLineas(lineas);
        
        return crearTransaccion(compra);
    }

    public Transaccion crearVenta(Long clienteId, String clienteNombre, Long vendedorId, List<LineaTransaccion> lineas) {
        Transaccion venta = new Transaccion(
            Transaccion.TipoTransaccion.VENTA,
            clienteId,
            Transaccion.TipoContraparte.CLIENTE,
            clienteNombre
        );
        
        venta.setVendedorId(vendedorId);
        lineas.forEach(linea -> linea.setTransaccion(venta));
        venta.setLineas(lineas);
        
        return crearTransaccion(venta);
    }

    public Transaccion crearDevolucionCompra(Long suplidorId, String suplidorNombre, 
                                           List<LineaTransaccion> lineas, Long transaccionOriginalId) {
        Transaccion devolucion = new Transaccion(
            Transaccion.TipoTransaccion.DEVOLUCION_COMPRA,
            suplidorId,
            Transaccion.TipoContraparte.SUPLIDOR,
            suplidorNombre
        );
        
        devolucion.setTransaccionOrigenId(transaccionOriginalId);
        devolucion.setObservaciones("Devolución de compra original ID: " + transaccionOriginalId);
        lineas.forEach(linea -> linea.setTransaccion(devolucion));
        devolucion.setLineas(lineas);
        
        return crearTransaccion(devolucion);
    }

    public Transaccion crearDevolucionVenta(Long clienteId, String clienteNombre, 
                                          List<LineaTransaccion> lineas, Long transaccionOriginalId) {
        Transaccion devolucion = new Transaccion(
            Transaccion.TipoTransaccion.DEVOLUCION_VENTA,
            clienteId,
            Transaccion.TipoContraparte.CLIENTE,
            clienteNombre
        );
        
        devolucion.setTransaccionOrigenId(transaccionOriginalId);
        devolucion.setObservaciones("Devolución de venta original ID: " + transaccionOriginalId);
        lineas.forEach(linea -> linea.setTransaccion(devolucion));
        devolucion.setLineas(lineas);
        
        return crearTransaccion(devolucion);
    }

    @Transactional(readOnly = true)
    public Optional<Transaccion> obtenerPorId(Long id) {
        return transaccionRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerTodas() {
        return transaccionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerPorTipo(Transaccion.TipoTransaccion tipo) {
        return transaccionRepository.findByTipo(tipo);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerCompras() {
        return transaccionRepository.findByTipo(Transaccion.TipoTransaccion.COMPRA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentas() {
        return transaccionRepository.findByTipo(Transaccion.TipoTransaccion.VENTA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerDevolucionesCompra() {
        return transaccionRepository.findByTipo(Transaccion.TipoTransaccion.DEVOLUCION_COMPRA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerDevolucionesVenta() {
        return transaccionRepository.findByTipo(Transaccion.TipoTransaccion.DEVOLUCION_VENTA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerPorEstado(Transaccion.EstadoTransaccion estado) {
        return transaccionRepository.findByEstado(estado);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerComprasPorSuplidor(Long suplidorId) {
        return transaccionRepository.findComprasPorSuplidor(suplidorId);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentasPorCliente(Long clienteId) {
        return transaccionRepository.findVentasPorCliente(clienteId);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentasPorVendedor(Long vendedorId) {
        return transaccionRepository.findVentasPorVendedor(vendedorId);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.findByFechaBetween(fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerComprasEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.findComprasEnPeriodo(Transaccion.TipoTransaccion.COMPRA, fechaInicio, fechaFin);
    }

    public Transaccion actualizarEstado(Long id, Transaccion.EstadoTransaccion nuevoEstado) {
        Transaccion transaccion = transaccionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        
        transaccion.setEstado(nuevoEstado);
        
        if (nuevoEstado == Transaccion.EstadoTransaccion.COMPLETADA) {
            transaccion.setFechaEntregaReal(LocalDateTime.now());
        }
        
        return transaccionRepository.save(transaccion);
    }

    public Transaccion confirmarCompra(Long id) {
        return actualizarEstado(id, Transaccion.EstadoTransaccion.CONFIRMADA);
    }

    public Transaccion completarTransaccion(Long id) {
        return actualizarEstado(id, Transaccion.EstadoTransaccion.COMPLETADA);
    }

    public Transaccion cancelarTransaccion(Long id) {
        return actualizarEstado(id, Transaccion.EstadoTransaccion.CANCELADA);
    }

    public Transaccion marcarComoRecibida(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        
        if (transaccion.getTipo() != Transaccion.TipoTransaccion.COMPRA) {
            throw new IllegalStateException("Solo las compras pueden marcarse como recibidas");
        }
        
        transaccion.setEstado(Transaccion.EstadoTransaccion.RECIBIDA);
        transaccion.setFechaEntregaReal(LocalDateTime.now());
        
        // Crear unidades para cada producto en la compra
        for (LineaTransaccion linea : transaccion.getLineas()) {
            if (linea.getProductoId() != null) {
                for (int i = 0; i < linea.getCantidad(); i++) {
                    unidadService.registrarUnidad(linea.getProductoId(), EstadoUnidad.DISPONIBLE, true);
                }
            }
        }
        
        return transaccionRepository.save(transaccion);
    }

    public Transaccion marcarComoPagada(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        
        if (transaccion.getTipo() != Transaccion.TipoTransaccion.COMPRA) {
            throw new IllegalStateException("Solo las compras pueden marcarse como pagadas");
        }
        
        transaccion.setEstado(Transaccion.EstadoTransaccion.PAGADA);
        
        return transaccionRepository.save(transaccion);
    }

    public Transaccion marcarComoEntregada(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        
        if (transaccion.getTipo() != Transaccion.TipoTransaccion.VENTA) {
            throw new IllegalStateException("Solo las ventas pueden marcarse como entregadas");
        }
        
        transaccion.setEstado(Transaccion.EstadoTransaccion.ENTREGADA);
        transaccion.setFechaEntregaReal(LocalDateTime.now());
        
        return transaccionRepository.save(transaccion);
    }

    public Transaccion marcarComoCobrada(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        
        if (transaccion.getTipo() != Transaccion.TipoTransaccion.VENTA) {
            throw new IllegalStateException("Solo las ventas pueden marcarse como cobradas");
        }
        
        transaccion.setEstado(Transaccion.EstadoTransaccion.COBRADA);
        
        return transaccionRepository.save(transaccion);
    }

    public Transaccion facturarVenta(Long id, String numeroFactura) {
        Transaccion transaccion = transaccionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        
        if (transaccion.getTipo() != Transaccion.TipoTransaccion.VENTA) {
            throw new IllegalStateException("Solo las ventas pueden facturarse");
        }
        
        transaccion.setEstado(Transaccion.EstadoTransaccion.FACTURADA);
        transaccion.setNumeroFactura(numeroFactura);
        
        return transaccionRepository.save(transaccion);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerComprasPendientesRecepcion() {
        return transaccionRepository.findByTipoAndEstado(
            Transaccion.TipoTransaccion.COMPRA, 
            Transaccion.EstadoTransaccion.CONFIRMADA
        );
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerComprasPendientesPago() {
        return transaccionRepository.findByTipoAndEstado(
            Transaccion.TipoTransaccion.COMPRA, 
            Transaccion.EstadoTransaccion.RECIBIDA
        );
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentasPendientesEntrega() {
        return transaccionRepository.findByTipoAndEstado(
            Transaccion.TipoTransaccion.VENTA, 
            Transaccion.EstadoTransaccion.CONFIRMADA
        );
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentasPendientesCobro() {
        return transaccionRepository.findByTipoAndEstado(
            Transaccion.TipoTransaccion.VENTA, 
            Transaccion.EstadoTransaccion.ENTREGADA
        );
    }

    /**
     * Determines if a transaction can be edited based on its current state
     * Only PENDIENTE and CONFIRMADA transactions can be edited
     */
    public boolean canEditTransaction(Transaccion transaccion) {
        return transaccion.getEstado() == Transaccion.EstadoTransaccion.PENDIENTE ||
               transaccion.getEstado() == Transaccion.EstadoTransaccion.CONFIRMADA;
    }

    /**
     * Updates a transaction with validation for editable states
     */
    public Transaccion actualizarTransaccion(Long id, Transaccion transaccion) {
        Transaccion existingTransaction = transaccionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Transacción no encontrada"));
        
        // Check if the transaction can be edited
        if (!canEditTransaction(existingTransaction)) {
            throw new IllegalStateException("No se puede editar una transacción con estado: " + existingTransaction.getEstado());
        }
        
        // Preserve the original ID
        transaccion.setId(id);
        
        // Process transaction lines
        procesarLineasTransaccion(transaccion);
        
        // Recalculate totals
        calcularTotalesTransaccion(transaccion);
        
        // Save the updated transaction
        return transaccionRepository.save(transaccion);
    }

    public void eliminarTransaccion(Long id) {
        if (!transaccionRepository.existsById(id)) {
            throw new EntityNotFoundException("Transacción no encontrada con ID: " + id);
        }
        transaccionRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Double obtenerTotalComprasEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.sumTotalPorTipoEnPeriodo(Transaccion.TipoTransaccion.COMPRA, fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public Double obtenerTotalVentasEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.sumTotalPorTipoEnPeriodo(Transaccion.TipoTransaccion.VENTA, fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public Double obtenerTotalDevolucionesCompraEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.sumTotalPorTipoEnPeriodo(Transaccion.TipoTransaccion.DEVOLUCION_COMPRA, fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public Double obtenerTotalDevolucionesVentaEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.sumTotalPorTipoEnPeriodo(Transaccion.TipoTransaccion.DEVOLUCION_VENTA, fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerTransaccionesPorOrigen(Long transaccionOrigenId) {
        return transaccionRepository.findByTransaccionOrigenId(transaccionOrigenId);
    }

    @Transactional(readOnly = true)
    public long contarTransaccionesPorTipoYEstado(Transaccion.TipoTransaccion tipo, Transaccion.EstadoTransaccion estado) {
        return transaccionRepository.countByTipoAndEstado(tipo, estado);
    }

    private void calcularTotalesTransaccion(Transaccion transaccion) {
        if (transaccion.getLineas() == null || transaccion.getLineas().isEmpty()) {
            transaccion.setSubtotal(BigDecimal.ZERO);
            transaccion.setImpuestos(BigDecimal.ZERO);
            transaccion.setTotal(BigDecimal.ZERO);
            return;
        }

        BigDecimal subtotal = transaccion.getLineas().stream()
            .map(LineaTransaccion::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal impuestos = transaccion.getLineas().stream()
            .map(linea -> linea.getImpuestoMonto() != null ? linea.getImpuestoMonto() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal total = transaccion.getLineas().stream()
            .map(LineaTransaccion::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        transaccion.setSubtotal(subtotal);
        transaccion.setImpuestos(impuestos);
        transaccion.setTotal(total);
    }

    private void procesarLineasTransaccion(Transaccion transaccion) {
        if (transaccion.getLineas() != null) {
            for (LineaTransaccion linea : transaccion.getLineas()) {
                // Si el productoId es null, crear un nuevo producto (solo para compras)
                if (linea.getProductoId() == null && linea.getProductoNombre() != null) {
                    if (transaccion.getTipo() == Transaccion.TipoTransaccion.COMPRA) {
                        Producto nuevoProducto = new Producto();
                        nuevoProducto.setNombre(linea.getProductoNombre());
                        nuevoProducto.setTipo("Mueble"); // Tipo por defecto para compras
                        nuevoProducto.setDescripcion("Mueble nuevo agregado por compra");
                        nuevoProducto.setItbis(18.0f); // 18% de ITBIS por defecto
                        nuevoProducto.setPrecioCompra(linea.getPrecioUnitario());
                        nuevoProducto.setPrecioVenta(BigDecimal.valueOf(0.0)); // Precio de venta no se establece en compras
                        nuevoProducto.setFotoURL("");
                        nuevoProducto.setEsNuevo(true);
                        nuevoProducto.setCantidadDisponible(linea.getCantidad());
                        
                        // Guardar el producto en la base de datos
                        nuevoProducto = productoRepository.save(nuevoProducto);
                        
                        // Asignar el ID generado a la línea de transacción
                        linea.setProductoId(nuevoProducto.getId());
                    } else {
                        throw new IllegalArgumentException("Solo se pueden crear productos nuevos en compras");
                    }
                } else if (linea.getProductoId() != null) {
                    // Para productos existentes, validar disponibilidad en ventas
                    if (transaccion.getTipo() == Transaccion.TipoTransaccion.VENTA) {
                        Producto producto = productoRepository.findById(linea.getProductoId())
                            .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + linea.getProductoId()));
                        
                        // Actualizar cantidades basadas en unidades reales
                        producto.actualizarEstadoPorUnidades();
                        
                        if (producto.getCantidadDisponible() < linea.getCantidad()) {
                            throw new IllegalArgumentException("Stock insuficiente para el producto: " + producto.getNombre());
                        }
                        
                        // Reservar unidades específicas
                        List<Unidad> unidadesDisponibles = producto.getUnidades().stream()
                            .filter(u -> u.getEstado() == EstadoUnidad.DISPONIBLE)
                            .limit(linea.getCantidad())
                            .collect(Collectors.toList());
                        
                        for (Unidad unidad : unidadesDisponibles) {
                            unidad.setEstado(EstadoUnidad.RESERVADO);
                        }
                        
                        // Actualizar estado del producto
                        producto.actualizarEstadoPorUnidades();
                        
                        productoRepository.save(producto);
                    }
                }
            }
        }
    }

    private void validateTransactionBusinessRules(Transaccion transaccion) {
        if (transaccion.getTipo() == null) {
            throw new IllegalArgumentException("El tipo de transacción es obligatorio");
        }
        
        if (transaccion.getTipoContraparte() == null) {
            throw new IllegalArgumentException("El tipo de contraparte es obligatorio");
        }
        
        // Validar reglas de negocio específicas por tipo de transacción
        switch (transaccion.getTipo()) {
            case COMPRA:
            case DEVOLUCION_COMPRA:
                if (transaccion.getTipoContraparte() != Transaccion.TipoContraparte.SUPLIDOR) {
                    throw new IllegalArgumentException("Las compras solo pueden realizarse con suplidores");
                }
                break;
            case VENTA:
            case DEVOLUCION_VENTA:
                if (transaccion.getTipoContraparte() != Transaccion.TipoContraparte.CLIENTE) {
                    throw new IllegalArgumentException("Las ventas solo pueden realizarse con clientes");
                }
                if (transaccion.getVendedorId() == null) {
                    throw new IllegalArgumentException("Las ventas requieren un vendedor asignado");
                }
                break;
        }
    }

    private void validatePaymentMetadata(Transaccion transaccion) {
        if (transaccion.getMetodoPago() != null) {
            PaymentMetadataValidator.ValidationResult validationResult = 
                paymentMetadataValidator.validatePaymentMetadata(
                    transaccion.getMetodoPago(), 
                    transaccion.getMetadatosPago()
                );
            
            if (!validationResult.isValid()) {
                throw new IllegalArgumentException("Error en metadatos de pago: " + 
                    String.join(", ", validationResult.getErrors()));
            }
        }
    }

    private Long obtenerUsuarioEnSesion() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            if (username != null && !username.equals("anonymousUser")) {
                User user = userService.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + username));
                return user.getId();
            }
        }
        throw new IllegalArgumentException("No hay un usuario autenticado en la sesión");
    }
}