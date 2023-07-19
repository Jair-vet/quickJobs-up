const passport = require('passport');
const bcryptjs = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const Usuarios = mongoose.model('Usuarios');
const Empresas = mongoose.model('Empresas');

// ! Ingreso Empresa y Estudiante
passport.use(new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password'
    }, async (email, password, done) => {
        const empresa = await Empresas.findOne({ email });
        const usuario = await Usuarios.findOne({ email });
        if(!empresa && !usuario) return done(null, false, {
            message: 'El Usuario No Existe'
        });

        // console.log(empresa);
        // Si el usuario existe, vamos a verificarlo
        if(empresa){
            const verificarEmpr = bcryptjs.compareSync(password, empresa.password);
            if( !verificarEmpr ) return done(null, false, {
                message: 'Password Incorrecto'
            });
        }
        if(usuario){
            const verificarUser = bcryptjs.compareSync(password, usuario.password);
            if( !verificarUser ) return done(null, false, {
                message: 'Password Incorrecto'
            });
        }
        // if( !verificarPass ) return done(null, false, {
        //     message: 'Password Incorrecto'
        // });

        // Usuario existe y el password es correcto
        return done(null, empresa || usuario);
}));

passport.serializeUser(function(empresa, usuario, done) {
    done(null, empresa._id || usuario._id)
});
// passport.serializeUser(function(usuario, done) { done(null, usuario) });
// passport.serializeUser(function(empresa, done) { done(null, empresa) });

passport.deserializeUser(async (id, done) => {
    const empresa = await Empresas.findById(id).exec();
    const usuario = await Usuarios.findById(id).exec();
    return done(null, empresa || usuario);
});

module.exports = passport;