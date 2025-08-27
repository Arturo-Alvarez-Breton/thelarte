package com.thelarte.contabilidad.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class DashboardCajeroDTO {
    
    private EstadoCaja estadoCaja;
    private ResumenDelDia resumenDelDia;
    private List<TransaccionRecienteDTO> transaccionesRecientes;
    private List<ProductoMasVendidoDTO> productosMasVendidos;
    
    public static class EstadoCaja {
        private Boolean cajaAbierta;
        private LocalDateTime horaApertura;
        private BigDecimal montoInicialCaja;
        private BigDecimal totalVentasEfectivo;
        private BigDecimal totalVentasTarjeta;
        private BigDecimal totalVentasTransferencia;
        private BigDecimal totalEfectivoEnCaja;
        private String cajeroActual;
        
        public EstadoCaja() {}
        
        public Boolean getCajaAbierta() { return cajaAbierta; }
        public void setCajaAbierta(Boolean cajaAbierta) { this.cajaAbierta = cajaAbierta; }
        
        public LocalDateTime getHoraApertura() { return horaApertura; }
        public void setHoraApertura(LocalDateTime horaApertura) { this.horaApertura = horaApertura; }
        
        public BigDecimal getMontoInicialCaja() { return montoInicialCaja; }
        public void setMontoInicialCaja(BigDecimal montoInicialCaja) { this.montoInicialCaja = montoInicialCaja; }
        
        public BigDecimal getTotalVentasEfectivo() { return totalVentasEfectivo; }
        public void setTotalVentasEfectivo(BigDecimal totalVentasEfectivo) { this.totalVentasEfectivo = totalVentasEfectivo; }
        
        public BigDecimal getTotalVentasTarjeta() { return totalVentasTarjeta; }
        public void setTotalVentasTarjeta(BigDecimal totalVentasTarjeta) { this.totalVentasTarjeta = totalVentasTarjeta; }
        
        public BigDecimal getTotalVentasTransferencia() { return totalVentasTransferencia; }
        public void setTotalVentasTransferencia(BigDecimal totalVentasTransferencia) { this.totalVentasTransferencia = totalVentasTransferencia; }
        
        public BigDecimal getTotalEfectivoEnCaja() { return totalEfectivoEnCaja; }
        public void setTotalEfectivoEnCaja(BigDecimal totalEfectivoEnCaja) { this.totalEfectivoEnCaja = totalEfectivoEnCaja; }
        
        public String getCajeroActual() { return cajeroActual; }
        public void setCajeroActual(String cajeroActual) { this.cajeroActual = cajeroActual; }
    }
    
    public static class ResumenDelDia {
        private Integer totalTransacciones;
        private BigDecimal totalVentas;
        private BigDecimal totalDevoluciones;
        private BigDecimal ventasNetas;
        private Integer clientesAtendidos;
        private BigDecimal promedioVentaPorCliente;
        
        public ResumenDelDia() {}
        
        public Integer getTotalTransacciones() { return totalTransacciones; }
        public void setTotalTransacciones(Integer totalTransacciones) { this.totalTransacciones = totalTransacciones; }
        
        public BigDecimal getTotalVentas() { return totalVentas; }
        public void setTotalVentas(BigDecimal totalVentas) { this.totalVentas = totalVentas; }
        
        public BigDecimal getTotalDevoluciones() { return totalDevoluciones; }
        public void setTotalDevoluciones(BigDecimal totalDevoluciones) { this.totalDevoluciones = totalDevoluciones; }
        
        public BigDecimal getVentasNetas() { return ventasNetas; }
        public void setVentasNetas(BigDecimal ventasNetas) { this.ventasNetas = ventasNetas; }
        
        public Integer getClientesAtendidos() { return clientesAtendidos; }
        public void setClientesAtendidos(Integer clientesAtendidos) { this.clientesAtendidos = clientesAtendidos; }
        
        public BigDecimal getPromedioVentaPorCliente() { return promedioVentaPorCliente; }
        public void setPromedioVentaPorCliente(BigDecimal promedioVentaPorCliente) { this.promedioVentaPorCliente = promedioVentaPorCliente; }
    }
    
    public static class TransaccionRecienteDTO {
        private Long id;
        private String numeroFactura;
        private String tipoTransaccion;
        private String clienteNombre;
        private BigDecimal total;
        private String metodoPago;
        private LocalDateTime fecha;
        private String estado;
        
        public TransaccionRecienteDTO() {}
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getNumeroFactura() { return numeroFactura; }
        public void setNumeroFactura(String numeroFactura) { this.numeroFactura = numeroFactura; }
        
        public String getTipoTransaccion() { return tipoTransaccion; }
        public void setTipoTransaccion(String tipoTransaccion) { this.tipoTransaccion = tipoTransaccion; }
        
        public String getClienteNombre() { return clienteNombre; }
        public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
        
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
        
        public String getMetodoPago() { return metodoPago; }
        public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
        
        public LocalDateTime getFecha() { return fecha; }
        public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
        
        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }
    }
    
    public static class ProductoMasVendidoDTO {
        private Long productoId;
        private String nombreProducto;
        private Integer cantidadVendida;
        private BigDecimal totalVendido;
        private String categoria;
        
        public ProductoMasVendidoDTO() {}
        
        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }
        
        public String getNombreProducto() { return nombreProducto; }
        public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
        
        public Integer getCantidadVendida() { return cantidadVendida; }
        public void setCantidadVendida(Integer cantidadVendida) { this.cantidadVendida = cantidadVendida; }
        
        public BigDecimal getTotalVendido() { return totalVendido; }
        public void setTotalVendido(BigDecimal totalVendido) { this.totalVendido = totalVendido; }
        
        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }
    }
    
    public DashboardCajeroDTO() {}
    
    public EstadoCaja getEstadoCaja() { return estadoCaja; }
    public void setEstadoCaja(EstadoCaja estadoCaja) { this.estadoCaja = estadoCaja; }
    
    public ResumenDelDia getResumenDelDia() { return resumenDelDia; }
    public void setResumenDelDia(ResumenDelDia resumenDelDia) { this.resumenDelDia = resumenDelDia; }
    
    public List<TransaccionRecienteDTO> getTransaccionesRecientes() { return transaccionesRecientes; }
    public void setTransaccionesRecientes(List<TransaccionRecienteDTO> transaccionesRecientes) { this.transaccionesRecientes = transaccionesRecientes; }
    
    public List<ProductoMasVendidoDTO> getProductosMasVendidos() { return productosMasVendidos; }
    public void setProductosMasVendidos(List<ProductoMasVendidoDTO> productosMasVendidos) { this.productosMasVendidos = productosMasVendidos; }
}