const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcryptjs = require('bcryptjs');

// Deninir todos los campos de la Base de Datos
const empresaSchema = new mongoose.Schema({    
    empresa: {
        type: String, 
        required: true,
        trim : true  // cortar espacios
    },
    jefe: {
        type: String,
        trim: true,
    },
    celular: {
        type: Number,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    url : {
        type: String,
        lowercase:true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }, 
    rol: {
        type: String,
        default: 'EMPRESA_ROLE',
        enum: ['ADMIN_ROLE', 'ESTUDIANTE_ROLE', 'EMPRESA_ROLE'],
    },
    imagen: [{
        titulo: String,
        imageURL: String,
        public_id: String,
    }],
    token: String,
    expira: Date,

});
// Método para hashear los passwords
empresaSchema.pre('save', async function(next) {
    // si el password ya esta hasheado
    if(!this.isModified('password')) {
        return next(); // deten la ejecución
    }
    // si no esta hasheado
    const hash = await bcryptjs.hash(this.password, 12);
    this.password = hash;
    next();
});

// Envia alerta cuando una Empresa ya esta registrado con el mismo email
empresaSchema.post('save', function(error, doc, next) {
    if(error.name === 'MongoServerError' && error.code === 11000 ){
        next('El correo ya esta registrado');
    } else {
        next(error);
    }
});

// Autenticar Empresas
empresaSchema.methods = {
    compararPassword: function(password) {
        return bcryptjs.compareSync(password, this.password);
    }
}


// Crear un indice
empresaSchema.index({ empresa : 'text' });


module.exports = mongoose.model('Empresas', empresaSchema);