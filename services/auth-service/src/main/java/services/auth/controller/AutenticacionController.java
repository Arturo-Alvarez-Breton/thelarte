package services.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import services.auth.dto.LoginRequest;
import services.auth.dto.LoginResponse;
import services.auth.dto.RegistroRequest;
import services.auth.entity.Usuario;
import services.auth.service.AutenticacionService;

/**
 * Controlador para gestionar la autenticación de usuarios
 */
@RestController
@RequestMapping("/api/auth")
public class AutenticacionController {

    private final AutenticacionService autenticacionService;

    @Autowired
    public AutenticacionController(AutenticacionService autenticacionService) {
        this.autenticacionService = autenticacionService;
    }

    /**
     * Endpoint para registro de nuevos usuarios
     * Solo gerentes y encargados TI pueden registrar usuarios
     * @param registroRequest datos del usuario a registrar
     * @return usuario registrado
     */
    @PostMapping("/registro")
    @PreAuthorize("hasRole('GERENTE') or hasRole('ENCARGADO_TI')")
    public ResponseEntity<?> registrar(@RequestBody RegistroRequest registroRequest) {
        try {
            Usuario usuario = autenticacionService.registrarUsuario(registroRequest);
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint para inicio de sesión
     * @param loginRequest credenciales del usuario
     * @return token JWT y datos del usuario
     */
    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse loginResponse = autenticacionService.iniciarSesion(loginRequest);
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error en credenciales: " + e.getMessage());
        }
    }

    /**
     * Endpoint para validar la autenticación del usuario
     * @return mensaje de confirmación
     */
    @GetMapping("/validar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> validarToken() {
        return ResponseEntity.ok("Token válido");
    }
}
