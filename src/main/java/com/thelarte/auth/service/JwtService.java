package com.thelarte.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;
import com.thelarte.auth.security.JwtTokenProvider;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

/**
 * @deprecated This service is deprecated. Use JwtTokenProvider instead for all JWT operations.
 * This class is kept for backward compatibility but delegates all operations to JwtTokenProvider.
 */
@Deprecated
@Service
public class JwtService {
    private final JwtTokenProvider jwtTokenProvider;
    private final SecretKey secretKey;

    public JwtService(JwtTokenProvider jwtTokenProvider, SecretKey secretKey) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.secretKey = secretKey;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        return jwtTokenProvider.validateToken(token);
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
