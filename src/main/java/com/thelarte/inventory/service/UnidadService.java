package com.thelarte.inventory.service;

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

@Service
public class UnidadService {

    @Autowired
    private UnidadRepository unidadRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // Registrar una nueva unidad para un producto
    public Unidad registrarUnidad(Long idProducto, EstadoUnidad estadoUnidad, boolean stock) {
        Optional<Producto> productoOpt = productoRepository.findById(idProducto);
        if (productoOpt.isEmpty()) {
            throw new IllegalArgumentException("Producto no encontrado");
        }
        Unidad unidad = new Unidad();
        unidad.setProducto(productoOpt.get());
        unidad.setFechaIngreso(new Date());
        unidad.setEstado(estadoUnidad);
        unidad.setStock(stock);
        return unidadRepository.save(unidad);
    }

    // Cambiar el estado de una unidad (por ejemplo: vender, reservar, dañar, etc)
    public Unidad cambiarEstado(Long idUnidad, EstadoUnidad nuevoEstado) {
        Unidad unidad = unidadRepository.findById(idUnidad)
                .orElseThrow(() -> new IllegalArgumentException("Unidad no encontrada"));
        unidad.setEstado(nuevoEstado);
        return unidadRepository.save(unidad);
    }

    // Mover unidad entre stock y almacén
    public Unidad moverUnidad(Long idUnidad, boolean stock) {
        Unidad unidad = unidadRepository.findById(idUnidad)
                .orElseThrow(() -> new IllegalArgumentException("Unidad no encontrada"));
        unidad.setStock(stock);
        return unidadRepository.save(unidad);
    }

    // Consultar todas las unidades de un producto
    public List<Unidad> unidadesPorProducto(Long idProducto) {
        return unidadRepository.findByProducto_Id(idProducto);
    }

    // Consultar unidades por estado
    public List<Unidad> unidadesPorEstado(EstadoUnidad estado) {
        return unidadRepository.findByEstado(estado);
    }


    // Consultar todas las unidades en stock/en almacén
    public List<Unidad> unidadesPorStock(boolean stock) {
        return unidadRepository.findByStock(stock);
    }

    // Consultar por ID
    public Optional<Unidad> buscarPorId(Long idUnidad) {
        return unidadRepository.findById(idUnidad);
    }

    // Eliminar una unidad
    public void eliminarUnidad(Long idUnidad) {
        unidadRepository.deleteById(idUnidad);
    }

    public Unidad actualizarUnidad(Long idUnidad, Unidad unidad) {
        Unidad existente = unidadRepository.findById(idUnidad)
                .orElseThrow(() -> new EntityNotFoundException("Unidad no encontrada"));
        // Actualiza los campos deseados:
        existente.setEstado(unidad.getEstado());
        existente.setStock(unidad.isStock());
        existente.setFechaIngreso(unidad.getFechaIngreso());
        // ...otros campos si corresponde
        return unidadRepository.save(existente);
    }
}