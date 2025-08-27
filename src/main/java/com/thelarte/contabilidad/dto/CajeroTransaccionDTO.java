package com.thelarte.contabilidad.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CajeroTransaccionDTO {
    
    private Long id;
    private String numeroFactura;
    private String tipoTransaccion;
    private LocalDateTime fecha;
    private String estado;
    private ClienteInfoDTO cliente;
    private SuplidorInfoDTO proveedor;
    private List<LineaTransaccionDTO> lineas;
    private BigDecimal subtotal;
    private BigDecimal impuestos;
    private BigDecimal total;
    private String metodoPago;
    private String numeroTransaccionPago;
    private BigDecimal montoPagado;
    private BigDecimal cambio;
    private String observaciones;
    private Boolean impresa;
    
    public static class ClienteInfoDTO {
        private String cedula;
        private String nombre;
        private String apellido;
        private String telefono;
        private String email;
        private String direccion;
        
        public ClienteInfoDTO() {}
        
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
        
        public String getNombreCompleto() {
            return (nombre != null ? nombre : "") + " " + (apellido != null ? apellido : "");
        }
    }
    
    public static class SuplidorInfoDTO {
        private Long id;
        private String nombre;
        private String rnc;
        private String telefono;
        private String email;
        private String direccion;
        private String ciudad;
        
        public SuplidorInfoDTO() {}
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        
        public String getRnc() { return rnc; }
        public void setRnc(String rnc) { this.rnc = rnc; }
        
        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }
        
        public String getCiudad() { return ciudad; }
        public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    }
    
    public static class LineaTransaccionDTO {
        private Long productoId;
        private String nombreProducto;
        private String codigoProducto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal descuento;
        private BigDecimal subtotalLinea;
        private String categoria;
        
        public LineaTransaccionDTO() {}
        
        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }
        
        public String getNombreProducto() { return nombreProducto; }
        public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
        
        public String getCodigoProducto() { return codigoProducto; }
        public void setCodigoProducto(String codigoProducto) { this.codigoProducto = codigoProducto; }
        
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
        
        public BigDecimal getPrecioUnitario() { return precioUnitario; }
        public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
        
        public BigDecimal getDescuento() { return descuento; }
        public void setDescuento(BigDecimal descuento) { this.descuento = descuento; }
        
        public BigDecimal getSubtotalLinea() { return subtotalLinea; }
        public void setSubtotalLinea(BigDecimal subtotalLinea) { this.subtotalLinea = subtotalLinea; }
        
        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }
    }
    
    public CajeroTransaccionDTO() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNumeroFactura() { return numeroFactura; }
    public void setNumeroFactura(String numeroFactura) { this.numeroFactura = numeroFactura; }
    
    public String getTipoTransaccion() { return tipoTransaccion; }
    public void setTipoTransaccion(String tipoTransaccion) { this.tipoTransaccion = tipoTransaccion; }
    
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public ClienteInfoDTO getCliente() { return cliente; }
    public void setCliente(ClienteInfoDTO cliente) { this.cliente = cliente; }
    
    public SuplidorInfoDTO getProveedor() { return proveedor; }
    public void setProveedor(SuplidorInfoDTO proveedor) { this.proveedor = proveedor; }
    
    public List<LineaTransaccionDTO> getLineas() { return lineas; }
    public void setLineas(List<LineaTransaccionDTO> lineas) { this.lineas = lineas; }
    
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    
    public BigDecimal getImpuestos() { return impuestos; }
    public void setImpuestos(BigDecimal impuestos) { this.impuestos = impuestos; }
    
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    
    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    
    public String getNumeroTransaccionPago() { return numeroTransaccionPago; }
    public void setNumeroTransaccionPago(String numeroTransaccionPago) { this.numeroTransaccionPago = numeroTransaccionPago; }
    
    public BigDecimal getMontoPagado() { return montoPagado; }
    public void setMontoPagado(BigDecimal montoPagado) { this.montoPagado = montoPagado; }
    
    public BigDecimal getCambio() { return cambio; }
    public void setCambio(BigDecimal cambio) { this.cambio = cambio; }
    
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    
    public Boolean getImpresa() { return impresa; }
    public void setImpresa(Boolean impresa) { this.impresa = impresa; }
}