package com.thelarte.transacciones.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thelarte.transacciones.dto.LineaTransaccionDTO;
import com.thelarte.transacciones.dto.PagoDTO;
import com.thelarte.transacciones.dto.TransaccionDTO;
import com.thelarte.transacciones.model.Pago;
import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.model.LineaTransaccion;
import com.thelarte.transacciones.repository.PagoRepository;
import com.thelarte.transacciones.repository.TransaccionRepository;
import com.thelarte.transacciones.util.PaymentMetadataValidator;
import com.thelarte.inventory.model.Producto;
import com.thelarte.inventory.repository.ProductoRepository;
import com.thelarte.shared.exception.EntityNotFoundException;
import com.thelarte.auth.entity.User;
import com.thelarte.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TransaccionService {

    @Autowired
    private TransaccionRepository transaccionRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private PaymentMetadataValidator paymentMetadataValidator;

    @Autowired
    private UserService userService;

    // --- UNIDAD SERVICE/REPOSITORY ELIMINADOS ---
    @Transactional
    public Transaccion crearTransaccion(Transaccion transaccion) {
        // Asignar la transacción a cada línea para que se guarde el transaccion_id
        if (transaccion.getLineas() != null) {
            for (LineaTransaccion linea : transaccion.getLineas()) {
                linea.setTransaccion(transaccion);
            }
        }

        // Asignar vendedor automáticamente para transacciones de venta
        if (transaccion.getTipo() == Transaccion.TipoTransaccion.VENTA ||
                transaccion.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_VENTA) {
            if (transaccion.getVendedorId() == null) {
                try {
                    Long vendedorId = obtenerUsuarioEnSesion();
                    transaccion.setVendedorId(vendedorId);
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Las ventas requieren un vendedor asignado. " + e.getMessage());
                }
            }
        }

        validateTransactionBusinessRules(transaccion);
        validatePaymentMetadata(transaccion);
        procesarLineasTransaccion(transaccion);
        calcularTotalesTransaccion(transaccion);

        // === LOGICA PARA DEVOLUCIONES ===
        if (transaccion.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_COMPRA ||
                transaccion.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_VENTA) {
            // [Código de devoluciones existente...]
            if (transaccion.getTransaccionOrigenId() == null) {
                throw new IllegalArgumentException("La devolución requiere el ID de la transacción original");
            }

            // Actualizar cantidades en Producto
            for (LineaTransaccion linea : transaccion.getLineas()) {
                if (linea.getProductoId() != null) {
                    Producto producto = productoRepository.findById(linea.getProductoId())
                            .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + linea.getProductoId()));
                    int cantidad = linea.getCantidad() != null ? linea.getCantidad() : 0;

                    if (transaccion.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_COMPRA) {
                        // Solo restar de disponible, NO sumar a devueltos
                        producto.setCantidadDisponible(
                                (producto.getCantidadDisponible() != null ? producto.getCantidadDisponible() : 0) - cantidad
                        );
                    } else if (transaccion.getTipo() == Transaccion.TipoTransaccion.DEVOLUCION_VENTA) {
                        // Sumar a devueltos, opcional sumar a disponible si regresa al inventario
                        producto.setCantidadDevuelta(
                                (producto.getCantidadDevuelta() != null ? producto.getCantidadDevuelta() : 0) + cantidad
                        );
                    }
                    productoRepository.save(producto);
                }
            }

            // === MARCAR TRANSACCION ORIGINAL COMO DEVUELTA O PARCIALMENTE_DEVUELTA ===
            Optional<Transaccion> transaccionOriginalOpt = transaccionRepository.findById(transaccion.getTransaccionOrigenId());
            if (transaccionOriginalOpt.isPresent()) {
                Transaccion transaccionOriginal = transaccionOriginalOpt.get();

                // Calcular cantidad total de la transacción original
                int totalOriginal = transaccionOriginal.getLineas().stream()
                        .mapToInt(l -> l.getCantidad() != null ? l.getCantidad() : 0)
                        .sum();

                // Sumar todas las devoluciones asociadas a la transacción original
                List<Transaccion> devoluciones = transaccionRepository.findByTransaccionOrigenIdAndDeletedFalse(transaccionOriginal.getId());
                int totalDevuelto = devoluciones.stream()
                        .flatMap(dev -> dev.getLineas().stream())
                        .mapToInt(l -> l.getCantidad() != null ? l.getCantidad() : 0)
                        .sum();

                // Sumar también la actual devolución si aún no está persistida
                totalDevuelto += transaccion.getLineas().stream()
                        .mapToInt(l -> l.getCantidad() != null ? l.getCantidad() : 0)
                        .sum();

                if (totalDevuelto >= totalOriginal) {
                    transaccionOriginal.setEstado(Transaccion.EstadoTransaccion.DEVUELTA);
                } else if (totalDevuelto > 0) {
                    transaccionOriginal.setEstado(Transaccion.EstadoTransaccion.PARCIALMENTE_DEVUELTA);
                } else {
                    transaccionOriginal.setEstado(Transaccion.EstadoTransaccion.CANCELADA); // fallback
                }
                transaccionRepository.save(transaccionOriginal);
            }
        }

        // Guardar la transacción primero para obtener su ID
        transaccion = transaccionRepository.save(transaccion);

        // Procesamiento de ventas en cuotas
        if (transaccion.getTipo() == Transaccion.TipoTransaccion.VENTA &&
                transaccion.getTipoPago() == Transaccion.TipoPago.ENCUOTAS) {

            // Asegurarnos de que montoInicial no sea null
            if (transaccion.getMontoInicial() == null) {
                transaccion.setMontoInicial(BigDecimal.ZERO);
                // Actualizar transacción con el montoInicial
                transaccion = transaccionRepository.save(transaccion);
            }

            // Registrar el pago inicial si es mayor que cero
            if (transaccion.getMontoInicial().compareTo(BigDecimal.ZERO) > 0) {
                Pago pagoInicial = new Pago();
                pagoInicial.setTransaccion(transaccion);
                pagoInicial.setFecha(LocalDate.now());
                pagoInicial.setMonto(transaccion.getMontoInicial());
                pagoInicial.setMetodoPago(transaccion.getMetodoPago());
                pagoInicial.setEstado(Pago.EstadoPago.COMPLETADO);
                pagoInicial.setObservaciones("Pago inicial");
                pagoInicial.setNumeroCuota(0); // 0 indica que es el pago inicial
                pagoRepository.save(pagoInicial);

                System.out.println("Pago inicial registrado: " + pagoInicial.getMonto());
            }

            // Procesar las cuotas programadas desde los metadatos
            if (transaccion.getMetadatosPago() != null && !transaccion.getMetadatosPago().isEmpty()) {
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, Object> metadata = mapper.readValue(transaccion.getMetadatosPago(), Map.class);

                    if (metadata.containsKey("cuotasProgramadas")) {
                        List<Map<String, Object>> cuotasData = (List<Map<String, Object>>) metadata.get("cuotasProgramadas");
                        System.out.println("Procesando " + cuotasData.size() + " cuotas programadas");

                        // Obtener la fecha actual para comparar
                        LocalDate fechaActual = LocalDate.now();

                        for (Map<String, Object> cuotaData : cuotasData) {
                            Pago cuota = new Pago();
                            cuota.setTransaccion(transaccion);
                            cuota.setNumeroCuota(Integer.parseInt(cuotaData.get("numero").toString()));
                            cuota.setFecha(LocalDate.parse(cuotaData.get("fecha").toString()));
                            cuota.setMonto(new BigDecimal(cuotaData.get("monto").toString()));

                            // Determinar si la cuota es para hoy
                            boolean esCuotaDeHoy = cuota.getFecha().equals(fechaActual);

                            // Si la cuota es para hoy, marcarla como COMPLETADA
                            if (esCuotaDeHoy) {
                                cuota.setEstado(Pago.EstadoPago.COMPLETADO);
                                cuota.setMetodoPago(transaccion.getMetodoPago()); // Usar el método de pago principal
                                cuota.setObservaciones("Cuota #" + cuota.getNumeroCuota() + " pagada al crear la transacción");
                                System.out.println("Cuota " + cuota.getNumeroCuota() + " COMPLETADA (fecha actual): " + cuota.getMonto());
                            } else {
                                cuota.setEstado(Pago.EstadoPago.PENDIENTE);
                                cuota.setMetodoPago("PENDIENTE"); // Se definirá al momento de pagar
                                cuota.setObservaciones("Cuota programada #" + cuota.getNumeroCuota());
                                System.out.println("Cuota " + cuota.getNumeroCuota() + " registrada como PENDIENTE: " + cuota.getMonto());
                            }

                            pagoRepository.save(cuota);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error al procesar cuotas programadas: " + e.getMessage());
                    e.printStackTrace();
                }
            }

            // CORRECCIÓN: Recalcular el saldo pendiente después de procesar todos los pagos
            BigDecimal saldoPendiente = calcularSaldoPendienteReal(transaccion);
            transaccion.setSaldoPendiente(saldoPendiente);
            transaccion = transaccionRepository.save(transaccion);
            System.out.println("Saldo pendiente final recalculado: " + saldoPendiente);
        }

        return transaccion;
    }



    /**
     * Marca un pago como completado y actualiza el saldo pendiente de la transacción
     * @param pagoId ID del pago a completar
     * @return El pago actualizado
     * @throws EntityNotFoundException si el pago no existe
     * @throws IllegalStateException si el pago ya está cancelado
     */
    @Transactional
    public Pago completarPago(Long pagoId) {
        // Obtener el pago
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new EntityNotFoundException("Pago no encontrado con ID: " + pagoId));

        // Verificar que no esté cancelado
        if (pago.getEstado() == Pago.EstadoPago.CANCELADO) {
            throw new IllegalStateException("No se puede completar un pago que ya está cancelado");
        }

        // Si ya está completado, solo retornarlo
        if (pago.getEstado() == Pago.EstadoPago.COMPLETADO) {
            return pago;
        }

        // Cambiar estado a completado
        pago.setEstado(Pago.EstadoPago.COMPLETADO);

        // Guardar el pago
        Pago pagoGuardado = pagoRepository.save(pago);

        // Actualizar el saldo pendiente de la transacción
        Transaccion transaccion = pago.getTransaccion();
        BigDecimal saldoPendiente = calcularSaldoPendienteReal(transaccion);
        transaccion.setSaldoPendiente(saldoPendiente);

        // Si el saldo pendiente es cero o negativo, actualizar el estado de la transacción
        if (saldoPendiente.compareTo(BigDecimal.ZERO) <= 0) {
            transaccion.setEstado(Transaccion.EstadoTransaccion.COBRADA);
        }

        transaccionRepository.save(transaccion);

        return pagoGuardado;
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularSaldoPendienteReal(Transaccion transaccion) {
        // Sumar todos los pagos realizados
        BigDecimal totalPagado = BigDecimal.ZERO;

        // Importante: NO incluir el pago inicial aquí, ya que se registra como un pago en la tabla
        // y lo contabilizaremos al recorrer los pagos

        // Obtener todos los pagos y filtrar los COMPLETADOS
        List<Pago> pagos = pagoRepository.findByTransaccionId(transaccion.getId());

        System.out.println("Calculando saldo pendiente para transacción ID: " + transaccion.getId());
        System.out.println("Total de la transacción: " + transaccion.getTotal());
        System.out.println("Total de pagos encontrados: " + pagos.size());

        for (Pago pago : pagos) {
            // Solo sumar los pagos COMPLETADOS
            if (pago.getEstado() == Pago.EstadoPago.COMPLETADO) {
                totalPagado = totalPagado.add(pago.getMonto());
                System.out.println("Sumando pago completado: " + pago.getMonto() +
                        " (tipo: " + (pago.getNumeroCuota() == 0 ? "Inicial" :
                        "Cuota " + pago.getNumeroCuota()) + ")");
            }
        }

        // El saldo pendiente es el total menos lo pagado
        BigDecimal saldoPendiente = transaccion.getTotal().subtract(totalPagado);

        // Asegurar que no sea negativo
        if (saldoPendiente.compareTo(BigDecimal.ZERO) < 0) {
            saldoPendiente = BigDecimal.ZERO;
        }

        System.out.println("Total a pagar: " + transaccion.getTotal() +
                ", Total pagado: " + totalPagado +
                ", Saldo pendiente calculado: " + saldoPendiente);

        return saldoPendiente;
    }

    public Transaccion actualizarTransaccion(Long id, Transaccion transaccion) {
        Transaccion existingTransaction = transaccionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transacción no encontrada"));

        if (!canEditTransaction(existingTransaction)) {
            throw new IllegalStateException("No se puede editar una transacción con estado: " + existingTransaction.getEstado());
        }

        // Actualiza campos principales
        existingTransaction.setTipo(transaccion.getTipo());
        existingTransaction.setFecha(transaccion.getFecha());
        existingTransaction.setContraparteId(transaccion.getContraparteId());
        existingTransaction.setTipoContraparte(transaccion.getTipoContraparte());
        existingTransaction.setContraparteNombre(transaccion.getContraparteNombre());
        existingTransaction.setNumeroFactura(transaccion.getNumeroFactura());
        existingTransaction.setObservaciones(transaccion.getObservaciones());
        existingTransaction.setSubtotal(transaccion.getSubtotal());
        existingTransaction.setImpuestos(transaccion.getImpuestos());
        existingTransaction.setTotal(transaccion.getTotal());
        existingTransaction.setEstado(transaccion.getEstado());
        existingTransaction.setVendedorId(transaccion.getVendedorId());
        existingTransaction.setDireccionEntrega(transaccion.getDireccionEntrega());
        existingTransaction.setCondicionesPago(transaccion.getCondicionesPago());
        existingTransaction.setMetodoPago(transaccion.getMetodoPago());
        existingTransaction.setMetadatosPago(transaccion.getMetadatosPago());
        existingTransaction.setTransaccionOrigenId(transaccion.getTransaccionOrigenId());
        existingTransaction.setNumeroReferencia(transaccion.getNumeroReferencia());
        existingTransaction.setNumeroOrdenCompra(transaccion.getNumeroOrdenCompra());
        existingTransaction.setFechaEntregaEsperada(transaccion.getFechaEntregaEsperada());
        existingTransaction.setFechaEntregaReal(transaccion.getFechaEntregaReal());
        existingTransaction.setNumeroTransaccion(transaccion.getNumeroTransaccion());

        // Actualizar campos para pagos en cuotas si están presentes
        if (transaccion.getTipoPago() != null) {
            existingTransaction.setTipoPago(transaccion.getTipoPago());
        }
        if (transaccion.getMontoInicial() != null) {
            existingTransaction.setMontoInicial(transaccion.getMontoInicial());
        }
        if (transaccion.getSaldoPendiente() != null) {
            existingTransaction.setSaldoPendiente(transaccion.getSaldoPendiente());
        }

        // Elimina las líneas viejas
        if (existingTransaction.getLineas() != null) {
            existingTransaction.getLineas().clear();
        }

        // Asocia las nuevas líneas
        if (transaccion.getLineas() != null) {
            for (LineaTransaccion linea : transaccion.getLineas()) {
                linea.setTransaccion(existingTransaction);
            }
            existingTransaction.getLineas().addAll(transaccion.getLineas());
        }

        validateTransactionBusinessRules(existingTransaction);
        validatePaymentMetadata(existingTransaction);
        procesarLineasTransaccion(existingTransaction);


        return transaccionRepository.save(existingTransaction);
    }

    public Transaccion crearCompra(Long suplidorId, String suplidorNombre, List<LineaTransaccion> lineas) {
        Transaccion compra = new Transaccion(
                Transaccion.TipoTransaccion.COMPRA,
                suplidorId,
                Transaccion.TipoContraparte.SUPLIDOR,
                suplidorNombre
        );
        lineas.forEach(linea -> linea.setTransaccion(compra));
        compra.setLineas(lineas);
        return crearTransaccion(compra);
    }

    public Transaccion crearVenta(Long clienteId, String clienteNombre, Long vendedorId, List<LineaTransaccion> lineas) {
        Transaccion venta = new Transaccion(
                Transaccion.TipoTransaccion.VENTA,
                clienteId,
                Transaccion.TipoContraparte.CLIENTE,
                clienteNombre
        );
        venta.setVendedorId(vendedorId);
        lineas.forEach(linea -> linea.setTransaccion(venta));
        venta.setLineas(lineas);
        return crearTransaccion(venta);
    }

    // Método para crear venta en cuotas
    public Transaccion crearVentaEnCuotas(Long clienteId, String clienteNombre, Long vendedorId,
                                          List<LineaTransaccion> lineas, BigDecimal montoInicial) {
        Transaccion venta = new Transaccion(
                Transaccion.TipoTransaccion.VENTA,
                clienteId,
                Transaccion.TipoContraparte.CLIENTE,
                clienteNombre
        );
        venta.setVendedorId(vendedorId);
        venta.setTipoPago(Transaccion.TipoPago.ENCUOTAS);
        lineas.forEach(linea -> linea.setTransaccion(venta));
        venta.setLineas(lineas);

        // Calcular totales primero para establecer el saldo pendiente correcto
        calcularTotalesTransaccion(venta);

        // Establecer monto inicial y saldo pendiente
        venta.setMontoInicial(montoInicial);
        venta.setSaldoPendiente(venta.getTotal().subtract(montoInicial));

        return crearTransaccion(venta);
    }

    public Transaccion crearDevolucionCompra(Long suplidorId, String suplidorNombre,
                                             List<LineaTransaccion> lineas, Long transaccionOriginalId) {
        Transaccion devolucion = new Transaccion(
                Transaccion.TipoTransaccion.DEVOLUCION_COMPRA,
                suplidorId,
                Transaccion.TipoContraparte.SUPLIDOR,
                suplidorNombre
        );
        devolucion.setTransaccionOrigenId(transaccionOriginalId);
        devolucion.setObservaciones("Devolución de compra original ID: " + transaccionOriginalId);
        lineas.forEach(linea -> linea.setTransaccion(devolucion));
        devolucion.setLineas(lineas);
        return crearTransaccion(devolucion);
    }

    public Transaccion crearDevolucionVenta(Long clienteId, String clienteNombre,
                                            List<LineaTransaccion> lineas, Long transaccionOriginalId) {
        Transaccion devolucion = new Transaccion(
                Transaccion.TipoTransaccion.DEVOLUCION_VENTA,
                clienteId,
                Transaccion.TipoContraparte.CLIENTE,
                clienteNombre
        );
        devolucion.setTransaccionOrigenId(transaccionOriginalId);
        devolucion.setObservaciones("Devolución de venta original ID: " + transaccionOriginalId);
        lineas.forEach(linea -> linea.setTransaccion(devolucion));
        devolucion.setLineas(lineas);
        return crearTransaccion(devolucion);
    }

    @Transactional(readOnly = true)
    public Optional<Transaccion> obtenerPorId(Long id) {
        return transaccionRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerTodas() {
        return transaccionRepository.findByDeletedFalse();
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerPorTipo(Transaccion.TipoTransaccion tipo) {
        return transaccionRepository.findByTipoAndDeletedFalse(tipo);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerCompras() {
        return transaccionRepository.findByTipoAndDeletedFalse(Transaccion.TipoTransaccion.COMPRA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentas() {
        return transaccionRepository.findByTipoAndDeletedFalse(Transaccion.TipoTransaccion.VENTA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentasEnCuotas() {
        return transaccionRepository.findByTipoAndTipoPagoAndDeletedFalse(
                Transaccion.TipoTransaccion.VENTA,
                Transaccion.TipoPago.ENCUOTAS
        );
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentasConSaldoPendiente() {
        return transaccionRepository.findVentasConSaldoPendiente();
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerDevolucionesCompra() {
        return transaccionRepository.findByTipoAndDeletedFalse(Transaccion.TipoTransaccion.DEVOLUCION_COMPRA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerDevolucionesVenta() {
        return transaccionRepository.findByTipoAndDeletedFalse(Transaccion.TipoTransaccion.DEVOLUCION_VENTA);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerPorEstado(Transaccion.EstadoTransaccion estado) {
        return transaccionRepository.findByEstadoAndDeletedFalse(estado);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerComprasPorSuplidor(Long suplidorId) {
        return transaccionRepository.findComprasPorSuplidor(suplidorId);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentasPorCliente(Long clienteId) {
        return transaccionRepository.findVentasPorCliente(clienteId);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentasPorVendedor(Long vendedorId) {
        return transaccionRepository.findVentasPorVendedor(vendedorId);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.findByFechaBetween(fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerComprasEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.findComprasEnPeriodo(Transaccion.TipoTransaccion.COMPRA, fechaInicio, fechaFin);
    }

    public Transaccion actualizarEstado(Long id, Transaccion.EstadoTransaccion nuevoEstado) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        transaccion.setEstado(nuevoEstado);
        if (nuevoEstado == Transaccion.EstadoTransaccion.COMPLETADA) {
            transaccion.setFechaEntregaReal(LocalDateTime.now());
        }
        return transaccionRepository.save(transaccion);
    }

    public Transaccion confirmarCompra(Long id) {
        return actualizarEstado(id, Transaccion.EstadoTransaccion.CONFIRMADA);
    }

    public Transaccion completarTransaccion(Long id) {
        return actualizarEstado(id, Transaccion.EstadoTransaccion.COMPLETADA);
    }

    public Transaccion cancelarTransaccion(Long id) {
        return actualizarEstado(id, Transaccion.EstadoTransaccion.CANCELADA);
    }

    public Transaccion marcarComoRecibida(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        if (transaccion.getTipo() != Transaccion.TipoTransaccion.COMPRA) {
            throw new IllegalStateException("Solo las compras pueden marcarse como recibidas");
        }
        transaccion.setEstado(Transaccion.EstadoTransaccion.RECIBIDA);
        transaccion.setFechaEntregaReal(LocalDateTime.now());

        // Actualiza stock de productos, no unidades
        for (LineaTransaccion linea : transaccion.getLineas()) {
            if (linea.getProductoId() != null) {
                Producto producto = productoRepository.findById(linea.getProductoId())
                        .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + linea.getProductoId()));
                producto.setCantidadDisponible(
                        (producto.getCantidadDisponible() != null ? producto.getCantidadDisponible() : 0) + linea.getCantidad()
                );
                productoRepository.save(producto);
            }
        }
        return transaccionRepository.save(transaccion);
    }

    public Transaccion marcarComoPagada(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        if (transaccion.getTipo() != Transaccion.TipoTransaccion.COMPRA) {
            throw new IllegalStateException("Solo las compras pueden marcarse como pagadas");
        }
        transaccion.setEstado(Transaccion.EstadoTransaccion.PAGADA);
        return transaccionRepository.save(transaccion);
    }

    public Transaccion marcarComoEntregada(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        if (transaccion.getTipo() != Transaccion.TipoTransaccion.VENTA) {
            throw new IllegalStateException("Solo las ventas pueden marcarse como entregadas");
        }
        transaccion.setEstado(Transaccion.EstadoTransaccion.ENTREGADA);
        transaccion.setFechaEntregaReal(LocalDateTime.now());
        return transaccionRepository.save(transaccion);
    }
    // Actualización del método marcarComoCobrada -> ahora es marcarComoCompletada
    public Transaccion marcarComoCompletada(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        if (transaccion.getTipo() != Transaccion.TipoTransaccion.VENTA) {
            throw new IllegalStateException("Solo las ventas pueden marcarse como completadas");
        }
        transaccion.setEstado(Transaccion.EstadoTransaccion.COMPLETADA);
        // Si es venta en cuotas, establecer saldo pendiente a cero
        if (transaccion.getTipoPago() == Transaccion.TipoPago.ENCUOTAS) {
            transaccion.setSaldoPendiente(BigDecimal.ZERO);
        }
        return transaccionRepository.save(transaccion);
    }


    public Transaccion facturarVenta(Long id, String numeroFactura) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
        if (transaccion.getTipo() != Transaccion.TipoTransaccion.VENTA) {
            throw new IllegalStateException("Solo las ventas pueden facturarse");
        }
        transaccion.setEstado(Transaccion.EstadoTransaccion.FACTURADA);
        transaccion.setNumeroFactura(numeroFactura);
        return transaccionRepository.save(transaccion);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerComprasPendientesRecepcion() {
        return transaccionRepository.findByTipoAndEstado(
                Transaccion.TipoTransaccion.COMPRA,
                Transaccion.EstadoTransaccion.CONFIRMADA
        );
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerComprasPendientes() {
        return transaccionRepository.findByTipoAndEstado(
                Transaccion.TipoTransaccion.COMPRA,
                Transaccion.EstadoTransaccion.PENDIENTE
        );
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerComprasPendientesPago() {
        return transaccionRepository.findByTipoAndEstado(
                Transaccion.TipoTransaccion.COMPRA,
                Transaccion.EstadoTransaccion.RECIBIDA
        );
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentasPendientesEntrega() {
        return transaccionRepository.findByTipoAndEstado(
                Transaccion.TipoTransaccion.VENTA,
                Transaccion.EstadoTransaccion.CONFIRMADA
        );
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerVentasPendientesCobro() {
        return transaccionRepository.findByTipoAndEstado(
                Transaccion.TipoTransaccion.VENTA,
                Transaccion.EstadoTransaccion.ENTREGADA
        );
    }

    public boolean canEditTransaction(Transaccion transaccion) {
        return transaccion.getEstado() == Transaccion.EstadoTransaccion.PENDIENTE ||
                transaccion.getEstado() == Transaccion.EstadoTransaccion.CONFIRMADA;
    }

    public void eliminarTransaccion(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));

        if (transaccion.isDeleted()) {
            throw new IllegalStateException("La transacción ya está eliminada");
        }

        transaccion.setDeleted(true);
        transaccionRepository.save(transaccion);
    }

    public void restaurarTransaccion(Long id) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));

        if (!transaccion.isDeleted()) {
            throw new IllegalStateException("La transacción no está eliminada");
        }

        transaccion.setDeleted(false);
        transaccionRepository.save(transaccion);
    }

    @Transactional(readOnly = true)
    public Double obtenerTotalComprasEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.sumTotalPorTipoEnPeriodo(Transaccion.TipoTransaccion.COMPRA, fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public Double obtenerTotalVentasEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.sumTotalPorTipoEnPeriodo(Transaccion.TipoTransaccion.VENTA, fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public Double obtenerTotalDevolucionesCompraEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.sumTotalPorTipoEnPeriodo(Transaccion.TipoTransaccion.DEVOLUCION_COMPRA, fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public Double obtenerTotalDevolucionesVentaEnPeriodo(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return transaccionRepository.sumTotalPorTipoEnPeriodo(Transaccion.TipoTransaccion.DEVOLUCION_VENTA, fechaInicio, fechaFin);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> obtenerTransaccionesPorOrigen(Long transaccionOrigenId) {
        return transaccionRepository.findByTransaccionOrigenIdAndDeletedFalse(transaccionOrigenId);
    }

    @Transactional(readOnly = true)
    public long contarTransaccionesPorTipoYEstado(Transaccion.TipoTransaccion tipo, Transaccion.EstadoTransaccion estado) {
        return transaccionRepository.countByTipoAndEstado(tipo, estado);
    }

    private void calcularTotalesTransaccion(Transaccion transaccion) {
        if (transaccion.getLineas() == null || transaccion.getLineas().isEmpty()) {
            // Solo asignar valores si son nulos
            if (transaccion.getSubtotal() == null) transaccion.setSubtotal(BigDecimal.ZERO);
            if (transaccion.getImpuestos() == null) transaccion.setImpuestos(BigDecimal.ZERO);
            if (transaccion.getTotal() == null) transaccion.setTotal(BigDecimal.ZERO);
            return;
        }

        // Calcular y asignar subtotal solo si es nulo
        if (transaccion.getSubtotal() == null) {
            BigDecimal subtotal = transaccion.getLineas().stream()
                    .map(LineaTransaccion::getSubtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            transaccion.setSubtotal(subtotal);
        }

        // Calcular y asignar impuestos solo si es nulo
        if (transaccion.getImpuestos() == null) {
            BigDecimal impuestos = transaccion.getLineas().stream()
                    .map(linea -> linea.getImpuestoMonto() != null ? linea.getImpuestoMonto() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            transaccion.setImpuestos(impuestos);
        }

        // Calcular y asignar total solo si es nulo
        if (transaccion.getTotal() == null) {
            BigDecimal total = transaccion.getLineas().stream()
                    .map(LineaTransaccion::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            transaccion.setTotal(total);
        }
    }

    /**
     * Lógica de procesamiento de líneas usando solo los campos enteros de Producto.
     */
    private void procesarLineasTransaccion(Transaccion transaccion) {
        if (transaccion.getLineas() != null) {
            for (LineaTransaccion linea : transaccion.getLineas()) {
                if (transaccion.getTipo() == Transaccion.TipoTransaccion.COMPRA) {
                    Producto producto;
                    if (linea.getProductoId() == null && linea.getProductoNombre() != null) {
                        // Producto nuevo: crea el producto con cantidades iniciales
                        producto = new Producto();
                        producto.setNombre(linea.getProductoNombre());
                        producto.setTipo("Mueble");
                        producto.setDescripcion("Mueble nuevo agregado por compra");
                        producto.setItbis(18.0f);
                        producto.setPrecioCompra(linea.getPrecioUnitario());
                        producto.setPrecioVenta(linea.getPrecioUnitario());
                        producto.setFotoURL("");
                        producto.setCantidadDisponible(0); // Al comprar, entra a almacen, no disponible
                        producto.setCantidadReservada(0);
                        producto.setCantidadDanada(0);
                        producto.setCantidadDevuelta(0);
                        producto.setCantidadAlmacen(linea.getCantidad()); // Aquí entra el stock de la compra
                        producto = productoRepository.save(producto);

                        linea.setProductoId(producto.getId());
                        linea.setPrecioUnitario(producto.getPrecioVenta());
                    } else {
                        // Producto existente: suma cantidad a almacen
                        producto = productoRepository.findById(linea.getProductoId())
                                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + linea.getProductoId()));
                        producto.setCantidadAlmacen(
                                (producto.getCantidadAlmacen() != null ? producto.getCantidadAlmacen() : 0) + linea.getCantidad()
                        );
                        productoRepository.save(producto);
                    }
                } else if (transaccion.getTipo() == Transaccion.TipoTransaccion.VENTA && linea.getProductoId() != null) {
                    Producto producto = productoRepository.findById(linea.getProductoId())
                            .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + linea.getProductoId()));

                    int disponible = producto.getCantidadDisponible() != null ? producto.getCantidadDisponible() : 0;
                    int almacen = producto.getCantidadAlmacen() != null ? producto.getCantidadAlmacen() : 0;
                    int reservada = producto.getCantidadReservada() != null ? producto.getCantidadReservada() : 0;
                    int cantidad = linea.getCantidad() != null ? linea.getCantidad() : 0;

                    int totalStock = disponible + almacen;

                    // Lógica para estado PENDIENTE (reserva de stock)
                    if (transaccion.getEstado() == Transaccion.EstadoTransaccion.PENDIENTE) {
                        if (totalStock < cantidad) {
                            throw new IllegalArgumentException("Stock insuficiente para reservar el producto: " + producto.getNombre());
                        }
                        int descontarDeDisponible = Math.min(cantidad, disponible);
                        int descontarDeAlmacen = cantidad - descontarDeDisponible;
                        producto.setCantidadDisponible(disponible - descontarDeDisponible);
                        producto.setCantidadAlmacen(almacen - descontarDeAlmacen);
                        producto.setCantidadReservada(reservada + cantidad);
                        productoRepository.save(producto);
                    }
                    // Lógica para estados CONFIRMADA, COMPLETADA, ENTREGADA (entrega de stock reservado)
                    else if (transaccion.getEstado() == Transaccion.EstadoTransaccion.CONFIRMADA ||
                            transaccion.getEstado() == Transaccion.EstadoTransaccion.COMPLETADA ||
                            transaccion.getEstado() == Transaccion.EstadoTransaccion.ENTREGADA) {
                        if (reservada < cantidad) {
                            // Si no hay suficiente reservado, intenta descontar de disponible y almacén
                            if (totalStock < cantidad) {
                                throw new IllegalArgumentException("Stock insuficiente para entregar el producto: " + producto.getNombre());
                            }
                            int descontarDeDisponible = Math.min(cantidad, disponible);
                            int descontarDeAlmacen = cantidad - descontarDeDisponible;
                            producto.setCantidadDisponible(disponible - descontarDeDisponible);
                            producto.setCantidadAlmacen(almacen - descontarDeAlmacen);
                            // No sumamos a reservada porque estamos entregando (descontando)
                        } else {
                            // Hay suficiente reservado, descuéntalo de reservada
                            producto.setCantidadReservada(reservada - cantidad);
                            // Ya no sumamos a disponible porque ya fue reservado previamente
                        }
                        productoRepository.save(producto);
                    }
                    // Por si acaso, si la venta se crea directamente como completada, descuenta de ambos
                    else {
                        if (totalStock < cantidad) {
                            throw new IllegalArgumentException("Stock insuficiente para el producto: " + producto.getNombre());
                        }
                        int descontarDeDisponible = Math.min(cantidad, disponible);
                        int descontarDeAlmacen = cantidad - descontarDeDisponible;
                        producto.setCantidadDisponible(disponible - descontarDeDisponible);
                        producto.setCantidadAlmacen(almacen - descontarDeAlmacen);
                        productoRepository.save(producto);
                    }
                    // Puedes agregar aquí lógica para dañados, devueltos, etc. si lo necesitas
                }
            }
        }
    }

    private void validateTransactionBusinessRules(Transaccion transaccion) {
        if (transaccion.getTipo() == null) {
            throw new IllegalArgumentException("El tipo de transacción es obligatorio");
        }
        if (transaccion.getTipoContraparte() == null) {
            throw new IllegalArgumentException("El tipo de contraparte es obligatorio");
        }
        switch (transaccion.getTipo()) {
            case COMPRA:
            case DEVOLUCION_COMPRA:
                if (transaccion.getTipoContraparte() != Transaccion.TipoContraparte.SUPLIDOR) {
                    throw new IllegalArgumentException("Las compras solo pueden realizarse con suplidores");
                }
                break;
            case VENTA:
            case DEVOLUCION_VENTA:
                if (transaccion.getTipoContraparte() != Transaccion.TipoContraparte.CLIENTE) {
                    throw new IllegalArgumentException("Las ventas solo pueden realizarse con clientes");
                }
                if (transaccion.getVendedorId() == null) {
                    throw new IllegalArgumentException("Las ventas requieren un vendedor asignado");
                }
                break;
        }
    }

    private void validatePaymentMetadata(Transaccion transaccion) {
        if (transaccion.getMetodoPago() != null) {
            PaymentMetadataValidator.ValidationResult validationResult =
                    paymentMetadataValidator.validatePaymentMetadata(
                            transaccion.getMetodoPago(),
                            transaccion.getMetadatosPago()
                    );
            if (!validationResult.isValid()) {
                throw new IllegalArgumentException("Error en metadatos de pago: " +
                        String.join(", ", validationResult.getErrors()));
            }
        }
    }

    private Long obtenerUsuarioEnSesion() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            if (username != null && !username.equals("anonymousUser")) {
                User user = userService.findByUsername(username)
                        .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + username));
                return user.getId();
            }
        }
        throw new IllegalArgumentException("No hay un usuario autenticado en la sesión");
    }

    /**
     * Convierte una entidad Transaccion a TransaccionDTO
     */
    public TransaccionDTO toDTO(Transaccion transaccion) {
        if (transaccion == null) {
            return null;
        }
        TransaccionDTO dto = new TransaccionDTO(
                transaccion.getId(),
                transaccion.getTipo() != null ? transaccion.getTipo().toString() : null,
                transaccion.getFecha(),
                transaccion.getEstado() != null ? transaccion.getEstado().toString() : null,
                transaccion.getContraparteId(),
                transaccion.getTipoContraparte() != null ? transaccion.getTipoContraparte().toString() : null,
                transaccion.getContraparteNombre(),
                transaccion.getTotal()
        );

        // Campos básicos
        dto.setSubtotal(transaccion.getSubtotal());
        dto.setImpuestos(transaccion.getImpuestos());
        dto.setNumeroFactura(transaccion.getNumeroFactura());
        dto.setFechaEntregaEsperada(transaccion.getFechaEntregaEsperada());
        dto.setFechaEntregaReal(transaccion.getFechaEntregaReal());
        dto.setCondicionesPago(transaccion.getCondicionesPago());
        dto.setNumeroOrdenCompra(transaccion.getNumeroOrdenCompra());
        dto.setMetodoPago(transaccion.getMetodoPago());
        dto.setNumeroTransaccion(transaccion.getNumeroTransaccion());
        dto.setVendedorId(transaccion.getVendedorId());
        dto.setDireccionEntrega(transaccion.getDireccionEntrega());
        dto.setObservaciones(transaccion.getObservaciones());
        dto.setMetadatosPago(transaccion.getMetadatosPago());
        dto.setTransaccionOrigenId(transaccion.getTransaccionOrigenId());
        dto.setNumeroReferencia(transaccion.getNumeroReferencia());
        dto.setFechaCreacion(transaccion.getFechaCreacion());
        dto.setFechaActualizacion(transaccion.getFechaActualizacion());

        // Campos para pagos en cuotas
        dto.setTipoPago(transaccion.getTipoPago() != null ? transaccion.getTipoPago().toString() : null);
        dto.setMontoInicial(transaccion.getMontoInicial());
        dto.setSaldoPendiente(transaccion.getSaldoPendiente());

        // Incluir información de pagos si es venta en cuotas
        if (transaccion.getTipoPago() == Transaccion.TipoPago.ENCUOTAS && transaccion.getPagos() != null) {
            List<PagoDTO> pagosDTO = transaccion.getPagos().stream()
                    .map(this::pagoToDTO)
                    .collect(Collectors.toList());
            dto.setPagos(pagosDTO);
        }

        // Líneas de la transacción - Manejo seguro de colecciones lazy
        try {
            List<LineaTransaccion> lineas = transaccion.getLineas();
            if (lineas != null && !lineas.isEmpty()) {
                List<LineaTransaccionDTO> lineasDto = lineas.stream().map(linea -> {
                    LineaTransaccionDTO lDto = new LineaTransaccionDTO();
                    lDto.setId(linea.getId());
                    lDto.setProductoId(linea.getProductoId());
                    lDto.setCantidad(linea.getCantidad());
                    lDto.setPrecioUnitario(linea.getPrecioUnitario());
                    lDto.setSubtotal(linea.getSubtotal());
                    lDto.setImpuestoPorcentaje(linea.getImpuestoPorcentaje());
                    lDto.setImpuestoMonto(linea.getImpuestoMonto());
                    lDto.setTotal(linea.getTotal());
                    lDto.setDescuentoPorcentaje(linea.getDescuentoPorcentaje());
                    lDto.setDescuentoMonto(linea.getDescuentoMonto());
                    lDto.setObservaciones(linea.getObservaciones());

                    if (linea.getProductoNombre() != null && !linea.getProductoNombre().isEmpty()) {
                        lDto.setProductoNombre(linea.getProductoNombre());
                    } else if (linea.getProductoId() != null) {
                        try {
                            Producto producto = productoRepository.findById(linea.getProductoId()).orElse(null);
                            lDto.setProductoNombre(producto != null ? producto.getNombre() : null);
                        } catch (Exception e) {
                            lDto.setProductoNombre("Producto no encontrado");
                        }
                    } else {
                        lDto.setProductoNombre(null);
                    }
                    return lDto;
                }).collect(Collectors.toList());
                dto.setLineas(lineasDto);
            }
        } catch (Exception e) {
            // Si hay problemas con la carga lazy, crear una lista vacía
            dto.setLineas(List.of());
        }
        return dto;
    }

    public Transaccion agregarLineaATransaccion(Transaccion transaccion, LineaTransaccionDTO lineaDto) {
        if (!canEditTransaction(transaccion)) {
            throw new IllegalStateException("No se puede editar una transacción con estado: " + transaccion.getEstado());
        }

        // Buscar si ya existe una línea para ese producto y precio
        LineaTransaccion existente = null;
        for (LineaTransaccion l : transaccion.getLineas()) {
            if (l.getProductoId().equals(lineaDto.getProductoId()) &&
                    l.getPrecioUnitario().compareTo(lineaDto.getPrecioUnitario()) == 0) {
                existente = l;
                break;
            }
        }

        // Obtener el producto para el ITBIS por si es necesario
        Producto producto = productoRepository.findById(lineaDto.getProductoId())
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + lineaDto.getProductoId()));
        BigDecimal itbis = BigDecimal.valueOf(producto.getItbis());

        if (existente != null) {
            // Agrupar la cantidad y recalcular totales e impuestos
            existente.setCantidad(existente.getCantidad() + lineaDto.getCantidad());
            // Si el impuesto no está, poner el del producto
            if (existente.getImpuestoPorcentaje() == null || existente.getImpuestoPorcentaje().compareTo(BigDecimal.ZERO) == 0) {
                existente.setImpuestoPorcentaje(itbis);
            }
            existente.calcularTotales();
        } else {
            // Crear nueva línea
            LineaTransaccion linea = new LineaTransaccion();
            linea.setTransaccion(transaccion);
            linea.setProductoId(lineaDto.getProductoId());
            linea.setProductoNombre(lineaDto.getProductoNombre());
            linea.setCantidad(lineaDto.getCantidad());
            linea.setPrecioUnitario(lineaDto.getPrecioUnitario());

            // Asignar impuesto del producto si el DTO no lo tiene
            if (lineaDto.getImpuestoPorcentaje() == null || lineaDto.getImpuestoPorcentaje().compareTo(BigDecimal.ZERO) == 0) {
                linea.setImpuestoPorcentaje(itbis);
            } else {
                linea.setImpuestoPorcentaje(lineaDto.getImpuestoPorcentaje());
            }

            linea.setDescuentoPorcentaje(lineaDto.getDescuentoPorcentaje());
            linea.setObservaciones(lineaDto.getObservaciones());
            linea.calcularTotales();

            transaccion.getLineas().add(linea);
        }

        return transaccionRepository.save(transaccion);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> getTransaccionesByFecha(java.time.LocalDate fechaInicio, java.time.LocalDate fechaFin) {
        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.atTime(23, 59, 59);
        return transaccionRepository.findByFechaBetween(inicio, fin);
    }

    @Transactional(readOnly = true)
    public List<Transaccion> getTransaccionesFiltered(String tipoFilter, String estadoFilter,
                                                      java.time.LocalDate fechaInicio, java.time.LocalDate fechaFin,
                                                      int page, int size) {
        LocalDateTime inicio = fechaInicio != null ? fechaInicio.atStartOfDay() : null;
        LocalDateTime fin = fechaFin != null ? fechaFin.atTime(23, 59, 59) : null;

        List<Transaccion> transacciones = transaccionRepository.findByDeletedFalse();

        if (tipoFilter != null && !tipoFilter.isEmpty()) {
            try {
                Transaccion.TipoTransaccion tipo = Transaccion.TipoTransaccion.valueOf(tipoFilter);
                transacciones = transacciones.stream()
                        .filter(t -> t.getTipo() == tipo)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Ignorar filtro inválido
            }
        }

        if (estadoFilter != null && !estadoFilter.isEmpty()) {
            try {
                Transaccion.EstadoTransaccion estado = Transaccion.EstadoTransaccion.valueOf(estadoFilter);
                transacciones = transacciones.stream()
                        .filter(t -> t.getEstado() == estado)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Ignorar filtro inválido
            }
        }

        if (inicio != null && fin != null) {
            transacciones = transacciones.stream()
                    .filter(t -> t.getFecha().isAfter(inicio) && t.getFecha().isBefore(fin))
                    .collect(Collectors.toList());
        }

        // Aplicar paginación manual
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, transacciones.size());

        if (fromIndex > transacciones.size()) {
            return List.of();
        }

        return transacciones.subList(fromIndex, toIndex);
    }

    @Transactional(readOnly = true)
    public Transaccion getTransaccionById(Long id) {
        return transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));
    }

    public Transaccion confirmarTransaccion(Long id) {
        return actualizarEstado(id, Transaccion.EstadoTransaccion.CONFIRMADA);
    }

    public Transaccion cancelarTransaccion(Long id, String motivo) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));

        transaccion.setEstado(Transaccion.EstadoTransaccion.CANCELADA);
        if (motivo != null && !motivo.isEmpty()) {
            String observacionesActuales = transaccion.getObservaciones() != null ? transaccion.getObservaciones() : "";
            transaccion.setObservaciones(observacionesActuales + " - Cancelada: " + motivo);
        }

        return transaccionRepository.save(transaccion);
    }

    public void marcarComoImpresa(Long transaccionId) {
        Transaccion transaccion = transaccionRepository.findById(transaccionId)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + transaccionId));

        String observacionesActuales = transaccion.getObservaciones() != null ? transaccion.getObservaciones() : "";
        transaccion.setObservaciones(observacionesActuales + " - Factura impresa en " + LocalDateTime.now());

        transaccionRepository.save(transaccion);
    }

    public Transaccion marcarComoDevuelta(Long id, List<LineaTransaccionDTO> productosDevueltos, String motivo, boolean parcial) {
        Transaccion transaccion = transaccionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + id));

        // Actualiza el estado
        transaccion.setEstado(parcial ?
                Transaccion.EstadoTransaccion.PARCIALMENTE_DEVUELTA :
                Transaccion.EstadoTransaccion.DEVUELTA);

        // Construye detalle de productos devueltos
        StringBuilder detalle = new StringBuilder("Se realizó una devolución de esta ");
        detalle.append(transaccion.getTipo() == Transaccion.TipoTransaccion.COMPRA ? "compra" : "venta");
        detalle.append(", del producto(s): ");
        for (LineaTransaccionDTO linea : productosDevueltos) {
            detalle.append(String.format("%s x%d, ",
                    linea.getProductoNombre() != null ? linea.getProductoNombre() : "ID " + linea.getProductoId(),
                    linea.getCantidad()));
        }
        // Elimina la última coma si hay productos
        if (productosDevueltos.size() > 0) {
            detalle.setLength(detalle.length() - 2);
        }
        if (motivo != null && !motivo.isEmpty()) {
            detalle.append(". Motivo: ").append(motivo);
        }

        String obsActual = transaccion.getObservaciones() != null ? transaccion.getObservaciones() : "";
        String nuevaObs = obsActual +
                (obsActual.isEmpty() ? "" : " ") +
                detalle.toString();

        transaccion.setObservaciones(nuevaObs.trim());

        return transaccionRepository.save(transaccion);
    }

    public Transaccion marcarComoDevueltaTotal(Long id, List<LineaTransaccionDTO> productosDevueltos, String motivo) {
        return marcarComoDevuelta(id, productosDevueltos, motivo, false);
    }

    public Transaccion marcarComoDevueltaParcial(Long id, List<LineaTransaccionDTO> productosDevueltos, String motivo) {
        return marcarComoDevuelta(id, productosDevueltos, motivo, true);
    }

    // --- NUEVOS MÉTODOS PARA GESTIÓN DE PAGOS ---

    /**
     * Registra un nuevo pago para una transacción con tipo de pago ENCUOTAS
     * @param transaccionId ID de la transacción
     * @param pagoDTO Datos del pago
     * @return El pago registrado
     */
    // Asegurarnos que este método modifique la transacción y maneje los estados correctamente
    @Transactional
    public Pago registrarPago(Long transaccionId, PagoDTO pagoDTO) {
        Transaccion transaccion = transaccionRepository.findById(transaccionId)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + transaccionId));

        // Verificar que la transacción sea de tipo VENTA y esté en modo ENCUOTAS
        if (transaccion.getTipo() != Transaccion.TipoTransaccion.VENTA) {
            throw new IllegalStateException("Solo se pueden registrar pagos para transacciones de tipo VENTA");
        }

        if (transaccion.getTipoPago() != Transaccion.TipoPago.ENCUOTAS) {
            throw new IllegalStateException("Solo se pueden registrar pagos para transacciones con tipo de pago ENCUOTAS");
        }

        // Verificar que el monto no exceda el saldo pendiente
        if (transaccion.getSaldoPendiente() == null) {
            // Si no tiene saldo pendiente registrado, calcularlo
            BigDecimal saldoPendiente = calcularSaldoPendienteReal(transaccion);
            transaccion.setSaldoPendiente(saldoPendiente);
        }

        // Verificar que el monto del pago no exceda el saldo pendiente
        if (pagoDTO.getMonto().compareTo(transaccion.getSaldoPendiente()) > 0) {
            throw new IllegalArgumentException(
                    "El monto del pago (" + pagoDTO.getMonto() + ") excede el saldo pendiente (" +
                            transaccion.getSaldoPendiente() + ")");
        }

        // Crear el pago
        Pago pago = new Pago();
        pago.setTransaccion(transaccion);
        pago.setFecha(pagoDTO.getFecha() != null ? pagoDTO.getFecha() : LocalDate.now());
        pago.setMonto(pagoDTO.getMonto());
        pago.setMetodoPago(pagoDTO.getMetodoPago());
        pago.setEstado(Pago.EstadoPago.COMPLETADO);
        pago.setObservaciones(pagoDTO.getObservaciones());
        pago.setNumeroCuota(pagoDTO.getNumeroCuota());

        // Actualizar el saldo pendiente de la transacción
        BigDecimal nuevoSaldo = transaccion.getSaldoPendiente().subtract(pagoDTO.getMonto());
        transaccion.setSaldoPendiente(nuevoSaldo);

        // Si el saldo pendiente es 0 o negativo, actualizar el estado de la transacción a COMPLETADA
        if (nuevoSaldo.compareTo(BigDecimal.ZERO) <= 0) {
            transaccion.setEstado(Transaccion.EstadoTransaccion.COMPLETADA);
        }

        // Guardar transacción con el saldo actualizado
        transaccionRepository.save(transaccion);

        // Guardar y retornar el pago
        return pagoRepository.save(pago);
    }

    /**
     * Obtiene todos los pagos de una transacción
     * @param transaccionId ID de la transacción
     * @return Lista de pagos
     */
    @Transactional(readOnly = true)
    public List<Pago> obtenerPagosPorTransaccion(Long transaccionId) {
        Transaccion transaccion = transaccionRepository.findById(transaccionId)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + transaccionId));

        // Retornar los pagos ordenados por fecha
        if (transaccion.getPagos() != null) {
            return transaccion.getPagos().stream()
                    .sorted((p1, p2) -> p1.getFecha().compareTo(p2.getFecha()))
                    .collect(Collectors.toList());
        }

        return List.of();
    }

    /**
     * Convierte una entidad Pago a DTO
     */
    public PagoDTO pagoToDTO(Pago pago) {
        if (pago == null) return null;

        PagoDTO dto = new PagoDTO();
        dto.setId(pago.getId());
        dto.setTransaccionId(pago.getTransaccion().getId());
        dto.setFecha(pago.getFecha());
        dto.setMonto(pago.getMonto());
        dto.setMetodoPago(pago.getMetodoPago());
        dto.setEstado(pago.getEstado().name());
        dto.setNumeroCuota(pago.getNumeroCuota());
        dto.setObservaciones(pago.getObservaciones());
        dto.setFechaCreacion(pago.getFechaCreacion());

        return dto;
    }

    /**
     * Configura una transacción como pago en cuotas
     */
    @Transactional
    public Transaccion configurarPagoEnCuotas(Long transaccionId, BigDecimal montoInicial) {
        Transaccion transaccion = transaccionRepository.findById(transaccionId)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + transaccionId));

        if (transaccion.getTipo() != Transaccion.TipoTransaccion.VENTA) {
            throw new IllegalStateException("Solo las ventas pueden configurarse para pago en cuotas");
        }

        // Validar que el monto inicial no sea mayor al total
        if (montoInicial != null && montoInicial.compareTo(transaccion.getTotal()) > 0) {
            throw new IllegalArgumentException("El monto inicial no puede ser mayor al total de la transacción");
        }

        // Configurar pago en cuotas
        transaccion.setTipoPago(Transaccion.TipoPago.ENCUOTAS);
        transaccion.setMontoInicial(montoInicial != null ? montoInicial : BigDecimal.ZERO);
        transaccion.setSaldoPendiente(transaccion.getTotal().subtract(transaccion.getMontoInicial()));



        // Guardar la transacción actualizada
        return transaccionRepository.save(transaccion);
    }

    /**
     * Actualiza el saldo pendiente de una transacción basado en los pagos registrados
     */
    @Transactional
    public BigDecimal actualizarSaldoPendiente(Long transaccionId) {
        Transaccion transaccion = transaccionRepository.findById(transaccionId)
                .orElseThrow(() -> new EntityNotFoundException("Transacción no encontrada con ID: " + transaccionId));

        if (transaccion.getTipoPago() != Transaccion.TipoPago.ENCUOTAS) {
            return BigDecimal.ZERO; // No hay saldo pendiente para pagos normales
        }

        BigDecimal montoInicial = transaccion.getMontoInicial() != null ? transaccion.getMontoInicial() : BigDecimal.ZERO;
        BigDecimal totalPagado = montoInicial;

        // Sumar todos los pagos registrados
        if (transaccion.getPagos() != null) {
            totalPagado = totalPagado.add(
                    transaccion.getPagos().stream()
                            .filter(p -> p.getEstado() == Pago.EstadoPago.COMPLETADO)
                            .map(Pago::getMonto)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
            );
        }

        // Calcular saldo pendiente
        BigDecimal saldoPendiente = transaccion.getTotal().subtract(totalPagado);

        // Actualizar saldo en la transacción
        transaccion.setSaldoPendiente(saldoPendiente);
        transaccionRepository.save(transaccion);

        return saldoPendiente;
    }

    // Sobrecarga del método crearTransaccion para manejar ventas con cuotas
    public Transaccion crearTransaccion(Transaccion transaccion, BigDecimal montoInicial, List<Pago> cuotas) {
        // Establecer tipo de pago a ENCUOTAS si se proporciona montoInicial
        if (transaccion.getTipo() == Transaccion.TipoTransaccion.VENTA && montoInicial != null) {
            transaccion.setTipoPago(Transaccion.TipoPago.ENCUOTAS);
            transaccion.setMontoInicial(montoInicial);

            // El saldo pendiente inicial es el total menos el monto inicial
            if (transaccion.getTotal() != null) {
                transaccion.setSaldoPendiente(transaccion.getTotal().subtract(montoInicial));
            }
        }

        // Crear la transacción base
        Transaccion nuevaTransaccion = crearTransaccion(transaccion);

        // Si hay cuotas programadas, guardarlas
        if (cuotas != null && !cuotas.isEmpty()) {
            for (Pago cuota : cuotas) {
                cuota.setTransaccion(nuevaTransaccion);
                pagoRepository.save(cuota);
            }
        }

        return nuevaTransaccion;
    }

    /**
     * Obtiene un pago específico por su ID
     */
    @Transactional(readOnly = true)
    public Pago obtenerPagoPorId(Long pagoId) {
        return pagoRepository.findById(pagoId)
                .orElseThrow(() -> new EntityNotFoundException("Pago no encontrado con ID: " + pagoId));
    }

    /**
     * Anula un pago existente
     */
    @Transactional
    public Pago anularPago(Long pagoId, String motivo) {
        Pago pago = obtenerPagoPorId(pagoId);

        // Verificar que el pago no esté ya anulado
        if (pago.getEstado() == Pago.EstadoPago.CANCELADO) {
            throw new IllegalStateException("El pago ya está anulado");
        }

        // Actualizar estado del pago
        pago.setEstado(Pago.EstadoPago.CANCELADO);

        // Agregar motivo a observaciones
        String observacionActual = pago.getObservaciones() != null ? pago.getObservaciones() : "";
        String nuevaObservacion = observacionActual + (observacionActual.isEmpty() ? "" : " - ") +
                "Anulado: " + (motivo != null ? motivo : "Sin motivo especificado");
        pago.setObservaciones(nuevaObservacion);

        // Actualizar saldo pendiente de la transacción
        Transaccion transaccion = pago.getTransaccion();
        if (transaccion.getSaldoPendiente() != null) {
            transaccion.setSaldoPendiente(transaccion.getSaldoPendiente().add(pago.getMonto()));
            transaccionRepository.save(transaccion);
        }

        return pagoRepository.save(pago);
    }

    /**
     * Actualiza el método de pago de un pago
     */
    @Transactional
    public Pago actualizarMetodoPagoDePago(Long pagoId, String metodoPago) {
        if (metodoPago == null || metodoPago.trim().isEmpty()) {
            throw new IllegalArgumentException("El método de pago no puede estar vacío");
        }

        Pago pago = obtenerPagoPorId(pagoId);

        // Verificar que no esté anulado
        if (pago.getEstado() == Pago.EstadoPago.CANCELADO) {
            throw new IllegalStateException("No se puede modificar un pago anulado");
        }

        // Registrar método anterior en observaciones
        String observacionActual = pago.getObservaciones() != null ? pago.getObservaciones() : "";
        String nuevaObservacion = observacionActual + (observacionActual.isEmpty() ? "" : " - ") +
                "Cambio de método de pago: " + pago.getMetodoPago() + " -> " + metodoPago;

        pago.setObservaciones(nuevaObservacion);
        pago.setMetodoPago(metodoPago);

        return pagoRepository.save(pago);
    }

    /**
     * Actualiza las observaciones de un pago
     */
    @Transactional
    public Pago actualizarObservacionesDePago(Long pagoId, String observaciones) {
        Pago pago = obtenerPagoPorId(pagoId);
        pago.setObservaciones(observaciones);
        return pagoRepository.save(pago);
    }

    /**
     * Obtiene pagos realizados en un periodo específico
     */
    @Transactional(readOnly = true)
    public List<Pago> obtenerPagosEnPeriodo(LocalDate fechaInicio, LocalDate fechaFin) {
        return pagoRepository.findByFechaBetween(fechaInicio, fechaFin);
    }

    /**
     * Obtiene pagos vencidos (con fecha anterior a hoy y estado PENDIENTE)
     */
    @Transactional(readOnly = true)
    public List<Pago> obtenerPagosVencidos() {
        return pagoRepository.findOverduePayments(LocalDate.now());
    }

    /**
     * Obtiene estadísticas de pagos agrupadas por método de pago
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticasPagosPorMetodo(LocalDate fechaInicio, LocalDate fechaFin) {
        // Obtener pagos del período
        List<Pago> pagos;
        if (fechaInicio != null && fechaFin != null) {
            pagos = pagoRepository.findByFechaBetween(fechaInicio, fechaFin);
        } else {
            pagos = pagoRepository.findAll();
        }

        // Filtrar solo pagos completados
        pagos = pagos.stream()
                .filter(p -> p.getEstado() == Pago.EstadoPago.COMPLETADO)
                .collect(Collectors.toList());

        // Agrupar por método de pago
        Map<String, List<Pago>> pagosPorMetodo = pagos.stream()
                .collect(Collectors.groupingBy(Pago::getMetodoPago));

        // Calcular totales por método
        Map<String, BigDecimal> totalesPorMetodo = new HashMap<>();
        pagosPorMetodo.forEach((metodo, listaPagos) -> {
            BigDecimal total = listaPagos.stream()
                    .map(Pago::getMonto)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalesPorMetodo.put(metodo, total);
        });

        // Construir resultado
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("totalPagos", pagos.size());
        resultado.put("totalMonto", pagos.stream()
                .map(Pago::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        resultado.put("pagosPorMetodo", pagosPorMetodo.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().size())));
        resultado.put("montoPorMetodo", totalesPorMetodo);

        return resultado;
    }

    /**
     * Obtiene reporte de ventas del día
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerReporteVentasDelDia(String fecha) {
        LocalDateTime fechaInicio;
        LocalDateTime fechaFin;

        if (fecha != null && !fecha.isEmpty()) {
            try {
                LocalDate fechaLocal = LocalDate.parse(fecha);
                fechaInicio = fechaLocal.atStartOfDay();
                fechaFin = fechaLocal.atTime(23, 59, 59);
            } catch (Exception e) {
                // Si la fecha no es válida, usar el día actual
                LocalDate hoy = LocalDate.now();
                fechaInicio = hoy.atStartOfDay();
                fechaFin = hoy.atTime(23, 59, 59);
            }
        } else {
            // Usar el día actual
            LocalDate hoy = LocalDate.now();
            fechaInicio = hoy.atStartOfDay();
            fechaFin = hoy.atTime(23, 59, 59);
        }

        // Obtener transacciones del período y filtrar por tipo VENTA
        List<Transaccion> todasLasTransacciones = transaccionRepository.findByFechaBetween(fechaInicio, fechaFin);
        List<Transaccion> ventas = todasLasTransacciones.stream()
                .filter(t -> t.getTipo() == Transaccion.TipoTransaccion.VENTA && !t.isDeleted())
                .collect(Collectors.toList());

        // Calcular estadísticas
        BigDecimal totalVentas = ventas.stream()
                .filter(t -> t.getEstado() == Transaccion.EstadoTransaccion.COMPLETADA ||
                            t.getEstado() == Transaccion.EstadoTransaccion.ENTREGADA ||
                            t.getEstado() == Transaccion.EstadoTransaccion.COBRADA ||
                            t.getEstado() == Transaccion.EstadoTransaccion.FACTURADA)
                .map(Transaccion::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalTransacciones = ventas.size();

        Map<String, Object> reporte = new HashMap<>();
        reporte.put("fecha", fechaInicio.toLocalDate().toString());
        reporte.put("totalTransacciones", totalTransacciones);
        reporte.put("totalVentas", totalVentas);
        reporte.put("ventasPorEstado", ventas.stream()
                .collect(Collectors.groupingBy(t -> t.getEstado().toString(), Collectors.counting())));

        return reporte;
    }

    /**
     * Obtiene productos más vendidos en un período
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerProductosMasVendidos(String fechaDesde, String fechaHasta, Integer limite) {
        LocalDateTime inicio = null;
        LocalDateTime fin = null;

        if (fechaDesde != null && !fechaDesde.isEmpty()) {
            try {
                inicio = LocalDate.parse(fechaDesde).atStartOfDay();
            } catch (Exception e) {
                // Usar fecha por defecto si hay error
                inicio = LocalDate.now().minusDays(30).atStartOfDay();
            }
        } else {
            inicio = LocalDate.now().minusDays(30).atStartOfDay();
        }

        if (fechaHasta != null && !fechaHasta.isEmpty()) {
            try {
                fin = LocalDate.parse(fechaHasta).atTime(23, 59, 59);
            } catch (Exception e) {
                fin = LocalDate.now().atTime(23, 59, 59);
            }
        } else {
            fin = LocalDate.now().atTime(23, 59, 59);
        }

        // Obtener transacciones del período y filtrar por tipo VENTA
        List<Transaccion> todasLasTransacciones = transaccionRepository.findByFechaBetween(inicio, fin);
        List<Transaccion> ventas = todasLasTransacciones.stream()
                .filter(t -> t.getTipo() == Transaccion.TipoTransaccion.VENTA && !t.isDeleted())
                .collect(Collectors.toList());

        // Agrupar por producto y calcular totales
        Map<Long, Map<String, Object>> productosVendidos = new HashMap<>();

        for (Transaccion venta : ventas) {
            if (venta.getEstado() == Transaccion.EstadoTransaccion.COMPLETADA ||
                venta.getEstado() == Transaccion.EstadoTransaccion.ENTREGADA ||
                venta.getEstado() == Transaccion.EstadoTransaccion.COBRADA ||
                venta.getEstado() == Transaccion.EstadoTransaccion.FACTURADA) {

                if (venta.getLineas() != null) {
                    for (LineaTransaccion linea : venta.getLineas()) {
                        if (linea.getProductoId() != null) {
                            Long productoId = linea.getProductoId();
                            int cantidad = linea.getCantidad() != null ? linea.getCantidad() : 0;
                            BigDecimal total = linea.getTotal() != null ? linea.getTotal() : BigDecimal.ZERO;

                            productosVendidos.computeIfAbsent(productoId, k -> {
                                Map<String, Object> producto = new HashMap<>();
                                producto.put("productoId", productoId);
                                producto.put("cantidadVendida", 0);
                                producto.put("totalVendido", BigDecimal.ZERO);
                                return producto;
                            });

                            // Actualizar totales
                            Map<String, Object> producto = productosVendidos.get(productoId);
                            producto.put("cantidadVendida", (Integer) producto.get("cantidadVendida") + cantidad);
                            producto.put("totalVendido", ((BigDecimal) producto.get("totalVendido")).add(total));

                            // Agregar nombre del producto si no está
                            if (!producto.containsKey("nombreProducto")) {
                                try {
                                    Producto prod = productoRepository.findById(productoId).orElse(null);
                                    producto.put("nombreProducto", prod != null ? prod.getNombre() : "Producto " + productoId);
                                } catch (Exception e) {
                                    producto.put("nombreProducto", "Producto " + productoId);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Convertir a lista y ordenar por cantidad vendida
        return productosVendidos.values().stream()
                .sorted((p1, p2) -> ((Integer) p2.get("cantidadVendida")).compareTo((Integer) p1.get("cantidadVendida")))
                .limit(limite != null ? limite : 5)
                .collect(Collectors.toList());
    }
}