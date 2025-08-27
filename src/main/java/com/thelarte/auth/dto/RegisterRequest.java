package com.thelarte.auth.dto;

import java.util.List;

public class RegisterRequest {
    private String username;
    private String password;
    private List<String> roles;
    private String empleadoCedula;

    public RegisterRequest() {
    }

    public RegisterRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public RegisterRequest(String username, String password, List<String> roles, String empleadoCedula) {
        this.username = username;
        this.password = password;
        this.roles = roles;
        this.empleadoCedula = empleadoCedula;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public String getEmpleadoCedula() {
        return empleadoCedula;
    }

    public void setEmpleadoCedula(String empleadoCedula) {
        this.empleadoCedula = empleadoCedula;
    }
}
