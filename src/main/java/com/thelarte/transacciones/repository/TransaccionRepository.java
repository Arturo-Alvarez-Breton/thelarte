package com.thelarte.transacciones.repository;

import com.thelarte.transacciones.model.Transaccion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {

    List<Transaccion> findByTipo(Transaccion.TipoTransaccion tipo);

    List<Transaccion> findByEstado(Transaccion.EstadoTransaccion estado);

    List<Transaccion> findByTipoAndEstado(Transaccion.TipoTransaccion tipo, Transaccion.EstadoTransaccion estado);

    List<Transaccion> findByContraparteIdAndTipoContraparte(Long contraparteId, Transaccion.TipoContraparte tipoContraparte);

    List<Transaccion> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    // Métodos que excluyen transacciones eliminadas lógicamente
    List<Transaccion> findByDeletedFalse();

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

    @Query("SELECT COUNT(t) FROM Transaccion t WHERE t.tipo = :tipo AND t.estado = :estado AND t.deleted = false")
    long countByTipoAndEstado(@Param("tipo") Transaccion.TipoTransaccion tipo, 
                             @Param("estado") Transaccion.EstadoTransaccion estado);

    @Query("SELECT SUM(t.total) FROM Transaccion t WHERE t.tipo = :tipo AND t.estado = 'COMPLETADA' AND t.fecha BETWEEN :fechaInicio AND :fechaFin AND t.deleted = false")
    Double sumTotalPorTipoEnPeriodo(@Param("tipo") Transaccion.TipoTransaccion tipo, 
                                   @Param("fechaInicio") LocalDateTime fechaInicio, 
                                   @Param("fechaFin") LocalDateTime fechaFin);

    List<Transaccion> findByTransaccionOrigenId(Long transaccionOrigenId);

    List<Transaccion> findByTransaccionOrigenIdAndDeletedFalse(Long transaccionOrigenId);

    /**
     * Encuentra transacciones por tipo, tipo de pago y que no estén eliminadas
     */
    List<Transaccion> findByTipoAndTipoPagoAndDeletedFalse(
            Transaccion.TipoTransaccion tipo,
            Transaccion.TipoPago tipoPago
    );

    /**
     * Encuentra ventas que tienen saldo pendiente (pagos en cuotas no completados)
     */
    @Query("SELECT t FROM Transaccion t WHERE t.tipo = 'VENTA' AND t.tipoPago = 'ENCUOTAS' " +
            "AND t.saldoPendiente > 0 AND t.deleted = false " +
            "ORDER BY t.fecha DESC")
    List<Transaccion> findVentasConSaldoPendiente();

    // También puedes agregar una versión alternativa con parámetros más flexibles
    @Query("SELECT t FROM Transaccion t WHERE t.tipo = 'VENTA' AND t.tipoPago = 'ENCUOTAS' " +
            "AND t.saldoPendiente > :montoMinimo AND t.estado <> 'COBRADA' AND t.deleted = false " +
            "ORDER BY t.fecha DESC")
    List<Transaccion> findVentasConSaldoPendienteMayorQue(java.math.BigDecimal montoMinimo);

    // Método para buscar ventas pendientes por cliente
    @Query("SELECT t FROM Transaccion t WHERE t.tipo = 'VENTA' AND t.tipoPago = 'ENCUOTAS' " +
            "AND t.saldoPendiente > 0 AND t.contraparteId = :clienteId AND t.deleted = false " +
            "ORDER BY t.fecha DESC")
    List<Transaccion> findVentasConSaldoPendienteByCliente(Long clienteId);


/**
     * Busca transacciones por fecha con paginación ordenadas por fecha descendente.
     * @param fechaInicio Fecha de inicio
     * @param fechaFin Fecha de fin
     * @param pageable Información de paginación
     * @return Página de transacciones ordenadas por fecha descendente
     */
    Page<Transaccion> findByFechaBetweenOrderByFechaDesc(LocalDateTime fechaInicio, LocalDateTime fechaFin, Pageable pageable);
}