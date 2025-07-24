package com.thelarte.contabilidad.service;

import com.thelarte.contabilidad.dto.FacturaImprimibleDTO;
import com.thelarte.transacciones.service.TransaccionService;
import com.thelarte.transacciones.model.Transaccion;
import com.thelarte.transacciones.model.LineaTransaccion;
import com.thelarte.user.service.ClienteService;
import com.thelarte.user.model.Cliente;
import com.thelarte.inventory.service.ProductoService;
import com.thelarte.inventory.model.Producto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ImpresionService {

    @Autowired
    private TransaccionService transaccionService;
    
    @Autowired
    private ClienteService clienteService;
    
    @Autowired
    private ProductoService productoService;

    public FacturaImprimibleDTO prepararFactura(Long transaccionId) {
        Transaccion transaccion = transaccionService.getTransaccionById(transaccionId);
        
        FacturaImprimibleDTO factura = new FacturaImprimibleDTO();
        
        factura.setEmpresa(crearDatosEmpresa());
        factura.setFactura(crearDatosFactura(transaccion));
        factura.setCliente(crearDatosCliente(transaccion));
        factura.setLineas(crearLineasFactura(transaccion));
        factura.setResumen(crearResumenFactura(transaccion));
        factura.setCodigoQR(generarCodigoQR(transaccion));
        factura.setFirmaDigital(generarFirmaDigital(transaccion));
        
        return factura;
    }

    private FacturaImprimibleDTO.DatosEmpresa crearDatosEmpresa() {
        FacturaImprimibleDTO.DatosEmpresa empresa = new FacturaImprimibleDTO.DatosEmpresa();
        empresa.setNombre("Thelarte");
        empresa.setRnc("130-12345-6");
        empresa.setDireccion("Calle Principal #123, Santo Domingo, República Dominicana");
        empresa.setTelefono("(809) 123-4567");
        empresa.setEmail("info@thelarte.com");
        empresa.setSitioWeb("www.thelarte.com");
        empresa.setLogo("/images/logo-empresa.png");
        return empresa;
    }

    private FacturaImprimibleDTO.DatosFactura crearDatosFactura(Transaccion transaccion) {
        FacturaImprimibleDTO.DatosFactura factura = new FacturaImprimibleDTO.DatosFactura();
        factura.setNumeroFactura(transaccion.getNumeroFactura());
        factura.setTipo(mapearTipoFactura(transaccion.getTipo()));
        factura.setFecha(transaccion.getFecha());
        factura.setCajero("Cajero Actual");
        factura.setMetodoPago(transaccion.getMetodoPago());
        factura.setNumeroTransaccionPago(transaccion.getNumeroTransaccion());
        factura.setNcf(generarNCF(transaccion));
        factura.setCondicionesPago(transaccion.getCondicionesPago());
        return factura;
    }

    private FacturaImprimibleDTO.DatosCliente crearDatosCliente(Transaccion transaccion) {
        FacturaImprimibleDTO.DatosCliente clienteDTO = new FacturaImprimibleDTO.DatosCliente();
        
        if (transaccion.getTipoContraparte() == Transaccion.TipoContraparte.CLIENTE) {
            try {
                Cliente cliente = clienteService.getClienteByCedula(transaccion.getContraparteId().toString());
                if (cliente != null) {
                    clienteDTO.setCedula(cliente.getCedula());
                    clienteDTO.setNombre(cliente.getNombre());
                    clienteDTO.setApellido(cliente.getApellido());
                    clienteDTO.setTelefono(cliente.getTelefono());
                    clienteDTO.setEmail(cliente.getEmail());
                    clienteDTO.setDireccion(cliente.getDireccion());
                }
            } catch (Exception e) {
                clienteDTO.setNombre("Cliente Consumidor Final");
                clienteDTO.setCedula("000-0000000-0");
            }
        } else {
            clienteDTO.setNombre(transaccion.getContraparteNombre());
        }
        
        return clienteDTO;
    }

    private List<FacturaImprimibleDTO.LineaFacturaDTO> crearLineasFactura(Transaccion transaccion) {
        if (transaccion.getLineas() == null) {
            return List.of();
        }
        
        return transaccion.getLineas().stream()
            .map(this::convertirLineaFactura)
            .collect(Collectors.toList());
    }

    private FacturaImprimibleDTO.LineaFacturaDTO convertirLineaFactura(LineaTransaccion linea) {
        FacturaImprimibleDTO.LineaFacturaDTO lineaDTO = new FacturaImprimibleDTO.LineaFacturaDTO();
        
        try {
            Producto producto = productoService.getProductoById(linea.getProductoId());
            if (producto != null) {
                lineaDTO.setCodigo(producto.getCodigo());
                lineaDTO.setDescripcion(producto.getNombre());
                
                BigDecimal itbisDecimal = BigDecimal.valueOf(producto.getItbis()).divide(BigDecimal.valueOf(100));
                BigDecimal montoItbis = linea.getPrecioUnitario().multiply(itbisDecimal).multiply(new BigDecimal(linea.getCantidad()));
                lineaDTO.setItbis(montoItbis);
            } else {
                lineaDTO.setCodigo("N/A");
                lineaDTO.setDescripcion("Producto no encontrado");
                lineaDTO.setItbis(BigDecimal.ZERO);
            }
        } catch (Exception e) {
            lineaDTO.setCodigo("N/A");
            lineaDTO.setDescripcion("Error al cargar producto");
            lineaDTO.setItbis(BigDecimal.ZERO);
        }
        
        lineaDTO.setCantidad(linea.getCantidad());
        lineaDTO.setPrecioUnitario(linea.getPrecioUnitario());
        lineaDTO.setDescuento(linea.getDescuento() != null ? linea.getDescuento() : BigDecimal.ZERO);
        lineaDTO.setSubtotal(linea.getSubtotal());
        
        return lineaDTO;
    }

    private FacturaImprimibleDTO.ResumenFactura crearResumenFactura(Transaccion transaccion) {
        FacturaImprimibleDTO.ResumenFactura resumen = new FacturaImprimibleDTO.ResumenFactura();
        
        resumen.setSubtotal(transaccion.getSubtotal() != null ? transaccion.getSubtotal() : BigDecimal.ZERO);
        resumen.setTotalItbis(transaccion.getImpuestos() != null ? transaccion.getImpuestos() : BigDecimal.ZERO);
        resumen.setTotal(transaccion.getTotal());
        
        BigDecimal totalDescuentos = BigDecimal.ZERO;
        if (transaccion.getLineas() != null) {
            totalDescuentos = transaccion.getLineas().stream()
                .map(linea -> linea.getDescuento() != null ? linea.getDescuento() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        resumen.setTotalDescuentos(totalDescuentos);
        
        BigDecimal baseImponible = resumen.getSubtotal().subtract(totalDescuentos);
        resumen.setBaseImponible(baseImponible);
        
        resumen.setMontoPagado(transaccion.getTotal());
        resumen.setCambio(BigDecimal.ZERO);
        
        resumen.setTotalEnLetras(convertirNumeroALetras(transaccion.getTotal()));
        
        return resumen;
    }

    private String mapearTipoFactura(Transaccion.TipoTransaccion tipo) {
        switch (tipo) {
            case VENTA:
                return "FACTURA DE VENTA";
            case COMPRA:
                return "FACTURA DE COMPRA";
            case DEVOLUCION_VENTA:
                return "NOTA DE CRÉDITO - DEVOLUCIÓN";
            case DEVOLUCION_COMPRA:
                return "NOTA DE DÉBITO - DEVOLUCIÓN";
            default:
                return "DOCUMENTO COMERCIAL";
        }
    }

    private String generarNCF(Transaccion transaccion) {
        String tipoNCF = "B01";
        long secuencial = transaccion.getId() != null ? transaccion.getId() : 1L;
        return String.format("%s%08d", tipoNCF, secuencial);
    }

    private String generarCodigoQR(Transaccion transaccion) {
        String data = String.format("FACTURA:%s|TOTAL:%s|FECHA:%s", 
            transaccion.getNumeroFactura(),
            transaccion.getTotal().toString(),
            transaccion.getFecha().toString());
        
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    }

    private String generarFirmaDigital(Transaccion transaccion) {
        return "DOCUMENTO PROCESADO DIGITALMENTE - VÁLIDO SIN FIRMA";
    }

    private String convertirNumeroALetras(BigDecimal numero) {
        if (numero == null) return "CERO PESOS";
        
        try {
            long parteEntera = numero.longValue();
            int centavos = numero.remainder(BigDecimal.ONE).multiply(new BigDecimal(100)).intValue();
            
            String letras = convertirEnteroALetras(parteEntera);
            
            if (centavos > 0) {
                return letras + " PESOS CON " + convertirEnteroALetras(centavos) + " CENTAVOS";
            } else {
                return letras + " PESOS";
            }
        } catch (Exception e) {
            return "ERROR EN CONVERSIÓN";
        }
    }

    private String convertirEnteroALetras(long numero) {
        if (numero == 0) return "CERO";
        if (numero == 1) return "UNO";
        if (numero <= 20) return numerosBasicos[(int)numero];
        if (numero < 100) return convertirDecenas(numero);
        if (numero < 1000) return convertirCentenas(numero);
        if (numero < 1000000) return convertirMiles(numero);
        
        return String.valueOf(numero);
    }

    private final String[] numerosBasicos = {
        "", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ",
        "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE"
    };

    private String convertirDecenas(long numero) {
        String[] decenas = {"", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"};
        
        int dec = (int) (numero / 10);
        int uni = (int) (numero % 10);
        
        if (uni == 0) {
            return decenas[dec];
        } else {
            return decenas[dec] + " Y " + numerosBasicos[uni];
        }
    }

    private String convertirCentenas(long numero) {
        String[] centenas = {"", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"};
        
        int cen = (int) (numero / 100);
        long resto = numero % 100;
        
        String resultado = (numero == 100) ? "CIEN" : centenas[cen];
        
        if (resto > 0) {
            if (resto <= 20) {
                resultado += " " + numerosBasicos[(int)resto];
            } else {
                resultado += " " + convertirDecenas(resto);
            }
        }
        
        return resultado;
    }

    private String convertirMiles(long numero) {
        long miles = numero / 1000;
        long resto = numero % 1000;
        
        String resultado;
        if (miles == 1) {
            resultado = "MIL";
        } else {
            resultado = convertirEnteroALetras(miles) + " MIL";
        }
        
        if (resto > 0) {
            resultado += " " + convertirEnteroALetras(resto);
        }
        
        return resultado;
    }

    public byte[] generarFacturaPDF(FacturaImprimibleDTO factura) {
        return new byte[0];
    }

    public String generarFacturaHTML(FacturaImprimibleDTO factura) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<title>Factura ").append(factura.getFactura().getNumeroFactura()).append("</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; margin: 20px; }");
        html.append(".header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }");
        html.append(".company-info { text-align: center; margin-bottom: 20px; }");
        html.append(".invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }");
        html.append(".client-info { margin-bottom: 20px; }");
        html.append("table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }");
        html.append("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }");
        html.append("th { background-color: #f2f2f2; }");
        html.append(".total-section { text-align: right; }");
        html.append(".footer { margin-top: 30px; text-align: center; font-size: 12px; }");
        html.append("</style>");
        html.append("</head><body>");
        
        html.append("<div class='header'>");
        html.append("<h1>").append(factura.getEmpresa().getNombre()).append("</h1>");
        html.append("</div>");
        
        html.append("<div class='company-info'>");
        html.append("<p>RNC: ").append(factura.getEmpresa().getRnc()).append("</p>");
        html.append("<p>").append(factura.getEmpresa().getDireccion()).append("</p>");
        html.append("<p>Tel: ").append(factura.getEmpresa().getTelefono()).append(" | Email: ").append(factura.getEmpresa().getEmail()).append("</p>");
        html.append("</div>");
        
        html.append("<div class='invoice-info'>");
        html.append("<div>");
        html.append("<h3>").append(factura.getFactura().getTipo()).append("</h3>");
        html.append("<p><strong>Número:</strong> ").append(factura.getFactura().getNumeroFactura()).append("</p>");
        html.append("<p><strong>NCF:</strong> ").append(factura.getFactura().getNcf()).append("</p>");
        html.append("</div>");
        html.append("<div>");
        html.append("<p><strong>Fecha:</strong> ").append(factura.getFactura().getFecha()).append("</p>");
        html.append("<p><strong>Cajero:</strong> ").append(factura.getFactura().getCajero()).append("</p>");
        html.append("<p><strong>Método de Pago:</strong> ").append(factura.getFactura().getMetodoPago()).append("</p>");
        html.append("</div>");
        html.append("</div>");
        
        html.append("<div class='client-info'>");
        html.append("<h4>Datos del Cliente</h4>");
        html.append("<p><strong>Nombre:</strong> ").append(factura.getCliente().getNombreCompleto()).append("</p>");
        if (factura.getCliente().getCedula() != null) {
            html.append("<p><strong>Cédula:</strong> ").append(factura.getCliente().getCedula()).append("</p>");
        }
        if (factura.getCliente().getTelefono() != null) {
            html.append("<p><strong>Teléfono:</strong> ").append(factura.getCliente().getTelefono()).append("</p>");
        }
        html.append("</div>");
        
        html.append("<table>");
        html.append("<thead>");
        html.append("<tr><th>Código</th><th>Descripción</th><th>Cant.</th><th>Precio Unit.</th><th>Descuento</th><th>ITBIS</th><th>Subtotal</th></tr>");
        html.append("</thead>");
        html.append("<tbody>");
        
        for (FacturaImprimibleDTO.LineaFacturaDTO linea : factura.getLineas()) {
            html.append("<tr>");
            html.append("<td>").append(linea.getCodigo()).append("</td>");
            html.append("<td>").append(linea.getDescripcion()).append("</td>");
            html.append("<td>").append(linea.getCantidad()).append("</td>");
            html.append("<td>$").append(formatearMoneda(linea.getPrecioUnitario())).append("</td>");
            html.append("<td>$").append(formatearMoneda(linea.getDescuento())).append("</td>");
            html.append("<td>$").append(formatearMoneda(linea.getItbis())).append("</td>");
            html.append("<td>$").append(formatearMoneda(linea.getSubtotal())).append("</td>");
            html.append("</tr>");
        }
        
        html.append("</tbody>");
        html.append("</table>");
        
        html.append("<div class='total-section'>");
        html.append("<p><strong>Subtotal: $").append(formatearMoneda(factura.getResumen().getSubtotal())).append("</strong></p>");
        html.append("<p><strong>Descuentos: $").append(formatearMoneda(factura.getResumen().getTotalDescuentos())).append("</strong></p>");
        html.append("<p><strong>Base Imponible: $").append(formatearMoneda(factura.getResumen().getBaseImponible())).append("</strong></p>");
        html.append("<p><strong>ITBIS: $").append(formatearMoneda(factura.getResumen().getTotalItbis())).append("</strong></p>");
        html.append("<h3>TOTAL: $").append(formatearMoneda(factura.getResumen().getTotal())).append("</h3>");
        html.append("<p><em>").append(factura.getResumen().getTotalEnLetras()).append("</em></p>");
        html.append("</div>");
        
        html.append("<div class='footer'>");
        html.append("<p>").append(factura.getFirmaDigital()).append("</p>");
        html.append("<p>Gracias por su compra</p>");
        html.append("</div>");
        
        html.append("</body></html>");
        
        return html.toString();
    }

    private String formatearMoneda(BigDecimal valor) {
        if (valor == null) return "0.00";
        NumberFormat formatter = NumberFormat.getNumberInstance(Locale.US);
        formatter.setMinimumFractionDigits(2);
        formatter.setMaximumFractionDigits(2);
        return formatter.format(valor);
    }
}