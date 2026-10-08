const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// --- Diccionario interno para el backend (Geolocalización Fallback) ---
const COORDS_BACKEND = {
    "Cerrillos": { lat: -33.4833, lng: -70.7167 }, "Cerro Navia": { lat: -33.4258, lng: -70.7356 },
    "Conchalí": { lat: -33.3833, lng: -70.6833 }, "El Bosque": { lat: -33.5667, lng: -70.6667 },
    "Estación Central": { lat: -33.4667, lng: -70.7 }, "Huechuraba": { lat: -33.3667, lng: -70.6333 },
    "Independencia": { lat: -33.4167, lng: -70.6667 }, "La Cisterna": { lat: -33.5333, lng: -70.6667 },
    "La Florida": { lat: -33.5167, lng: -70.5167 }, "La Granja": { lat: -33.5333, lng: -70.6167 },
    "La Pintana": { lat: -33.5833, lng: -70.6333 }, "La Reina": { lat: -33.45, lng: -70.5333 },
    "Las Condes": { lat: -33.4167, lng: -70.5833 }, "Lo Barnechea": { lat: -33.35, lng: -70.5167 },
    "Lo Espejo": { lat: -33.5167, lng: -70.6833 }, "Lo Prado": { lat: -33.4333, lng: -70.7167 },
    "Macul": { lat: -33.4833, lng: -70.6 }, "Maipú": { lat: -33.5167, lng: -70.7667 },
    "Ñuñoa": { lat: -33.45, lng: -70.6 }, "Pedro Aguirre Cerda": { lat: -33.4833, lng: -70.6667 },
    "Peñalolén": { lat: -33.4833, lng: -70.5333 }, "Providencia": { lat: -33.4333, lng: -70.6167 },
    "Pudahuel": { lat: -33.4333, lng: -70.7667 }, "Quilicura": { lat: -33.3667, lng: -70.7333 },
    "Quinta Normal": { lat: -33.4333, lng: -70.6833 }, "Recoleta": { lat: -33.4, lng: -70.6333 },
    "Renca": { lat: -33.4, lng: -70.7333 }, "San Joaquín": { lat: -33.4833, lng: -70.6333 },
    "San Miguel": { lat: -33.5, lng: -70.65 }, "San Ramón": { lat: -33.5333, lng: -70.6333 },
    "Santiago": { lat: -33.4372, lng: -70.6506 }, "Vitacura": { lat: -33.4, lng: -70.6 },
    "Puente Alto": { lat: -33.6167, lng: -70.5833 }, "Pirque": { lat: -33.6333, lng: -70.5333 },
    "San José de Maipo": { lat: -33.65, lng: -70.35 }, "Colina": { lat: -33.2, lng: -70.6833 },
    "Lampa": { lat: -33.2833, lng: -70.8667 }, "Tiltil": { lat: -33.0833, lng: -70.9333 },
    "San Bernardo": { lat: -33.5833, lng: -70.7 }, "Buin": { lat: -33.7333, lng: -70.75 },
    "Calera de Tango": { lat: -33.6333, lng: -70.7833 }, "Paine": { lat: -33.8167, lng: -70.75 },
    "Melipilla": { lat: -33.6833, lng: -71.2167 }, "Alhué": { lat: -34.0333, lng: -71.1 },
    "Curacaví": { lat: -33.4, lng: -71.15 }, "María Pinto": { lat: -33.5167, lng: -71.1167 },
    "San Pedro": { lat: -33.9, lng: -71.4667 }, "Talagante": { lat: -33.6667, lng: -70.9333 },
    "El Monte": { lat: -33.6833, lng: -71.0167 }, "Isla de Maipo": { lat: -33.75, lng: -70.9 },
    "Padre Hurtado": { lat: -33.5667, lng: -70.8167 }, "Peñaflor": { lat: -33.6167, lng: -70.8833 }
};

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
        const { tituloTienda, biografia, tarifaReferencia, zonaCobertura, tipoAtencion, localesFisicos } = req.body;
        const usuario = await User.findById(req.usuario.id);

        if (!usuario || usuario.rol !== 'Prestador') {
            return res.status(403).json({ success: false, message: 'No autorizado.' });
        }

        if (tituloTienda !== undefined) usuario.tituloTienda = tituloTienda;
        if (biografia !== undefined) usuario.biografia = biografia;
        if (tarifaReferencia !== undefined) usuario.tarifaReferencia = tarifaReferencia;
        if (tipoAtencion !== undefined) usuario.tipoAtencion = tipoAtencion;
        
        if (zonaCobertura !== undefined) {
            usuario.zonaCobertura = JSON.parse(zonaCobertura);
        }

        if (localesFisicos !== undefined) {
            const arrLocales = JSON.parse(localesFisicos);
            usuario.localesFisicos = arrLocales.map(local => {
                let coords = [0, 0];
                
                if (local.lat && local.lng) {
                    coords = [parseFloat(local.lng), parseFloat(local.lat)];
                } else if (local.comuna && COORDS_BACKEND[local.comuna]) {
                    coords = [COORDS_BACKEND[local.comuna].lng, COORDS_BACKEND[local.comuna].lat];
                }
                
                return {
                    nombreLocal: local.nombreLocal || 'Sede Principal',
                    direccion: local.direccion,
                    numero: local.numero || '', // <-- NUEVO CAMPO AL GUARDAR
                    comuna: local.comuna,
                    ubicacion: { type: 'Point', coordinates: coords }
                };
            });
        }

        if (req.file) {
            usuario.fotoPerfil = req.file.path.replace(/\\/g, '/');
        }

        await usuario.save();

        res.status(200).json({ success: true, message: 'Perfil actualizado correctamente', usuario });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar perfil', error: error.message });
    }
};

const obtenerPrestadoresPublicos = async (req, res) => {
    try {
        const { servicio, comuna, modo, lat, lng, radio } = req.query;
        let query = { rol: 'Prestador', isVerified: true };
        
        if (servicio) query.oficio = servicio;

        // BÚSQUEDA VARIANTE 1: Locales físicos por proximidad en mapa (2dsphere)
        if (modo === 'local') {
            query.tipoAtencion = { $in: ['En local', 'Ambas'] };
            if (lat && lng && radio) {
                query['localesFisicos.ubicacion'] = {
                    $near: {
                        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                        $maxDistance: parseInt(radio) * 1000 // Convertir kilómetros a metros
                    }
                };
            }
        } 
        // BÚSQUEDA VARIANTE 2: Atención a domicilio tradicional
        else {
            query.tipoAtencion = { $in: ['A domicilio', 'Ambas'] };
            if (comuna) {
                query.zonaCobertura = comuna;
            }
        }

        const prestadores = await User.find(query).select('nombre oficio tituloTienda biografia tarifaReferencia zonaCobertura tipoAtencion localesFisicos fotoPerfil calificacionPromedio numeroResenas');
        res.status(200).json({ success: true, prestadores });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener prestadores públicos', error: error.message });
    }
};

const obtenerPrestadorPorIdPublico = async (req, res) => {
    try {
        const prestador = await User.findOne({ _id: req.params.id, rol: 'Prestador', isVerified: true })
            .select('nombre oficio tituloTienda biografia tarifaReferencia zonaCobertura tipoAtencion localesFisicos fotoPerfil calificacionPromedio numeroResenas');
        
        if (!prestador) {
            return res.status(404).json({ success: false, message: 'Prestador no encontrado.' });
        }
        
        res.status(200).json({ success: true, prestador });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener prestador', error: error.message });
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
    actualizarPerfilPrestador,
    obtenerPrestadoresPublicos,
    obtenerPrestadorPorIdPublico
};