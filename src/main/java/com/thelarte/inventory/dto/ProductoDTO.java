package com.thelarte.inventory.dto;

import java.math.BigDecimal;

public class ProductoDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private String tipo;
    private String descripcion;
    private Float itbis;
    private BigDecimal precioCompra;
    private BigDecimal precioVenta;
    private String fotoBase64;
    private String fotoUrl;
    private Integer cantidadDisponible;
    private Integer cantidadReservada;
    private Integer cantidadDanada;
    private Integer cantidadDevuelta;
    private Integer cantidadAlmacen;
    private boolean eliminado = false;


    public ProductoDTO() {}

    public ProductoDTO(
            Long id,
            String codigo,
            String nombre,
            String tipo,
            String descripcion,
            Float itbis,
            BigDecimal precioCompra,
            BigDecimal precioVenta,
            String fotoUrl,
            Integer cantidadDisponible,
            Integer cantidadDanada,
            Integer cantidadDevuelta,
            Integer cantidadAlmacen,
            boolean eliminado
    ) {
        this.id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.itbis = itbis;
        this.precioCompra = precioCompra;
        this.precioVenta = precioVenta;
        this.fotoUrl = fotoUrl;
        this.cantidadDisponible = cantidadDisponible;
        this.cantidadDanada = cantidadDanada;
        this.cantidadDevuelta = cantidadDevuelta;
        this.cantidadAlmacen = cantidadAlmacen;
        this.eliminado = eliminado;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Float getItbis() { return itbis; }
    public void setItbis(Float itbis) { this.itbis = itbis; }

    public BigDecimal getPrecioCompra() { return precioCompra; }
    public void setPrecioCompra(BigDecimal precioCompra) { this.precioCompra = precioCompra; }

    public BigDecimal getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(BigDecimal precioVenta) { this.precioVenta = precioVenta; }

    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }

    public String getFotoBase64() { return fotoBase64; }
    public void setFotoBase64(String fotoBase64) { this.fotoBase64 = fotoBase64; }

    public Integer getCantidadDisponible() { return cantidadDisponible; }
    public void setCantidadDisponible(Integer cantidadDisponible) { this.cantidadDisponible = cantidadDisponible; }

    public Integer getCantidadReservada() { return cantidadReservada; }
    public void setCantidadReservada(Integer cantidadReservada) { this.cantidadReservada = cantidadReservada; }

    public Integer getCantidadAlmacen() { return cantidadAlmacen; }
    public void setCantidadAlmacen(Integer cantidadAlmacen) { this.cantidadAlmacen = cantidadAlmacen; }

    public Integer getCantidadDanada() { return cantidadDanada; }
    public void setCantidadDanada(Integer cantidadDanada) { this.cantidadDanada = cantidadDanada; }

    public Integer getCantidadDevuelta() { return cantidadDevuelta; }
    public void setCantidadDevuelta(Integer cantidadDevuelta) { this.cantidadDevuelta = cantidadDevuelta; }

    public boolean isEliminado() {
        return eliminado;
    }
    public void setEliminado(boolean eliminado) {
        this.eliminado = eliminado;
    }
}