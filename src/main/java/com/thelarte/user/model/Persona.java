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

    /**
     * Usamos la cédula como clave primaria.
     * Se asume que cada persona (empleado o cliente) tiene cédula única.
     */
    @Id
    @Column(name = "cedula", nullable = false, unique = true, length = 20)
    @NotBlank(message = "La cédula es obligatoria")
    private String cedula;

    @Column(nullable = false)
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @Column(nullable = false)
    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @Column(nullable = false)
    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;
}
