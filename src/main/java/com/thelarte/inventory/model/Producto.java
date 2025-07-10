package com.thelarte.inventory.model;

import com.thelarte.inventory.util.EstadoUnidad;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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
    private BigDecimal precioCompra;
    private BigDecimal precioVenta;
    private String fotoURL;
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Unidad> unidades = new ArrayList<>();
    
    @Column(name = "estado")
    @Enumerated(EnumType.STRING)
    private EstadoProducto estado;
    
    @Column(name = "cantidad_disponible")
    private Integer cantidadDisponible;
    
    @Column(name = "cantidad_reservada")
    private Integer cantidadReservada;
    
    @Column(name = "es_nuevo")
    private Boolean esNuevo;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    public Producto() {
        this.fechaCreacion = LocalDateTime.now();
        this.estado = EstadoProducto.DISPONIBLE;
        this.cantidadDisponible = 0;
        this.cantidadReservada = 0;
        this.esNuevo = true;
    }

    public Producto(String nombre, String tipo, String descripcion, float itbis, BigDecimal precioCompra, BigDecimal precioVenta, String fotoURL) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.itbis = itbis;
        this.precioCompra = precioCompra;
        this.precioVenta = precioVenta;
        this.fotoURL = fotoURL;
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
    
    public Boolean getEsNuevo() {
        return esNuevo;
    }
    
    public void setEsNuevo(Boolean esNuevo) {
        this.esNuevo = esNuevo;
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
    
    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
    
    public enum EstadoProducto {
        DISPONIBLE,
        AGOTADO,
        DESCONTINUADO
    }

    public List<Unidad> getUnidades() {
        return unidades;
    }

    public void actualizarEstadoPorUnidades() {
        long disponibles = unidades.stream()
                .filter(u -> u.getEstado() == EstadoUnidad.DISPONIBLE)
                .count();

        if (disponibles > 0) {
            this.estado = EstadoProducto.DISPONIBLE;
        } else {
            this.estado = EstadoProducto.AGOTADO;
        }
    }
}
