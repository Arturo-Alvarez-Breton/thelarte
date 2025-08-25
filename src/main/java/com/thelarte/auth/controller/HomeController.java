package com.thelarte.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.Map;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "forward:/pages/login.html";
    }
    
    @GetMapping("/dashboard")
    public String dashboard() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            // Redirect to role-appropriate dashboard
            return "redirect:" + getDashboardUrlByRole(auth);
        }
        return "redirect:/pages/login.html";
    }

    private String getDashboardUrlByRole(Authentication auth) {
        var authorities = auth.getAuthorities().stream()
            .map(a -> a.getAuthority())
            .collect(java.util.stream.Collectors.toSet());

        if (authorities.contains("ROLE_ADMINISTRADOR")) {
            return "/pages/admin/index.html";
        } else if (authorities.contains("ROLE_TI")) {
            return "/pages/ti/usuarios.html";
        } else if (authorities.contains("ROLE_CONTABILIDAD")) {
            return "/pages/contabilidad/reportes.html";
        } else if (authorities.contains("ROLE_CAJERO")) {
            return "/pages/cajero/transacciones.html";
        } else if (authorities.contains("ROLE_VENDEDOR")) {
            return "/pages/vendedor/productos.html";
        }
        return "/pages/login.html";
    }
    
    // API endpoint to validate dashboard access
    @GetMapping("/api/dashboard/validate")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> validateDashboardAccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            response.put("authorized", true);
            response.put("username", auth.getName());
            response.put("roles", auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .collect(java.util.stream.Collectors.toList()));
            return ResponseEntity.ok(response);
        } else {
            response.put("authorized", false);
            return ResponseEntity.status(401).body(response);
        }
    }
}
