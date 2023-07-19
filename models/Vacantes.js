const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');  // Para generar las URL
const shortid = require('shortid'); // Para generar un id unico
const mongoosePaginate = require('mongoose-paginate-v2');

// Deninir todos los campos de la Base de Datos
const vacantesSchema = new mongoose.Schema({    
    titulo: {
        type: String, 
        required: true,
        trim : true  // cortar espacios
    }, 
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicación es obligatoria'
    },
    salario: {
        type: String,
        default: 0,
        trim: true,
    },
    contrato: {
        type: String,
        trim: true,
    },
    descripcion: {
        type: String,
        trim: true,
    },
    url : {
        type: String,
        lowercase:true
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cel: Number,
        cv : String
    }], 
    autor : {
        type: mongoose.Schema.ObjectId, 
        ref: 'Empresas', 
        required: 'El autor es obligatorio'
    },
    empresa: {
        type: mongoose.Schema.ObjectId,
        ref: 'Empresas',
    },

});

vacantesSchema.plugin(mongoosePaginate); // Paginación

// almacenar antes de guardar en la BD  -> Middleware
vacantesSchema.pre('save', function(next) {

    // crear la url
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;

    next();
})

// Crear un indice
vacantesSchema.index({ titulo : 'text' });


module.exports = mongoose.model('Vacante', vacantesSchema);