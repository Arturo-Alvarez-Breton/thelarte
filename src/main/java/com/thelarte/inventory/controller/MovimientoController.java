package com.thelarte.inventory.controller;

import com.thelarte.inventory.dto.MovimientoDTO;
import com.thelarte.inventory.model.Movimiento;
import com.thelarte.inventory.service.MovimientoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    @Autowired
    private MovimientoService movimientoService;

    @PostMapping
    public Movimiento registrarMovimiento(@RequestBody MovimientoDTO dto) {
        return movimientoService.registrarMovimiento(dto);
    }

    @GetMapping("/producto/{productoId}")
    public List<Movimiento> obtenerMovimientosPorProducto(@PathVariable Long productoId) {
        return movimientoService.obtenerMovimientosPorProducto(productoId);
    }
}