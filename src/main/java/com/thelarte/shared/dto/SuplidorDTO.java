package com.thelarte.shared.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class SuplidorDTO {
    private long id;
    private String nombre;
    private String ciudad;
    private String pais;     // NUEVO: país estandarizado (nombre)
    private String direccion;
    private String email;
    @JsonProperty("rNC")
    private String RNC;

    @JsonProperty("nCF")
    private String NCF;
    private List<String> telefonos;
    private Double longitud;
    private Double latitud;
    private Boolean activo;

    public SuplidorDTO() {}

    public SuplidorDTO(long id, String nombre, String ciudad, String pais, String direccion, String email, String RNC, String NCF, List<String> telefonos, Double longitud, Double latitud, Boolean activo) {
        this.id = id;
        this.nombre = nombre;
        this.ciudad = ciudad;
        this.pais = pais;
        this.direccion = direccion;
        this.email = email;
        this.RNC = RNC;
        this.NCF = NCF;
        this.telefonos = telefonos;
        this.longitud = longitud;
        this.latitud = latitud;
        this.activo = activo;
    }

    public long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCiudad() { return ciudad; }
    public String getPais() { return pais; }
    public String getDireccion() { return direccion; }
    public String getEmail() { return email; }
    public String getRNC() { return RNC; }
    public String getNCF() { return NCF; }
    public List<String> getTelefonos() { return telefonos; }
    public Double getLongitud() { return longitud; }
    public Double getLatitud() { return latitud; }
    public Boolean getActivo() { return activo; }

    public void setId(long id) { this.id = id; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public void setPais(String pais) { this.pais = pais; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public void setEmail(String email) { this.email = email; }
    public void setRNC(String RNC) { this.RNC = RNC; }
    public void setNCF(String NCF) { this.NCF = NCF; }
    public void setTelefonos(List<String> telefonos) { this.telefonos = telefonos; }
    public void setLongitud(Double longitud) { this.longitud = longitud; }
    public void setLatitud(Double latitud) { this.latitud = latitud; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}