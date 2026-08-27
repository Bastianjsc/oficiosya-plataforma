const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <-- Esta línea es vital para evitar el error

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    rol: {
        type: String,
        enum: ['Cliente', 'Prestador', 'Admin'],
        default: 'Cliente'
    },
    oficio: {
        type: String,
        trim: true
    },
    tarifaReferencial: {
        type: Number
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    documentosIdentidad: {
        type: [String],
        default: []
    },
    calificacionPromedio: {
        type: Number,
        default: 0
    },
    numeroResenas: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true 
});

// Interceptor para encriptar la contraseña antes de guardar
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);