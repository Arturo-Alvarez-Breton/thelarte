package com.thelarte.inventory.service;

import com.thelarte.inventory.dto.UnidadDTO;
import com.thelarte.inventory.model.Unidad;
import com.thelarte.inventory.model.Producto;
import com.thelarte.inventory.repository.UnidadRepository;
import com.thelarte.inventory.repository.ProductoRepository;
import com.thelarte.inventory.util.EstadoUnidad;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UnidadService {

    @Autowired
    private UnidadRepository unidadRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // Registrar una nueva unidad para un producto (devuelve DTO)
    public UnidadDTO registrarUnidad(Long idProducto, EstadoUnidad estadoUnidad, boolean stock, Long transaccionOrigenId) {
        Optional<Producto> productoOpt = productoRepository.findById(idProducto);
        if (productoOpt.isEmpty()) {
            throw new IllegalArgumentException("Producto no encontrado");
        }
        Unidad unidad = new Unidad();
        unidad.setProducto(productoOpt.get());
        unidad.setFechaIngreso(new Date());
        unidad.setEstado(estadoUnidad);
        unidad.setStock(stock);
        unidad.setTransaccionOrigenId(transaccionOrigenId); // <<< NUEVO: asigna el id de la transacción de compra/venta
        productoOpt.get().getUnidades().add(unidad); // Agregar unidad al producto
        Unidad saved = unidadRepository.save(unidad);
        return toDto(saved);
    }
    public UnidadDTO registrarUnidad(Long idProducto, EstadoUnidad estadoUnidad, boolean stock) {
        return registrarUnidad(idProducto, estadoUnidad, stock, null);
    }

    // Cambiar el estado de una unidad (devuelve DTO)
    public UnidadDTO cambiarEstado(Long idUnidad, EstadoUnidad nuevoEstado) {
        Unidad unidad = unidadRepository.findById(idUnidad)
                .orElseThrow(() -> new IllegalArgumentException("Unidad no encontrada"));
        unidad.setEstado(nuevoEstado);
        Unidad saved = unidadRepository.save(unidad);
        return toDto(saved);
    }

    // Mover unidad entre stock y almacén (devuelve DTO)
    public UnidadDTO moverUnidad(Long idUnidad, boolean stock) {
        Unidad unidad = unidadRepository.findById(idUnidad)
                .orElseThrow(() -> new IllegalArgumentException("Unidad no encontrada"));
        unidad.setStock(stock);
        Unidad saved = unidadRepository.save(unidad);
        return toDto(saved);
    }

    // Consultar todas las unidades de un producto (devuelve lista de DTO)
    public List<UnidadDTO> unidadesPorProducto(Long idProducto) {
        return unidadRepository.findByProducto_Id(idProducto)
                .stream()
                .map(unidad -> new UnidadDTO(
                        unidad.getIdUnidad(),
                        idProducto,
                        unidad.getFechaIngreso(),
                        unidad.getEstado(),
                        unidad.isStock()
                ))
                .collect(Collectors.toList());
    }

    // Consultar unidades por estado (devuelve lista de DTO)
    public List<UnidadDTO> unidadesPorEstado(EstadoUnidad estado) {
        return unidadRepository.findByEstado(estado)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Consultar todas las unidades en stock/en almacén (devuelve lista de DTO)
    public List<UnidadDTO> unidadesPorStock(boolean stock) {
        return unidadRepository.findByStock(stock)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Consultar por ID (devuelve Optional<DTO>)
    public Optional<UnidadDTO> buscarPorId(Long idUnidad) {
        return unidadRepository.findById(idUnidad)
                .map(this::toDto);
    }

    // Eliminar una unidad (no cambia)
    public void eliminarUnidad(Long idUnidad) {
        Unidad unidad = unidadRepository.findById(idUnidad)
                .orElseThrow(() -> new EntityNotFoundException("Unidad no encontrada"));
        Producto producto = unidad.getProducto();
        producto.getUnidades().remove(unidad);
        unidadRepository.deleteById(idUnidad);
    }

    // Actualizar unidad (devuelve DTO)
    public UnidadDTO actualizarUnidad(Long idUnidad, UnidadDTO unidad) {
        Unidad existente = unidadRepository.findById(idUnidad)
                .orElseThrow(() -> new EntityNotFoundException("Unidad no encontrada"));
        existente.setEstado(unidad.getEstado());
        existente.setStock(unidad.isStock());
        existente.setFechaIngreso(unidad.getFechaIngreso());
        Unidad saved = unidadRepository.save(existente);
        return toDto(saved);
    }

    public UnidadDTO toDto(Unidad unidad) {
        return new UnidadDTO(
                unidad.getIdUnidad(),
                unidad.getProducto() != null ? unidad.getProducto().getId() : 0,
                unidad.getFechaIngreso(),
                unidad.getEstado(),
                unidad.isStock()
        );
    }
    public List<UnidadDTO> unidadesDisponiblesPorProducto(Long idProducto) {
        return unidadRepository.findByProducto_Id(idProducto)
                .stream()
                .filter(u -> u.getEstado() == EstadoUnidad.DISPONIBLE)
                .map(unidad -> new UnidadDTO(
                        unidad.getIdUnidad(),
                        idProducto,
                        unidad.getFechaIngreso(),
                        unidad.getEstado(),
                        unidad.isStock()
                ))
                .collect(Collectors.toList());
    }
}