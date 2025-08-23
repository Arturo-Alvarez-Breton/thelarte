package com.thelarte.inventory.repository;

import com.thelarte.inventory.model.Movimiento;
import com.thelarte.inventory.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {
    List<Movimiento> findByProducto(Producto producto);
}