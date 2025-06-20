package com.thelarte.user.dto;

import jakarta.validation.constraints.*;
public class EmpleadoUpdateDTO {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;

    @NotBlank(message = "El rol es obligatorio")
    private String rol;

    @NotNull(message = "El salario es obligatorio")
    @PositiveOrZero(message = "El salario no puede ser negativo")
    private Float salario;

    // Getters y setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public Float getSalario() { return salario; }
    public void setSalario(Float salario) { this.salario = salario; }
}
