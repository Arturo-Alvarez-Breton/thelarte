package com.thelarte.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtConfig {    @Value("${jwt.secret:thisisasecretkeyforjwtauthenticationthelarteappthisneedstobe64chars}")
    private String jwtSecret;

    @Value("${jwt.expiration:1800000}") // Changed to 30 minutes (30 * 60 * 1000 ms)
    private long jwtExpiration;

    @Bean
    public SecretKey secretKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String getJwtSecret() {
        return jwtSecret;
    }

    public long getJwtExpiration() {
        return jwtExpiration;
    }
}
