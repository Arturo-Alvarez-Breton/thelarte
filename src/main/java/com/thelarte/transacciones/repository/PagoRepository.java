package com.thelarte.transacciones.repository;

import com.thelarte.transacciones.model.Pago;
import com.thelarte.transacciones.model.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    /**
     * Encuentra todos los pagos asociados a una transacción
     * @param transaccion La transacción para la que buscar pagos
     * @return Lista de pagos asociados
     */
    List<Pago> findByTransaccion(Transaccion transaccion);

    /**
     * Encuentra todos los pagos asociados al ID de una transacción
     * @param transaccionId ID de la transacción
     * @return Lista de pagos asociados
     */
    @Query("SELECT p FROM Pago p WHERE p.transaccion.id = :transaccionId")
    List<Pago> findByTransaccionId(@Param("transaccionId") Long transaccionId);

    /**
     * Encuentra pagos por su estado
     * @param estado El estado del pago (PENDIENTE, COMPLETADO, etc.)
     * @return Lista de pagos con el estado especificado
     */
    List<Pago> findByEstado(Pago.EstadoPago estado);

    /**
     * Encuentra pagos en un rango de fechas
     * @param fechaInicio Fecha inicial (inclusive)
     * @param fechaFin Fecha final (inclusive)
     * @return Lista de pagos en el rango de fechas
     */
    List<Pago> findByFechaBetween(LocalDate fechaInicio, LocalDate fechaFin);

    /**
     * Suma el total de pagos para una transacción
     * @param transaccionId ID de la transacción
     * @return Suma total de los montos de pago
     */
    @Query("SELECT SUM(p.monto) FROM Pago p WHERE p.transaccion.id = :transaccionId AND p.estado = 'COMPLETADO'")
    BigDecimal sumMontoByTransaccionId(@Param("transaccionId") Long transaccionId);

    /**
     * Cuenta los pagos completados para una transacción
     * @param transaccionId ID de la transacción
     * @return Cantidad de pagos completados
     */
    @Query("SELECT COUNT(p) FROM Pago p WHERE p.transaccion.id = :transaccionId AND p.estado = 'COMPLETADO'")
    Long countCompletedPaymentsByTransaccionId(@Param("transaccionId") Long transaccionId);

    /**
     * Encuentra pagos pendientes cuya fecha de vencimiento ya pasó
     * @param hoy Fecha actual
     * @return Lista de pagos vencidos
     */
    @Query("SELECT p FROM Pago p WHERE p.estado = 'PENDIENTE' AND p.fecha < :hoy")
    List<Pago> findOverduePayments(@Param("hoy") LocalDate hoy);

    /**
     * Encuentra pagos por método de pago
     * @param metodoPago El método de pago utilizado
     * @return Lista de pagos con el método especificado
     */
    List<Pago> findByMetodoPago(String metodoPago);
}