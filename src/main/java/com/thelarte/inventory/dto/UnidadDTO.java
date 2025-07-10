package com.thelarte.inventory.dto;

import com.thelarte.inventory.util.EstadoUnidad;

import java.util.Date;

public class UnidadDTO {
    private String idUnidad;
    private String idProducto;
    private Date fechaIngreso;
    private EstadoUnidad estado;
    private boolean stock; // en inventario o en almacen

    public UnidadDTO(String idUnidad, String idProducto, Date fechaIngreso, EstadoUnidad disponible, boolean stock) {
        this.idUnidad = idUnidad;
        this.idProducto = idProducto;
        this.fechaIngreso = fechaIngreso;
        this.estado = estado;
        this.stock = stock;
    }
    public UnidadDTO() {
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

    public EstadoUnidad getEstado() {
        return estado;
    }

    public void setEstado(EstadoUnidad estado) {
        this.estado = estado;
    }

    public boolean isStock() {
        return stock;
    }

    public void setStock(boolean stock) {
        this.stock = stock;
    }
}
