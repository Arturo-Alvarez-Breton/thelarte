package com.thelarte.inventory.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_producto")
public class Movimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Producto producto;

    @Enumerated(EnumType.STRING)
    private TipoMovimiento tipo; // Enum: ALMACEN_A_DISPONIBLE, DISPONIBLE_A_ALMACEN, etc.

    private Integer cantidad;

    private String motivo;

    private LocalDateTime fecha;

    private String usuario; // Opcional, para saber quién hizo el movimiento

    public Movimiento(Producto producto, TipoMovimiento tipo, Integer cantidad, String motivo, LocalDateTime fecha, String usuario) {
        this.producto = producto;
        this.tipo = tipo;
        this.cantidad = cantidad;
        this.motivo = motivo;
        this.fecha = fecha;
        this.usuario = usuario;
    }
    public Movimiento() {
    }
    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public TipoMovimiento getTipo() {
        return tipo;
    }

    public void setTipo(TipoMovimiento tipo) {
        this.tipo = tipo;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public enum TipoMovimiento {
        ALMACEN_A_DISPONIBLE,
        DISPONIBLE_A_ALMACEN,
        DANADA_A_DISPONIBLE,
        DISPONIBLE_A_DANADA,
        AJUSTE_DISPONIBLE,
        AJUSTE_ALMACEN,
        AJUSTE_DANADA
    }
}
