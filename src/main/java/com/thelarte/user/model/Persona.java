package com.thelarte.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad base para Empleado y Cliente.
 * Herencia SINGLE_TABLE, con discriminator "tipo_persona".
 */
@Entity
@Table(name = "personas")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_persona", discriminatorType = DiscriminatorType.STRING)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public abstract class Persona {

    @Id
    @Column(name = "cedula", nullable = false, unique = true, length = 20)
    @NotBlank(message = "La cédula es obligatoria")
    private String cedula;

    @Column(name = "nombre", nullable = false)
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @Column(name = "apellido", nullable = false)
    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @Column(name = "telefono", nullable = false)
    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;

    @Column(name = "email", nullable = true, unique = true)
    private String email;
}
