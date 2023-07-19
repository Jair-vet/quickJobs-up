const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { Schema, model } = require('mongoose');
const slug = require('slug');  // Para generar las URL
const shortid = require('shortid'); // Para generar un id unico


const photoSchema = new mongoose.Schema({
    titulo: String,
    imageURL: String,
    public_id: String,
    url : {
        type: String,
        lowercase:true
    },
});

// almacenar antes de guardar en la BD  -> Middleware
photoSchema.pre('save', function(next) {

    // crear la url
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;

    next();
})

module.exports = model('Image', photoSchema);