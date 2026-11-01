import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generarEvidenciaPDF = (solicitud) => {
  try {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Acuerdo de Trabajo - OficiosYa", 14, 20);

    // Datos principales seguros
    doc.setFontSize(12);
    doc.text(`Cliente: ${solicitud.cliente?.nombre || 'No registrado'}`, 14, 30);
    doc.text(`Prestador: ${solicitud.prestador?.nombre || 'No registrado'}`, 14, 37);
    doc.text(`Fecha: ${new Date(solicitud.createdAt).toLocaleDateString()}`, 14, 44);

    // Detalles (Esto es lo que insertamos en el paso anterior)
    const detalles = solicitud.presupuesto?.mensajePrestador || 'Sin detalles adicionales.';
    doc.text("Detalles del Servicio:", 14, 54);
    doc.setFontSize(10);
    
    // Evita que el texto largo se salga del PDF
    const splitText = doc.splitTextToSize(detalles, 180);
    doc.text(splitText, 14, 60);

    // Montos
    const offsetY = 60 + (splitText.length * 5) + 10;
    doc.autoTable({
      startY: offsetY,
      head: [['Concepto', 'Valor']],
      body: [
        ['Mano de Obra', `$${solicitud.presupuesto?.manoDeObra || 0}`],
        ['Materiales', `$${solicitud.presupuesto?.materiales || 0}`],
        ['Total', `$${(solicitud.presupuesto?.manoDeObra || 0) + (solicitud.presupuesto?.materiales || 0)}`]
      ],
    });

    // Guardar archivo
    doc.save(`Servicio_${solicitud._id}.pdf`);
  } catch (error) {
    console.error("Error crítico al generar PDF:", error);
    alert("Hubo un error al generar el PDF. Revisa la consola.");
  }
};