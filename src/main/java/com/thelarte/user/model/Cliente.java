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

    @Column(name = "direccion", nullable = true)
    private String direccion;

    @Column(name = "fecha_registro")
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
