import { jsPDF } from "jspdf";

export const generarEvidenciaPDF = (solicitud) => {
  const doc = new jsPDF();
  
  // Encabezado (Color corporativo #1b3b2c)
  doc.setFillColor(27, 59, 44); 
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("Acuerdo de Servicio - OficiosYa", 105, 20, { align: "center" });
  
  // Metadatos
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  const fechaStr = solicitud.updatedAt || solicitud.createdAt;
  const fecha = fechaStr ? new Date(fechaStr).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'Fecha no disponible';
  
  doc.text(`ID de Solicitud: ${solicitud._id}`, 20, 45);
  doc.text(`Fecha del Acuerdo: ${fecha}`, 20, 52);
  doc.text(`Estado Legal: ${solicitud.estado}`, 20, 59);
  
  // Sección: Partes Involucradas
  doc.setFontSize(14);
  doc.setTextColor(27, 59, 44);
  doc.text("Partes Involucradas", 20, 75);
  doc.line(20, 77, 190, 77); // Línea separadora
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`CLIENTE: ${solicitud.cliente?.nombre || 'Usuario Cliente'}`, 20, 87);
  doc.text(`TÉCNICO / PRESTADOR: ${solicitud.prestador?.nombre || 'Técnico'} (${solicitud.prestador?.oficio || 'Profesional'})`, 20, 95);
  
  // Sección: Detalles del Problema (Cliente)
  doc.setFontSize(14);
  doc.setTextColor(27, 59, 44);
  doc.text("Descripción del Requerimiento", 20, 115);
  doc.line(20, 117, 190, 117);
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const splitDescripcion = doc.splitTextToSize(solicitud.descripcionCliente || 'Sin descripción.', 170);
  doc.text(splitDescripcion, 20, 127);
  
  let yFinal = 127 + (splitDescripcion.length * 6) + 15;
  
  // Sección: Cotización y Acuerdo
  if (solicitud.presupuesto) {
    doc.setFontSize(14);
    doc.setTextColor(27, 59, 44);
    doc.text("Presupuesto Formal Aceptado", 20, yFinal);
    doc.line(20, yFinal + 2, 190, yFinal + 2);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    if (solicitud.presupuesto.mensajePrestador) {
        const splitMensaje = doc.splitTextToSize(`Alcance del trabajo propuesto: ${solicitud.presupuesto.mensajePrestador}`, 170);
        doc.text(splitMensaje, 20, yFinal + 12);
        yFinal += (splitMensaje.length * 6) + 10;
    } else {
        yFinal += 12;
    }

    doc.setFontSize(12);
    doc.text(`Mano de Obra: $${solicitud.presupuesto.manoDeObra}`, 20, yFinal);
    doc.text(`Materiales: $${solicitud.presupuesto.materiales}`, 20, yFinal + 8);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL ACORDADO: $${solicitud.presupuesto.manoDeObra + solicitud.presupuesto.materiales}`, 20, yFinal + 20);
    doc.setFont("helvetica", "normal");
  }
  
  // Footer / Aviso Legal
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Este documento es generado automáticamente por la plataforma OficiosYa y constituye un", 105, 275, { align: "center" });
  doc.text("respaldo digital de la aceptación del presupuesto entre ambas partes involucradas.", 105, 280, { align: "center" });
  
  // =========================================================================
  // NUEVA LÓGICA DE VISUALIZACIÓN: 
  // En lugar de doc.save() (que fuerza la descarga), generamos un Blob de datos
  // y lo abrimos en una nueva pestaña del navegador para visualizarlo.
  // =========================================================================
  const pdfBlobUrl = doc.output('bloburl');
  window.open(pdfBlobUrl, '_blank');
};