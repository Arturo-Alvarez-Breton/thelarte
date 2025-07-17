package com.thelarte.transacciones.controller;

import com.thelarte.transacciones.dto.TransaccionDevolucionDTO;
import com.thelarte.transacciones.model.TransaccionDevolucion;
import com.thelarte.transacciones.service.TransaccionDevolucionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transacciones/devoluciones")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class TransaccionDevolucionController {

    @Autowired
    private TransaccionDevolucionService devolucionService;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        System.out.println("Devoluciones test endpoint called successfully");
        return new ResponseEntity<>("API de devoluciones funcionando correctamente", HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<TransaccionDevolucionDTO> crearDevolucion(@RequestBody TransaccionDevolucion devolucion) {
        try {
            // Validar campos obligatorios
            if (devolucion.getTransaccion() == null || devolucion.getTransaccion().getId() == null) {
                throw new IllegalArgumentException("transaccionId es obligatorio");
            }
            if (devolucion.getSuplidorId() == null) {
                throw new IllegalArgumentException("suplidorId es obligatorio");
            }

            System.out.println("Recibida petición para crear devolución para transacción: " + devolucion.getTransaccion().getId());
            System.out.println("SuplidorId: " + devolucion.getSuplidorId());
            
            TransaccionDevolucion nuevaDevolucion = devolucionService.crearDevolucion(devolucion);
            return new ResponseEntity<>(devolucionService.toDTO(nuevaDevolucion), HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error al crear devolución: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<TransaccionDevolucionDTO>> obtenerTodas() {
        List<TransaccionDevolucionDTO> dtos = devolucionService.obtenerTodas()
                .stream()
                .map(devolucionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransaccionDevolucionDTO> obtenerPorId(@PathVariable Long id) {
        Optional<TransaccionDevolucion> devolucion = devolucionService.obtenerPorId(id);
        return devolucion
                .map(d -> ResponseEntity.ok(devolucionService.toDTO(d)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/transaccion/{transaccionId}")
    public ResponseEntity<List<TransaccionDevolucionDTO>> obtenerPorTransaccion(@PathVariable Long transaccionId) {
        List<TransaccionDevolucionDTO> devoluciones = devolucionService.obtenerPorTransaccion(transaccionId)
                .stream()
                .map(devolucionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(devoluciones, HttpStatus.OK);
    }

    @GetMapping("/suplidor/{suplidorId}")
    public ResponseEntity<List<TransaccionDevolucionDTO>> obtenerPorSuplidor(@PathVariable Long suplidorId) {
        List<TransaccionDevolucionDTO> devoluciones = devolucionService.obtenerPorSuplidor(suplidorId)
                .stream()
                .map(devolucionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(devoluciones, HttpStatus.OK);
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<TransaccionDevolucionDTO>> obtenerPorEstado(@PathVariable String estado) {
        try {
            TransaccionDevolucion.EstadoDevolucion estadoDevolucion = TransaccionDevolucion.EstadoDevolucion.valueOf(estado.toUpperCase());
            List<TransaccionDevolucionDTO> devoluciones = devolucionService.obtenerPorEstado(estadoDevolucion)
                    .stream()
                    .map(devolucionService::toDTO)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(devoluciones, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/suplidor/{suplidorId}/estado/{estado}")
    public ResponseEntity<List<TransaccionDevolucionDTO>> obtenerPorSuplidorYEstado(@PathVariable Long suplidorId, @PathVariable String estado) {
        try {
            TransaccionDevolucion.EstadoDevolucion estadoDevolucion = TransaccionDevolucion.EstadoDevolucion.valueOf(estado.toUpperCase());
            List<TransaccionDevolucionDTO> devoluciones = devolucionService.obtenerDevolucionesPorSuplidorYEstado(suplidorId, estadoDevolucion)
                    .stream()
                    .map(devolucionService::toDTO)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(devoluciones, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/periodo")
    public ResponseEntity<List<TransaccionDevolucionDTO>> obtenerEnPeriodo(
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        try {
            LocalDateTime inicio = LocalDateTime.parse(fechaInicio);
            LocalDateTime fin = LocalDateTime.parse(fechaFin);
            List<TransaccionDevolucionDTO> devoluciones = devolucionService.obtenerEnPeriodo(inicio, fin)
                    .stream()
                    .map(devolucionService::toDTO)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(devoluciones, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarDevolucion(@PathVariable Long id, @RequestBody TransaccionDevolucion devolucion) {
        try {
            TransaccionDevolucion devolucionActualizada = devolucionService.actualizarDevolucion(id, devolucion);
            return ResponseEntity.ok(devolucionService.toDTO(devolucionActualizada));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<TransaccionDevolucionDTO> actualizarEstado(@PathVariable Long id, @RequestParam String estado) {
        try {
            TransaccionDevolucion.EstadoDevolucion nuevoEstado = TransaccionDevolucion.EstadoDevolucion.valueOf(estado.toUpperCase());
            TransaccionDevolucion devolucionActualizada = devolucionService.actualizarEstado(id, nuevoEstado);
            return new ResponseEntity<>(devolucionService.toDTO(devolucionActualizada), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/procesar")
    public ResponseEntity<TransaccionDevolucionDTO> procesarDevolucion(@PathVariable Long id) {
        try {
            TransaccionDevolucion devolucionProcesada = devolucionService.procesarDevolucion(id);
            return new ResponseEntity<>(devolucionService.toDTO(devolucionProcesada), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/completar")
    public ResponseEntity<TransaccionDevolucionDTO> completarDevolucion(@PathVariable Long id) {
        try {
            TransaccionDevolucion devolucionCompletada = devolucionService.completarDevolucion(id);
            return new ResponseEntity<>(devolucionService.toDTO(devolucionCompletada), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<TransaccionDevolucionDTO> cancelarDevolucion(@PathVariable Long id) {
        try {
            TransaccionDevolucion devolucionCancelada = devolucionService.cancelarDevolucion(id);
            return new ResponseEntity<>(devolucionService.toDTO(devolucionCancelada), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarDevolucion(@PathVariable Long id) {
        try {
            devolucionService.eliminarDevolucion(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/estadisticas/contar/{estado}")
    public ResponseEntity<Long> contarPorEstado(@PathVariable String estado) {
        try {
            TransaccionDevolucion.EstadoDevolucion estadoDevolucion = TransaccionDevolucion.EstadoDevolucion.valueOf(estado.toUpperCase());
            long count = devolucionService.contarPorEstado(estadoDevolucion);
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<TransaccionDevolucionDTO>> obtenerPendientes() {
        List<TransaccionDevolucionDTO> devoluciones = devolucionService.obtenerPorEstado(TransaccionDevolucion.EstadoDevolucion.PENDIENTE)
                .stream()
                .map(devolucionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(devoluciones, HttpStatus.OK);
    }

    @GetMapping("/procesando")
    public ResponseEntity<List<TransaccionDevolucionDTO>> obtenerProcesando() {
        List<TransaccionDevolucionDTO> devoluciones = devolucionService.obtenerPorEstado(TransaccionDevolucion.EstadoDevolucion.PROCESANDO)
                .stream()
                .map(devolucionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(devoluciones, HttpStatus.OK);
    }

    @GetMapping("/completadas")
    public ResponseEntity<List<TransaccionDevolucionDTO>> obtenerCompletadas() {
        List<TransaccionDevolucionDTO> devoluciones = devolucionService.obtenerPorEstado(TransaccionDevolucion.EstadoDevolucion.COMPLETADA)
                .stream()
                .map(devolucionService::toDTO)
                .collect(Collectors.toList());
        return new ResponseEntity<>(devoluciones, HttpStatus.OK);
    }
}