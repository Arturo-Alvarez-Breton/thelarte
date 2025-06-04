package services.auth.dto;

import services.auth.entity.TipoRol;

/**
 * DTO para la solicitud de registro de nuevo usuario
 */
public class RegistroRequest {
    
    private String nombre;
    private String apellido;
    private String correo;
    private String nombreUsuario;
    private String clave;
    private TipoRol rol;

    public RegistroRequest() {
    }

    public RegistroRequest(String nombre, String apellido, String correo, 
                         String nombreUsuario, String clave, TipoRol rol) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.nombreUsuario = nombreUsuario;
        this.clave = clave;
        this.rol = rol;
    }

    // Getters y Setters
    
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

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
    }

    public TipoRol getRol() {
        return rol;
    }

    public void setRol(TipoRol rol) {
        this.rol = rol;
    }
}
