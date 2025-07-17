package com.thelarte.transacciones.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "transacciones_devolucion")
public class TransaccionDevolucion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaccion_id", nullable = false)
    private Transaccion transaccion;

    @Column(name = "suplidor_id", nullable = false)
    private Long suplidorId;

    @Column(name = "suplidor_nombre", nullable = false)
    private String suplidorNombre;

    @OneToMany(mappedBy = "transaccionDevolucion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LineaTransaccion> lineasDevolucion;

    @Column(name = "fecha_devolucion", nullable = false)
    private LocalDateTime fechaDevolucion;

    @Column(name = "motivo_devolucion", length = 500)
    private String motivoDevolucion;

    @Column(name = "estado_devolucion", nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoDevolucion estadoDevolucion;

    @Column(name = "observaciones", length = 1000)
    private String observaciones;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    public TransaccionDevolucion() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaDevolucion = LocalDateTime.now();
        this.estadoDevolucion = EstadoDevolucion.PENDIENTE;
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

    public Transaccion getTransaccion() {
        return transaccion;
    }

    public void setTransaccion(Transaccion transaccion) {
        this.transaccion = transaccion;
    }

    public Long getSuplidorId() {
        return suplidorId;
    }

    public void setSuplidorId(Long suplidorId) {
        this.suplidorId = suplidorId;
    }

    public String getSuplidorNombre() {
        return suplidorNombre;
    }

    public void setSuplidorNombre(String suplidorNombre) {
        this.suplidorNombre = suplidorNombre;
    }

    public List<LineaTransaccion> getLineasDevolucion() {
        return lineasDevolucion;
    }

    public void setLineasDevolucion(List<LineaTransaccion> lineasDevolucion) {
        this.lineasDevolucion = lineasDevolucion;
    }

    public LocalDateTime getFechaDevolucion() {
        return fechaDevolucion;
    }

    public void setFechaDevolucion(LocalDateTime fechaDevolucion) {
        this.fechaDevolucion = fechaDevolucion;
    }

    public String getMotivoDevolucion() {
        return motivoDevolucion;
    }

    public void setMotivoDevolucion(String motivoDevolucion) {
        this.motivoDevolucion = motivoDevolucion;
    }

    public EstadoDevolucion getEstadoDevolucion() {
        return estadoDevolucion;
    }

    public void setEstadoDevolucion(EstadoDevolucion estadoDevolucion) {
        this.estadoDevolucion = estadoDevolucion;
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

    public enum EstadoDevolucion {
        PENDIENTE,
        PROCESANDO,
        COMPLETADA,
        CANCELADA
    }
}