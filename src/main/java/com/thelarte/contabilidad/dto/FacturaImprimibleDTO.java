package com.thelarte.contabilidad.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class FacturaImprimibleDTO {
    
    private DatosEmpresa empresa;
    private DatosFactura factura;
    private DatosCliente cliente;
    private List<LineaFacturaDTO> lineas;
    private ResumenFactura resumen;
    private String firmaDigital;
    private String codigoQR;
    
    public static class DatosEmpresa {
        private String nombre;
        private String rnc;
        private String direccion;
        private String telefono;
        private String email;
        private String sitioWeb;
        private String logo;
        
        public DatosEmpresa() {}
        
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        
        public String getRnc() { return rnc; }
        public void setRnc(String rnc) { this.rnc = rnc; }
        
        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }
        
        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getSitioWeb() { return sitioWeb; }
        public void setSitioWeb(String sitioWeb) { this.sitioWeb = sitioWeb; }
        
        public String getLogo() { return logo; }
        public void setLogo(String logo) { this.logo = logo; }
    }
    
    public static class DatosFactura {
        private String numeroFactura;
        private String tipo;
        private LocalDateTime fecha;
        private String cajero;
        private String metodoPago;
        private String numeroTransaccionPago;
        private String ncf;
        private String condicionesPago;
        
        public DatosFactura() {}
        
        public String getNumeroFactura() { return numeroFactura; }
        public void setNumeroFactura(String numeroFactura) { this.numeroFactura = numeroFactura; }
        
        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }
        
        public LocalDateTime getFecha() { return fecha; }
        public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
        
        public String getCajero() { return cajero; }
        public void setCajero(String cajero) { this.cajero = cajero; }
        
        public String getMetodoPago() { return metodoPago; }
        public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
        
        public String getNumeroTransaccionPago() { return numeroTransaccionPago; }
        public void setNumeroTransaccionPago(String numeroTransaccionPago) { this.numeroTransaccionPago = numeroTransaccionPago; }
        
        public String getNcf() { return ncf; }
        public void setNcf(String ncf) { this.ncf = ncf; }
        
        public String getCondicionesPago() { return condicionesPago; }
        public void setCondicionesPago(String condicionesPago) { this.condicionesPago = condicionesPago; }
    }
    
    public static class DatosCliente {
        private String cedula;
        private String nombre;
        private String apellido;
        private String telefono;
        private String email;
        private String direccion;
        private String rnc;
        
        public DatosCliente() {}
        
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
        
        public String getRnc() { return rnc; }
        public void setRnc(String rnc) { this.rnc = rnc; }
        
        public String getNombreCompleto() {
            return (nombre != null ? nombre : "") + " " + (apellido != null ? apellido : "");
        }
    }
    
    public static class LineaFacturaDTO {
        private String codigo;
        private String descripcion;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal descuento;
        private BigDecimal itbis;
        private BigDecimal subtotal;
        
        public LineaFacturaDTO() {}
        
        public String getCodigo() { return codigo; }
        public void setCodigo(String codigo) { this.codigo = codigo; }
        
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
        
        public BigDecimal getPrecioUnitario() { return precioUnitario; }
        public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
        
        public BigDecimal getDescuento() { return descuento; }
        public void setDescuento(BigDecimal descuento) { this.descuento = descuento; }
        
        public BigDecimal getItbis() { return itbis; }
        public void setItbis(BigDecimal itbis) { this.itbis = itbis; }
        
        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    }
    
    public static class ResumenFactura {
        private BigDecimal subtotal;
        private BigDecimal totalDescuentos;
        private BigDecimal baseImponible;
        private BigDecimal totalItbis;
        private BigDecimal total;
        private BigDecimal montoPagado;
        private BigDecimal cambio;
        private String totalEnLetras;
        
        public ResumenFactura() {}
        
        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
        
        public BigDecimal getTotalDescuentos() { return totalDescuentos; }
        public void setTotalDescuentos(BigDecimal totalDescuentos) { this.totalDescuentos = totalDescuentos; }
        
        public BigDecimal getBaseImponible() { return baseImponible; }
        public void setBaseImponible(BigDecimal baseImponible) { this.baseImponible = baseImponible; }
        
        public BigDecimal getTotalItbis() { return totalItbis; }
        public void setTotalItbis(BigDecimal totalItbis) { this.totalItbis = totalItbis; }
        
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
        
        public BigDecimal getMontoPagado() { return montoPagado; }
        public void setMontoPagado(BigDecimal montoPagado) { this.montoPagado = montoPagado; }
        
        public BigDecimal getCambio() { return cambio; }
        public void setCambio(BigDecimal cambio) { this.cambio = cambio; }
        
        public String getTotalEnLetras() { return totalEnLetras; }
        public void setTotalEnLetras(String totalEnLetras) { this.totalEnLetras = totalEnLetras; }
    }
    
    public FacturaImprimibleDTO() {}
    
    public DatosEmpresa getEmpresa() { return empresa; }
    public void setEmpresa(DatosEmpresa empresa) { this.empresa = empresa; }
    
    public DatosFactura getFactura() { return factura; }
    public void setFactura(DatosFactura factura) { this.factura = factura; }
    
    public DatosCliente getCliente() { return cliente; }
    public void setCliente(DatosCliente cliente) { this.cliente = cliente; }
    
    public List<LineaFacturaDTO> getLineas() { return lineas; }
    public void setLineas(List<LineaFacturaDTO> lineas) { this.lineas = lineas; }
    
    public ResumenFactura getResumen() { return resumen; }
    public void setResumen(ResumenFactura resumen) { this.resumen = resumen; }
    
    public String getFirmaDigital() { return firmaDigital; }
    public void setFirmaDigital(String firmaDigital) { this.firmaDigital = firmaDigital; }
    
    public String getCodigoQR() { return codigoQR; }
    public void setCodigoQR(String codigoQR) { this.codigoQR = codigoQR; }
}