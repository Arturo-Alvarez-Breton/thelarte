package com.thelarte.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginRequest {
    @JsonProperty("username")
    private String username;
    
    @JsonProperty("email")  // Mantener compatibilidad con frontend
    private String email;
    
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        // Priorizar username, luego email para compatibilidad
        return username != null ? username : email;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
        // Si no hay username, usar email como username para compatibilidad
        if (this.username == null) {
            this.username = email;
        }
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
