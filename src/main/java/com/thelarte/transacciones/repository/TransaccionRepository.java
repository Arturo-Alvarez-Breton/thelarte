package com.thelarte.transacciones.repository;

import com.thelarte.transacciones.model.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {

    List<Transaccion> findByTipoAndDeletedFalse(Transaccion.TipoTransaccion tipo);

    List<Transaccion> findByEstadoAndDeletedFalse(Transaccion.EstadoTransaccion estado);

    List<Transaccion> findByTipoAndEstadoAndDeletedFalse(Transaccion.TipoTransaccion tipo, Transaccion.EstadoTransaccion estado);

    List<Transaccion> findByContraparteIdAndTipoContraparteAndDeletedFalse(Long contraparteId, Transaccion.TipoContraparte tipoContraparte);

    List<Transaccion> findByFechaBetweenAndDeletedFalse(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    @Query("SELECT t FROM Transaccion t WHERE t.tipo = :tipo AND t.fecha BETWEEN :fechaInicio AND :fechaFin AND t.deleted = false")
    List<Transaccion> findComprasEnPeriodo(@Param("tipo") Transaccion.TipoTransaccion tipo, 
                                          @Param("fechaInicio") LocalDateTime fechaInicio, 
                                          @Param("fechaFin") LocalDateTime fechaFin);

    @Query("SELECT t FROM Transaccion t WHERE t.contraparteId = :suplidorId AND t.tipoContraparte = 'SUPLIDOR' AND t.tipo = 'COMPRA' AND t.deleted = false")
    List<Transaccion> findComprasPorSuplidor(@Param("suplidorId") Long suplidorId);

    @Query("SELECT t FROM Transaccion t WHERE t.contraparteId = :clienteId AND t.tipoContraparte = 'CLIENTE' AND t.tipo = 'VENTA' AND t.deleted = false")
    List<Transaccion> findVentasPorCliente(@Param("clienteId") Long clienteId);

    @Query("SELECT t FROM Transaccion t WHERE t.vendedorId = :vendedorId AND t.tipo = 'VENTA' AND t.deleted = false")
    List<Transaccion> findVentasPorVendedor(@Param("vendedorId") Long vendedorId);

    @Query("SELECT t FROM Transaccion t WHERE t.contraparteId = :contraparteId AND t.tipo = 'DEVOLUCION' AND t.deleted = false")
    List<Transaccion> findDevolucionesPorContraparte(@Param("contraparteId") Long contraparteId);

    List<Transaccion> findByNumeroFacturaAndDeletedFalse(String numeroFactura);

    List<Transaccion> findByNumeroOrdenCompraAndDeletedFalse(String numeroOrdenCompra);

    @Query("SELECT COUNT(t) FROM Transaccion t WHERE t.tipo = :tipo AND t.estado = :estado AND t.deleted = false")
    long countByTipoAndEstado(@Param("tipo") Transaccion.TipoTransaccion tipo, 
                             @Param("estado") Transaccion.EstadoTransaccion estado);

    @Query("SELECT SUM(t.total) FROM Transaccion t WHERE t.tipo = :tipo AND t.estado = 'COMPLETADA' AND t.fecha BETWEEN :fechaInicio AND :fechaFin AND t.deleted = false")
    Double sumTotalPorTipoEnPeriodo(@Param("tipo") Transaccion.TipoTransaccion tipo, 
                                   @Param("fechaInicio") LocalDateTime fechaInicio, 
                                   @Param("fechaFin") LocalDateTime fechaFin);

    List<Transaccion> findByTransaccionOrigenIdAndDeletedFalse(Long transaccionOrigenId);

    List<Transaccion> findAllByDeletedFalse();
}