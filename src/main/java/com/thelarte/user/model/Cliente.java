package com.thelarte.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Entidad que extiende a Persona para representar Clientes.
 */
@Entity
@DiscriminatorValue("CLIENTE")
public class Cliente extends Persona {

    @NotBlank(message = "La dirección es obligatoria")
    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private LocalDate fechaRegistro;

    // Constructores
    public Cliente() {
        super();
    }

    public Cliente(String cedula, String nombre, String apellido, String telefono,
                   String email, String direccion, LocalDate fechaRegistro) {

        super(cedula, nombre, apellido, telefono, email);
        this.direccion = direccion;
    }

    // Getters y Setters
    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public LocalDate getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDate fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    @PrePersist
    public void prePersist() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDate.now();
        }
    }
}
