package services.common.repository;

import services.common.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VentaRepository extends JpaRepository<Venta, String> {

    //List<Venta> findByNombreContaining(String nombre);
}
