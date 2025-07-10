package com.thelarte.inventory.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.math.BigDecimal;
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

    public Producto() {
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
    

}
