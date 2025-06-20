package com.thelarte.inventory.dto;

import java.math.BigDecimal;

public class ProductoDTO {
    private long id;
    private String nombre;
    private String tipo;
    private String descripcion;
    private String marca;
    private float itbis;
    private BigDecimal precio;
    private String fotoBase64; // solo para recibir del frontend
    private String fotoUrl;    // la URL del archivo en disco

    public ProductoDTO() {
    }

    public ProductoDTO(long id, String nombre, String tipo, String descripcion, String marca, float itbis, BigDecimal precio, String fotoUrl) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.marca = marca;
        this.itbis = itbis;
        this.precio = precio;
        this.fotoUrl = fotoUrl;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public float getItbis() { return itbis; }
    public void setItbis(float itbis) { this.itbis = itbis; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }

    public String getFotoBase64() { return fotoBase64; }
    public void setFotoBase64(String fotoBase64) { this.fotoBase64 = fotoBase64; }
}