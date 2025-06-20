package com.thelarte.user.dto;

import jakarta.validation.constraints.NotBlank;

public class ClienteCreateDTO {
    @NotBlank(message = "La cédula es obligatoria")
    // Si quieres validar formato, usa @Pattern; ejemplo simplificado:
    // @Pattern(regexp="\\d{3}-\\d{7}-\\d", message="Formato de cédula inválido")
    private String cedula;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;

    @NotBlank(message = "El correo es obligatorio")
    // @Email(message="Formato de correo inválido") si importas jakarta.validation.constraints.Email
    private String email;

    @NotBlank(message = "La dirección es obligatoria")
    private String direccion;

    // Getters y setters
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
}
