const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // Validar si el usuario ya existe
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
        }

        // Crear el nuevo usuario en la base de datos
        const nuevoUsuario = await User.create({
            nombre,
            email,
            password,
            rol
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: nuevoUsuario
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
    }
};

const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find();
        
        res.status(200).json({
            success: true,
            cantidad: usuarios.length,
            data: usuarios
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener datos', error: error.message });
    }
};

const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Verificar si el usuario existe
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // 2. Verificar si la contraseña es correcta comparando el hash
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // 3. Generar el JWT usando el secreto de tu .env
        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol }, 
            process.env.JWT_SECRET || 'secreto_temporal', 
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            data: {
                id: usuario._id,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.log("ERROR EN LOGIN:", error);
        res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
    }
};

const uploadDocumentos = async (req, res) => {
    try {
        // req.files contiene los archivos interceptados por multer
        if (!req.files || (!req.files.cedula && !req.files.antecedentes)) {
            return res.status(400).json({ success: false, message: 'Faltan documentos requeridos.' });
        }

        // req.usuario.id viene del token validado por tu middleware anterior
        const usuario = await User.findById(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        // Extraer las rutas donde se guardaron los archivos
        const rutasDocumentos = [];
        if (req.files.cedula) rutasDocumentos.push(req.files.cedula[0].path);
        if (req.files.antecedentes) rutasDocumentos.push(req.files.antecedentes[0].path);

        // Actualizar el perfil del técnico
        usuario.documentosIdentidad = rutasDocumentos;
        // Se mantiene isVerified en false porque el administrador debe validarlo manualmente
        await usuario.save();

        res.status(200).json({ 
            success: true, 
            message: 'Documentos recibidos con éxito. Tu perfil está en revisión.' 
        });

    } catch (error) {
        console.log("ERROR EN UPLOAD:", error);
        res.status(500).json({ success: false, message: 'Error procesando documentos', error: error.message });
    }
};

module.exports = {
    registrarUsuario,
    obtenerUsuarios,
    loginUsuario,
    uploadDocumentos
};