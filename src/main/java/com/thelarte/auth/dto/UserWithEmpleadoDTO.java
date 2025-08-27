package com.thelarte.auth.dto;

import com.thelarte.auth.entity.UserRole;
import com.thelarte.user.model.Empleado;

import java.util.List;

public class UserWithEmpleadoDTO {
    private Long id;
    private String username;
    private List<UserRole> roles;
    private boolean active;
    private String empleadoCedula;
    private Empleado empleado; // Datos completos del empleado si existe

    public UserWithEmpleadoDTO() {}

    public UserWithEmpleadoDTO(Long id, String username, List<UserRole> roles, boolean active, String empleadoCedula, Empleado empleado) {
        this.id = id;
        this.username = username;
        this.roles = roles;
        this.active = active;
        this.empleadoCedula = empleadoCedula;
        this.empleado = empleado;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getEmpleadoCedula() {
        return empleadoCedula;
    }

    public void setEmpleadoCedula(String empleadoCedula) {
        this.empleadoCedula = empleadoCedula;
    }

    public Empleado getEmpleado() {
        return empleado;
    }

    public void setEmpleado(Empleado empleado) {
        this.empleado = empleado;
    }
}
