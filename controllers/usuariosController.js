const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const { body, validationResult } = require('express-validator');

// ! Mostrar Formulario Crear Cuenta Estudiante
exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en QuickJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
        regresar: true
    })
}


// ! Crear Estudiante
exports.crearUsuario = async (req, res, next) => {
    // Crear Usuario
    const usuario = new Usuarios(req.body)

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
        req.flash('correcto', 'Cuenta Creada Exitosamente');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }

}

// ! formulario para iniciar sesión
exports.formIniciarSesion = (req, res ) => {
    res.render('iniciar-sesion', {
        nombrePagina : 'Iniciar Sesión QuickJobs',
        tagline: 'Revisa las Vacantes que tenemos Para los Estudiantes, solo debes Registrarte',
        regresar: true
    })
}


// ! Formulario para editar el Perfil del Estudiante
exports.formEditarPerfil = async (req, res) => {
    // Extraemos la imagen del Estudiante para mostrarla
    const { imagen } = await Usuarios.findById(req.user._id);
    const [imagenObjeto] = imagen
    
    // Validamos cuando no exista la imagen
    if(imagen && imagenObjeto) {
        const imageURL = imagenObjeto.imageURL
        const imagenEstudiante = imageURL
        
        res.render('editar-perfil', {
            nombrePagina : 'Edita Tu Perfil en QuickJobs',
            usuario: req.user,
            cerrarSesion: true,
            sesionEstudiante: true,
            nombre : req.user.nombre,
            logo : imagenEstudiante,
        })
    } else {
        res.render('editar-perfil', {
            nombrePagina : 'Edita Tu Perfil en QuickJobs',
            usuario: req.user,
            cerrarSesion: true,
            sesionEstudiante: true,
            nombre : req.user.nombre,
            Nologo : true,
        })
    }
}


// ! Guardar cambios editar perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);
    
    usuario.nombre = req.body.nombre;
    usuario.codigo = req.body.codigo;
    usuario.celular = req.body.celular;
    usuario.email = req.body.email;
    usuario.experiencia = req.body.experiencia;
    usuario.descripcion = req.body.descripcion;

    // Guardar los Skills de la persona
    usuario.skills = req.body.skills.split(','); 
    
    if(req.body.password) {
        usuario.password = req.body.password
    }
    
    if(req.file) {
        usuario.imagen = req.file.filename;
    }
    
    await usuario.save();
    
    req.flash('correcto', 'Cambios Guardados Correctamente');
    // redirect
    res.redirect('/administracion-estudiante');
    
    
}
// ! Formulario para editar el Perfil del Estudiante
exports.formRevisarPerfil = async(req, res) => {
     // Extraemos la imagen del Estudiante para mostrarla
     const { imagen } = await Usuarios.findById(req.user._id);
     const [imagenObjeto] = imagen
     
     // Validamos cuando no exista la imagen
     if(imagen && imagenObjeto) {
         const imageURL = imagenObjeto.imageURL
         const imagenEstudiante = imageURL
         
         res.render('revisar-perfil', {
            nombrePagina : 'Revisa Tu Perfil en QuickJobs',
            tagline: 'Aquí podras subir tus habilidades y conocimientos que tienes de las Técnologias',
            usuario: req.user,
            cerrarSesion: true,
            sesionEstudiante: true,
            nombre : req.user.nombre,
            Silogo: true,
            logo : imagenEstudiante,
            imagenEstudiante
        })
     } else {
        res.render('revisar-perfil', {
            nombrePagina : 'Revisa Tu Perfil en QuickJobs',
            tagline: 'Aquí podras subir tus habilidades y conocimientos que tienes de las Técnologias',
            usuario: req.user,
            cerrarSesion: true,
            sesionEstudiante: true,
            nombre : req.user.nombre,
            Nologo : true,
        })
     }
}

// ! Validamos Campos del Estudiante
exports.validarPerfilEstudiante = async (req, res, next) => {
    //sanitizar los campos
    const rules = [
        body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        body('codigo').not().isEmpty().isNumeric().withMessage('El Codigo es Numerico y Obligaorio').escape(),
        body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('editar-perfil', {
            nombrePagina: 'Editar tu Perfil en QuickJobs',
            usuario: req.user,
            cerrarSesion: true,
            sesionEstudiante: true,
            nombre : req.user.nombre,
            imagen : req.user.imagen,
            mensajes : req.flash()
        })
        return;
    }
    //si toda la validacion es correcta
    next();
}

// ! Mostrar Tablas estadisticas
exports.formMostrarCuadros = async (req, res ) => {
    // Extraemos la imagen del Estudiante para mostrarla
    const { imagen } = await Usuarios.findById(req.user._id);
    const [imagenObjeto] = imagen
    
    // Validamos cuando no exista la imagen
    if(imagen && imagenObjeto) {
        const imageURL = imagenObjeto.imageURL
        const imagenEstudiante = imageURL
        
        res.render('tablas', {
            nombrePagina : 'Revisa Datos sobre IT en QuickJobs',
            tagline: 'Estos Datos pueden ayudarte a reflexionar ¿Cúales son las mejores opciones para ti?',
            cerrarSesion: true,
            sesionEstudiante: true,
            nombre : req.user.nombre,
            logo : imagenEstudiante,
        })
    } else {
        res.render('tablas', {
            nombrePagina : 'Revisa Datos sobre IT en QuickJobs',
            tagline: 'Estos Datos pueden ayudarte a reflexionar ¿Cúales son las mejores opciones para ti?',
            cerrarSesion: true,
            sesionEstudiante: true,
            nombre : req.user.nombre,
            Nologo : true,
        })
    }
}
