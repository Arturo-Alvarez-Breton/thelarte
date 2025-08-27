package com.thelarte.inventory.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String codigo = UUID.randomUUID().toString(); // Genera un código único para cada producto
    private String nombre;
    private String tipo;
    private String descripcion;
    private float itbis;
    @Column(name = "precio_compra")
    private BigDecimal precioCompra;
    @Column(name = "precio_venta")
    private BigDecimal precioVenta;
    @Column(name = "foto_url")
    private String fotoURL;
    private boolean eliminado = false;
    @Column(name = "estado")
    @Enumerated(EnumType.STRING)
    private EstadoProducto estado;
    
    @Column(name = "cantidad_disponible")
    private Integer cantidadDisponible;
    
    @Column(name = "cantidad_reservada")
    private Integer cantidadReservada;
    @Column(name = "cantidad_danada")
    private Integer cantidadDanada;
    @Column(name = "cantidad_devuelta")
    private Integer cantidadDevuelta;
    @Column(name = "cantidad_almacen")
    private Integer cantidadAlmacen;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    public Producto() {
        this.fechaCreacion = LocalDateTime.now();
        this.estado = EstadoProducto.DISPONIBLE;
        this.cantidadDisponible = 0;
        this.cantidadReservada = 0;
    }

    public Producto(
            String nombre,
            String tipo,
            String descripcion,
            float itbis,
            BigDecimal precioCompra,
            BigDecimal precioVenta,
            String fotoURL,
            Integer cantidadDisponible,
            Integer cantidadReservada,
            Integer cantidadDanada,
            Integer cantidadDevuelta,
            Integer cantidadAlmacen
    ) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.itbis = itbis;
        this.precioCompra = precioCompra;
        this.precioVenta = precioVenta;
        this.fotoURL = fotoURL;
        this.cantidadDisponible = cantidadDisponible != null ? cantidadDisponible : 0;
        this.cantidadReservada = cantidadReservada != null ? cantidadReservada : 0;
        this.cantidadDanada = cantidadDanada != null ? cantidadDanada : 0;
        this.cantidadDevuelta = cantidadDevuelta != null ? cantidadDevuelta : 0;
        this.cantidadAlmacen = cantidadAlmacen != null ? cantidadAlmacen : 0;
        this.fechaCreacion = LocalDateTime.now();
        this.estado = EstadoProducto.DISPONIBLE;
    }

    public long getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }


    public float getItbis() {
        return itbis;
    }

    public void setItbis(float itbis) {
        this.itbis = itbis;
    }

    public BigDecimal getPrecioCompra() {
        return precioCompra;
    }
    public void setPrecioCompra(BigDecimal precioCompra) {
        this.precioCompra = precioCompra;
    }
    public BigDecimal getPrecioVenta() {
        return precioVenta;
    }
    public void setPrecioVenta(BigDecimal precioVenta) {
        this.precioVenta = precioVenta;
    }

    public void setPrecio(BigDecimal precioVenta) {
        this.precioVenta = precioVenta;
    }
    public String getFotoURL() {
        return fotoURL;
    }
    public void setFotoURL(String fotoURL) {
        this.fotoURL = fotoURL;
    }
    
    public EstadoProducto getEstado() {
        return estado;
    }
    
    public void setEstado(EstadoProducto estado) {
        this.estado = estado;
    }
    
    public Integer getCantidadDisponible() {
        return cantidadDisponible;
    }
    
    public void setCantidadDisponible(Integer cantidadDisponible) {
        this.cantidadDisponible = cantidadDisponible;
    }
    
    public Integer getCantidadReservada() {
        return cantidadReservada;
    }
    
    public void setCantidadReservada(Integer cantidadReservada) {
        this.cantidadReservada = cantidadReservada;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }
    
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public Integer getCantidadAlmacen() {
        return cantidadAlmacen;
    }

    public void setCantidadAlmacen(Integer cantidadAlmacen) {
        this.cantidadAlmacen = cantidadAlmacen;
    }

    public Integer getCantidadDanada() {
        return cantidadDanada;
    }

    public void setCantidadDanada(Integer cantidadDanada) {
        this.cantidadDanada = cantidadDanada;
    }

    public Integer getCantidadDevuelta() {
        return cantidadDevuelta;
    }

    public void setCantidadDevuelta(Integer cantidadDevuelta) {
        this.cantidadDevuelta = cantidadDevuelta;
    }

    public boolean isEliminado() {
        return eliminado;
    }
    public void setEliminado(boolean eliminado) {
        this.eliminado = eliminado;
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
    
    public enum EstadoProducto {
        DISPONIBLE,
        AGOTADO,
        DESCONTINUADO
    }


}
