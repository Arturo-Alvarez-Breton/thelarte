package com.thelarte.transacciones.service;

import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.model.LineaTransaccion;
import com.thelarte.transacciones.repository.TransaccionRepository;
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

    public Transaccion crearTransaccion(Transaccion transaccion) {
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

    public Transaccion crearDevolucion(Long contraparteId, Transaccion.TipoContraparte tipoContraparte, 
                                      String contraparteNombre, List<LineaTransaccion> lineas, 
                                      Long transaccionOriginalId) {
        Transaccion devolucion = new Transaccion(
            Transaccion.TipoTransaccion.DEVOLUCION,
            contraparteId,
            tipoContraparte,
            contraparteNombre
        );
        
        devolucion.setObservaciones("Devolución de transacción original ID: " + transaccionOriginalId);
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
    public List<Transaccion> obtenerDevoluciones() {
        return transaccionRepository.findByTipo(Transaccion.TipoTransaccion.DEVOLUCION);
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

    public Transaccion actualizarTransaccion(Long id, Transaccion transaccionActualizada) {
        Transaccion transaccion = transaccionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        
        transaccion.setObservaciones(transaccionActualizada.getObservaciones());
        transaccion.setFechaEntregaEsperada(transaccionActualizada.getFechaEntregaEsperada());
        transaccion.setCondicionesPago(transaccionActualizada.getCondicionesPago());
        transaccion.setNumeroFactura(transaccionActualizada.getNumeroFactura());
        transaccion.setNumeroOrdenCompra(transaccionActualizada.getNumeroOrdenCompra());
        transaccion.setMetodoPago(transaccionActualizada.getMetodoPago());
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
    public Double obtenerTotalDevolucionesEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.sumTotalPorTipoEnPeriodo(Transaccion.TipoTransaccion.DEVOLUCION, fechaInicio, fechaFin);
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
}