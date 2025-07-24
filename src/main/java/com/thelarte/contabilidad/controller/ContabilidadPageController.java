package com.thelarte.contabilidad.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/pages/contabilidad")
public class ContabilidadPageController {

    @GetMapping({"", "/", "/index"})
    public String index() {
        return "forward:/pages/contabilidad/index.html";
    }

    @GetMapping("/dashboard")
    public String dashboardPage() {
        return "forward:/pages/contabilidad/dashboard.html";
    }

    @GetMapping("/reportes")
    public String reportesPage() {
        return "forward:/pages/contabilidad/reportes.html";
    }
}