package com.thelarte.transacciones.service;

import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.model.LineaTransaccion;
import com.thelarte.transacciones.repository.TransaccionRepository;
import com.thelarte.transacciones.util.PaymentMetadataValidator;
import com.thelarte.inventory.model.Producto;
import com.thelarte.inventory.repository.ProductoRepository;
import com.thelarte.shared.exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TransaccionService {

    @Autowired
    private TransaccionRepository transaccionRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private PaymentMetadataValidator paymentMetadataValidator;

    public Transaccion crearTransaccion(Transaccion transaccion) {
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

    public Transaccion actualizarTransaccion(Long id, Transaccion transaccionActualizada) {
        Transaccion transaccion = transaccionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        
        transaccion.setObservaciones(transaccionActualizada.getObservaciones());
        transaccion.setFechaEntregaEsperada(transaccionActualizada.getFechaEntregaEsperada());
        transaccion.setCondicionesPago(transaccionActualizada.getCondicionesPago());
        transaccion.setNumeroFactura(transaccionActualizada.getNumeroFactura());
        transaccion.setNumeroOrdenCompra(transaccionActualizada.getNumeroOrdenCompra());
        transaccion.setMetodoPago(transaccionActualizada.getMetodoPago());
        transaccion.setMetadatosPago(transaccionActualizada.getMetadatosPago());
        transaccion.setDireccionEntrega(transaccionActualizada.getDireccionEntrega());
        
        if (transaccionActualizada.getLineas() != null) {
            transaccion.setLineas(transaccionActualizada.getLineas());
            calcularTotalesTransaccion(transaccion);
        }
        
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
                // Si el productoId es null, crear un nuevo producto
                if (linea.getProductoId() == null && linea.getProductoNombre() != null) {
                    Producto nuevoProducto = new Producto();
                    nuevoProducto.setNombre(linea.getProductoNombre());
                    nuevoProducto.setTipo("General"); // Tipo por defecto
                    nuevoProducto.setDescripcion("Producto creado automáticamente");
                    nuevoProducto.setMarca("Sin marca");
                    nuevoProducto.setItbis(18.0f); // 18% de ITBIS por defecto
                    nuevoProducto.setPrecio(linea.getPrecioUnitario());
                    nuevoProducto.setFotoURL("");
                    
                    // Guardar el producto en la base de datos
                    nuevoProducto = productoRepository.save(nuevoProducto);
                    
                    // Asignar el ID generado a la línea de transacción
                    linea.setProductoId(nuevoProducto.getId());
                }
            }
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
}