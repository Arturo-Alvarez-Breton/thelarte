package com.thelarte.contabilidad.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ClienteCajeroDTO {
    
    private String cedula;
    private String nombre;
    private String apellido;
    private String telefono;
    private String email;
    private String direccion;
    private LocalDate fechaRegistro;
    private Integer totalCompras;
    private BigDecimal totalGastado;
    private LocalDate ultimaCompra;
    private String tipoCliente;
    
    public ClienteCajeroDTO() {}
    
    public String getCedula() { return cedula; }
    public void setCedula(String cedula) { this.cedula = cedula; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    
    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    
    public Integer getTotalCompras() { return totalCompras; }
    public void setTotalCompras(Integer totalCompras) { this.totalCompras = totalCompras; }
    
    public BigDecimal getTotalGastado() { return totalGastado; }
    public void setTotalGastado(BigDecimal totalGastado) { this.totalGastado = totalGastado; }
    
    public LocalDate getUltimaCompra() { return ultimaCompra; }
    public void setUltimaCompra(LocalDate ultimaCompra) { this.ultimaCompra = ultimaCompra; }
    
    public String getTipoCliente() { return tipoCliente; }
    public void setTipoCliente(String tipoCliente) { this.tipoCliente = tipoCliente; }
    
    public String getNombreCompleto() {
        return (nombre != null ? nombre : "") + " " + (apellido != null ? apellido : "");
    }
    
    public String getTipoClienteCalculado() {
        if (totalGastado == null) return "NUEVO";
        
        BigDecimal limite = new BigDecimal("50000");
        if (totalGastado.compareTo(limite) >= 0) {
            return "VIP";
        } else if (totalCompras != null && totalCompras >= 10) {
            return "FRECUENTE";
        } else {
            return "REGULAR";
        }
    }
}