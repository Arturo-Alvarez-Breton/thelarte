package com.thelarte.contabilidad.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CajaDTO {
    
    private Long id;
    private String cajero;
    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;
    private BigDecimal montoInicialEfectivo;
    private BigDecimal montoCierreEfectivo;
    private BigDecimal totalVentasEfectivo;
    private BigDecimal totalVentasTarjeta;
    private BigDecimal totalVentasTransferencia;
    private BigDecimal totalVentas;
    private BigDecimal totalDevoluciones;
    private BigDecimal ventasNetas;
    private Integer numeroTransacciones;
    private Boolean cerrada;
    private String observaciones;
    private BigDecimal diferenciaCaja;
    
    public CajaDTO() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCajero() { return cajero; }
    public void setCajero(String cajero) { this.cajero = cajero; }
    
    public LocalDateTime getFechaApertura() { return fechaApertura; }
    public void setFechaApertura(LocalDateTime fechaApertura) { this.fechaApertura = fechaApertura; }
    
    public LocalDateTime getFechaCierre() { return fechaCierre; }
    public void setFechaCierre(LocalDateTime fechaCierre) { this.fechaCierre = fechaCierre; }
    
    public BigDecimal getMontoInicialEfectivo() { return montoInicialEfectivo; }
    public void setMontoInicialEfectivo(BigDecimal montoInicialEfectivo) { this.montoInicialEfectivo = montoInicialEfectivo; }
    
    public BigDecimal getMontoCierreEfectivo() { return montoCierreEfectivo; }
    public void setMontoCierreEfectivo(BigDecimal montoCierreEfectivo) { this.montoCierreEfectivo = montoCierreEfectivo; }
    
    public BigDecimal getTotalVentasEfectivo() { return totalVentasEfectivo; }
    public void setTotalVentasEfectivo(BigDecimal totalVentasEfectivo) { this.totalVentasEfectivo = totalVentasEfectivo; }
    
    public BigDecimal getTotalVentasTarjeta() { return totalVentasTarjeta; }
    public void setTotalVentasTarjeta(BigDecimal totalVentasTarjeta) { this.totalVentasTarjeta = totalVentasTarjeta; }
    
    public BigDecimal getTotalVentasTransferencia() { return totalVentasTransferencia; }
    public void setTotalVentasTransferencia(BigDecimal totalVentasTransferencia) { this.totalVentasTransferencia = totalVentasTransferencia; }
    
    public BigDecimal getTotalVentas() { return totalVentas; }
    public void setTotalVentas(BigDecimal totalVentas) { this.totalVentas = totalVentas; }
    
    public BigDecimal getTotalDevoluciones() { return totalDevoluciones; }
    public void setTotalDevoluciones(BigDecimal totalDevoluciones) { this.totalDevoluciones = totalDevoluciones; }
    
    public BigDecimal getVentasNetas() { return ventasNetas; }
    public void setVentasNetas(BigDecimal ventasNetas) { this.ventasNetas = ventasNetas; }
    
    public Integer getNumeroTransacciones() { return numeroTransacciones; }
    public void setNumeroTransacciones(Integer numeroTransacciones) { this.numeroTransacciones = numeroTransacciones; }
    
    public Boolean getCerrada() { return cerrada; }
    public void setCerrada(Boolean cerrada) { this.cerrada = cerrada; }
    
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    
    public BigDecimal getDiferenciaCaja() { return diferenciaCaja; }
    public void setDiferenciaCaja(BigDecimal diferenciaCaja) { this.diferenciaCaja = diferenciaCaja; }
    
    public BigDecimal getEfectivoEsperado() {
        if (montoInicialEfectivo != null && totalVentasEfectivo != null) {
            return montoInicialEfectivo.add(totalVentasEfectivo);
        }
        return BigDecimal.ZERO;
    }
}