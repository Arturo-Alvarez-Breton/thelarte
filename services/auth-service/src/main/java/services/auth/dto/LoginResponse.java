package services.auth.dto;

import services.auth.entity.TipoRol;

/**
 * DTO para la respuesta de inicio de sesión
 */
public class LoginResponse {
    
    private String token;
    private String nombreUsuario;
    private TipoRol rol;
    
    public LoginResponse() {
    }
    
    public LoginResponse(String token, String nombreUsuario, TipoRol rol) {
        this.token = token;
        this.nombreUsuario = nombreUsuario;
        this.rol = rol;
    }
    
    // Getters y Setters
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getNombreUsuario() {
        return nombreUsuario;
    }
    
    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }
    
    public TipoRol getRol() {
        return rol;
    }
    
    public void setRol(TipoRol rol) {
        this.rol = rol;
    }
}
