package com.thelarte.transacciones.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class TransaccionDTO {
    private Long id;
    private String tipo;
    private LocalDateTime fecha;
    private String estado;
    private Long contraparteId;
    private String tipoContraparte;
    private String contraparteNombre;
    private List<LineaTransaccionDTO> lineas;
    private BigDecimal subtotal;
    private BigDecimal impuestos;
    private BigDecimal total;
    private String numeroFactura;
    private LocalDateTime fechaEntregaEsperada;
    private LocalDateTime fechaEntregaReal;
    private String condicionesPago;
    private String numeroOrdenCompra;
    private String metodoPago;
    private String numeroTransaccion;
    private Long vendedorId;
    private String direccionEntrega;
    private String observaciones;
    private String metadatosPago;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    public TransaccionDTO() {
    }

    public TransaccionDTO(Long id, String tipo, LocalDateTime fecha, String estado, Long contraparteId, 
                         String tipoContraparte, String contraparteNombre, BigDecimal total) {
        this.id = id;
        this.tipo = tipo;
        this.fecha = fecha;
        this.estado = estado;
        this.contraparteId = contraparteId;
        this.tipoContraparte = tipoContraparte;
        this.contraparteNombre = contraparteNombre;
        this.total = total;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Long getContraparteId() {
        return contraparteId;
    }

    public void setContraparteId(Long contraparteId) {
        this.contraparteId = contraparteId;
    }

    public String getTipoContraparte() {
        return tipoContraparte;
    }

    public void setTipoContraparte(String tipoContraparte) {
        this.tipoContraparte = tipoContraparte;
    }

    public String getContraparteNombre() {
        return contraparteNombre;
    }

    public void setContraparteNombre(String contraparteNombre) {
        this.contraparteNombre = contraparteNombre;
    }

    public List<LineaTransaccionDTO> getLineas() {
        return lineas;
    }

    public void setLineas(List<LineaTransaccionDTO> lineas) {
        this.lineas = lineas;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getImpuestos() {
        return impuestos;
    }

    public void setImpuestos(BigDecimal impuestos) {
        this.impuestos = impuestos;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getNumeroFactura() {
        return numeroFactura;
    }

    public void setNumeroFactura(String numeroFactura) {
        this.numeroFactura = numeroFactura;
    }

    public LocalDateTime getFechaEntregaEsperada() {
        return fechaEntregaEsperada;
    }

    public void setFechaEntregaEsperada(LocalDateTime fechaEntregaEsperada) {
        this.fechaEntregaEsperada = fechaEntregaEsperada;
    }

    public LocalDateTime getFechaEntregaReal() {
        return fechaEntregaReal;
    }

    public void setFechaEntregaReal(LocalDateTime fechaEntregaReal) {
        this.fechaEntregaReal = fechaEntregaReal;
    }

    public String getCondicionesPago() {
        return condicionesPago;
    }

    public void setCondicionesPago(String condicionesPago) {
        this.condicionesPago = condicionesPago;
    }

    public String getNumeroOrdenCompra() {
        return numeroOrdenCompra;
    }

    public void setNumeroOrdenCompra(String numeroOrdenCompra) {
        this.numeroOrdenCompra = numeroOrdenCompra;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getNumeroTransaccion() {
        return numeroTransaccion;
    }

    public void setNumeroTransaccion(String numeroTransaccion) {
        this.numeroTransaccion = numeroTransaccion;
    }

    public Long getVendedorId() {
        return vendedorId;
    }

    public void setVendedorId(Long vendedorId) {
        this.vendedorId = vendedorId;
    }

    public String getDireccionEntrega() {
        return direccionEntrega;
    }

    public void setDireccionEntrega(String direccionEntrega) {
        this.direccionEntrega = direccionEntrega;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getMetadatosPago() {
        return metadatosPago;
    }

    public void setMetadatosPago(String metadatosPago) {
        this.metadatosPago = metadatosPago;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}