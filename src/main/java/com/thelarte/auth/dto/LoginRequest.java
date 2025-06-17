package com.thelarte.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginRequest {
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("username")
    private String username;
    
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        // Return email if present, otherwise return username as email
        return email != null ? email : username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // Support for username field (treat as email)
    public String getUsername() {
        return username != null ? username : email;
    }

    public void setUsername(String username) {
        this.username = username;
        // If email is not set, use username as email
        if (this.email == null) {
            this.email = username;
        }
    }
}
