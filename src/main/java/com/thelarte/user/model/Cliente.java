package com.thelarte.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Entidad que extiende a Persona para representar Clientes.
 */
@Entity
@DiscriminatorValue("CLIENTE")
public class Cliente extends Persona {

    @Email(message = "El email debe ser válido")
    @NotBlank(message = "El email es obligatorio")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "La dirección es obligatoria")
    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    @NotNull(message = "La fecha de registro es obligatoria")
    private LocalDate fechaRegistro;

    // Constructores
    public Cliente() {
        super();
    }

    public Cliente(String cedula, String nombre, String apellido, String telefono,
                   String email, String direccion, LocalDate fechaRegistro) {

        super(cedula, nombre, apellido, telefono);
        this.email = email;
        this.direccion = direccion;
        this.fechaRegistro = fechaRegistro;
    }

    // Getters y Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

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
}
