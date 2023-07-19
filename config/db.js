const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

// Conectando la base de datos usando el cluster de Mongoose
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE, {useNewUrlParser:true});

// En caso de que exista un error de conexión
mongoose.connection.on('error', (error) =>{
    console.log(error);
})

// Importamos los modelos
require('../models/Usuarios');
require('../models/Vacantes');
require('../models/Empresas');
require('../models/Role');
require('../models/Logo');
require('../models/Image');