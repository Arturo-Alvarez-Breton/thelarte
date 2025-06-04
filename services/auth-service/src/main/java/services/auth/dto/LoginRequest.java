package services.auth.dto;

/**
 * DTO para la solicitud de inicio de sesión
 */
public class LoginRequest {
    
    private String nombreUsuario;
    private String clave;
    
    public LoginRequest() {
    }
    
    public LoginRequest(String nombreUsuario, String clave) {
        this.nombreUsuario = nombreUsuario;
        this.clave = clave;
    }
    
    // Getters y Setters
    
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
}
