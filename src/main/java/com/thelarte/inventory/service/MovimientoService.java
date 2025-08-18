package com.thelarte.inventory.service;

import com.thelarte.inventory.dto.MovimientoDTO;
import com.thelarte.inventory.model.Movimiento;
import com.thelarte.inventory.model.Producto;
import com.thelarte.inventory.repository.MovimientoRepository;
import com.thelarte.inventory.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MovimientoService {

    @Autowired
    private MovimientoRepository movimientoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    private Movimiento.TipoMovimientoSimple resolveTipoSimple(String tipo, int cantidad) {
        // Puedes ajustar el mapeo según tu lógica
        switch (tipo) {
            case "ajuste_disponible":
            case "ajuste_almacen":
            case "ajuste_danada":
                return cantidad >= 0 ? Movimiento.TipoMovimientoSimple.INGRESO : Movimiento.TipoMovimientoSimple.REBAJA;
            case "almacen_a_disponible":
            case "danada_a_disponible":
            case "disponible_a_almacen":
            case "disponible_a_danada":
                return Movimiento.TipoMovimientoSimple.TRANSFERENCIA;
            default:
                return Movimiento.TipoMovimientoSimple.TRANSFERENCIA; // fallback
        }
    }

    public Movimiento registrarMovimiento(MovimientoDTO dto) {
        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Lógica de actualización (igual que antes)
        switch (dto.getTipo()) {
            case "ajuste_disponible":
            case "ajuste_almacen":
            case "ajuste_danada":
                if ("ajuste_disponible".equals(dto.getTipo())) {
                    producto.setCantidadDisponible(producto.getCantidadDisponible() + dto.getCantidad());
                } else if ("ajuste_almacen".equals(dto.getTipo())) {
                    producto.setCantidadAlmacen(producto.getCantidadAlmacen() + dto.getCantidad());
                } else if ("ajuste_danada".equals(dto.getTipo())) {
                    producto.setCantidadDanada(producto.getCantidadDanada() + dto.getCantidad());
                }
                break;
            case "almacen_a_disponible":
                if (producto.getCantidadAlmacen() >= dto.getCantidad()) {
                    producto.setCantidadAlmacen(producto.getCantidadAlmacen() - dto.getCantidad());
                    producto.setCantidadDisponible(producto.getCantidadDisponible() + dto.getCantidad());
                } else {
                    throw new RuntimeException("No hay suficiente cantidad en almacén");
                }
                break;
            case "disponible_a_almacen":
                if (producto.getCantidadDisponible() >= dto.getCantidad()) {
                    producto.setCantidadDisponible(producto.getCantidadDisponible() - dto.getCantidad());
                    producto.setCantidadAlmacen(producto.getCantidadAlmacen() + dto.getCantidad());
                } else {
                    throw new RuntimeException("No hay suficiente cantidad disponible");
                }
                break;
            case "danada_a_disponible":
                if (producto.getCantidadDanada() >= dto.getCantidad()) {
                    producto.setCantidadDanada(producto.getCantidadDanada() - dto.getCantidad());
                    producto.setCantidadDisponible(producto.getCantidadDisponible() + dto.getCantidad());
                } else {
                    throw new RuntimeException("No hay suficiente cantidad dañada");
                }
                break;
            case "disponible_a_danada":
                if (producto.getCantidadDisponible() >= dto.getCantidad()) {
                    producto.setCantidadDisponible(producto.getCantidadDisponible() - dto.getCantidad());
                    producto.setCantidadDanada(producto.getCantidadDanada() + dto.getCantidad());
                } else {
                    throw new RuntimeException("No hay suficiente cantidad disponible");
                }
                break;
            default:
                throw new RuntimeException("Tipo de movimiento no soportado: " + dto.getTipo());
        }

        productoRepository.save(producto);

        Movimiento.TipoMovimientoSimple tipoSimple = resolveTipoSimple(dto.getTipo(), dto.getCantidad());

        Movimiento movimiento = new Movimiento(
                producto,
                dto.getTipo(),
                tipoSimple,
                dto.getCantidad(),
                dto.getMotivo(),
                dto.getFecha() != null ? dto.getFecha() : LocalDateTime.now(),
                dto.getIdUsuario()
        );

        return movimientoRepository.save(movimiento);
    }

    public List<Movimiento> obtenerMovimientosPorProducto(Long productoId) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return movimientoRepository.findByProducto(producto);
    }
}