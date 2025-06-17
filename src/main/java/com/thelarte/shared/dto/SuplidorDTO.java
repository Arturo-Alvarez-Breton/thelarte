package com.thelarte.shared.dto;

import java.util.List;

public class SuplidorDTO {
    private long id;
    private String nombre;
    private String ciudad;
    private String direccion;
    private String email;
    private String RNC;
    private String NCF;
    private List<String> telefonos;

    // Constructor vacío
    public SuplidorDTO() {}

    // Constructor con todos los campos
    public SuplidorDTO(long id, String nombre, String ciudad, String direccion, String email, String RNC, String NCF, List<String> telefonos) {
        this.id = id;
        this.nombre = nombre;
        this.ciudad = ciudad;
        this.direccion = direccion;
        this.email = email;
        this.RNC = RNC;
        this.NCF = NCF;
        this.telefonos = telefonos;
    }

    // Getters
    public long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getCiudad() {
        return ciudad;
    }

    public String getDireccion() {
        return direccion;
    }

    public String getEmail() {
        return email;
    }

    public String getRNC() {
        return RNC;
    }

    public String getNCF() {
        return NCF;
    }

    public List<String> getTelefonos() {
        return telefonos;
    }

    // Setters
    public void setId(long id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRNC(String RNC) {
        this.RNC = RNC;
    }

    public void setNCF(String NCF) {
        this.NCF = NCF;
    }

    public void setTelefonos(List<String> telefonos) {
        this.telefonos = telefonos;
    }
}
