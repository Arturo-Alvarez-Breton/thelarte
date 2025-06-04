package thelarte.services.common.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Entidad base para Empleado y Cliente.
 * Herencia SINGLE_TABLE, con discriminator "tipo_persona".
 */
@Entity
@Table(name = "personas")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "tipo_persona", discriminatorType = DiscriminatorType.STRING)
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

    // Constructores
    protected Persona() { }

    public Persona(String cedula, String nombre, String apellido, String telefono) {
        this.cedula = cedula;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
    }

    // Getters y Setters
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
}
