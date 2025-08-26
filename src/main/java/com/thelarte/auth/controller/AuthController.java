package com.thelarte.auth.controller;

import com.thelarte.auth.dto.AuthResponse;
import com.thelarte.auth.dto.LoginRequest;
import com.thelarte.auth.dto.RegisterRequest;
import com.thelarte.auth.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/")
public class AuthController {

    private final AuthService authService;

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

        // Create HTTP-only cookie for JWT token (for browser navigation) - 30 minutes expiration
        ResponseCookie jwtCookie = ResponseCookie.from("jwt_token", response.getToken())
                .httpOnly(true)
                .secure(false) // Set to true for HTTPS in production
                .path("/")
                .maxAge(Duration.ofMinutes(30)) // Changed to 30 minutes
                .sameSite("Lax")
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
        // Create multiple cookie clearing headers to ensure removal
        ResponseCookie clearCookieHttpOnly = ResponseCookie.from("jwt_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ZERO)
                .sameSite("Lax")
                .build();

        ResponseCookie clearCookieNonHttpOnly = ResponseCookie.from("jwt_token", "")
                .httpOnly(false)
                .secure(false)
                .path("/")
                .maxAge(Duration.ZERO)
                .sameSite("Lax")
                .build();

        // Additional clearing for different path variations
        ResponseCookie clearCookieRoot = ResponseCookie.from("jwt_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        ResponseCookie clearCookieRootNonHttpOnly = ResponseCookie.from("jwt_token", "")
                .httpOnly(false)
                .secure(false)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookieHttpOnly.toString())
                .header(HttpHeaders.SET_COOKIE, clearCookieNonHttpOnly.toString())
                .header(HttpHeaders.SET_COOKIE, clearCookieRoot.toString())
                .header(HttpHeaders.SET_COOKIE, clearCookieRootNonHttpOnly.toString())
                .build();
    }
}
