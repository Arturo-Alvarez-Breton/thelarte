package com.thelarte.contabilidad.dto;

import java.math.BigDecimal;

public class ProductoCajeroDTO {
    
    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String categoria;
    private BigDecimal precioVenta;
    private Integer cantidadDisponible;
    private Boolean disponible;
    private String fotoURL;
    private Float itbis;
    private Boolean esNuevo;
    
    public ProductoCajeroDTO() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    
    public BigDecimal getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(BigDecimal precioVenta) { this.precioVenta = precioVenta; }
    
    public Integer getCantidadDisponible() { return cantidadDisponible; }
    public void setCantidadDisponible(Integer cantidadDisponible) { this.cantidadDisponible = cantidadDisponible; }
    
    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }
    
    public String getFotoURL() { return fotoURL; }
    public void setFotoURL(String fotoURL) { this.fotoURL = fotoURL; }
    
    public Float getItbis() { return itbis; }
    public void setItbis(Float itbis) { this.itbis = itbis; }
    
    public Boolean getEsNuevo() { return esNuevo; }
    public void setEsNuevo(Boolean esNuevo) { this.esNuevo = esNuevo; }
    
    public boolean puedeVenderse() {
        return disponible != null && disponible && 
               cantidadDisponible != null && cantidadDisponible > 0;
    }
}