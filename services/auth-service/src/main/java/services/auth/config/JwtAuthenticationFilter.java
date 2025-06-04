package services.auth.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import services.auth.service.AutenticacionService;
import services.auth.util.JwtUtil;

import java.io.IOException;

/**
 * Filtro para autenticación basada en JWT
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final AutenticacionService autenticacionService;

    @Autowired
    public JwtAuthenticationFilter(JwtUtil jwtUtil, AutenticacionService autenticacionService) {
        this.jwtUtil = jwtUtil;
        this.autenticacionService = autenticacionService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = extraerJwt(request);
            if (StringUtils.hasText(jwt)) {
                String nombreUsuario = jwtUtil.extraerNombreUsuario(jwt);

                if (StringUtils.hasText(nombreUsuario) && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = autenticacionService.loadUserByUsername(nombreUsuario);
                    
                    if (jwtUtil.validarToken(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("No se pudo establecer la autenticación del usuario", e);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extrae el token JWT de la cabecera Authorization
     * @param request solicitud HTTP
     * @return token JWT o null si no existe
     */
    private String extraerJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
