package com.thelarte.inventory.dto;

import java.time.LocalDateTime;

public class MovimientoDTO {
    private Long productoId;
    private String tipo; // Por ejemplo: "ajuste_disponible", "almacen_a_disponible"
    private Integer cantidad; // Puede ser positivo o negativo
    private String motivo;
    private LocalDateTime fecha; // Opcional: se puede poner en el backend
    private String idUsuario;

    public MovimientoDTO() {}

    public MovimientoDTO(Long productoId, String tipo, Integer cantidad, String motivo, LocalDateTime fecha, String idUsuario) {
        this.productoId = productoId;
        this.tipo = tipo;
        this.cantidad = cantidad;
        this.motivo = motivo;
        this.fecha = fecha;
        this.idUsuario = idUsuario;
    }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }

    public String getIdUsuario() { return idUsuario; }
    public void setIdUsuario(String idUsuario) { this.idUsuario = idUsuario; }
}
