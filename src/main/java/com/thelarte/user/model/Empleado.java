package com.thelarte.user.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "empleados")
public class Empleado {

    @Id
    @Column(name = "cedula", nullable = false, unique = true, length = 20)
    private String cedula;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "apellido", nullable = false)
    private String apellido;

    @Column(name = "telefono", nullable = false)
    private String telefono;

    @Column(name = "email", nullable = true, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false, length = 20)
    private com.thelarte.user.util.Rol rol;

    @Column(name = "salario", nullable = false)
    private Float salario;

    @Column(name = "comision", nullable = true)
    private Float comision;

    @Column(name = "fecha_contratacion", nullable = false)
    private LocalDate fechaContratacion;

    @Column(name = "deleted", nullable = false)
    private Boolean deleted = false;

    public Empleado() {
        // JPA requires a no-arg constructor
    }

    // Getters & setters

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public com.thelarte.user.util.Rol getRol() {
        return rol;
    }

    public void setRol(com.thelarte.user.util.Rol rol) {
        this.rol = rol;
    }

    public Float getSalario() {
        return salario;
    }

    public void setSalario(Float salario) {
        this.salario = salario;
    }

    public Float getComision() {
        return comision;
    }

    public void setComision(Float comision) {
        if (comision != null) {
            if (comision < 0 || comision > 100) {
                throw new IllegalArgumentException("La comisión debe estar entre 0 y 100.");
            }
            if (this.rol != com.thelarte.user.util.Rol.COMERCIAL) {
                throw new IllegalArgumentException("La comisión solo aplica al rol COMERCIAL.");
            }
        }
        this.comision = comision;
    }

    public LocalDate getFechaContratacion() {
        return fechaContratacion;
    }

    public void setFechaContratacion(LocalDate fechaContratacion) {
        this.fechaContratacion = fechaContratacion;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public boolean isDeleted() {
        return deleted != null && deleted;
    }

    @PrePersist
    public void prePersist() {
        if (this.fechaContratacion == null) {
            this.fechaContratacion = LocalDate.now();
        }
        if (this.deleted == null) {
            this.deleted = false;
        }
    }
}
