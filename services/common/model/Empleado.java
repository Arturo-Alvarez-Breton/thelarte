package thelarte.services.common.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

/**
 * Entidad que extiende a Persona para representar Empleados.
 */
@Entity
@DiscriminatorValue("EMPLEADO")
@Table(name = "empleados")
public class Empleado extends Persona {

    /*
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
     * (Opcional: si quisieras agregarla, bastaría con:
     *    @Column(nullable = false)
     *    private LocalDate fechaContratacion;
     *  junto con validaciones adecuadas).
     */
    @Column(nullable = false)
    private LocalDate fechaContratacion;

    // Constructores
    public Empleado() {
        super();
    }

    public Empleado(String cedula, String nombre, String apellido, String telefono,
                    Rol rol, float salario, LocalDate fechaContratacion) {

        super(cedula, nombre, apellido, telefono);
        this.rol = rol;
        this.salario = salario;
        this.fechaContratacion = fechaContratacion;
    }

    // Getters y Setters
    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public float getSalario() {
        return salario;
    }

    public void setSalario(float salario) {
        this.salario = salario;
    }

    public LocalDate getFechaContratacion() {
        return fechaContratacion;
    }

    public void setFechaContratacion(LocalDate fechaContratacion) {
        this.fechaContratacion = fechaContratacion;
    }
}
