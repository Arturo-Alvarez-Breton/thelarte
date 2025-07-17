package com.thelarte.inventory.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.thelarte.inventory.util.EstadoUnidad;
import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Unidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_unidad")
    private Long idUnidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Producto producto;
    private Date fechaIngreso;
    private EstadoUnidad estado; // Estado de la unidad (DISPONIBLE, VENDIDO, RESERVADO, DAÑADO)
    private boolean stock; // en inventario = true o en almacen = false
    @Column(name = "transaccion_origen_id")
    private Long transaccionOrigenId;

    public Unidad(Producto producto, Date fechaIngreso ,boolean stock) {
        this.producto = producto;
        this.fechaIngreso = fechaIngreso;
        this.stock = stock;
        this.estado = EstadoUnidad.DISPONIBLE;
    }

    public Unidad() {
        this.estado = EstadoUnidad.DISPONIBLE;
    }

    public Long getIdUnidad() {
        return idUnidad;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
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

    public EstadoUnidad getEstado() {
        return estado;
    }

    public void setEstado(EstadoUnidad estado) {
        this.estado = estado;
    }

    public Long getTransaccionOrigenId() {
        return transaccionOrigenId;
    }
    public void setTransaccionOrigenId(Long transaccionOrigenId) {
        this.transaccionOrigenId = transaccionOrigenId;
    }
}