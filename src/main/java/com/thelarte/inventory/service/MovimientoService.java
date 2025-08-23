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
        switch (tipo) {
            case "ajuste_disponible":
            case "ajuste_almacen":
            case "ajuste_danada":
            case "ajuste_devuelta":
            case "ajuste_reservada":
                return cantidad >= 0 ? Movimiento.TipoMovimientoSimple.INGRESO : Movimiento.TipoMovimientoSimple.REBAJA;
            // Todas las transferencias posibles entre estados
            case "disponible_a_almacen":
            case "disponible_a_danada":
            case "disponible_a_devuelta":
            case "disponible_a_reservada":
            case "almacen_a_disponible":
            case "almacen_a_danada":
            case "almacen_a_devuelta":
            case "almacen_a_reservada":
            case "danada_a_disponible":
            case "danada_a_almacen":
            case "danada_a_devuelta":
            case "danada_a_reservada":
            case "devuelta_a_disponible":
            case "devuelta_a_almacen":
            case "devuelta_a_danada":
            case "devuelta_a_reservada":
            case "reservada_a_disponible":
            case "reservada_a_almacen":
            case "reservada_a_danada":
            case "reservada_a_devuelta":
                return Movimiento.TipoMovimientoSimple.TRANSFERENCIA;
            default:
                return Movimiento.TipoMovimientoSimple.TRANSFERENCIA;
        }
    }

    public Movimiento registrarMovimiento(MovimientoDTO dto) {
        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        switch (dto.getTipo()) {
            // AJUSTES directos
            case "ajuste_disponible":
                producto.setCantidadDisponible(producto.getCantidadDisponible() + dto.getCantidad());
                break;
            case "ajuste_almacen":
                producto.setCantidadAlmacen(producto.getCantidadAlmacen() + dto.getCantidad());
                break;
            case "ajuste_danada":
                producto.setCantidadDanada(producto.getCantidadDanada() + dto.getCantidad());
                break;
            case "ajuste_devuelta":
                producto.setCantidadDevuelta(producto.getCantidadDevuelta() + dto.getCantidad());
                break;
            case "ajuste_reservada":
                producto.setCantidadReservada(producto.getCantidadReservada() + dto.getCantidad());
                break;

            // TRANSFERENCIAS entre estados
            // Disponible
            case "disponible_a_almacen":
                if (producto.getCantidadDisponible() >= dto.getCantidad()) {
                    producto.setCantidadDisponible(producto.getCantidadDisponible() - dto.getCantidad());
                    producto.setCantidadAlmacen(producto.getCantidadAlmacen() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad disponible");
                break;
            case "disponible_a_danada":
                if (producto.getCantidadDisponible() >= dto.getCantidad()) {
                    producto.setCantidadDisponible(producto.getCantidadDisponible() - dto.getCantidad());
                    producto.setCantidadDanada(producto.getCantidadDanada() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad disponible");
                break;
            case "disponible_a_devuelta":
                if (producto.getCantidadDisponible() >= dto.getCantidad()) {
                    producto.setCantidadDisponible(producto.getCantidadDisponible() - dto.getCantidad());
                    producto.setCantidadDevuelta(producto.getCantidadDevuelta() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad disponible");
                break;
            case "disponible_a_reservada":
                if (producto.getCantidadDisponible() >= dto.getCantidad()) {
                    producto.setCantidadDisponible(producto.getCantidadDisponible() - dto.getCantidad());
                    producto.setCantidadReservada(producto.getCantidadReservada() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad disponible");
                break;

            // Almacen
            case "almacen_a_disponible":
                if (producto.getCantidadAlmacen() >= dto.getCantidad()) {
                    producto.setCantidadAlmacen(producto.getCantidadAlmacen() - dto.getCantidad());
                    producto.setCantidadDisponible(producto.getCantidadDisponible() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad en almacén");
                break;
            case "almacen_a_danada":
                if (producto.getCantidadAlmacen() >= dto.getCantidad()) {
                    producto.setCantidadAlmacen(producto.getCantidadAlmacen() - dto.getCantidad());
                    producto.setCantidadDanada(producto.getCantidadDanada() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad en almacén");
                break;
            case "almacen_a_devuelta":
                if (producto.getCantidadAlmacen() >= dto.getCantidad()) {
                    producto.setCantidadAlmacen(producto.getCantidadAlmacen() - dto.getCantidad());
                    producto.setCantidadDevuelta(producto.getCantidadDevuelta() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad en almacén");
                break;
            case "almacen_a_reservada":
                if (producto.getCantidadAlmacen() >= dto.getCantidad()) {
                    producto.setCantidadAlmacen(producto.getCantidadAlmacen() - dto.getCantidad());
                    producto.setCantidadReservada(producto.getCantidadReservada() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad en almacén");
                break;

            // Danada
            case "danada_a_disponible":
                if (producto.getCantidadDanada() >= dto.getCantidad()) {
                    producto.setCantidadDanada(producto.getCantidadDanada() - dto.getCantidad());
                    producto.setCantidadDisponible(producto.getCantidadDisponible() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad dañada");
                break;
            case "danada_a_almacen":
                if (producto.getCantidadDanada() >= dto.getCantidad()) {
                    producto.setCantidadDanada(producto.getCantidadDanada() - dto.getCantidad());
                    producto.setCantidadAlmacen(producto.getCantidadAlmacen() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad dañada");
                break;
            case "danada_a_devuelta":
                if (producto.getCantidadDanada() >= dto.getCantidad()) {
                    producto.setCantidadDanada(producto.getCantidadDanada() - dto.getCantidad());
                    producto.setCantidadDevuelta(producto.getCantidadDevuelta() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad dañada");
                break;
            case "danada_a_reservada":
                if (producto.getCantidadDanada() >= dto.getCantidad()) {
                    producto.setCantidadDanada(producto.getCantidadDanada() - dto.getCantidad());
                    producto.setCantidadReservada(producto.getCantidadReservada() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad dañada");
                break;

            // Devuelta
            case "devuelta_a_disponible":
                if (producto.getCantidadDevuelta() >= dto.getCantidad()) {
                    producto.setCantidadDevuelta(producto.getCantidadDevuelta() - dto.getCantidad());
                    producto.setCantidadDisponible(producto.getCantidadDisponible() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad devuelta");
                break;
            case "devuelta_a_almacen":
                if (producto.getCantidadDevuelta() >= dto.getCantidad()) {
                    producto.setCantidadDevuelta(producto.getCantidadDevuelta() - dto.getCantidad());
                    producto.setCantidadAlmacen(producto.getCantidadAlmacen() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad devuelta");
                break;
            case "devuelta_a_danada":
                if (producto.getCantidadDevuelta() >= dto.getCantidad()) {
                    producto.setCantidadDevuelta(producto.getCantidadDevuelta() - dto.getCantidad());
                    producto.setCantidadDanada(producto.getCantidadDanada() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad devuelta");
                break;
            case "devuelta_a_reservada":
                if (producto.getCantidadDevuelta() >= dto.getCantidad()) {
                    producto.setCantidadDevuelta(producto.getCantidadDevuelta() - dto.getCantidad());
                    producto.setCantidadReservada(producto.getCantidadReservada() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad devuelta");
                break;

            // Reservada
            case "reservada_a_disponible":
                if (producto.getCantidadReservada() >= dto.getCantidad()) {
                    producto.setCantidadReservada(producto.getCantidadReservada() - dto.getCantidad());
                    producto.setCantidadDisponible(producto.getCantidadDisponible() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad reservada");
                break;
            case "reservada_a_almacen":
                if (producto.getCantidadReservada() >= dto.getCantidad()) {
                    producto.setCantidadReservada(producto.getCantidadReservada() - dto.getCantidad());
                    producto.setCantidadAlmacen(producto.getCantidadAlmacen() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad reservada");
                break;
            case "reservada_a_danada":
                if (producto.getCantidadReservada() >= dto.getCantidad()) {
                    producto.setCantidadReservada(producto.getCantidadReservada() - dto.getCantidad());
                    producto.setCantidadDanada(producto.getCantidadDanada() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad reservada");
                break;
            case "reservada_a_devuelta":
                if (producto.getCantidadReservada() >= dto.getCantidad()) {
                    producto.setCantidadReservada(producto.getCantidadReservada() - dto.getCantidad());
                    producto.setCantidadDevuelta(producto.getCantidadDevuelta() + dto.getCantidad());
                } else throw new RuntimeException("No hay suficiente cantidad reservada");
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