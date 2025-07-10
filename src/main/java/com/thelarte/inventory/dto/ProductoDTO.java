package com.thelarte.inventory.dto;

import java.math.BigDecimal;

public class ProductoDTO {
    private long id;
    private String codigo; // Generado automáticamente, no se recibe del frontend
    private String nombre;
    private String tipo;
    private String descripcion;
    private float itbis;
    private BigDecimal precioCompra;
    private BigDecimal precioVenta;
    private String fotoBase64; // solo para recibir del frontend
    private String fotoUrl;
    private int cantidadDisponible;// la URL del archivo en disco

    public ProductoDTO() {
    }

    public ProductoDTO(long id, String codigo, String nombre, String tipo, String descripcion, float itbis, BigDecimal precioCompra,BigDecimal precioVenta, String fotoUrl, int cantidadDisponible) {
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
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public float getItbis() { return itbis; }
    public void setItbis(float itbis) { this.itbis = itbis; }

    public BigDecimal getPrecioCompra() { return precioCompra; }
    public void setPrecioCompra(BigDecimal precioCompra) { this.precioCompra = precioCompra; }
    public BigDecimal getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(BigDecimal precioVenta) { this.precioVenta = precioVenta; }

    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }

    public String getFotoBase64() { return fotoBase64; }
    public void setFotoBase64(String fotoBase64) { this.fotoBase64 = fotoBase64; }

    public int getCantidadDisponible() {
        return cantidadDisponible;
    }
    public void setCantidadDisponible(int cantidadDisponible) {
        this.cantidadDisponible = cantidadDisponible;
    }
}