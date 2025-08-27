package com.thelarte.transacciones.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/pages/transaccion")
public class TransaccionPageController {

    @GetMapping("/compra")
    public String compraPage() {
        return "static/pages/transaccion/compra.html";
    }

    @GetMapping("/index")
    public String indexPage() {
        return "static/pages/transaccion/index.html";
    }
}