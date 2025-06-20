package com.thelarte.inventory.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Unidad {
    @Id
    private String idUnidad;
    private String idProducto;
    private Date fechaIngreso;
    private boolean disponible;  // disponible o vendido
    private boolean stock; // en inventario o en almacen

    public Unidad(String idProducto, Date fechaIngreso, boolean disponible ,boolean stock) {
        this.idProducto = idProducto;
        this.fechaIngreso = fechaIngreso;
        this.stock = stock;
    }

    public Unidad() {
    }

    public boolean isDisponible() {
        return disponible;
    }

    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }

    public String getIdUnidad() {
        return idUnidad;
    }

    public String getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(String idProducto) {
        this.idProducto = idProducto;
    }

    public Date getFechaIngreso() {
        return fechaIngreso;
    }

    public void setFechaIngreso(Date fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }

    public boolean isStock() {
        return stock;
    }

    public void setStock(boolean stock) {
        this.stock = stock;
    }
}