// src/main/resources/static/js/printable/imprimirFactu.js
export function imprimirFactura(transaccion) {
    console.log("Datos de transacción para factura:", transaccion);

    // Función auxiliar para extraer el nombre del cliente de manera robusta
    function obtenerNombreCliente(transaccion) {
        // Imprimir para depuración
        console.log("Cliente en transacción:", transaccion.cliente);

        // Verificar si existe el cliente y sus propiedades
        if (transaccion.cliente) {
            if (transaccion.cliente.nombre && transaccion.cliente.apellido) {
                return `${transaccion.cliente.nombre} ${transaccion.cliente.apellido}`.trim();
            } else if (transaccion.cliente.nombre) {
                return transaccion.cliente.nombre;
            } else if (transaccion.cliente.apellido) {
                return transaccion.cliente.apellido;
            } else if (typeof transaccion.cliente === 'string') {
                return transaccion.cliente;
            }
        }

        // Alternativas comunes
        if (transaccion.clienteNombre) return transaccion.clienteNombre;
        if (transaccion.nombreCliente) return transaccion.nombreCliente;
        if (transaccion.contraparteNombre) return transaccion.contraparteNombre;

        // Si hay lineas y la primera linea tiene cliente
        if (transaccion.lineas && transaccion.lineas.length > 0 && transaccion.lineas[0].cliente) {
            const lineaCliente = transaccion.lineas[0].cliente;
            if (typeof lineaCliente === 'string') return lineaCliente;
            if (lineaCliente.nombre) return lineaCliente.nombre;
        }

        return 'Consumidor Final';
    }

    // Obtener el nombre del cliente de forma robusta
    const nombreCliente = obtenerNombreCliente(transaccion);
    console.log("Nombre del cliente obtenido:", nombreCliente);

    // Crear un elemento temporal que contendrá la estructura de la factura
    const facturaElement = document.createElement('div');
    facturaElement.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
            <!-- Encabezado con logo y número de factura -->
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="/images/logo-thelarte.png" width="100px" style="margin-bottom: 10px;">
                <h2 style="font-size: 20px; margin: 0; font-weight: 700; color: #000;">FACTURA #${transaccion.numeroFactura || transaccion.id}</h2>
            </div>
            
            <!-- Información del cliente y empresa - formato más compacto -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div style="flex: 1;">
                    <p style="margin: 3px 0; font-size: 14px;"><strong>Cliente:</strong> ${nombreCliente}</p>
                    <p style="margin: 3px 0; font-size: 14px;"><strong>Fecha:</strong> ${new Date(transaccion.fecha).toLocaleDateString()}</p>
                    <p style="margin: 3px 0; font-size: 14px;"><strong>Método de Pago:</strong> ${transaccion.metodoPago || 'N/A'}</p>
                </div>
                <div style="flex: 1; text-align: right;">
                    <p style="margin: 3px 0; font-size: 14px;"><strong>ThelArte</strong></p>
                    <p style="margin: 3px 0; font-size: 14px;"><strong>RNC:</strong> XXXXXXXX</p>
                    <p style="margin: 3px 0; font-size: 14px;"><strong>Dirección:</strong> XXXXXXXX</p>
                    <p style="margin: 3px 0; font-size: 14px;"><strong>Tel:</strong> XXXXXXXX</p>
                </div>
            </div>
            
            <!-- Tabla de productos - formato más compacto -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f3f3f3;">
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px;">Producto</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 13px;">Cantidad</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 13px;">Precio</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 13px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${transaccion.lineas?.map(linea => `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px;">${linea.productoNombre || linea.nombreProducto || 'Sin nombre'}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-size: 13px;">${linea.cantidad}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 13px;">RD$${linea.precioUnitario?.toFixed(2) || '0.00'}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 13px;">RD$${(linea.total || linea.subtotal || (linea.cantidad * linea.precioUnitario) || 0).toFixed(2)}</td>
                        </tr>
                    `).join('') || `
                        <tr>
                            <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: center; font-style: italic; color: #777;">
                                No hay productos en esta transacción
                            </td>
                        </tr>
                    `}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 8px; font-size: 13px;"><strong>Subtotal:</strong></td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 13px;">RD$${transaccion.subtotal?.toFixed(2) || '0.00'}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 8px; font-size: 13px;"><strong>Impuestos (18%):</strong></td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 13px;">RD$${transaccion.impuestos?.toFixed(2) || '0.00'}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right; padding: 8px; font-size: 13px;"><strong>Total:</strong></td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold; font-size: 14px;">RD$${transaccion.total?.toFixed(2) || '0.00'}</td>
                    </tr>
                </tfoot>
            </table>
            
            <!-- Mensaje de agradecimiento con términos juntos para ahorrar espacio -->
            <div style="text-align: center; margin: 10px 0; background-color: #f7f7f7; padding: 10px; border-radius: 4px;">
                <p style="font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">¡Gracias por su compra!</p>
                <p style="font-size: 13px; color: #555; margin: 0;">Para cualquier consulta contacte al (809) XXX-XXXX</p>
                <p style="font-size: 11px; margin-top: 8px; color: #666;">Los productos adquiridos tienen garantía según lo establecido por el fabricante. Para reclamos presente esta factura.</p>
            </div>
            
            <!-- Sección para firma del cliente - más compacta -->
            <div style="margin-top: 20px;">
                <div style="width: 50%; margin: 0 auto; text-align: center;">
                    <div style="border-bottom: 1px solid #000; margin-bottom: 6px; height: 25px;"></div>
                    <p style="font-size: 13px; margin: 0;">Firma del Cliente</p>
                    <p style="font-size: 11px; color: #666; margin-top: 3px;">${nombreCliente}</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(facturaElement);

    // Mostrar mensaje de generación
    if (window.showToast) {
        window.showToast("Generando PDF...", "info");
    }

    // Usar las bibliotecas globales cargadas por los scripts en el HTML
    window.html2canvas(facturaElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
    }).then(canvas => {
        document.body.removeChild(facturaElement);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
        pdf.save(`factura-${transaccion.numeroFactura || transaccion.id}.pdf`);

        if (window.showToast) {
            window.showToast("Factura generada correctamente", "success");
        }
    }).catch(error => {
        console.error("Error al generar la factura:", error);
        if (window.showToast) {
            window.showToast("Error al generar la factura", "error");
        }
    });
}