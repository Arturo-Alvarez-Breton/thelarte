package com.thelarte.inventory.service;

import com.thelarte.inventory.model.Producto;
import com.thelarte.inventory.dto.ProductoDTO;
import com.thelarte.inventory.repository.ProductoRepository;
import com.thelarte.shared.exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductoService implements IProductoService {

    private final ProductoRepository productoRepository;

    @Autowired
    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    /**
     * Lista todos los productos
     * @return Lista de DTOs de productos
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProductoDTO> listarTodos() {
        return productoRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca un producto por su ID
     * @param id ID del producto
     * @return Optional con el DTO si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ProductoDTO> buscarPorId(Long id) {
        return productoRepository.findById(id)
                .map(this::toDto);
    }

    /**
     * Busca un producto por su nombre
     * @param nombre Nombre del producto
     * @return Optional con el DTO si existe
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ProductoDTO> buscarPorNombre(String nombre) {
        return productoRepository.findByNombre(nombre)
                .map(this::toDto);
    }

    /**
     * Guarda o actualiza un producto
     * @param productoDTO DTO con los datos del producto
     * @return DTO con los datos guardados
     */
    @Override
    public ProductoDTO guardar(ProductoDTO productoDTO) {
        Producto producto;

        // Cambia la condición a null o <= 0 para evitar problemas con id nulo
        if (productoDTO.getId() == null || productoDTO.getId() <= 0) {
            // Es un nuevo producto
            producto = new Producto();
        } else {
            // Actualizar producto existente
            producto = productoRepository.findById(productoDTO.getId())
                    .orElseThrow(() -> new EntityNotFoundException("No se encontró el producto con ID: " + productoDTO.getId()));
        }

        // Validaciones adicionales (puedes agregar más si lo deseas)
        if (productoDTO.getNombre() == null || productoDTO.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio");
        }
        if (productoDTO.getTipo() == null || productoDTO.getTipo().isBlank()) {
            throw new IllegalArgumentException("El tipo de producto es obligatorio");
        }
        if (productoDTO.getPrecioVenta() == null || productoDTO.getPrecioVenta().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio de venta debe ser mayor o igual a 0");
        }
        if (productoDTO.getPrecioCompra() == null || productoDTO.getPrecioCompra().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio de compra debe ser mayor o igual a 0");
        }

        producto.setNombre(productoDTO.getNombre());
        producto.setTipo(productoDTO.getTipo());
        producto.setDescripcion(productoDTO.getDescripcion());
        producto.setItbis(productoDTO.getItbis());
        producto.setPrecioCompra(productoDTO.getPrecioCompra());
        producto.setPrecioVenta(productoDTO.getPrecioVenta());
        producto.setFotoURL(productoDTO.getFotoUrl());
        producto.setCantidadDisponible(productoDTO.getCantidadDisponible());
        producto.setCantidadReservada(productoDTO.getCantidadReservada());
        producto.setCantidadDanada(productoDTO.getCantidadDanada());
        producto.setCantidadDevuelta(productoDTO.getCantidadDevuelta());
        producto.setCantidadAlmacen(productoDTO.getCantidadAlmacen());

        producto = productoRepository.save(producto);

        return toDto(producto);
    }

    /**
     * Elimina un producto por su ID
     * @param id ID del producto a eliminar
     */
    @Override
    public void eliminar(Long id) {
        if (productoRepository.existsById(id)) {
            productoRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("No se encontró el producto con ID: " + id);
        }
    }

    /**
     * Lista productos por tipo
     * @param tipo Tipo para filtrar
     * @return Lista de productos del tipo especificado
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProductoDTO> listarPorTipo(String tipo) {
        return productoRepository.findByTipo(tipo).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ProductoDTO toDto(Producto p) {
        return new ProductoDTO(
                p.getId(),
                p.getCodigo(),
                p.getNombre(),
                p.getTipo(),
                p.getDescripcion(),
                p.getItbis(),
                p.getPrecioCompra(),
                p.getPrecioVenta(),
                p.getFotoURL(),
                p.getCantidadDisponible(),
                p.getCantidadDanada(),
                p.getCantidadDevuelta(),
                p.getCantidadAlmacen()
        );
    }

    @Transactional(readOnly = true)
    public Producto getProductoById(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + id));
    }

    @Transactional(readOnly = true)
    public Producto getProductoByCodigo(String codigo) {
        return productoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con código: " + codigo));
    }

    @Transactional(readOnly = true)
    public List<Producto> getProductosDisponibles(String busqueda, String categoria, int page, int size) {
        List<Producto> productos = productoRepository.findAll();

        if (busqueda != null && !busqueda.isEmpty()) {
            productos = productos.stream()
                    .filter(p -> p.getNombre().toLowerCase().contains(busqueda.toLowerCase()) ||
                            (p.getCodigo() != null && p.getCodigo().toLowerCase().contains(busqueda.toLowerCase())))
                    .collect(Collectors.toList());
        }

        if (categoria != null && !categoria.isEmpty()) {
            productos = productos.stream()
                    .filter(p -> p.getTipo().equalsIgnoreCase(categoria))
                    .collect(Collectors.toList());
        }

        // Aplicar paginación manual
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, productos.size());

        if (fromIndex > productos.size()) {
            return List.of();
        }

        return productos.subList(fromIndex, toIndex);
    }
}