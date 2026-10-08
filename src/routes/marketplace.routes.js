const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const { 
    crearSolicitud, 
    obtenerSolicitudesCliente, 
    obtenerSolicitudesPrestador,
    enviarCotizacion,
    actualizarEstadoSolicitud,
    calificarServicio
} = require('../controllers/solicitud.controller');

router.get('/test', (req, res) => {
    res.status(200).json({ success: true, message: 'Marketplace activo.' });
});

router.post('/solicitudes', verificarToken, crearSolicitud);
router.get('/solicitudes/cliente', verificarToken, obtenerSolicitudesCliente);
router.get('/solicitudes/prestador', verificarToken, obtenerSolicitudesPrestador);
router.put('/solicitudes/:id/cotizar', verificarToken, enviarCotizacion);
router.patch('/solicitudes/:id/estado', verificarToken, actualizarEstadoSolicitud);
router.post('/solicitudes/:id/calificar', verificarToken, calificarServicio);

module.exports = router;