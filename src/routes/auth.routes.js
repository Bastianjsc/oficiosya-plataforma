const express = require('express');
const router = express.Router();
const { registrarUsuario, obtenerUsuarios, loginUsuario, uploadDocumentos } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);
router.get('/users', verificarToken, obtenerUsuarios);

router.post('/verify-upload', 
    verificarToken, 
    upload.fields([
        { name: 'cedula', maxCount: 1 }, 
        { name: 'antecedentes', maxCount: 1 }
    ]), 
    uploadDocumentos
);

module.exports = router;