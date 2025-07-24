package com.thelarte.contabilidad.controller;

import com.thelarte.contabilidad.dto.*;
import com.thelarte.contabilidad.service.CajeroServiceSimplificado;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cajero")
public class CajeroController {

    @Autowired
    private CajeroServiceSimplificado cajeroService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardCajeroDTO> getDashboard() {
        DashboardCajeroDTO dashboard = cajeroService.getDashboardData();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/transacciones")
    public ResponseEntity<List<CajeroTransaccionDTO>> getTransacciones(
            @RequestParam(name = "tipo", required = false) String tipo,
            @RequestParam(name = "estado", required = false) String estado,
            @RequestParam(name = "busqueda", required = false) String busqueda,
            @RequestParam(name = "fechaDesde", required = false) LocalDate fechaDesde,
            @RequestParam(name = "fechaHasta", required = false) LocalDate fechaHasta,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        
        List<CajeroTransaccionDTO> transacciones = cajeroService.getTransaccionesFiltered(
            tipo, estado, busqueda, fechaDesde, fechaHasta, page, size);
        return ResponseEntity.ok(transacciones);
    }

    @GetMapping("/transacciones/{id}")
    public ResponseEntity<CajeroTransaccionDTO> getTransaccion(@PathVariable Long id) {
        CajeroTransaccionDTO transaccion = cajeroService.getTransaccionById(id);
        return ResponseEntity.ok(transaccion);
    }

    @PostMapping("/transacciones")
    public ResponseEntity<CajeroTransaccionDTO> crearTransaccion(@RequestBody CajeroTransaccionDTO transaccionDTO) {
        CajeroTransaccionDTO nuevaTransaccion = cajeroService.crearTransaccion(transaccionDTO);
        return ResponseEntity.ok(nuevaTransaccion);
    }

    @PutMapping("/transacciones/{id}")
    public ResponseEntity<CajeroTransaccionDTO> actualizarTransaccion(
            @PathVariable Long id, 
            @RequestBody CajeroTransaccionDTO transaccionDTO) {
        CajeroTransaccionDTO transaccionActualizada = cajeroService.actualizarTransaccion(id, transaccionDTO);
        return ResponseEntity.ok(transaccionActualizada);
    }

    @PostMapping("/transacciones/{id}/confirmar")
    public ResponseEntity<CajeroTransaccionDTO> confirmarTransaccion(@PathVariable Long id) {
        CajeroTransaccionDTO transaccionConfirmada = cajeroService.confirmarTransaccion(id);
        return ResponseEntity.ok(transaccionConfirmada);
    }

    @PostMapping("/transacciones/{id}/cancelar")
    public ResponseEntity<CajeroTransaccionDTO> cancelarTransaccion(
            @PathVariable Long id,
            @RequestParam String motivo) {
        CajeroTransaccionDTO transaccionCancelada = cajeroService.cancelarTransaccion(id, motivo);
        return ResponseEntity.ok(transaccionCancelada);
    }

    @GetMapping("/productos")
    public ResponseEntity<List<ProductoCajeroDTO>> getProductos(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String categoria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        List<ProductoCajeroDTO> productos = cajeroService.getProductosParaVenta(busqueda, categoria, page, size);
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/productos/{id}")
    public ResponseEntity<ProductoCajeroDTO> getProducto(@PathVariable Long id) {
        ProductoCajeroDTO producto = cajeroService.getProductoById(id);
        return ResponseEntity.ok(producto);
    }

    @GetMapping("/productos/codigo/{codigo}")
    public ResponseEntity<ProductoCajeroDTO> getProductoPorCodigo(@PathVariable String codigo) {
        ProductoCajeroDTO producto = cajeroService.getProductoByCodigo(codigo);
        return ResponseEntity.ok(producto);
    }

    @GetMapping("/clientes")
    public ResponseEntity<List<ClienteCajeroDTO>> getClientes(
            @RequestParam(required = false) String busqueda,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        List<ClienteCajeroDTO> clientes = cajeroService.getClientes(busqueda, page, size);
        return ResponseEntity.ok(clientes);
    }

    @GetMapping("/clientes/{cedula}")
    public ResponseEntity<ClienteCajeroDTO> getCliente(@PathVariable String cedula) {
        ClienteCajeroDTO cliente = cajeroService.getClienteByCedula(cedula);
        return ResponseEntity.ok(cliente);
    }

    @GetMapping("/suplidores")
    public ResponseEntity<List<SuplidorDTO>> getSuplidores() {
        List<SuplidorDTO> suplidores = cajeroService.getSuplidores();
        return ResponseEntity.ok(suplidores);
    }

    @PostMapping("/clientes")
    public ResponseEntity<ClienteCajeroDTO> registrarCliente(@RequestBody ClienteCajeroDTO clienteDTO) {
        ClienteCajeroDTO nuevoCliente = cajeroService.registrarClienteRapido(clienteDTO);
        return ResponseEntity.ok(nuevoCliente);
    }

    @PostMapping("/caja/abrir")
    public ResponseEntity<CajaDTO> abrirCaja(@RequestParam BigDecimal montoInicial) {
        CajaDTO caja = cajeroService.abrirCaja(montoInicial);
        return ResponseEntity.ok(caja);
    }

    @PostMapping("/caja/cerrar")
    public ResponseEntity<CajaDTO> cerrarCaja(
            @RequestParam BigDecimal montoEfectivoCierre,
            @RequestParam(required = false) String observaciones) {
        CajaDTO caja = cajeroService.cerrarCaja(montoEfectivoCierre, observaciones);
        return ResponseEntity.ok(caja);
    }

    @GetMapping("/caja/estado")
    public ResponseEntity<CajaDTO> getEstadoCaja() {
        CajaDTO estadoCaja = cajeroService.getEstadoCajaActual();
        return ResponseEntity.ok(estadoCaja);
    }

    @GetMapping("/facturas/{transaccionId}/imprimir")
    public ResponseEntity<FacturaImprimibleDTO> getFacturaParaImprimir(@PathVariable Long transaccionId) {
        FacturaImprimibleDTO factura = cajeroService.prepararFacturaParaImprimir(transaccionId);
        return ResponseEntity.ok(factura);
    }

    @PostMapping("/facturas/{transaccionId}/marcar-impresa")
    public ResponseEntity<Void> marcarFacturaComoImpresa(@PathVariable Long transaccionId) {
        cajeroService.marcarFacturaComoImpresa(transaccionId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/reportes/ventas-dia")
    public ResponseEntity<Map<String, Object>> getReporteVentasDelDia(@RequestParam(required = false) LocalDate fecha) {
        Map<String, Object> reporte = cajeroService.getReporteVentasDelDia(fecha);
        return ResponseEntity.ok(reporte);
    }

    @GetMapping("/reportes/productos-mas-vendidos")
    public ResponseEntity<List<Map<String, Object>>> getProductosMasVendidos(
            @RequestParam(required = false) LocalDate fechaDesde,
            @RequestParam(required = false) LocalDate fechaHasta,
            @RequestParam(defaultValue = "10") int limite) {
        
        List<Map<String, Object>> productos = cajeroService.getProductosMasVendidos(fechaDesde, fechaHasta, limite);
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/configuracion")
    public ResponseEntity<Map<String, Object>> getConfiguracionCaja() {
        Map<String, Object> configuracion = cajeroService.getConfiguracionCaja();
        return ResponseEntity.ok(configuracion);
    }

    @PostMapping("/configuracion")
    public ResponseEntity<Void> actualizarConfiguracionCaja(@RequestBody Map<String, Object> configuracion) {
        cajeroService.actualizarConfiguracionCaja(configuracion);
        return ResponseEntity.ok().build();
    }
}