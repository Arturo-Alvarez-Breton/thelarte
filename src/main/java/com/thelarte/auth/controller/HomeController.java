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
        return "forward:/login.html";
    }
    
    @GetMapping("/dashboard")
    public String dashboard() {
        return "forward:/pages/dashboard.html";
    }
    
    // API endpoint to validate dashboard access
    @GetMapping("/api/dashboard/validate")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> validateDashboardAccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        
        if (auth != null && auth.isAuthenticated() && 
            auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_VENDEDOR"))) {
            response.put("authorized", true);
            response.put("username", auth.getName());
            response.put("roles", auth.getAuthorities());
            return ResponseEntity.ok(response);
        } else {
            response.put("authorized", false);
            return ResponseEntity.status(401).body(response);
        }
    }
}
