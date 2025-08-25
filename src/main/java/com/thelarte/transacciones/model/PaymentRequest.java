package com.thelarte.transacciones.model;

public class PaymentRequest {
    private String ordenId;
    private Double total;
    private Double impuestos;
    private String clienteNombre;
    private String clienteEmail;
    private String clienteTelefono;
    private String descripcion;
    private boolean usePhysicalTerminal = false; // Nuevo campo con valor predeterminado false

    // Getters y setters
    public String getOrdenId() {
        return ordenId;
    }

    public void setOrdenId(String ordenId) {
        this.ordenId = ordenId;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public Double getImpuestos() {
        return impuestos;
    }

    public void setImpuestos(Double impuestos) {
        this.impuestos = impuestos;
    }

    public String getClienteNombre() {
        return clienteNombre;
    }

    public void setClienteNombre(String clienteNombre) {
        this.clienteNombre = clienteNombre;
    }

    public String getClienteEmail() {
        return clienteEmail;
    }

    public void setClienteEmail(String clienteEmail) {
        this.clienteEmail = clienteEmail;
    }

    public String getClienteTelefono() {
        return clienteTelefono;
    }

    public void setClienteTelefono(String clienteTelefono) {
        this.clienteTelefono = clienteTelefono;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public boolean isUsePhysicalTerminal() {
        return usePhysicalTerminal;
    }

    public void setUsePhysicalTerminal(boolean usePhysicalTerminal) {
        this.usePhysicalTerminal = usePhysicalTerminal;
    }
}