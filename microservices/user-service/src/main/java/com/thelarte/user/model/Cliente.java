package com.thelarte.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Entidad que extiende a Persona para representar Clientes.
 */
@Entity
@DiscriminatorValue("CLIENTE")
@Getter
@Setter
@NoArgsConstructor
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

    public Cliente(String cedula, String nombre, String apellido, String telefono,
                   String email, String direccion, LocalDate fechaRegistro) {
        super(cedula, nombre, apellido, telefono);
        this.email = email;
        this.direccion = direccion;
        this.fechaRegistro = fechaRegistro;
    }
}
