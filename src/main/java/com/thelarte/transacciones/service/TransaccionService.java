package com.thelarte.transacciones.service;

import com.thelarte.inventory.repository.UnidadRepository;
import com.thelarte.transacciones.dto.LineaTransaccionDTO;
import com.thelarte.transacciones.dto.TransaccionDTO;
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

    @Autowired
    private UnidadRepository unidadRepository;

    public Transaccion crearTransaccion(Transaccion transaccion) {
        // Asignar la transacción a cada línea para que se guarde el transaccion_id
        if (transaccion.getLineas() != null) {
            for (LineaTransaccion linea : transaccion.getLineas()) {
                linea.setTransaccion(transaccion);
            }
        }

        // Asignar vendedor automáticamente para transacciones de venta
        if (transaccion.getTipo() == Transaccion.TipoTransaccion.VENTA ||
                transaccion.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_VENTA) {
            if (transaccion.getVendedorId() == null) {
                try {
                    Long vendedorId = obtenerUsuarioEnSesion();
                    transaccion.setVendedorId(vendedorId);
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Las ventas requieren un vendedor asignado. " + e.getMessage());
                }
            }
        }

        validateTransactionBusinessRules(transaccion);
        validatePaymentMetadata(transaccion);
        procesarLineasTransaccion(transaccion);
        calcularTotalesTransaccion(transaccion);

        // === LOGICA PARA DEVOLUCIONES ===
        if (transaccion.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_COMPRA ||
                transaccion.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_VENTA) {

            if (transaccion.getTransaccionOrigenId() == null) {
                throw new IllegalArgumentException("La devolución requiere el ID de la transacción original");
            }

            for (LineaTransaccion linea : transaccion.getLineas()) {
                // Busca las unidades asociadas a la transacción original y producto
                List<Unidad> unidadesOriginales = unidadRepository.findByTransaccionOrigenIdAndProductoId(
                        transaccion.getTransaccionOrigenId(),
                        linea.getProductoId()
                );
                int cantidadADevolver = linea.getCantidad();
                int count = 0;

                for (Unidad unidad : unidadesOriginales) {
                    if (count >= cantidadADevolver) break;

                    // Solo unidades que aún no han sido devueltas
                    if (
                            transaccion.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_COMPRA &&
                                    (unidad.getEstado() == EstadoUnidad.DISPONIBLE || unidad.getEstado() == EstadoUnidad.RESERVADO)
                    ) {
                        unidad.setEstado(EstadoUnidad.DEVUELTO_COMPRA);
                        unidadRepository.save(unidad);
                        count++;
                    } else if (
                            transaccion.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_VENTA &&
                                    (unidad.getEstado() == EstadoUnidad.VENDIDO || unidad.getEstado() == EstadoUnidad.RESERVADO)
                    ) {
                        unidad.setEstado(EstadoUnidad.DEVUELTO_VENTA);
                        unidadRepository.save(unidad);
                        count++;
                    }
                }
            }

            // === MARCAR TRANSACCION ORIGINAL COMO CANCELADA ===
            Optional<Transaccion> transaccionOriginalOpt = transaccionRepository.findById(transaccion.getTransaccionOrigenId());
            if (transaccionOriginalOpt.isPresent()) {
                Transaccion transaccionOriginal = transaccionOriginalOpt.get();
                transaccionOriginal.setEstado(Transaccion.EstadoTransaccion.CANCELADA);
                transaccionRepository.save(transaccionOriginal);
            }
        }

        return transaccionRepository.save(transaccion);
    }

    public Transaccion actualizarTransaccion(Long id, Transaccion transaccion) {
        Transaccion existingTransaction = transaccionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transacción no encontrada"));

        if (!canEditTransaction(existingTransaction)) {
            throw new IllegalStateException("No se puede editar una transacción con estado: " + existingTransaction.getEstado());
        }

        // Actualiza campos principales
        existingTransaction.setTipo(transaccion.getTipo());
        existingTransaction.setFecha(transaccion.getFecha());
        existingTransaction.setContraparteId(transaccion.getContraparteId());
        existingTransaction.setTipoContraparte(transaccion.getTipoContraparte());
        existingTransaction.setContraparteNombre(transaccion.getContraparteNombre());
        existingTransaction.setNumeroFactura(transaccion.getNumeroFactura());
        existingTransaction.setObservaciones(transaccion.getObservaciones());
        existingTransaction.setSubtotal(transaccion.getSubtotal());
        existingTransaction.setImpuestos(transaccion.getImpuestos());
        existingTransaction.setTotal(transaccion.getTotal());
        existingTransaction.setEstado(transaccion.getEstado());
        existingTransaction.setVendedorId(transaccion.getVendedorId());
        existingTransaction.setDireccionEntrega(transaccion.getDireccionEntrega());
        existingTransaction.setCondicionesPago(transaccion.getCondicionesPago());
        existingTransaction.setMetodoPago(transaccion.getMetodoPago());
        existingTransaction.setMetadatosPago(transaccion.getMetadatosPago());
        existingTransaction.setTransaccionOrigenId(transaccion.getTransaccionOrigenId());
        existingTransaction.setNumeroReferencia(transaccion.getNumeroReferencia());
        existingTransaction.setNumeroOrdenCompra(transaccion.getNumeroOrdenCompra());
        existingTransaction.setFechaEntregaEsperada(transaccion.getFechaEntregaEsperada());
        existingTransaction.setFechaEntregaReal(transaccion.getFechaEntregaReal());
        existingTransaction.setNumeroTransaccion(transaccion.getNumeroTransaccion());

        // Elimina las líneas viejas
        if (existingTransaction.getLineas() != null) {
            existingTransaction.getLineas().clear();
        }

        // Asocia las nuevas líneas
        if (transaccion.getLineas() != null) {
            for (LineaTransaccion linea : transaccion.getLineas()) {
                linea.setTransaccion(existingTransaction);
            }
            existingTransaction.getLineas().addAll(transaccion.getLineas());
        }

        validateTransactionBusinessRules(existingTransaction);
        validatePaymentMetadata(existingTransaction);
        procesarLineasTransaccion(existingTransaction);
        calcularTotalesTransaccion(existingTransaction);

        return transaccionRepository.save(existingTransaction);
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
        return transaccionRepository.findByDeletedFalse();
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerPorTipo(Transaccion.TipoTransaccion tipo) {
        return transaccionRepository.findByTipoAndDeletedFalse(tipo);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerCompras() {
        return transaccionRepository.findByTipoAndDeletedFalse(Transaccion.TipoTransaccion.COMPRA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentas() {
        return transaccionRepository.findByTipoAndDeletedFalse(Transaccion.TipoTransaccion.VENTA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerDevolucionesCompra() {
        return transaccionRepository.findByTipoAndDeletedFalse(Transaccion.TipoTransaccion.DEVOLUCION_COMPRA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerDevolucionesVenta() {
        return transaccionRepository.findByTipoAndDeletedFalse(Transaccion.TipoTransaccion.DEVOLUCION_VENTA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerPorEstado(Transaccion.EstadoTransaccion estado) {
        return transaccionRepository.findByEstadoAndDeletedFalse(estado);
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

        for (LineaTransaccion linea : transaccion.getLineas()) {
            if (linea.getProductoId() != null) {
                for (int i = 0; i < linea.getCantidad(); i++) {
                    unidadService.registrarUnidad(linea.getProductoId(), EstadoUnidad.DISPONIBLE, true, transaccion.getId());
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
    public List<Transaccion> obtenerComprasPendientes() {
        return transaccionRepository.findByTipoAndEstado(
                Transaccion.TipoTransaccion.COMPRA,
                Transaccion.EstadoTransaccion.PENDIENTE
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

    public boolean canEditTransaction(Transaccion transaccion) {
        return transaccion.getEstado() == Transaccion.EstadoTransaccion.PENDIENTE ||
                transaccion.getEstado() == Transaccion.EstadoTransaccion.CONFIRMADA;
    }

    public void eliminarTransaccion(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        
        if (transaccion.isDeleted()) {
            throw new IllegalStateException("La transacción ya está eliminada");
        }
        
        transaccion.setDeleted(true);
        transaccionRepository.save(transaccion);
    }
    
    public void restaurarTransaccion(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        
        if (!transaccion.isDeleted()) {
            throw new IllegalStateException("La transacción no está eliminada");
        }
        
        transaccion.setDeleted(false);
        transaccionRepository.save(transaccion);
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
        return transaccionRepository.findByTransaccionOrigenIdAndDeletedFalse(transaccionOrigenId);
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
                if (transaccion.getTipo() == Transaccion.TipoTransaccion.COMPRA) {
                    if (linea.getProductoId() == null && linea.getProductoNombre() != null) {
                        // Producto nuevo: crea el producto y las unidades
                        Producto nuevoProducto = new Producto();
                        nuevoProducto.setNombre(linea.getProductoNombre());
                        nuevoProducto.setTipo("Mueble");
                        nuevoProducto.setDescripcion("Mueble nuevo agregado por compra");
                        nuevoProducto.setItbis(18.0f);
                        nuevoProducto.setPrecioCompra(linea.getPrecioUnitario());
                        nuevoProducto.setPrecioVenta(linea.getPrecioUnitario()); // Usar el precio del frontend
                        nuevoProducto.setFotoURL("");
                        nuevoProducto.setEsNuevo(true);
                        nuevoProducto.setCantidadDisponible(linea.getCantidad());
                        nuevoProducto = productoRepository.save(nuevoProducto);

                        for (int i = 0; i < linea.getCantidad(); i++) {
                            unidadService.registrarUnidad(nuevoProducto.getId(), EstadoUnidad.DISPONIBLE, false, transaccion.getId());
                        }

                        linea.setProductoId(nuevoProducto.getId());
                        linea.setPrecioUnitario(nuevoProducto.getPrecioVenta()); // Asegura que la línea tenga el precio
                    } else if (linea.getProductoId() != null) {
                        Producto productoExistente = productoRepository.findById(linea.getProductoId())
                                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + linea.getProductoId()));

                        for (int i = 0; i < linea.getCantidad(); i++) {
                            unidadService.registrarUnidad(productoExistente.getId(), EstadoUnidad.DISPONIBLE, false, transaccion.getId());
                        }
                        productoExistente.setCantidadDisponible(productoExistente.getCantidadDisponible() + linea.getCantidad());
                        productoRepository.save(productoExistente);
                    }
                } else if (transaccion.getTipo() == Transaccion.TipoTransaccion.VENTA && linea.getProductoId() != null) {
                    Producto producto = productoRepository.findById(linea.getProductoId())
                            .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + linea.getProductoId()));

                    producto.actualizarEstadoPorUnidades();

                    if (producto.getCantidadDisponible() < linea.getCantidad()) {
                        throw new IllegalArgumentException("Stock insuficiente para el producto: " + producto.getNombre());
                    }

                    List<Unidad> unidadesDisponibles = producto.getUnidades().stream()
                            .filter(u -> u.getEstado() == EstadoUnidad.DISPONIBLE)
                            .limit(linea.getCantidad())
                            .collect(Collectors.toList());

                    for (Unidad unidad : unidadesDisponibles) {
                        unidad.setEstado(EstadoUnidad.RESERVADO);
                        unidad.setTransaccionOrigenId(transaccion.getId()); // <<< marca la venta!
                        unidadRepository.save(unidad);
                    }

                    producto.actualizarEstadoPorUnidades();
                    productoRepository.save(producto);
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

    public TransaccionDTO toDTO(Transaccion transaccion) {
        if (transaccion == null) {
            return null;
        }
        TransaccionDTO dto = new TransaccionDTO(
                transaccion.getId(),
                transaccion.getTipo() != null ? transaccion.getTipo().toString() : null,
                transaccion.getFecha(),
                transaccion.getEstado() != null ? transaccion.getEstado().toString() : null,
                transaccion.getContraparteId(),
                transaccion.getTipoContraparte() != null ? transaccion.getTipoContraparte().toString() : null,
                transaccion.getContraparteNombre(),
                transaccion.getTotal()
        );
        dto.setSubtotal(transaccion.getSubtotal());
        dto.setImpuestos(transaccion.getImpuestos());
        dto.setNumeroFactura(transaccion.getNumeroFactura());
        dto.setFechaEntregaEsperada(transaccion.getFechaEntregaEsperada());
        dto.setFechaEntregaReal(transaccion.getFechaEntregaReal());
        dto.setCondicionesPago(transaccion.getCondicionesPago());
        dto.setNumeroOrdenCompra(transaccion.getNumeroOrdenCompra());
        dto.setMetodoPago(transaccion.getMetodoPago());
        dto.setNumeroTransaccion(transaccion.getNumeroTransaccion());
        dto.setVendedorId(transaccion.getVendedorId());
        dto.setDireccionEntrega(transaccion.getDireccionEntrega());
        dto.setObservaciones(transaccion.getObservaciones());
        dto.setMetadatosPago(transaccion.getMetadatosPago());
        dto.setTransaccionOrigenId(transaccion.getTransaccionOrigenId());
        dto.setNumeroReferencia(transaccion.getNumeroReferencia());
        dto.setFechaCreacion(transaccion.getFechaCreacion());
        dto.setFechaActualizacion(transaccion.getFechaActualizacion());

        if (transaccion.getLineas() != null) {
            List<LineaTransaccionDTO> lineasDto = transaccion.getLineas().stream().map(linea -> {
                LineaTransaccionDTO lDto = new LineaTransaccionDTO();
                lDto.setId(linea.getId());
                lDto.setProductoId(linea.getProductoId());
                lDto.setCantidad(linea.getCantidad());
                lDto.setPrecioUnitario(linea.getPrecioUnitario());
                lDto.setSubtotal(linea.getSubtotal());
                lDto.setImpuestoPorcentaje(linea.getImpuestoPorcentaje());
                lDto.setImpuestoMonto(linea.getImpuestoMonto());
                lDto.setTotal(linea.getTotal());
                lDto.setDescuentoPorcentaje(linea.getDescuentoPorcentaje());
                lDto.setDescuentoMonto(linea.getDescuentoMonto());
                lDto.setObservaciones(linea.getObservaciones());

                if (linea.getProductoNombre() != null && !linea.getProductoNombre().isEmpty()) {
                    lDto.setProductoNombre(linea.getProductoNombre());
                } else if (linea.getProductoId() != null) {
                    Producto producto = productoRepository.findById(linea.getProductoId()).orElse(null);
                    lDto.setProductoNombre(producto != null ? producto.getNombre() : null);
                } else {
                    lDto.setProductoNombre(null);
                }
                return lDto;
            }).collect(Collectors.toList());
            dto.setLineas(lineasDto);
        }
        return dto;
    }

    public Transaccion agregarLineaATransaccion(Transaccion transaccion, LineaTransaccionDTO lineaDto) {
        if (!canEditTransaction(transaccion)) {
            throw new IllegalStateException("No se puede editar una transacción con estado: " + transaccion.getEstado());
        }

        // Buscar si ya existe una línea para ese producto y precio
        LineaTransaccion existente = null;
        for (LineaTransaccion l : transaccion.getLineas()) {
            if (l.getProductoId().equals(lineaDto.getProductoId()) &&
                    l.getPrecioUnitario().compareTo(lineaDto.getPrecioUnitario()) == 0) {
                existente = l;
                break;
            }
        }

        // Obtener el producto para el ITBIS por si es necesario
        Producto producto = productoRepository.findById(lineaDto.getProductoId())
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + lineaDto.getProductoId()));
        BigDecimal itbis = BigDecimal.valueOf(producto.getItbis());

        if (existente != null) {
            // Agrupar la cantidad y recalcular totales e impuestos
            existente.setCantidad(existente.getCantidad() + lineaDto.getCantidad());
            // Si el impuesto no está, poner el del producto
            if (existente.getImpuestoPorcentaje() == null || existente.getImpuestoPorcentaje().compareTo(BigDecimal.ZERO) == 0) {
                existente.setImpuestoPorcentaje(itbis);
            }
            existente.calcularTotales();
        } else {
            // Crear nueva línea
            LineaTransaccion linea = new LineaTransaccion();
            linea.setTransaccion(transaccion);
            linea.setProductoId(lineaDto.getProductoId());
            linea.setProductoNombre(lineaDto.getProductoNombre());
            linea.setCantidad(lineaDto.getCantidad());
            linea.setPrecioUnitario(lineaDto.getPrecioUnitario());

            // Asignar impuesto del producto si el DTO no lo tiene
            if (lineaDto.getImpuestoPorcentaje() == null || lineaDto.getImpuestoPorcentaje().compareTo(BigDecimal.ZERO) == 0) {
                linea.setImpuestoPorcentaje(itbis);
            } else {
                linea.setImpuestoPorcentaje(lineaDto.getImpuestoPorcentaje());
            }

            linea.setDescuentoPorcentaje(lineaDto.getDescuentoPorcentaje());
            linea.setObservaciones(lineaDto.getObservaciones());
            linea.calcularTotales();

            transaccion.getLineas().add(linea);
        }

        // Recalcular totales de la transacción
        calcularTotalesTransaccion(transaccion);

        return transaccionRepository.save(transaccion);
    }
}