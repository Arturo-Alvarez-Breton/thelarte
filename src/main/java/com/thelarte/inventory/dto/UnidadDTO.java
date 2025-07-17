package com.thelarte.inventory.dto;

import com.thelarte.inventory.util.EstadoUnidad;

import java.util.Date;

public class UnidadDTO {
    private long idUnidad;
    private long idProducto;
    private Date fechaIngreso;
    private EstadoUnidad estado;
    private boolean stock; // en inventario o en almacen

    public UnidadDTO(long idUnidad, long idProducto, Date fechaIngreso, EstadoUnidad estado, boolean stock) {
        this.idUnidad = idUnidad;
        this.idProducto = idProducto;
        this.fechaIngreso = fechaIngreso;
        this.estado = estado;
        this.stock = stock;
    }
    public UnidadDTO() {
    }
    public long getIdUnidad() {
        return idUnidad;
    }

    public long getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(long idProducto) {
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
