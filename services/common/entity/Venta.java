package services.common.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
@Entity
public class Venta {

    @Id
    private String id;
    private List <String> idArticulos;
    private String idCliente;
    private String idVenta;
    private String idTransaccion;

    public Venta(List<String> idArticulos, String idCliente, String idVenta, String idTransaccion) {
        this.idArticulos = idArticulos;
        this.idCliente = idCliente;
        this.idVenta = idVenta;
        this.idTransaccion = idTransaccion;
    }

    public List<String> getIdArticulos() {
        return idArticulos;
    }

    public void setIdArticulos(List<String> idArticulos) {
        this.idArticulos = idArticulos;
    }

    public String getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(String idCliente) {
        this.idCliente = idCliente;
    }

    public String getIdVenta() {
        return idVenta;
    }

    public void setIdVenta(String idVenta) {
        this.idVenta = idVenta;
    }

    public String getIdTransaccion() {
        return idTransaccion;
    }

    public void setIdTransaccion(String idTransaccion) {
        this.idTransaccion = idTransaccion;
    }

    public String getId() {
        return id;
    }

}