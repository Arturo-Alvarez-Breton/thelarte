package com.thelarte.auth.service;

import com.thelarte.auth.dto.AuthResponse;
import com.thelarte.auth.dto.LoginRequest;
import com.thelarte.auth.dto.RegisterRequest;
import com.thelarte.auth.entity.User;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserService userService, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }    public AuthResponse register(RegisterRequest request) {
        User user = userService.createUser(request.getUsername(), request.getPassword());
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getUsername());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        if (authentication.isAuthenticated()) {
            User user = userService.findByUsername(request.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
            String token = jwtService.generateToken(user);
            return new AuthResponse(token, user.getUsername());
        } else {
            throw new UsernameNotFoundException("Credenciales inválidas");
        }
    }
}
