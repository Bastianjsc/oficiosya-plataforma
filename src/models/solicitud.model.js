const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
    cliente: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    prestador: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    descripcionCliente: { 
        type: String, 
        required: true 
    },
    estado: { 
        type: String, 
        enum: ['Pendiente', 'Cotizado', 'Aceptado', 'Rechazado', 'Finalizado'], 
        default: 'Pendiente' 
    },
    presupuesto: {
        manoDeObra: { type: Number, default: 0 },
        materiales: { type: Number, default: 0 },
        mensajePrestador: { type: String, default: '' }
    },
    calificacion: {
        estrellas: { type: Number, min: 1, max: 5 },
        comentario: { type: String },
        fecha: { type: Date }
    }
}, {
    timestamps: true 
});

const Solicitud = mongoose.model('Solicitud', solicitudSchema);
module.exports = Solicitud;