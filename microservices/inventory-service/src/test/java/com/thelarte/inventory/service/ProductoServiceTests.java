package com.thelarte.inventory.service;

import com.thelarte.shared.model.Producto;
import com.thelarte.inventory.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductoServiceTests {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoService productoService;

    private Producto producto1;
    private Producto producto2;

    @BeforeEach
    void setUp() {
        producto1 = new Producto();
        producto1.setId("1");
        producto1.setNombre("Producto 1");
        producto1.setPrecio(new BigDecimal("100.00"));
        producto1.setStock(10);
        
        producto2 = new Producto();
        producto2.setId("2");
        producto2.setNombre("Producto 2");
        producto2.setPrecio(new BigDecimal("200.00"));
        producto2.setStock(20);
    }

    @Test
    void findAll_ShouldReturnAllProductos() {
        // Arrange
        List<Producto> productos = Arrays.asList(producto1, producto2);
        when(productoRepository.findAll()).thenReturn(productos);
        
        // Act
        List<Producto> result = productoService.findAll();
        
        // Assert
        assertEquals(2, result.size());
        assertEquals("1", result.get(0).getId());
        assertEquals("2", result.get(1).getId());
        verify(productoRepository, times(1)).findAll();
    }

    @Test
    void findById_WhenProductoExists_ShouldReturnProducto() {
        // Arrange
        when(productoRepository.findById(anyString())).thenReturn(Optional.of(producto1));
        
        // Act
        Optional<Producto> result = productoService.findById("1");
        
        // Assert
        assertTrue(result.isPresent());
        assertEquals("1", result.get().getId());
        assertEquals("Producto 1", result.get().getNombre());
        verify(productoRepository, times(1)).findById("1");
    }

    @Test
    void findById_WhenProductoDoesNotExist_ShouldReturnEmpty() {
        // Arrange
        when(productoRepository.findById(anyString())).thenReturn(Optional.empty());
        
        // Act
        Optional<Producto> result = productoService.findById("999");
        
        // Assert
        assertFalse(result.isPresent());
        verify(productoRepository, times(1)).findById("999");
    }

    @Test
    void save_ShouldReturnSavedProducto() {
        // Arrange
        when(productoRepository.save(any(Producto.class))).thenReturn(producto1);
        
        // Act
        Producto result = productoService.save(producto1);
        
        // Assert
        assertNotNull(result);
        assertEquals("1", result.getId());
        assertEquals("Producto 1", result.getNombre());
        verify(productoRepository, times(1)).save(producto1);
    }

    @Test
    void deleteById_ShouldCallRepository() {
        // Arrange
        doNothing().when(productoRepository).deleteById(anyString());
        
        // Act
        productoService.deleteById("1");
        
        // Assert
        verify(productoRepository, times(1)).deleteById("1");
    }
}
