const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['Cliente', 'Prestador', 'Admin'], default: 'Cliente' },
    oficio: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    documentosIdentidad: [{ type: String }],
    tituloTienda: { type: String, default: '' },
    fotoPerfil: { type: String, default: '' },
    biografia: { type: String, default: '' },
    tarifaReferencia: { type: String, default: 'A convenir' },
    zonaCobertura: { type: String, default: 'Santiago y comunas colindantes' },
    calificacionPromedio: { type: Number, default: 0 },
    numeroResenas: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Encriptar la contraseña antes de guardar el documento (sin usar 'next')
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar la contraseña ingresada con la encriptada
userSchema.methods.compararPassword = async function(passwordCandidate) {
    return await bcrypt.compare(passwordCandidate, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;