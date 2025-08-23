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

    @Column(nullable = false)
    private String tipo; // "ajuste_disponible", "almacen_a_disponible", etc.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimientoSimple tipoSimple; // INGRESO, REBAJA, TRANSFERENCIA

    private Integer cantidad;
    private String motivo;
    private LocalDateTime fecha;
    private String idUsuario;

    public Movimiento() {}

    public Movimiento(Producto producto, String tipo, TipoMovimientoSimple tipoSimple, Integer cantidad, String motivo, LocalDateTime fecha, String idUsuario) {
        this.producto = producto;
        this.tipo = tipo;
        this.tipoSimple = tipoSimple;
        this.cantidad = cantidad;
        this.motivo = motivo;
        this.fecha = fecha;
        this.idUsuario = idUsuario;
    }

    // Getters y setters...
    public Long getId() { return id; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public TipoMovimientoSimple getTipoSimple() { return tipoSimple; }
    public void setTipoSimple(TipoMovimientoSimple tipoSimple) { this.tipoSimple = tipoSimple; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public String getIdUsuario() { return idUsuario; }
    public void setIdUsuario(String idUsuario) { this.idUsuario = idUsuario; }

    public enum TipoMovimientoSimple {
        INGRESO,       // aumento
        REBAJA,        // disminución
        TRANSFERENCIA  // entre estados
    }
}