package com.thelarte.transacciones.dto;

import java.math.BigDecimal;

public class LineaTransaccionDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private BigDecimal impuestoPorcentaje;
    private BigDecimal impuestoMonto;
    private BigDecimal total;
    private BigDecimal descuentoPorcentaje;
    private BigDecimal descuentoMonto;
    private String observaciones;

    public LineaTransaccionDTO() {
    }

    public LineaTransaccionDTO(Long productoId, String productoNombre, Integer cantidad, BigDecimal precioUnitario) {
        this.productoId = productoId;
        this.productoNombre = productoNombre;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public String getProductoNombre() {
        return productoNombre;
    }

    public void setProductoNombre(String productoNombre) {
        this.productoNombre = productoNombre;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getImpuestoPorcentaje() {
        return impuestoPorcentaje;
    }

    public void setImpuestoPorcentaje(BigDecimal impuestoPorcentaje) {
        this.impuestoPorcentaje = impuestoPorcentaje;
    }

    public BigDecimal getImpuestoMonto() {
        return impuestoMonto;
    }

    public void setImpuestoMonto(BigDecimal impuestoMonto) {
        this.impuestoMonto = impuestoMonto;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getDescuentoPorcentaje() {
        return descuentoPorcentaje;
    }

    public void setDescuentoPorcentaje(BigDecimal descuentoPorcentaje) {
        this.descuentoPorcentaje = descuentoPorcentaje;
    }

    public BigDecimal getDescuentoMonto() {
        return descuentoMonto;
    }

    public void setDescuentoMonto(BigDecimal descuentoMonto) {
        this.descuentoMonto = descuentoMonto;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}