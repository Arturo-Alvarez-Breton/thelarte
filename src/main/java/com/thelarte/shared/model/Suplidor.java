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

    @ElementCollection
    private List<String> telefonos;

    // Constructor vacío requerido por JPA
    public Suplidor() {}


    public Suplidor(String nombre, String ciudad, String direccion, String email, List<String> telefonos, String RNC, String NCF) {
        this.nombre = nombre;
        this.ciudad = ciudad;
        this.direccion = direccion;
        this.email = email;
        this.telefonos = telefonos;
        this.RNC = RNC;
        this.NCF = NCF;
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
}
