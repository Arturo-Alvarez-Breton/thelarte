package com.thelarte.suplidor.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlador para servir las páginas del frontend de suplidores
 */
@Controller
@RequestMapping("/suplidor")
public class SuplidorPageController {    @GetMapping({"", "/", "/index"})
    public String index() {
        return "forward:/pages/suplidor/index.html";
    }

    @GetMapping("/create")
    public String create() {
        return "forward:/pages/suplidor/create.html";
    }

    @GetMapping("/edit")
    public String edit() {
        return "forward:/pages/suplidor/edit.html";
    }
}
