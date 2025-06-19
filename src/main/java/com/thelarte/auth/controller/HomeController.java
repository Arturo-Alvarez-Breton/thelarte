package com.thelarte.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "forward:/login.html";
    }
    
    @GetMapping("/dashboard")
    public String dashboard() {
        return "redirect:/"; // For now, redirect back to login
    }
}
