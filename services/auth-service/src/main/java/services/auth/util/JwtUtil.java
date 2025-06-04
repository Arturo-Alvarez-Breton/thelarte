package services.auth.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Utilidad para manejar tokens JWT
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private Long expiracion;

    /**
     * Genera un token JWT para un usuario
     * @param userDetails detalles del usuario
     * @return token JWT generado
     */
    public String generarToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("authorities", userDetails.getAuthorities());
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiracion * 1000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Valida un token JWT contra los detalles de un usuario
     * @param token token a validar
     * @param userDetails detalles del usuario
     * @return true si el token es válido, false en caso contrario
     */
    public boolean validarToken(String token, UserDetails userDetails) {
        final String username = extraerNombreUsuario(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpirado(token);
    }

    /**
     * Extrae el nombre de usuario de un token JWT
     * @param token token JWT
     * @return nombre de usuario
     */
    public String extraerNombreUsuario(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    /**
     * Extrae la fecha de expiración de un token JWT
     * @param token token JWT
     * @return fecha de expiración
     */
    public Date extraerExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    /**
     * Extrae un claim específico de un token JWT
     * @param token token JWT
     * @param claimsResolver función para extraer el claim
     * @param <T> tipo de dato del claim
     * @return claim extraído
     */
    public <T> T extraerClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extrae todos los claims de un token JWT
     * @param token token JWT
     * @return todos los claims
     */
    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Verifica si un token JWT ha expirado
     * @param token token JWT
     * @return true si el token ha expirado, false en caso contrario
     */
    private Boolean isTokenExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }

    /**
     * Obtiene la clave de firma para el token JWT
     * @return clave de firma
     */
    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
