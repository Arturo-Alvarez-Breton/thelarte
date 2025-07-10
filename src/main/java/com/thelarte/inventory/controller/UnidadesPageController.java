package com.thelarte.inventory.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/unidades")
public class UnidadesPageController {
    @GetMapping({"", "/", "/index"})
    public String index() {
        return "forward:/pages/unidades/index.html";
    }

    @GetMapping("/create")
    public String create() {
        return "forward:/pages/unidades/form.html";
    }
}