package com.thelarte.inventory.repository;

import com.thelarte.inventory.model.Unidad;
import com.thelarte.inventory.util.EstadoUnidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnidadRepository extends JpaRepository<Unidad, Long> {
    List<Unidad> findByProducto_Id(Long idProducto);
    List<Unidad> findByEstado(EstadoUnidad estado);
    List<Unidad> findByStock(boolean stock);
}