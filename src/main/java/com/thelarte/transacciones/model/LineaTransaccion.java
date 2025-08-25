package com.thelarte.transacciones.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "lineas_transaccion")
public class LineaTransaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaccion_id", nullable = true)
    private Transaccion transaccion;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @Column(name = "producto_nombre", nullable = false)
    private String productoNombre;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", precision = 12, scale = 2, nullable = false)
    private BigDecimal precioUnitario;

    @Column(name = "subtotal", precision = 12, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @Column(name = "impuesto_porcentaje", precision = 5, scale = 2)
    private BigDecimal impuestoPorcentaje;

    @Column(name = "impuesto_monto", precision = 12, scale = 2)
    private BigDecimal impuestoMonto;

    @Column(name = "total", precision = 12, scale = 2, nullable = false)
    private BigDecimal total;

    @Column(name = "descuento_porcentaje", precision = 5, scale = 2)
    private BigDecimal descuentoPorcentaje;

    @Column(name = "descuento_monto", precision = 12, scale = 2)
    private BigDecimal descuentoMonto;

    @Column(name = "observaciones", length = 500)
    private String observaciones;

    public LineaTransaccion() {
    }

    public LineaTransaccion(Transaccion transaccion, Long productoId, String productoNombre, Integer cantidad, BigDecimal precioUnitario) {
        this.transaccion = transaccion;
        this.productoId = productoId;
        this.productoNombre = productoNombre;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.calcularTotales();
    }

    public void calcularTotales() {
        // Check for null values to prevent NullPointerException
        if (this.precioUnitario == null) {
            this.precioUnitario = BigDecimal.ZERO;
        }
        
        if (this.cantidad == null) {
            this.cantidad = 0;
        }
        
        this.subtotal = this.precioUnitario.multiply(BigDecimal.valueOf(this.cantidad));
        
        if (this.descuentoMonto != null) {
            this.subtotal = this.subtotal.subtract(this.descuentoMonto);
        } else if (this.descuentoPorcentaje != null) {
            BigDecimal descuento = this.subtotal.multiply(this.descuentoPorcentaje).divide(BigDecimal.valueOf(100));
            this.subtotal = this.subtotal.subtract(descuento);
            this.descuentoMonto = descuento;
        }

        if (this.impuestoPorcentaje != null) {
            this.impuestoMonto = this.subtotal
                    .multiply(this.impuestoPorcentaje)
                    .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);
        } else {
            this.impuestoMonto = BigDecimal.ZERO;
        }

        this.total = this.subtotal.add(this.impuestoMonto != null ? this.impuestoMonto : BigDecimal.ZERO);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Transaccion getTransaccion() {
        return transaccion;
    }

    public void setTransaccion(Transaccion transaccion) {
        this.transaccion = transaccion;
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
        this.calcularTotales();
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
        this.calcularTotales();
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
        this.calcularTotales();
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
        this.calcularTotales();
    }

    public BigDecimal getDescuentoMonto() {
        return descuentoMonto;
    }

    public void setDescuentoMonto(BigDecimal descuentoMonto) {
        this.descuentoMonto = descuentoMonto;
        this.calcularTotales();
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public BigDecimal getDescuento() {
        return descuentoMonto != null ? descuentoMonto : BigDecimal.ZERO;
    }
}