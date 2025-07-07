package com.thelarte.transacciones.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "transacciones")
public class Transaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoTransaccion tipo;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "estado", nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoTransaccion estado;

    @Column(name = "contraparte_id", nullable = false)
    private Long contraparteId;

    @Column(name = "tipo_contraparte", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoContraparte tipoContraparte;

    @Column(name = "contraparte_nombre", nullable = false)
    private String contraparteNombre;

    @OneToMany(mappedBy = "transaccion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LineaTransaccion> lineas;

    @Column(name = "subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "impuestos", precision = 12, scale = 2)
    private BigDecimal impuestos;

    @Column(name = "total", precision = 12, scale = 2, nullable = false)
    private BigDecimal total;

    @Column(name = "numero_factura")
    private String numeroFactura;

    @Column(name = "fecha_entrega_esperada")
    private LocalDateTime fechaEntregaEsperada;

    @Column(name = "fecha_entrega_real")
    private LocalDateTime fechaEntregaReal;

    @Column(name = "condiciones_pago")
    private String condicionesPago;

    @Column(name = "numero_orden_compra")
    private String numeroOrdenCompra;

    @Column(name = "metodo_pago")
    private String metodoPago;

    @Column(name = "numero_transaccion")
    private String numeroTransaccion;

    @Column(name = "vendedor_id")
    private Long vendedorId;

    @Column(name = "direccion_entrega", length = 500)
    private String direccionEntrega;

    @Column(name = "observaciones", length = 1000)
    private String observaciones;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    public Transaccion() {
        this.fechaCreacion = LocalDateTime.now();
        this.fecha = LocalDateTime.now();
        this.estado = EstadoTransaccion.PENDIENTE;
    }

    public Transaccion(TipoTransaccion tipo, Long contraparteId, TipoContraparte tipoContraparte, String contraparteNombre) {
        this();
        this.tipo = tipo;
        this.contraparteId = contraparteId;
        this.tipoContraparte = tipoContraparte;
        this.contraparteNombre = contraparteNombre;
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TipoTransaccion getTipo() {
        return tipo;
    }

    public void setTipo(TipoTransaccion tipo) {
        this.tipo = tipo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public EstadoTransaccion getEstado() {
        return estado;
    }

    public void setEstado(EstadoTransaccion estado) {
        this.estado = estado;
    }

    public Long getContraparteId() {
        return contraparteId;
    }

    public void setContraparteId(Long contraparteId) {
        this.contraparteId = contraparteId;
    }

    public TipoContraparte getTipoContraparte() {
        return tipoContraparte;
    }

    public void setTipoContraparte(TipoContraparte tipoContraparte) {
        this.tipoContraparte = tipoContraparte;
    }

    public String getContraparteNombre() {
        return contraparteNombre;
    }

    public void setContraparteNombre(String contraparteNombre) {
        this.contraparteNombre = contraparteNombre;
    }

    public List<LineaTransaccion> getLineas() {
        return lineas;
    }

    public void setLineas(List<LineaTransaccion> lineas) {
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

    public enum TipoTransaccion {
        COMPRA,
        VENTA,
        DEVOLUCION
    }

    public enum EstadoTransaccion {
        PENDIENTE,
        CONFIRMADA,
        COMPLETADA,
        CANCELADA
    }

    public enum TipoContraparte {
        CLIENTE,
        SUPLIDOR
    }
}