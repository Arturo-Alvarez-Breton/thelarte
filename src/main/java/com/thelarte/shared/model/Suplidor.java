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
    private String pais; // NUEVO: almacenar país estandarizado (nombre)
    private String direccion;
    private String email;
    private String RNC;

    private Double longitud;
    private Double latitud;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @ElementCollection
    private List<String> telefonos;

    public Suplidor() {}

    public Suplidor(String nombre, String ciudad, String pais, String direccion, String email, List<String> telefonos, String RNC, Double longitud, Double latitud) {
        this.nombre = nombre;
        this.ciudad = ciudad;
        this.pais = pais;
        this.direccion = direccion;
        this.email = email;
        this.telefonos = telefonos;
        this.RNC = RNC;
        this.longitud = longitud;
        this.latitud = latitud;
    }

    public long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCiudad() { return ciudad; }
    public String getPais() { return pais; }
    public String getDireccion() { return direccion; }
    public String getEmail() { return email; }
    public List<String> getTelefonos() { return telefonos; }
    public String getRNC() { return RNC; }
    public Double getLongitud() { return longitud; }
    public Double getLatitud() { return latitud; }
    public Boolean getActivo() { return activo; }

    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public void setPais(String pais) { this.pais = pais; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public void setEmail(String email) { this.email = email; }
    public void setTelefonos(List<String> telefonos) { this.telefonos = telefonos; }
    public void setRNC(String RNC) { this.RNC = RNC; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}