package com.thelarte.transacciones.dto;

import com.thelarte.transacciones.model.TransaccionDevolucion;
import java.time.LocalDateTime;
import java.util.List;

public class TransaccionDevolucionDTO {

    private Long id;
    private Long transaccionId;
    private TransaccionDTO transaccion;
    private Long suplidorId;
    private String suplidorNombre;
    private List<LineaTransaccionDTO> lineasDevolucion;
    private LocalDateTime fechaDevolucion;
    private String motivoDevolucion;
    private TransaccionDevolucion.EstadoDevolucion estadoDevolucion;
    private String observaciones;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    public TransaccionDevolucionDTO() {
    }

    public TransaccionDevolucionDTO(Long id, Long transaccionId, Long suplidorId, String suplidorNombre, 
                                   LocalDateTime fechaDevolucion, String motivoDevolucion, 
                                   TransaccionDevolucion.EstadoDevolucion estadoDevolucion, 
                                   String observaciones, LocalDateTime fechaCreacion, 
                                   LocalDateTime fechaActualizacion) {
        this.id = id;
        this.transaccionId = transaccionId;
        this.suplidorId = suplidorId;
        this.suplidorNombre = suplidorNombre;
        this.fechaDevolucion = fechaDevolucion;
        this.motivoDevolucion = motivoDevolucion;
        this.estadoDevolucion = estadoDevolucion;
        this.observaciones = observaciones;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTransaccionId() {
        return transaccionId;
    }

    public void setTransaccionId(Long transaccionId) {
        this.transaccionId = transaccionId;
    }

    public TransaccionDTO getTransaccion() {
        return transaccion;
    }

    public void setTransaccion(TransaccionDTO transaccion) {
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

    public List<LineaTransaccionDTO> getLineasDevolucion() {
        return lineasDevolucion;
    }

    public void setLineasDevolucion(List<LineaTransaccionDTO> lineasDevolucion) {
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

    public TransaccionDevolucion.EstadoDevolucion getEstadoDevolucion() {
        return estadoDevolucion;
    }

    public void setEstadoDevolucion(TransaccionDevolucion.EstadoDevolucion estadoDevolucion) {
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
}