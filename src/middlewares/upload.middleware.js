const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Asegurar que la carpeta 'uploads' exista en la raíz del proyecto
const dir = './uploads';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// Configurar el almacenamiento físico
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta destino
    },
    filename: (req, file, cb) => {
        // Renombrar archivo: fecha-actual + extensión original
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

// Filtro de seguridad: solo aceptar imágenes y PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no soportado. Solo JPG, PNG o PDF.'), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por archivo
});

module.exports = upload;