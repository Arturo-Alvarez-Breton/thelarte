package com.thelarte.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.thelarte.auth.entity.UserRole;
import java.util.List;

public class AuthResponse {
    private String token;
    private String username;
    private List<UserRole> roles;

    public AuthResponse() {
    }

    public AuthResponse(String token, String username) {
        this.token = token;
        this.username = username;
    }

    public AuthResponse(String token, String username, List<UserRole> roles) {
        this.token = token;
        this.username = username;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public List<UserRole> getRoles() {
        return roles;
    }

    public void setRoles(List<UserRole> roles) {
        this.roles = roles;
    }
}


