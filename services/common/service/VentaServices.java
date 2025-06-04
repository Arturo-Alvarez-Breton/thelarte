package com.thelarte.thelarte.service;

import services.common.entity.Venta;
import services.common.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    public List<Articulo> obtenerTodos(){
        return ventaRepository.findAll();
    }

    public Venta obtenerPorId(String id) {
        return ventaRepository.findById(id);
    }

    public Venta guardar(Venta articulo) {
        return ventaRepository.save(articulo);
    }

    public void eliminar(String id) {
        ventaRepository.deleteById(id);
    }
}