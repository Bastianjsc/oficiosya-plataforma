const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    try {
        // 1. Obtener el token del header 'Authorization' (Formato: "Bearer <token>")
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Acceso denegado. Formato de token inválido o inexistente.' });
        }

        const token = authHeader.split(' ')[1];

        // 2. Verificar si el token fue firmado por tu servidor y no ha expirado
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Inyectar los datos descifrados del usuario (id y rol) en la request para que el controlador los pueda usar
        req.usuario = decoded;
        
        // 4. Autorizar el paso a la ruta protegida
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
    }
};

module.exports = { verificarToken };