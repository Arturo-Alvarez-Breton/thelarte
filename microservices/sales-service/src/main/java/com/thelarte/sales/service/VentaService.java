package com.thelarte.sales.service;

import com.thelarte.shared.model.Venta;
import com.thelarte.sales.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    public List<Venta> listarTodos() {
        return ventaRepository.findAll();
    }

    public Optional<Venta> buscarPorId(String id) {
        return ventaRepository.findById(id);
    }

    public Venta guardar(Venta venta) {
        return ventaRepository.save(venta);
    }

    public void eliminar(String id) {
        ventaRepository.deleteById(id);
    }
}
