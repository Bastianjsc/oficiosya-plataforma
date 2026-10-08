const Solicitud = require('../models/solicitud.model');
const User = require('../models/user.model');

const crearSolicitud = async (req, res) => {
    try {
        const { prestadorId, descripcionCliente } = req.body;
        const clienteId = req.usuario.id;

        if (!prestadorId || !descripcionCliente) {
            return res.status(400).json({ success: false, message: 'Faltan datos requeridos para la solicitud.' });
        }

        const nuevaSolicitud = new Solicitud({
            cliente: clienteId,
            prestador: prestadorId,
            descripcionCliente
        });

        await nuevaSolicitud.save();

        res.status(201).json({ success: true, message: 'Solicitud enviada al prestador con éxito.', solicitud: nuevaSolicitud });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear solicitud', error: error.message });
    }
};

const obtenerSolicitudesCliente = async (req, res) => {
    try {
        const solicitudes = await Solicitud.find({ cliente: req.usuario.id })
            .populate('prestador', 'nombre oficio tituloTienda fotoPerfil tarifaReferencia')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, solicitudes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener tus solicitudes', error: error.message });
    }
};

const obtenerSolicitudesPrestador = async (req, res) => {
    try {
        const solicitudes = await Solicitud.find({ prestador: req.usuario.id })
            .populate('cliente', 'nombre email')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, solicitudes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener solicitudes entrantes', error: error.message });
    }
};

const enviarCotizacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { manoDeObra, materiales, mensajePrestador } = req.body;

        const solicitud = await Solicitud.findById(id);
        if (!solicitud) return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });

        if (solicitud.prestador.toString() !== req.usuario.id) {
            return res.status(403).json({ success: false, message: 'No autorizado para cotizar esta solicitud.' });
        }

        solicitud.presupuesto = { manoDeObra, materiales, mensajePrestador };
        solicitud.estado = 'Cotizado';
        await solicitud.save();

        res.status(200).json({ success: true, message: 'Cotización enviada exitosamente al cliente.', solicitud });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al procesar la cotización', error: error.message });
    }
};

const actualizarEstadoSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 

        const solicitud = await Solicitud.findById(id);
        if (!solicitud) return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });

        solicitud.estado = estado;
        await solicitud.save();

        res.status(200).json({ success: true, message: `Solicitud marcada como ${estado}.`, solicitud });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar el estado', error: error.message });
    }
};

const calificarServicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { estrellas, comentario } = req.body;
        const clienteId = req.usuario.id;

        const solicitud = await Solicitud.findOne({ _id: id, cliente: clienteId });
        if (!solicitud) return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });

        if (solicitud.estado !== 'Finalizado') {
            return res.status(403).json({ success: false, message: 'Solo puedes calificar servicios que hayan finalizado.' });
        }

        if (solicitud.calificacion && solicitud.calificacion.estrellas) {
            return res.status(400).json({ success: false, message: 'Ya has calificado este servicio previamente.' });
        }

        solicitud.calificacion = { estrellas, comentario, fecha: new Date() };
        await solicitud.save();

        const solicitudesCalificadas = await Solicitud.find({
            prestador: solicitud.prestador,
            'calificacion.estrellas': { $exists: true }
        });

        const numeroResenas = solicitudesCalificadas.length;
        const sumaEstrellas = solicitudesCalificadas.reduce((acc, curr) => acc + curr.calificacion.estrellas, 0);
        const calificacionPromedio = (sumaEstrellas / numeroResenas).toFixed(1);

        await User.findByIdAndUpdate(solicitud.prestador, {
            calificacionPromedio: Number(calificacionPromedio),
            numeroResenas
        });

        res.status(200).json({ success: true, message: 'Reseña publicada con éxito. ¡Gracias por tu evaluación!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al procesar la calificación', error: error.message });
    }
};

module.exports = {
    crearSolicitud,
    obtenerSolicitudesCliente,
    obtenerSolicitudesPrestador,
    enviarCotizacion,
    actualizarEstadoSolicitud,
    calificarServicio
};