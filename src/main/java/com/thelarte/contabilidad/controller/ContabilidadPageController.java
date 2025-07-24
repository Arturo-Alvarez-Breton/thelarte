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

    @GetMapping("/transacciones")
    public String transaccionesPage() {
        return "forward:/pages/contabilidad/transacciones.html";
    }

    @GetMapping("/productos")
    public String productosPage() {
        return "forward:/pages/contabilidad/productos.html";
    }

    @GetMapping("/clientes")
    public String clientesPage() {
        return "forward:/pages/contabilidad/clientes.html";
    }

    @GetMapping("/suplidores")
    public String suplidoresPage() {
        return "forward:/pages/contabilidad/suplidores.html";
    }

    @GetMapping("/reportes")
    public String reportesPage() {
        return "forward:/pages/contabilidad/reportes.html";
    }

    @GetMapping("/config")
    public String configPage() {
        return "forward:/pages/contabilidad/config.html";
    }
}