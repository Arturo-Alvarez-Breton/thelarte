package com.thelarte.transacciones.repository;

import com.thelarte.transacciones.model.TransaccionDevolucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransaccionDevolucionRepository extends JpaRepository<TransaccionDevolucion, Long> {

    List<TransaccionDevolucion> findByTransaccionId(Long transaccionId);

    List<TransaccionDevolucion> findBySuplidorId(Long suplidorId);

    List<TransaccionDevolucion> findByEstadoDevolucion(TransaccionDevolucion.EstadoDevolucion estado);

    List<TransaccionDevolucion> findByFechaDevolucionBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    @Query("SELECT td FROM TransaccionDevolucion td WHERE td.transaccion.id = :transaccionId")
    List<TransaccionDevolucion> findDevolucionesPorTransaccion(@Param("transaccionId") Long transaccionId);

    @Query("SELECT td FROM TransaccionDevolucion td WHERE td.suplidorId = :suplidorId AND td.estadoDevolucion = :estado")
    List<TransaccionDevolucion> findDevolucionesPorSuplidorYEstado(@Param("suplidorId") Long suplidorId, 
                                                                   @Param("estado") TransaccionDevolucion.EstadoDevolucion estado);

    @Query("SELECT COUNT(td) FROM TransaccionDevolucion td WHERE td.estadoDevolucion = :estado")
    long countByEstadoDevolucion(@Param("estado") TransaccionDevolucion.EstadoDevolucion estado);

    @Query("SELECT td FROM TransaccionDevolucion td WHERE td.fechaDevolucion BETWEEN :fechaInicio AND :fechaFin AND td.estadoDevolucion = :estado")
    List<TransaccionDevolucion> findDevolucionesEnPeriodoPorEstado(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                                                   @Param("fechaFin") LocalDateTime fechaFin, 
                                                                   @Param("estado") TransaccionDevolucion.EstadoDevolucion estado);
}