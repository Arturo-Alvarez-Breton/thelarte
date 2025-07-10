package com.thelarte.transacciones.service;

import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.model.Transaccion.EstadoTransaccion;
import com.thelarte.transacciones.model.Transaccion.TipoTransaccion;
import com.thelarte.transacciones.repository.TransaccionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransaccionServiceTest {

    @Mock
    private TransaccionRepository transaccionRepository;

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

        transaccionVenta = new Transaccion(
            TipoTransaccion.VENTA,
            2L,
            Transaccion.TipoContraparte.CLIENTE,
            "Test Cliente"
        );
        transaccionVenta.setId(2L);
        transaccionVenta.setEstado(EstadoTransaccion.CONFIRMADA);
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