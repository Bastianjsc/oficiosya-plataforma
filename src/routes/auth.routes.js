const express = require('express');
const router = express.Router();

// Importar controladores en una sola declaración
const { 
    registrarUsuario, 
    obtenerUsuarios, 
    loginUsuario, 
    uploadDocumentos, 
    obtenerPerfilActual,
    verificarPrestadorAdmin,
    eliminarUsuarioAdmin,
    actualizarPerfilPrestador,
    obtenerPrestadoresPublicos,
    obtenerPrestadorPorIdPublico,
    obtenerNotificaciones,
    marcarNotificacionLeida,
    eliminarNotificacion,
    eliminarNotificacionesEnMasa,
    solicitarRecuperacion,   
    restablecerPassword,
    revocarVerificacion
} = require('../controllers/auth.controller');

const { verificarToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const LISTA_OFICIOS = require('../data/oficios.data');

// Rutas públicas
router.get('/oficios', (req, res) => {
    res.status(200).json({ success: true, oficios: LISTA_OFICIOS });
});
router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);
router.get('/prestadores-publicos', obtenerPrestadoresPublicos);
router.get('/prestadores-publicos/:id', obtenerPrestadorPorIdPublico);

// --- RUTAS DE RECUPERACIÓN DE CONTRASEÑA ---
router.post('/recuperar-password', solicitarRecuperacion);
router.post('/restablecer-password', restablecerPassword);
// -------------------------------------------

// Rutas protegidas
router.get('/users', verificarToken, obtenerUsuarios);
router.get('/perfil', verificarToken, obtenerPerfilActual);

// --- RUTAS DE NOTIFICACIONES ---
router.get('/notificaciones', verificarToken, obtenerNotificaciones);
router.patch('/notificaciones/:id/leer', verificarToken, marcarNotificacionLeida);
router.delete('/notificaciones/:id', verificarToken, eliminarNotificacion);
router.post('/notificaciones/masa', verificarToken, eliminarNotificacionesEnMasa);

// Ruta para subida de documentos
router.post('/verify-upload', 
    verificarToken, 
    upload.fields([
        { name: 'cedula', maxCount: 5 },
        { name: 'antecedentes', maxCount: 5 }
    ]), 
    uploadDocumentos
);

// Ruta de administración para otorgar el Sello de Confianza
router.patch('/users/:id/verify', verificarToken, verificarPrestadorAdmin);

// Ruta para revocar la insignia y rechazar documentos
router.patch('/users/:id/revoke', verificarToken, revocarVerificacion);

// Ruta para eliminar cuentas (Solo Admin)
router.delete('/users/:id', verificarToken, eliminarUsuarioAdmin);

// Ruta para actualizar perfil / foto
router.put('/perfil', verificarToken, upload.single('fotoPerfil'), actualizarPerfilPrestador);

module.exports = router;