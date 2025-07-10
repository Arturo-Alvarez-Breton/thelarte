package com.thelarte.transacciones.service;

import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.model.Transaccion.EstadoTransaccion;
import com.thelarte.transacciones.model.Transaccion.TipoTransaccion;
import com.thelarte.transacciones.model.LineaTransaccion;
import com.thelarte.transacciones.repository.TransaccionRepository;
import com.thelarte.inventory.service.UnidadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransaccionServiceTest {

    @Mock
    private TransaccionRepository transaccionRepository;

    @Mock
    private UnidadService unidadService;

    @InjectMocks
    private TransaccionService transaccionService;

    private Transaccion transaccionCompra;
    private Transaccion transaccionVenta;

    @BeforeEach
    void setUp() {
        transaccionCompra = new Transaccion(
            TipoTransaccion.COMPRA,
            1L,
            Transaccion.TipoContraparte.SUPLIDOR,
            "Test Suplidor"
        );
        transaccionCompra.setId(1L);
        transaccionCompra.setEstado(EstadoTransaccion.CONFIRMADA);
        
        // Add mock lines to the compra transaction
        List<LineaTransaccion> lineasCompra = new ArrayList<>();
        LineaTransaccion linea1 = new LineaTransaccion();
        linea1.setProductoId(1L);
        linea1.setCantidad(2);
        linea1.setPrecioUnitario(BigDecimal.valueOf(100.0));
        lineasCompra.add(linea1);
        transaccionCompra.setLineas(lineasCompra);

        transaccionVenta = new Transaccion(
            TipoTransaccion.VENTA,
            2L,
            Transaccion.TipoContraparte.CLIENTE,
            "Test Cliente"
        );
        transaccionVenta.setId(2L);
        transaccionVenta.setEstado(EstadoTransaccion.CONFIRMADA);
        
        // Add mock lines to the venta transaction
        List<LineaTransaccion> lineasVenta = new ArrayList<>();
        LineaTransaccion linea2 = new LineaTransaccion();
        linea2.setProductoId(2L);
        linea2.setCantidad(1);
        linea2.setPrecioUnitario(BigDecimal.valueOf(200.0));
        lineasVenta.add(linea2);
        transaccionVenta.setLineas(lineasVenta);
    }

    @Test
    void testMarcarComoRecibida_Success() {
        // Arrange
        when(transaccionRepository.findById(1L)).thenReturn(Optional.of(transaccionCompra));
        when(transaccionRepository.save(any(Transaccion.class))).thenReturn(transaccionCompra);

        // Act
        Transaccion result = transaccionService.marcarComoRecibida(1L);

        // Assert
        assertEquals(EstadoTransaccion.RECIBIDA, result.getEstado());
        assertNotNull(result.getFechaEntregaReal());
        verify(transaccionRepository).save(transaccionCompra);
        verify(unidadService, times(2)).registrarUnidad(eq(1L), any(), eq(true));
    }

    @Test
    void testMarcarComoRecibida_OnlyForCompras() {
        // Arrange
        when(transaccionRepository.findById(2L)).thenReturn(Optional.of(transaccionVenta));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> {
            transaccionService.marcarComoRecibida(2L);
        });
        verify(transaccionRepository, never()).save(any());
    }

    @Test
    void testMarcarComoPagada_Success() {
        // Arrange
        when(transaccionRepository.findById(1L)).thenReturn(Optional.of(transaccionCompra));
        when(transaccionRepository.save(any(Transaccion.class))).thenReturn(transaccionCompra);

        // Act
        Transaccion result = transaccionService.marcarComoPagada(1L);

        // Assert
        assertEquals(EstadoTransaccion.PAGADA, result.getEstado());
        verify(transaccionRepository).save(transaccionCompra);
    }

    @Test
    void testMarcarComoEntregada_Success() {
        // Arrange
        when(transaccionRepository.findById(2L)).thenReturn(Optional.of(transaccionVenta));
        when(transaccionRepository.save(any(Transaccion.class))).thenReturn(transaccionVenta);

        // Act
        Transaccion result = transaccionService.marcarComoEntregada(2L);

        // Assert
        assertEquals(EstadoTransaccion.ENTREGADA, result.getEstado());
        assertNotNull(result.getFechaEntregaReal());
        verify(transaccionRepository).save(transaccionVenta);
    }

    @Test
    void testMarcarComoEntregada_OnlyForVentas() {
        // Arrange
        when(transaccionRepository.findById(1L)).thenReturn(Optional.of(transaccionCompra));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> {
            transaccionService.marcarComoEntregada(1L);
        });
        verify(transaccionRepository, never()).save(any());
    }

    @Test
    void testMarcarComoCobrada_Success() {
        // Arrange
        when(transaccionRepository.findById(2L)).thenReturn(Optional.of(transaccionVenta));
        when(transaccionRepository.save(any(Transaccion.class))).thenReturn(transaccionVenta);

        // Act
        Transaccion result = transaccionService.marcarComoCobrada(2L);

        // Assert
        assertEquals(EstadoTransaccion.COBRADA, result.getEstado());
        verify(transaccionRepository).save(transaccionVenta);
    }

    @Test
    void testFacturarVenta_Success() {
        // Arrange
        when(transaccionRepository.findById(2L)).thenReturn(Optional.of(transaccionVenta));
        when(transaccionRepository.save(any(Transaccion.class))).thenReturn(transaccionVenta);

        // Act
        Transaccion result = transaccionService.facturarVenta(2L, "FAC-001");

        // Assert
        assertEquals(EstadoTransaccion.FACTURADA, result.getEstado());
        assertEquals("FAC-001", result.getNumeroFactura());
        verify(transaccionRepository).save(transaccionVenta);
    }

    @Test
    void testFacturarVenta_OnlyForVentas() {
        // Arrange
        when(transaccionRepository.findById(1L)).thenReturn(Optional.of(transaccionCompra));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> {
            transaccionService.facturarVenta(1L, "FAC-001");
        });
        verify(transaccionRepository, never()).save(any());
    }
}