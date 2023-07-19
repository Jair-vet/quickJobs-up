const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');
const { body, validationResult } = require('express-validator');

const Vacante = mongoose.model('Vacante');
const Usuarios = require("../models/Usuarios.js");
const Empresas = require("../models/Empresas.js");

require('dotenv').config({ path: 'variables.env' });

exports.autenticarUsuarioEmpresa = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect : '/iniciar-sesion-empresa', 
    failureFlash: true,
    badRequestMessage : 'Ambos campos son obligatorios'
});

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion-estudiante',
    failureRedirect : '/iniciar-sesion', 
    failureFlash: true,
    badRequestMessage : 'Ambos campos son obligatorios'
});

exports.formElegirTipoCuenta = async (req, res) => {
    res.render('estudiante-empresa', {
        nombrePagina : 'Elige el Tipo de Cuenta que Quieres Crear',
        tagline : 'Elige entre una Cuenta Estudiante y una Cuenta Empresa',
        regresar: true
    })
}

exports.validarRegistro = async (req, res, next) => {
    //sanitizar los campos
    const rules = [
        body('nombre').not().isEmpty().withMessage('El Nombre es obligatorio').escape(),
        body('codigo').not().isEmpty().isNumeric().withMessage('El Codigo es Numerico y Obligaorio').escape(),
        body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
        body('password').not().isEmpty().withMessage('El password es obligatorio').escape(),
        body('confirmar').not().isEmpty().withMessage('Confirmar password es obligatorio').escape(),
        body('confirmar').equals(req.body.password).withMessage('Los passwords no son iguales')
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('crear-cuenta', {
            nombrePagina: 'Crea una cuenta en QuickJobs',
            tagline: 'Comienza a ver vacantes gratis, solo debes crear una cuenta',
            mensajes: req.flash(),
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
}


// Revisar si el usuario esta autenticado o no
exports.verificarUsuario = async (req, res, next) => {
    
    // revisar el usuario
    if(req.isAuthenticated()){
        return next(); // estan autenticados
    }
    
    // redireccionar
    res.redirect('/iniciar-sesion');

}

// Revisar si la Empresa esta autenticado o no
exports.verificarEmpresa = (req, res, next) => {

    // revisar el usuario
    if(req.isAuthenticated()){
        return next(); // estan autenticados
    }

    // redireccionar
    res.redirect('/iniciar-sesion-empresa');

}

const getPagination = (page, size) => {
    const limit = size ? + size : 10;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
  };

exports.mostrarPanel = async (req, res) => {
    // Extraemos los Roles
    const empresa = await req.user.rol
    const estudiante = await req.user.rol

    // Validamos por medio del rol para mostrar el Panel
    if( empresa == 'EMPRESA_ROLE'){   // Si es Empresa
        // consultar el usuario autenticado
        const vacantes = await Vacante.find({ autor: req.user._id });
        vacantes.reverse() // Mostrar el Registro mas nuevo
        
        // Extraemos los Usuarios
        const usuarios = await Usuarios.find();

        // Extraemos la imagen de la Empresa para mostrarla
        const { imagen } = await Empresas.findById(req.user._id);
        const [imagenObjeto] = imagen
        
        // Validamos cuando no exista la imagen
        if(imagen && imagenObjeto) {
            const imageURL = imagenObjeto.imageURL
  
            res.render('administracion', {
                nombrePagina: 'Panel de Administración',
                tagline: 'Crea y Administra tus Vacantes Desde Aquí',
                cerrarSesion: true,
                sesion: true,
                empresa : req.user.empresa,
                logo : imageURL,
                usuarios,
                vacantes,
            });
        } else {
            res.render('administracion', {
                nombrePagina: 'Panel de Administración',
                tagline: 'Crea y Administra tus Vacantes Desde Aquí',
                cerrarSesion: true,
                sesion: true,
                empresa : req.user.empresa,
                Nologo : true,
                usuarios,
                vacantes,
            });
        }
    }
    if( estudiante == 'ESTUDIANTE_ROLE'){  // Si es Estudiante

        // Extraemos la imagen del Estudiante para mostrarla
        const { imagen } = await Usuarios.findById(req.user._id);
        const [imagenObjeto] = imagen
        
        // Validamos cuando no exista la imagen
        if(imagen && imagenObjeto) {
        const imageURL = imagenObjeto.imageURL
                
        const { page, size, title } = req.query;
        var condition = title
            ? { title: { $regex: new RegExp(title), $options: "i" } }
            : {};

        const { limit, offset } = getPagination(page, size);

        Vacante.paginate(condition, { offset, limit })
        .then((data) => {
            const prevPageEstu = data.prevPage - 1
            const nextPageEstu = data.nextPage - 1

            const activarNextEstu = data.hasNextPage
            const activarPrevEstu = data.hasPrevPage

            const vacantes = data.docs
            vacantes.reverse()
             
            res.render('administracion-estudiante', {
                nombrePagina: 'Panel de Estudiante',
                tagline: 'Revisa tu perfil desde aquí y algunas vacantes',
                cerrarSesion: true,
                sesionEstudiante: true,
                nombre : req.user.nombre,
                logo : imageURL,
                pagina: true,
                paginacionEstudiante: true,
                prevPageEstu,
                nextPageEstu,
                activarNextEstu,
                activarPrevEstu,
                vacantes,
            });
        })
        .catch((error) => {
            req.flash('error', error);
        });
        } else {
            const { page, size, title } = req.query;
            var condition = title
                ? { title: { $regex: new RegExp(title), $options: "i" } }
                : {};

            const { limit, offset } = getPagination(page, size);

            Vacante.paginate(condition, { offset, limit })
            .then((data) => {
                const prevPageEstu = data.prevPage - 1
                const nextPageEstu = data.nextPage - 1

                const activarNextEstu = data.hasNextPage
                const activarPrevEstu = data.hasPrevPage

                const vacantes = data.docs
                vacantes.reverse()

                res.render('administracion-estudiante', {
                    nombrePagina: 'Panel de Estudiante',
                    tagline: 'Revisa tu perfil desde aquí y algunas vacantes',
                    cerrarSesion: true,
                    sesionEstudiante: true,
                    nombre : req.user.nombre,
                    Nologo : true,
                    vacantes,
                    pagina: true,
                    paginacionEstudiante: true,
                    prevPageEstu,
                    nextPageEstu,
                    activarNextEstu,
                    activarPrevEstu,
                    vacantes,
                })
            })
            .catch((error) => {
                req.flash('error', error);
            });
            
        } 
    }
}
// Cerrar Sesion
exports.cerrarSesion = (req, res, next) => {
    req.logout(function(err){
        if(err) {
            return next(err);
        }
        req.flash('correcto', 'Se Cerró la Sessión Correctamente'); // Mensaje de confirmación
        return res.redirect('/');
    });
    
}

/** Formulario para Reiniciar el password */
exports.formReestablecerPassword = (req, res ) => {
    res.render('reestablecer-password', {
        nombrePagina : 'Reestablece tu Password',
        tagline : 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email',
        regresar: true
    })
}
/** Formulario para Reiniciar el password */
exports.formReestablecerPasswordEmpresa = (req, res ) => {
    res.render('reestablecer-password-empresa', {
        nombrePagina : 'Reestablece tu Password',
        tagline : 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email',
        regresar: true
    })
}

// Genera el Token en la tabla del usuario
exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });  // Para encontrar un resultado

    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');  // Mandamos msj si no la encuentra
        return res.redirect('/iniciar-sesion');
    }

    // el usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex'); // Nos genera un Token
    usuario.expira = Date.now() + 3600000;  // Dar Tiempo de expiracion

    // Guardar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;  // Generamos una url

    // console.log(resetUrl);

    // TODO: Enviar notificacion por email
    await enviarEmail.enviar({
        usuario,
        subject : 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    // correcto 
    req.flash('correcto', 'Revisa tu email para las indicaciones');
    res.redirect('/iniciar-sesion');
}

// Genera el Token en la tabla de Empresa
exports.enviarTokenEmpresa = async (req, res) => {
    const empresa = await Empresas.findOne({ email: req.body.email });  // Para encontrar un resultado

    if(!empresa) {
        req.flash('error', 'No existe esa cuenta');  // Mandamos msj si no la encuentra
        return res.redirect('/iniciar-sesion-empresa');
    }

    // el usuario existe, generar token
    empresa.token = crypto.randomBytes(20).toString('hex'); // Nos genera un Token
    empresa.expira = Date.now() + 3600000;  // Dar Tiempo de expiracion

    // Guardar el usuario
    await empresa.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${empresa.token}`;  // Generamos una url

    // console.log(resetUrl);

    // TODO: Enviar notificacion por email
    await enviarEmail.enviar({
        empresa,
        subject : 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    // correcto 
    req.flash('correcto', 'Revisa tu email para las indicaciones');
    res.redirect('/iniciar-sesion-empresa');
}


// Valida si el token es valido y el usuario existe, muestra la vista
exports.reestablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token : req.params.token
    });

    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    // Todo bien, mostrar el formulario
    res.render('nuevo-password', {
        nombrePagina : 'Nuevo Password'
    })
}

// Valida si el token es valido y el usuario existe, muestra la vista
exports.reestablecerPasswordEmpresa = async (req, res) => {
    const empresa = await Empresas.findOne({
        token : req.params.token
    });

    if(!empresa) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password-empresa');
    }

    // Todo bien, mostrar el formulario
    res.render('nuevo-password-empresa', {
        nombrePagina : 'Nuevo Password'
    })
}

// almacena el nuevo password en la BD
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token : req.params.token
    });

    // no existe el usuario o el token es invalido
    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    // Asignar nuevo password, limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    // agregar y eliminar valores del objeto
    await usuario.save();

    // redirigir
    req.flash('correcto', 'Password Modificado Correctamente');
    res.redirect('/iniciar-sesion');
}

// almacena el nuevo password en la BD
exports.guardarPasswordEmpresa = async (req, res) => {
    const empresa = await Empresas.findOne({
        token : req.params.token
    });

    // no existe el usuario o el token es invalido
    if(!empresa) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password-empresa');
    }

    // Asignar nuevo password, limpiar valores previos
    empresa.password = req.body.password;
    empresa.token = undefined;
    empresa.expira = undefined;

    // agregar y eliminar valores del objeto
    await empresa.save();

    // redirigir
    req.flash('correcto', 'Password Modificado Correctamente');
    res.redirect('/iniciar-sesion-empresa');
}