const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol, oficio } = req.body;

        const usuarioExiste = await User.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado.' });
        }

        const nuevoUsuario = new User({
            nombre,
            email,
            password,
            rol,
            oficio: rol === 'Prestador' ? oficio : ''
        });

        await nuevoUsuario.save();

        const token = jwt.sign(
            { id: nuevoUsuario._id, rol: nuevoUsuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado con éxito',
            token,
            nombre: nuevoUsuario.nombre
        });

    } catch (error) {
        console.log("💥 ERROR EN REGISTRO:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
    }
};

const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ success: false, message: 'Credenciales inválidas.' });
        }

        const isMatch = await usuario.compararPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            nombre: usuario.nombre,
            rol: usuario.rol
        });

    } catch (error) {
        console.log("💥 ERROR EN LOGIN:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
    }
};

const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find().select('-password');
        res.status(200).json({ success: true, usuarios });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener los usuarios', error: error.message });
    }
};

const obtenerPerfilActual = async (req, res) => {
    try {
        const usuario = await User.findById(req.usuario.id).select('-password');
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
        res.status(200).json({ success: true, usuario });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el perfil', error: error.message });
    }
};

const uploadDocumentos = async (req, res) => {
    try {
        if (!req.files || (!req.files.cedula && !req.files.antecedentes)) {
            return res.status(400).json({ success: false, message: 'Faltan documentos requeridos.' });
        }

        const usuario = await User.findById(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        const rutasDocumentos = [];
        if (req.files.cedula && req.files.cedula[0]) {
            rutasDocumentos.push(req.files.cedula[0].path.replace(/\\/g, '/'));
        }
        if (req.files.antecedentes && req.files.antecedentes[0]) {
            rutasDocumentos.push(req.files.antecedentes[0].path.replace(/\\/g, '/'));
        }

        usuario.documentosIdentidad = rutasDocumentos;
        await usuario.save();

        res.status(200).json({ 
            success: true, 
            message: 'Documentos recibidos con éxito. Tu perfil está en revisión.' 
        });

    } catch (error) {
        console.log("💥 ERROR EN UPLOAD:", error);
        res.status(500).json({ success: false, message: 'Error procesando documentos', error: error.message });
    }
};

const verificarPrestadorAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await User.findById(id);

        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Prestador no encontrado.' });
        }

        usuario.isVerified = true;
        await usuario.save();

        res.status(200).json({ 
            success: true, 
            message: 'Prestador verificado exitosamente con el Sello de Confianza.' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar el estado', error: error.message });
    }
};

const eliminarUsuarioAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioEliminado = await User.findByIdAndDelete(id);

        if (!usuarioEliminado) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ success: true, message: 'Cuenta eliminada exitosamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar el usuario', error: error.message });
    }
};

const actualizarPerfilPrestador = async (req, res) => {
    try {
        const { tituloTienda, biografia, tarifaReferencia, zonaCobertura } = req.body;
        const usuario = await User.findById(req.usuario.id);

        if (!usuario || usuario.rol !== 'Prestador') {
            return res.status(403).json({ success: false, message: 'No autorizado.' });
        }

        if (tituloTienda !== undefined) usuario.tituloTienda = tituloTienda;
        if (biografia !== undefined) usuario.biografia = biografia;
        if (tarifaReferencia !== undefined) usuario.tarifaReferencia = tarifaReferencia;
        if (zonaCobertura !== undefined) usuario.zonaCobertura = zonaCobertura;

        if (req.file) {
            usuario.fotoPerfil = req.file.path.replace(/\\/g, '/');
        }

        await usuario.save();

        res.status(200).json({ success: true, message: 'Perfil actualizado correctamente', usuario });
    } catch (error) {
        console.log("💥 ERROR EN ACTUALIZAR PERFIL:", error);
        res.status(500).json({ success: false, message: 'Error al actualizar perfil', error: error.message });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario,
    obtenerUsuarios,
    obtenerPerfilActual,
    uploadDocumentos,
    verificarPrestadorAdmin,
    eliminarUsuarioAdmin,
    actualizarPerfilPrestador
};