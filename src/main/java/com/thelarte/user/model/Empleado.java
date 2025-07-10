package com.thelarte.user.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@DiscriminatorValue("EMPLEADO")
public class Empleado extends Persona {

    @Enumerated(EnumType.STRING)
    @Column(name = "ROL", nullable = true, length = 20) // Ensure nullable = true
    private com.thelarte.user.util.Rol rol;

    @Column(name = "SALARIO", nullable = true)
    private Float salario;

    @Column(name = "FECHA_CONTRATACION", nullable = true)
    private LocalDate fechaContratacion;

    public Empleado() {
        super();
    }

    public Empleado(String cedula, String nombre, String apellido, String telefono,
                    String email, com.thelarte.user.util.Rol rol, Float salario, LocalDate fechaContratacion) {
        super(cedula, nombre, apellido, telefono, email);
        this.rol = rol;
        this.salario = salario;
        this.fechaContratacion = fechaContratacion;
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

    public LocalDate getFechaContratacion() {
        return fechaContratacion;
    }
    public void setFechaContratacion(LocalDate fechaContratacion) {
        this.fechaContratacion = fechaContratacion;
    }

    @PrePersist
    public void prePersist() {
        if (this.fechaContratacion == null) {
            this.fechaContratacion = LocalDate.now();
        }
    }
}
