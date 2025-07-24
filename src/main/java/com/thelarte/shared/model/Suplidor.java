package com.thelarte.shared.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Suplidor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String nombre;
    private String ciudad;
    private String direccion;
    private String email;
    private String RNC;
    private String NCF;
    
    // Campos de geolocalización
    private Double longitud;
    private Double latitud;
    
    // Campo para borrado lógico
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @ElementCollection
    private List<String> telefonos;

    // Constructor vacío requerido por JPA
    public Suplidor() {}


    public Suplidor(String nombre, String ciudad, String direccion, String email, List<String> telefonos, String RNC, String NCF, Double longitud, Double latitud) {
        this.nombre = nombre;
        this.ciudad = ciudad;
        this.direccion = direccion;
        this.email = email;
        this.telefonos = telefonos;
        this.RNC = RNC;
        this.NCF = NCF;
        this.longitud = longitud;
        this.latitud = latitud;
    }


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

    public List<String> getTelefonos() {
        return telefonos;
    }

    public String getRNC() {
        return RNC;
    }

    public String getNCF() {
        return NCF;
    }

    public Double getLongitud() {
        return longitud;
    }

    public Double getLatitud() {
        return latitud;
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

    public void setTelefonos(List<String> telefonos) {
        this.telefonos = telefonos;
    }

    public void setRNC(String RNC) {
        this.RNC = RNC;
    }

    public void setNCF(String NCF) {
        this.NCF = NCF;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
