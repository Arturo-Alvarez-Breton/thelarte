package com.thelarte.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.thelarte.user.util.Rol;

import java.time.LocalDate;

/**
 * Entidad que extiende a Persona para representar Empleados.
 */
@Entity
@DiscriminatorValue("EMPLEADO")
@Getter
@Setter
@NoArgsConstructor
public class Empleado extends Persona {

    /**
     * El rol del empleado (ADMIN, VENDEDOR, GERENTE, etc.).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @NotNull(message = "El rol es obligatorio")
    private Rol rol;

    /**
     * Salario mensual (solo positivo).
     */
    @Column(nullable = false)
    @Min(value = 0, message = "El salario no puede ser negativo")
    private float salario;

    /**
     * Fecha de contratación.
     */
    @Column(nullable = false)
    private LocalDate fechaContratacion;

    public Empleado(String cedula, String nombre, String apellido, String telefono,
                    Rol rol, float salario, LocalDate fechaContratacion) {
        super(cedula, nombre, apellido, telefono);
        this.rol = rol;
        this.salario = salario;
        this.fechaContratacion = fechaContratacion;
    }
}
