package com.thelarte.transacciones.service;

import com.thelarte.transacciones.dto.LineaTransaccionDTO;
import com.thelarte.transacciones.dto.TransaccionDevolucionDTO;
import com.thelarte.transacciones.model.TransaccionDevolucion;
import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.model.LineaTransaccion;
import com.thelarte.transacciones.repository.TransaccionDevolucionRepository;
import com.thelarte.transacciones.repository.TransaccionRepository;
import com.thelarte.shared.exception.EntityNotFoundException;
import com.thelarte.shared.model.Suplidor;
import com.thelarte.shared.repository.SuplidorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TransaccionDevolucionService {

    @Autowired
    private TransaccionDevolucionRepository devolucionRepository;

    @Autowired
    private TransaccionRepository transaccionRepository;

    @Autowired
    private SuplidorRepository suplidorRepository;

    @Autowired
    private TransaccionService transaccionService;

    public TransaccionDevolucion crearDevolucion(TransaccionDevolucion devolucion) {
        // Validar que la transacción existe
        Optional<Transaccion> transaccionOpt = transaccionRepository.findById(devolucion.getTransaccion().getId());
        if (transaccionOpt.isEmpty()) {
            throw new EntityNotFoundException("Transacción no encontrada con ID: " + devolucion.getTransaccion().getId());
        }

        // Validar que el suplidor existe
        Optional<Suplidor> suplidorOpt = suplidorRepository.findById(devolucion.getSuplidorId());
        if (suplidorOpt.isEmpty()) {
            throw new EntityNotFoundException("Suplidor no encontrado con ID: " + devolucion.getSuplidorId());
        }

        Suplidor suplidor = suplidorOpt.get();
        devolucion.setSuplidorNombre(suplidor.getNombre());
        devolucion.setTransaccion(transaccionOpt.get());

        // Asignar la devolución a cada línea
        if (devolucion.getLineasDevolucion() != null) {
            for (LineaTransaccion linea : devolucion.getLineasDevolucion()) {
                linea.setTransaccionDevolucion(devolucion);
            }
        }

        return devolucionRepository.save(devolucion);
    }

    @Transactional(readOnly = true)
    public Optional<TransaccionDevolucion> obtenerPorId(Long id) {
        return devolucionRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<TransaccionDevolucion> obtenerTodas() {
        return devolucionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<TransaccionDevolucion> obtenerPorTransaccion(Long transaccionId) {
        return devolucionRepository.findByTransaccionId(transaccionId);
    }

    @Transactional(readOnly = true)
    public List<TransaccionDevolucion> obtenerPorSuplidor(Long suplidorId) {
        return devolucionRepository.findBySuplidorId(suplidorId);
    }

    @Transactional(readOnly = true)
    public List<TransaccionDevolucion> obtenerPorEstado(TransaccionDevolucion.EstadoDevolucion estado) {
        return devolucionRepository.findByEstadoDevolucion(estado);
    }

    @Transactional(readOnly = true)
    public List<TransaccionDevolucion> obtenerEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return devolucionRepository.findByFechaDevolucionBetween(fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public List<TransaccionDevolucion> obtenerDevolucionesPorSuplidorYEstado(Long suplidorId, TransaccionDevolucion.EstadoDevolucion estado) {
        return devolucionRepository.findDevolucionesPorSuplidorYEstado(suplidorId, estado);
    }

    @Transactional(readOnly = true)
    public long contarPorEstado(TransaccionDevolucion.EstadoDevolucion estado) {
        return devolucionRepository.countByEstadoDevolucion(estado);
    }

    public TransaccionDevolucion actualizarDevolucion(Long id, TransaccionDevolucion devolucionActualizada) {
        Optional<TransaccionDevolucion> devolucionOpt = devolucionRepository.findById(id);
        if (devolucionOpt.isEmpty()) {
            throw new EntityNotFoundException("Devolución no encontrada con ID: " + id);
        }

        TransaccionDevolucion devolucion = devolucionOpt.get();
        
        // Actualizar campos
        devolucion.setMotivoDevolucion(devolucionActualizada.getMotivoDevolucion());
        devolucion.setObservaciones(devolucionActualizada.getObservaciones());
        devolucion.setFechaDevolucion(devolucionActualizada.getFechaDevolucion());
        
        // Actualizar líneas de devolución si se proporcionan
        if (devolucionActualizada.getLineasDevolucion() != null) {
            // Limpiar líneas existentes
            devolucion.getLineasDevolucion().clear();
            
            // Agregar nuevas líneas
            for (LineaTransaccion linea : devolucionActualizada.getLineasDevolucion()) {
                linea.setTransaccionDevolucion(devolucion);
                devolucion.getLineasDevolucion().add(linea);
            }
        }

        return devolucionRepository.save(devolucion);
    }

    public TransaccionDevolucion actualizarEstado(Long id, TransaccionDevolucion.EstadoDevolucion nuevoEstado) {
        Optional<TransaccionDevolucion> devolucionOpt = devolucionRepository.findById(id);
        if (devolucionOpt.isEmpty()) {
            throw new EntityNotFoundException("Devolución no encontrada con ID: " + id);
        }

        TransaccionDevolucion devolucion = devolucionOpt.get();
        devolucion.setEstadoDevolucion(nuevoEstado);
        return devolucionRepository.save(devolucion);
    }

    public TransaccionDevolucion procesarDevolucion(Long id) {
        return actualizarEstado(id, TransaccionDevolucion.EstadoDevolucion.PROCESANDO);
    }

    public TransaccionDevolucion completarDevolucion(Long id) {
        return actualizarEstado(id, TransaccionDevolucion.EstadoDevolucion.COMPLETADA);
    }

    public TransaccionDevolucion cancelarDevolucion(Long id) {
        return actualizarEstado(id, TransaccionDevolucion.EstadoDevolucion.CANCELADA);
    }

    public void eliminarDevolucion(Long id) {
        if (!devolucionRepository.existsById(id)) {
            throw new EntityNotFoundException("Devolución no encontrada con ID: " + id);
        }
        devolucionRepository.deleteById(id);
    }

    // Método para convertir entidad a DTO
    public TransaccionDevolucionDTO toDTO(TransaccionDevolucion devolucion) {
        TransaccionDevolucionDTO dto = new TransaccionDevolucionDTO();
        dto.setId(devolucion.getId());
        dto.setTransaccionId(devolucion.getTransaccion().getId());
        dto.setSuplidorId(devolucion.getSuplidorId());
        dto.setSuplidorNombre(devolucion.getSuplidorNombre());
        dto.setFechaDevolucion(devolucion.getFechaDevolucion());
        dto.setMotivoDevolucion(devolucion.getMotivoDevolucion());
        dto.setEstadoDevolucion(devolucion.getEstadoDevolucion());
        dto.setObservaciones(devolucion.getObservaciones());
        dto.setFechaCreacion(devolucion.getFechaCreacion());
        dto.setFechaActualizacion(devolucion.getFechaActualizacion());

        // Incluir transacción completa si es necesario
        if (devolucion.getTransaccion() != null) {
            dto.setTransaccion(transaccionService.toDTO(devolucion.getTransaccion()));
        }

        // Convertir líneas de devolución
        if (devolucion.getLineasDevolucion() != null) {
            List<LineaTransaccionDTO> lineasDTO = devolucion.getLineasDevolucion().stream()
                    .map(this::lineaToDTO)
                    .collect(Collectors.toList());
            dto.setLineasDevolucion(lineasDTO);
        }

        return dto;
    }

    // Método auxiliar para convertir LineaTransaccion a DTO
    private LineaTransaccionDTO lineaToDTO(LineaTransaccion linea) {
        LineaTransaccionDTO dto = new LineaTransaccionDTO();
        dto.setId(linea.getId());
        dto.setProductoId(linea.getProductoId());
        dto.setProductoNombre(linea.getProductoNombre());
        dto.setCantidad(linea.getCantidad());
        dto.setPrecioUnitario(linea.getPrecioUnitario());
        dto.setSubtotal(linea.getSubtotal());
        dto.setImpuestoPorcentaje(linea.getImpuestoPorcentaje());
        dto.setImpuestoMonto(linea.getImpuestoMonto());
        dto.setTotal(linea.getTotal());
        dto.setDescuentoPorcentaje(linea.getDescuentoPorcentaje());
        dto.setDescuentoMonto(linea.getDescuentoMonto());
        dto.setObservaciones(linea.getObservaciones());
        return dto;
    }
}