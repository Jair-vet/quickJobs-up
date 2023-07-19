const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcryptjs = require('bcryptjs');

const usuariosSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    codigo: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    celular: {
        type: String,
        trim: true,
    },
    descripcion: {
        type: String,
    },
    experiencia: {
        type: Number,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    rol: {
        type: String,
        required: true,
        default: 'ESTUDIANTE_ROLE',
        enum: ['ADMIN_ROLE', 'ESTUDIANTE_ROLE', 'EMPRESA_ROLE'],
    },
    skills: [String],
    token: String,
    expira: Date, 
    imagen: [{
        titulo: String,
        imageURL: String,
        public_id: String,
    }],
});

// Método para hashear los passwords
usuariosSchema.pre('save', async function(next) {
    // si el password ya esta hasheado
    if(!this.isModified('password')) {
        return next(); // deten la ejecución
    }
    // si no esta hasheado
    const hash = await bcryptjs.hash(this.password, 12);
    this.password = hash;
    next();
});

// Envia alerta cuando un usuario ya esta registrado con el mismo email
usuariosSchema.post('save', function(error, doc, next) {
    if(error.name === 'MongoServerError' && error.code === 11000 ){
        next('El correo ya esta registrado');
    } else {
        next(error);
    }
});


// Autenticar Usuarios
usuariosSchema.methods = {
    compararPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuarios', usuariosSchema);