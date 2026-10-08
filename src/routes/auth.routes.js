const express = require('express');
const router = express.Router();

// Importar controladores y middlewares en una sola línea cada uno
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
    obtenerPrestadorPorIdPublico
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

// Rutas protegidas
router.get('/users', verificarToken, obtenerUsuarios);
router.get('/perfil', verificarToken, obtenerPerfilActual);

router.post('/verify-upload', 
    verificarToken, 
    upload.fields([
        { name: 'cedula', maxCount: 1 }, 
        { name: 'antecedentes', maxCount: 1 }
    ]), 
    uploadDocumentos
);

// Ruta de administración para otorgar el Sello de Confianza[cite: 1]
router.patch('/users/:id/verify', verificarToken, verificarPrestadorAdmin);

// Ruta para eliminar cuentas (Solo Admin)
router.delete('/users/:id', verificarToken, eliminarUsuarioAdmin);

router.put('/perfil', verificarToken, upload.single('fotoPerfil'), actualizarPerfilPrestador);

module.exports = router;