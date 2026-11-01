import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarEvidenciaPDF = (solicitud) => {
  try {
    const doc = new jsPDF();

    // --- PALETA DE COLORES OFICIOSYA ---
    const colorPrincipal = [27, 59, 44];   // #1b3b2c (Verde oscuro)
    const colorSecundario = [232, 197, 130]; // #e8c582 (Dorado)
    const colorTexto = [60, 60, 60];

    // --- ENCABEZADO CON FONDO ---
    doc.setFillColor(...colorPrincipal);
    doc.rect(0, 0, 210, 25, 'F'); // Rectángulo superior

    doc.setTextColor(...colorSecundario);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ACUERDO DE SERVICIO DIGITAL", 105, 16, { align: "center" });

    // --- FECHA Y HORA ---
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const fechaFormateada = new Date(solicitud.createdAt).toLocaleString('es-CL', {
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
    doc.text(`Generado: ${fechaFormateada}`, 195, 33, { align: "right" });

    // --- DATOS DE LAS PARTES ---
    doc.setTextColor(...colorPrincipal);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Información de las Partes", 14, 40);
    
    doc.setDrawColor(...colorSecundario);
    doc.setLineWidth(0.5);
    doc.line(14, 43, 196, 43);

    doc.setTextColor(...colorTexto);
    doc.setFontSize(11);
    
    // SOLUCIÓN AL NOMBRE: Si el backend no envía el objeto cliente (porque el usuario activo es el cliente), tomamos su nombre de la sesión local.
    const nombreCliente = solicitud.cliente?.nombre || localStorage.getItem('nombreUsuario') || 'Cliente de OficiosYa';
    const nombrePrestador = solicitud.prestador?.tituloTienda || solicitud.prestador?.nombre || 'Prestador Profesional';

    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 14, 52);
    doc.setFont("helvetica", "normal");
    doc.text(nombreCliente, 32, 52);

    doc.setFont("helvetica", "bold");
    doc.text("Técnico:", 100, 52);
    doc.setFont("helvetica", "normal");
    doc.text(nombrePrestador, 118, 52);

    // --- DESCRIPCIÓN DEL PROBLEMA (LO QUE PIDIÓ EL CLIENTE) ---
    let currentY = 66;
    doc.setTextColor(...colorPrincipal);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Requerimiento Original del Cliente:", 14, currentY);
    
    currentY += 6;
    doc.setTextColor(...colorTexto);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const problema = solicitud.descripcionCliente || 'Sin descripción registrada.';
    const splitProblema = doc.splitTextToSize(problema, 180);
    doc.text(splitProblema, 14, currentY);

    currentY += (splitProblema.length * 5) + 6;

    // --- DETALLES Y CONDICIONES DEL PRESTADOR ---
    doc.setTextColor(...colorPrincipal);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Condiciones del Trabajo (Prestador):", 14, currentY);
    
    currentY += 6;
    doc.setTextColor(...colorTexto);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const detalles = solicitud.presupuesto?.mensajePrestador || 'Sin condiciones o detalles adicionales especificados.';
    const splitDetalles = doc.splitTextToSize(detalles, 180);
    doc.text(splitDetalles, 14, currentY);

    currentY += (splitDetalles.length * 5) + 10;

    // --- TABLA DE PRESUPUESTO (DISEÑO MEJORADO) ---
    const manoObra = solicitud.presupuesto?.manoDeObra || 0;
    const materiales = solicitud.presupuesto?.materiales || 0;
    const total = manoObra + materiales;

    autoTable(doc, {
      startY: currentY,
      head: [['Concepto Presupuestado', 'Valor Acordado']],
      body: [
        ['Costo de Mano de Obra', `$${manoObra.toLocaleString('es-CL')}`],
        ['Costo de Materiales / Repuestos', `$${materiales.toLocaleString('es-CL')}`]
      ],
      foot: [
        ['TOTAL A PAGAR', `$${total.toLocaleString('es-CL')}`]
      ],
      headStyles: {
        fillColor: colorPrincipal,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        fontSize: 11
      },
      bodyStyles: {
        textColor: colorTexto,
        halign: 'left',
        fontSize: 10
      },
      footStyles: {
        fillColor: colorSecundario, // Color dorado para destacar el total
        textColor: colorPrincipal, // Texto verde oscuro
        fontStyle: 'bold',
        halign: 'left',
        fontSize: 12
      },
      theme: 'grid',
      margin: { left: 14, right: 14 }
    });

    // --- PIE DE PÁGINA ---
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Este documento es un respaldo digital emitido por la plataforma OficiosYa.", 105, finalY, { align: "center" });
    doc.text("Certifica el acuerdo comercial de presupuesto entre las partes mencionadas.", 105, finalY + 4, { align: "center" });

    // Guardar archivo (nombre dinámico)
    doc.save(`Acuerdo_Servicio_${solicitud._id.substring(0, 6)}.pdf`);
  } catch (error) {
    console.error("Error crítico al generar PDF:", error);
    alert("Hubo un error al generar el documento PDF. Revisa la consola.");
  }
};