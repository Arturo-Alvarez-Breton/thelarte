package com.thelarte.inventory.controller;

import com.thelarte.shared.model.Producto;
import com.thelarte.inventory.service.ProductoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductoController.class)
public class ProductoControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService productoService;

    @Test
    void getAllProductos_ShouldReturnList() throws Exception {
        // Arrange
        Producto producto1 = new Producto();
        producto1.setId("1");
        producto1.setNombre("Producto 1");
        producto1.setPrecio(new BigDecimal("100.00"));
        
        Producto producto2 = new Producto();
        producto2.setId("2");
        producto2.setNombre("Producto 2");
        producto2.setPrecio(new BigDecimal("200.00"));
        
        List<Producto> productos = Arrays.asList(producto1, producto2);
        
        when(productoService.findAll()).thenReturn(productos);

        // Act & Assert
        mockMvc.perform(get("/productos")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value("1"))
                .andExpect(jsonPath("$[0].nombre").value("Producto 1"))
                .andExpect(jsonPath("$[1].id").value("2"))
                .andExpect(jsonPath("$[1].nombre").value("Producto 2"));
    }

    @Test
    void getProductoById_ShouldReturnProducto() throws Exception {
        // Arrange
        Producto producto = new Producto();
        producto.setId("1");
        producto.setNombre("Producto 1");
        producto.setPrecio(new BigDecimal("100.00"));
        
        when(productoService.findById(anyString())).thenReturn(Optional.of(producto));

        // Act & Assert
        mockMvc.perform(get("/productos/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("1"))
                .andExpect(jsonPath("$.nombre").value("Producto 1"));
    }

    @Test
    void createProducto_ShouldReturnCreated() throws Exception {
        // Arrange
        Producto producto = new Producto();
        producto.setId("1");
        producto.setNombre("Producto 1");
        producto.setPrecio(new BigDecimal("100.00"));
        
        when(productoService.save(any(Producto.class))).thenReturn(producto);

        // Act & Assert
        mockMvc.perform(post("/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombre\":\"Producto 1\",\"precio\":100.00}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("1"))
                .andExpect(jsonPath("$.nombre").value("Producto 1"));
    }
}
