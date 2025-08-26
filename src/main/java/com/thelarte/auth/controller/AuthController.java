package com.thelarte.auth.controller;

import com.thelarte.auth.dto.AuthResponse;
import com.thelarte.auth.dto.LoginRequest;
import com.thelarte.auth.dto.RegisterRequest;
import com.thelarte.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/")
public class AuthController {

    private final AuthService authService;

    @Value("${server.ssl.enabled:false}")
    private boolean sslEnabled;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);

        // Create secure HTTP-only cookie for JWT token - 30 minutes expiration
        ResponseCookie jwtCookie = ResponseCookie.from("jwt_token", response.getToken())
                .httpOnly(true)
                .secure(cookieSecure || sslEnabled) // Use secure cookies in production/HTTPS
                .path("/")
                .maxAge(Duration.ofMinutes(30))
                .sameSite("Strict") // Changed to Strict for better security
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logoutPost() {
        return performLogout();
    }

    @GetMapping("/logout")
    public ResponseEntity<Void> logoutGet() {
        return performLogout();
    }

    private ResponseEntity<Void> performLogout() {
        // Create a single, effective cookie clearing response
        ResponseCookie clearCookie = ResponseCookie.from("jwt_token", "")
                .httpOnly(true)
                .secure(cookieSecure || sslEnabled)
                .path("/")
                .maxAge(Duration.ZERO)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .build();
    }
}
