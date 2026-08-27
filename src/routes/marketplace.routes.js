const express = require('express');
const router = express.Router();

// Ruta GET de prueba: /api/marketplace/test
router.get('/test', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Módulo del Marketplace y motor de búsqueda respondiendo.' 
    });
});

module.exports = router;