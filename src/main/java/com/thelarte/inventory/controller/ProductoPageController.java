package com.thelarte.inventory.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlador para servir las páginas del frontend de suplidores
 */
@Controller
@RequestMapping("/producto")
public class ProductoPageController {    @GetMapping({"", "/", "/index"})
public String index() {
    return "forward:/pages/producto/index.html";
}

    @GetMapping("/create")
    public String create() {
        return "forward:/pages/producto/form.html";
    }

    @GetMapping("/edit")
    public String edit() {
        return "forward:/pages/producto/form.html";
    }
}
