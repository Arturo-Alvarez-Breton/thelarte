package com.thelarte.shared.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.util.List;
import java.util.UUID;

@Entity
public class Venta {

    @Id
    private String id;
    private List<String> idArticulos;
    private String idCliente;
    private String idVenta;
    private String idTransaccion;
    
    public Venta() {
    }

    public Venta(List<String> idArticulos, String idCliente, String idVenta, String idTransaccion) {
        this.id = UUID.randomUUID().toString();
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
    
    public void setId(String id) {
        this.id = id;
    }
}
