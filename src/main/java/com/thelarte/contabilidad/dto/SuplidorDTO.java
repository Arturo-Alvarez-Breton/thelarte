package com.thelarte.contabilidad.dto;

public class SuplidorDTO {
    private Long id;
    private String nombre;
    private String rnc;

    public SuplidorDTO(Long id, String nombre, String rnc) {
        this.id = id;
        this.nombre = nombre;
        this.rnc = rnc;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getRnc() {
        return rnc;
    }

    public void setRnc(String rnc) {
        this.rnc = rnc;
    }
}
