package com.thelarte.auth.service;

import com.thelarte.auth.dto.AuthResponse;
import com.thelarte.auth.dto.LoginRequest;
import com.thelarte.auth.dto.RegisterRequest;
import com.thelarte.auth.entity.User;
import com.thelarte.auth.entity.UserRole;
import com.thelarte.auth.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserService userService, JwtTokenProvider jwtTokenProvider, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        // Convertir roles de String a UserRole
        List<UserRole> roles = request.getRoles() != null
            ? request.getRoles().stream().map(UserRole::valueOf).toList()
            : Collections.singletonList(UserRole.VENDEDOR);

        User user = userService.createUser(
            request.getUsername(),
            request.getPassword(),
            roles,
            request.getEmpleadoCedula()
        );

        // Create authentication object to generate token
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getUsername(), null, user.getAuthorities());
        
        String token = jwtTokenProvider.createToken(authentication);
        return new AuthResponse(token, user.getUsername());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        if (authentication.isAuthenticated()) {
            User user = userService.findByUsername(request.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
            
            String token = jwtTokenProvider.createToken(authentication);
            return new AuthResponse(token, user.getUsername());
        } else {
            throw new UsernameNotFoundException("Credenciales inválidas");
        }
    }
}
