package com.thelarte.inventory.service;

import com.thelarte.inventory.model.Producto;
import com.thelarte.inventory.dto.ProductoDTO;
import com.thelarte.inventory.repository.ProductoRepository;
import com.thelarte.shared.exception.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductoService implements IProductoService {

    private final ProductoRepository productoRepository;
    private static final String UPLOAD_DIR = "uploads/imagenes/";

    @Autowired
    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
        // Crear directorio de uploads si no existe
        createUploadDirectoryIfNotExists();
    }

    private void createUploadDirectoryIfNotExists() {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("No se pudo crear el directorio de uploads: " + e.getMessage());
        }
    }

    private String saveImageFromBase64(String base64Data) {
        if (base64Data == null || base64Data.isEmpty()) {
            return null;
        }

        try {
            // Extraer el contenido base64 (remover el prefijo data:image/...)
            String base64Content;
            String fileExtension = "png"; // default

            if (base64Data.contains(",")) {
                String[] parts = base64Data.split(",");
                if (parts.length == 2) {
                    String header = parts[0];
                    base64Content = parts[1];

                    // Extraer la extensión del header
                    if (header.contains("jpeg") || header.contains("jpg")) {
                        fileExtension = "jpg";
                    } else if (header.contains("png")) {
                        fileExtension = "png";
                    } else if (header.contains("gif")) {
                        fileExtension = "gif";
                    } else if (header.contains("webp")) {
                        fileExtension = "webp";
                    }
                } else {
                    base64Content = base64Data;
                }
            } else {
                base64Content = base64Data;
            }

            // Decodificar base64
            byte[] imageBytes = Base64.getDecoder().decode(base64Content);

            // Generar nombre único para el archivo
            String fileName = System.currentTimeMillis() + "." + fileExtension;
            String filePath = UPLOAD_DIR + fileName;

            // Guardar el archivo
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(imageBytes);
            }

            // Retornar la URL relativa
            return "/uploads/imagenes/" + fileName;

        } catch (Exception e) {
            throw new RuntimeException("Error al guardar la imagen: " + e.getMessage());
        }
    }

    private void deleteImageFile(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // Extraer el nombre del archivo de la URL
            if (imageUrl.startsWith("/uploads/imagenes/")) {
                String fileName = imageUrl.substring("/uploads/imagenes/".length());
                Path filePath = Paths.get(UPLOAD_DIR + fileName);

                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                }
            }
        } catch (IOException e) {
            // Log el error pero no fallar la operación principal
            System.err.println("Error al eliminar archivo de imagen: " + e.getMessage());
        }
    }

    /**
     * Lista todos los productos que NO han sido eliminados lógicamente
     * @return Lista de DTOs de productos
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProductoDTO> listarTodos() {
        return productoRepository.findAllActive().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca un producto por su ID
     * @param id ID del producto
     * @return Optional con el DTO si existe y NO está eliminado
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ProductoDTO> buscarPorId(Long id) {
        return productoRepository.findByIdAndNotDeleted(id)
                .map(this::toDto);
    }

    /**
     * Busca un producto por su nombre
     * @param nombre Nombre del producto
     * @return Optional con el DTO si existe y NO está eliminado
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ProductoDTO> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreAndNotDeleted(nombre)
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
        String oldImageUrl = null;

        // Cambia la condición a null o <= 0 para evitar problemas con id nulo
        if (productoDTO.getId() == null || productoDTO.getId() <= 0) {
            // Es un nuevo producto
            producto = new Producto();
        } else {
            // Actualizar producto existente - buscar sin filtro de eliminado para permitir reactivación
            producto = productoRepository.findById(productoDTO.getId())
                    .orElseThrow(() -> new EntityNotFoundException("No se encontró el producto con ID: " + productoDTO.getId()));

            // Guardar la URL de la imagen antigua para eliminarla si se actualiza
            oldImageUrl = producto.getFotoURL();
        }

        // Validaciones adicionales
        if (productoDTO.getNombre() == null || productoDTO.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio");
        }

        // Validar que no exista otro producto activo con el mismo nombre (excepto el actual)
        Optional<Producto> existingProduct = productoRepository.findByNombreAndNotDeleted(productoDTO.getNombre());
        if (existingProduct.isPresent() && !Objects.equals(existingProduct.get().getId(), producto.getId())) {
            throw new IllegalArgumentException("Ya existe un producto activo con el nombre: " + productoDTO.getNombre());
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
        producto.setItbis(productoDTO.getItbis() == null ? 0f : productoDTO.getItbis());
        producto.setPrecioCompra(productoDTO.getPrecioCompra());
        producto.setPrecioVenta(productoDTO.getPrecioVenta());

        // Manejar la imagen
        String newImageUrl = null;
        if (productoDTO.getFotoBase64() != null && !productoDTO.getFotoBase64().isEmpty()) {
            // Si hay una nueva imagen en base64, guardarla
            if (!productoDTO.getFotoBase64().equals(oldImageUrl)) {
                // Solo procesar si es realmente una imagen base64 nueva
                if (productoDTO.getFotoBase64().startsWith("data:image/")) {
                    newImageUrl = saveImageFromBase64(productoDTO.getFotoBase64());
                    // Eliminar imagen antigua si existe y es diferente
                    if (oldImageUrl != null && !oldImageUrl.isEmpty()) {
                        deleteImageFile(oldImageUrl);
                    }
                } else {
                    // Si no es base64, mantener la URL existente
                    newImageUrl = productoDTO.getFotoBase64();
                }
            } else {
                // Mantener la imagen existente
                newImageUrl = oldImageUrl;
            }
        } else if (productoDTO.getFotoUrl() != null && !productoDTO.getFotoUrl().isEmpty()) {
            // Si no hay fotoBase64 pero hay fotoUrl, usar fotoUrl
            newImageUrl = productoDTO.getFotoUrl();
        }

        producto.setFotoURL(newImageUrl);

        // Asigna 0 si viene NULL en cantidades
        producto.setCantidadDisponible(productoDTO.getCantidadDisponible() == null ? 0 : productoDTO.getCantidadDisponible());
        producto.setCantidadReservada(productoDTO.getCantidadReservada() == null ? 0 : productoDTO.getCantidadReservada());
        producto.setCantidadDanada(productoDTO.getCantidadDanada() == null ? 0 : productoDTO.getCantidadDanada());
        producto.setCantidadDevuelta(productoDTO.getCantidadDevuelta() == null ? 0 : productoDTO.getCantidadDevuelta());
        producto.setCantidadAlmacen(productoDTO.getCantidadAlmacen() == null ? 0 : productoDTO.getCantidadAlmacen());

        // Manejar el estado de eliminación
        producto.setEliminado(productoDTO.isEliminado());

        producto = productoRepository.save(producto);
        return toDto(producto);
    }

    /**
     * Elimina un producto por su ID (borrado lógico)
     * @param id ID del producto a eliminar
     */
    @Override
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el producto con ID: " + id));

        if (producto.isEliminado()) {
            throw new IllegalStateException("El producto ya está eliminado");
        }

        // No eliminar la imagen física al hacer borrado lógico
        // La imagen se mantiene en caso de reactivación
        producto.setEliminado(true);
        productoRepository.save(producto);
    }

    /**
     * Reactiva un producto eliminado lógicamente
     * @param id ID del producto a reactivar
     * @return DTO del producto reactivado
     */
    public ProductoDTO reactivar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el producto con ID: " + id));

        if (!producto.isEliminado()) {
            throw new IllegalStateException("El producto no está eliminado");
        }

        // Verificar que no exista otro producto activo con el mismo nombre
        Optional<Producto> existingActive = productoRepository.findByNombreAndNotDeleted(producto.getNombre());
        if (existingActive.isPresent()) {
            throw new IllegalArgumentException("Ya existe un producto activo con el nombre: " + producto.getNombre());
        }

        producto.setEliminado(false);
        producto = productoRepository.save(producto);
        return toDto(producto);
    }

    /**
     * Lista productos por tipo (solo los que NO están eliminados)
     * @param tipo Tipo para filtrar
     * @return Lista de productos del tipo especificado
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProductoDTO> listarPorTipo(String tipo) {
        return productoRepository.findByTipoAndNotDeleted(tipo).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Lista todos los productos incluyendo los eliminados (para administración)
     * @return Lista de todos los DTOs de productos
     */
    @Transactional(readOnly = true)
    public List<ProductoDTO> listarTodosInclusiveEliminados() {
        return productoRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Lista solo los productos eliminados lógicamente
     * @return Lista de DTOs de productos eliminados
     */
    @Transactional(readOnly = true)
    public List<ProductoDTO> listarEliminados() {
        return productoRepository.findAll().stream()
                .filter(Producto::isEliminado)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todos los tipos únicos de productos existentes
     * @return Lista de tipos únicos de productos
     */
    @Override
    @Transactional(readOnly = true)
    public List<String> obtenerTiposUnicos() {
        return productoRepository.findAllActive().stream()
                .map(Producto::getTipo)
                .filter(tipo -> tipo != null && !tipo.trim().isEmpty())
                .distinct()
                .sorted()
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
                p.getCantidadAlmacen(),
                p.isEliminado()
        );
    }

    @Transactional(readOnly = true)
    public Producto getProductoById(Long id) {
        return productoRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + id));
    }

    @Transactional(readOnly = true)
    public Producto getProductoByCodigo(String codigo) {
        return productoRepository.findByCodigoAndNotDeleted(codigo)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con código: " + codigo));
    }

    @Transactional(readOnly = true)
    public List<Producto> getProductosDisponibles(String busqueda, String categoria, int page, int size) {
        List<Producto> productos = productoRepository.findAllActive();

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
