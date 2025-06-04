package services.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import services.auth.dto.LoginRequest;
import services.auth.dto.LoginResponse;
import services.auth.dto.RegistroRequest;
import services.auth.entity.TipoRol;
import services.auth.entity.Usuario;
import services.auth.repository.UsuarioRepository;
import services.auth.util.JwtUtil;

/**
 * Servicio de autenticación para manejo de registro e inicio de sesión
 */
@Service
public class AutenticacionService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AutenticacionService(UsuarioRepository usuarioRepository, 
                              PasswordEncoder passwordEncoder,
                              JwtUtil jwtUtil,
                              AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Registra un nuevo usuario en el sistema
     * @param request datos del usuario a registrar
     * @return usuario registrado
     * @throws RuntimeException si el usuario o correo ya existen
     */
    public Usuario registrarUsuario(RegistroRequest request) {
        if (usuarioRepository.existsByNombreUsuario(request.getNombreUsuario())) {
            throw new RuntimeException("El nombre de usuario ya está en uso");
        }

        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        TipoRol rol = request.getRol();
        if (rol == null) {
            rol = TipoRol.VENDEDOR; // Rol por defecto
        }

        Usuario nuevoUsuario = new Usuario(
            request.getNombre(),
            request.getApellido(),
            request.getCorreo(),
            request.getNombreUsuario(),
            passwordEncoder.encode(request.getClave()),
            rol
        );

        return usuarioRepository.save(nuevoUsuario);
    }

    /**
     * Maneja el inicio de sesión de usuarios
     * @param request credenciales del usuario
     * @return respuesta con token JWT
     */
    public LoginResponse iniciarSesion(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getNombreUsuario(),
                request.getClave()
            )
        );

        Usuario usuario = (Usuario) authentication.getPrincipal();
        String token = jwtUtil.generarToken(usuario);

        return new LoginResponse(token, usuario.getNombreUsuario(), usuario.getRol());
    }

    @Override
    public UserDetails loadUserByUsername(String nombreUsuario) throws UsernameNotFoundException {
        return usuarioRepository.findByNombreUsuario(nombreUsuario)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + nombreUsuario));
    }
}
