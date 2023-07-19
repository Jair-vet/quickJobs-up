const mongoose = require('mongoose');
const Empresas = mongoose.model('Empresas');
const Usuarios = mongoose.model('Usuarios');
const Image = mongoose.model('Image');
const { body, validationResult } = require('express-validator');
const Usuario = require("../models/Usuarios.js");

// ! Crear Empresa ->
exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en QuickJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
        regresar: true,
        empresa: true,
    })
}

 
// ! Crear Empresa ->
exports.crearEmpresa = async (req, res, next) => {
    // Crear Empresa
    const empresa = new Empresas(req.body);

    try {
        await empresa.save();
        res.redirect('/iniciar-sesion-empresa');
        req.flash('correcto', 'Cuenta Creada Exitosamente');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }

}

// ! Formulario para iniciar sesión ->
exports.formIniciarSesionEmpresa = (req, res ) => {
    res.render('iniciar-sesion-empresa', {
        nombrePagina : 'Iniciar Sesión QuickJobs',
        tagline: 'Crea Grandes Oportunidades y Verifica Día a Día los Candidatos Nuevos para tus Vacantes',
        regresar: true,
        empresa: true,
    })
}

// ! Formulario para editar el Perfil ->
exports.formEditarPerfilEmpresa = async(req, res) => {
     // Extraemos la imagen del Estudiante para mostrarla
     const { imagen } = await Empresas.findById(req.user._id);
     const [imagenObjeto] = imagen
     
     // Validamos cuando no exista la imagen
     if(imagen && imagenObjeto) {
         const imageURL = imagenObjeto.imageURL
         const imagenEmpresa = imageURL
         
         res.render('editar-empresa', {
            nombrePagina : 'Editar Perfil',
            usuario: req.user,
            cerrarSesion: true,
            sesion: true,
            empresa : req.user.empresa,
            logo : imagenEmpresa,
        })
     } else {
        res.render('editar-empresa', {
            nombrePagina : 'Editar Perfil',
            usuario: req.user,
            cerrarSesion: true,
            sesion: true,
            empresa : req.user.empresa,
            Nologo : true,
        })
     }
}

// ! Guardar cambios editar perfil ->
exports.editarPerfilEmpresa = async (req, res) => {
    const empresa = await Empresas.findById(req.user._id);
 
    empresa.empresa = req.body.empresa;
    empresa.jefe = req.body.jefe;
    empresa.celular = req.body.celular;
    empresa.email = req.body.email;
    
    if(req.body.password) {
        empresa.password = req.body.password
    }
 
    await empresa.save();
    // console.log(empresa);

    req.flash('correcto', 'Cambios Guardados Correctamente');
    // redirect
    res.redirect('/administracion');
    
   
}

// ! Mostrar Empresa
exports.mostrarEmpresas = async (req, res, next) => {
    const empresa = await Empresas.find();

    // Aqui le pasamos los datos al controlador, para que estos puedan ser procesados
    res.render('empresas', {
        nombrePagina : 'Empresas',
        tagline: 'Encuentra la Empresa de tus sueños y revisa las Empresas para Desarrolladores',
        regresar: true,
        botonEmpresa: true,
    })
}

// ! Mostrar Estudiantes
exports.mostrarEstudiante = async (req, res, next) => {
     // Extraemos la imagen del Estudiante para mostrarla
     const { imagen } = await Empresas.findById(req.user._id);
     const [imagenObjeto] = imagen

    //  Extraemos los Estudiantes para mostrarlos
     const usuario = await Usuarios.find();
     usuario.reverse() // Oredenar el Arreglo de al revez y mostrar los registros mas nuevos
 
     
     // Validamos cuando no exista la imagen
     if(imagen && imagenObjeto) {
         const imageURL = imagenObjeto.imageURL
         const imagenEmpresa = imageURL
         // Aqui le pasamos los datos al controlador, para que estos puedan ser procesados
         res.render('mostrar-estudiante', {
            nombrePagina : 'Empresas',
            tagline: 'Encuentra a los Desarrolladores que mejor se adaptan a tus necesidads y contactalos',
            usuario: req.user,
            cerrarSesion: true,
            sesion: true,
            empresa : req.user.empresa,
            Silogo: true,
            logo : imagenEmpresa,
            usuario,
        })
     } else {
        // Aqui le pasamos los datos al controlador, para que estos puedan ser procesados
        res.render('mostrar-estudiante', {
            nombrePagina : 'Empresas',
            tagline: 'Encuentra a los Desarrolladores que mejor se adaptan a tus necesidads y contactalos',
            usuario: req.user,
            cerrarSesion: true,
            sesion: true,
            empresa : req.user.empresa,
            Nologo : true,
            usuario,
        })
     }
}

// ! Mostrar Perfil de la Empresa
exports.perfilEmpresa = async (req, res, next) => {

    // Aqui le pasamos los datos al controlador, para que estos puedan ser procesados
    res.render('perfil-empresa', {
        nombrePagina : 'Mi Empresa',
        tagline: 'Encuentra Desarrolladores de acuerdo a las Habilidades que necesitas para tu Empresa Sube Vacantes Recuerda ser muy especifico con las Habilidades que buscas para tu negocio',
        regresar: true,
        empresa: true,
    })
}


// ! Mostrar Formulario de Registro
exports.formMostrarCuentaEmpresa = (req, res) => {
    res.render('registro-empresa', {
        nombrePagina: 'Crea tu cuenta para tu Empresa en QuickJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
        regresar: true,
        empresa: true,
    })
}

// ! Validamos el Fromulario 
exports.validarRegistroEmpresa = async (req, res, next) => {
    //sanitizar los campos
    const rules = [
        body('empresa').not().isEmpty().withMessage('El nombre del la Empresa es obligatorio').escape(),
        body('jefe').not().isEmpty().withMessage('El nombre del Encargado es obligatorio').escape(),
        body('celular').isNumeric().not().isEmpty().withMessage('El Celular es obligatorio').escape(),
        body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
        body('password').not().isEmpty().withMessage('El password es obligatorio').escape(),
        body('confirmar').not().isEmpty().withMessage('Confirmar password es obligatorio').escape(),
        body('confirmar').equals(req.body.password).withMessage('Los passwords no son iguales'),
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('registro-empresa', {
            nombrePagina: 'Crea tu cuenta para tu Empresa en QuickJobs',
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
            regresar: true,
            mensajes: req.flash(),
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
}

// ! Guardamos la Empresa
exports.crearEmpresa = async (req, res, next) => {
    // Crear Empresa
    const empresa = new Empresas(req.body)
    // empresa.rol = 'empresa';

    try {
        await empresa.save();
        res.redirect('administracion');
        req.flash('correcto', 'Empresa Creada Correctamente');
    } catch (error) {
        req.flash('error', error);
        // console.log(error);
        res.redirect('/registro-empresa');
    }

}

// ! Muestra cada Estudiante 
exports.mostrarEstudianteEmpresa = async (req, res, next) => {
    // Extraemos la imagen de la Empresa para mostrarla
    const {imagen} = await Empresas.findById(req.user._id);
    const [imagenObjeto] = imagen

    // Extraemos la imagen del Estudiante para mostrarla
    const usuario = await Usuario.findById(req.params.id); //filtramos por id
    const [imagenE] = usuario.imagen

    // si no hay resultados
    if(!usuario) return next()

    if(!imagenE && !imagen || !imagen) {
        res.render('revisar-perfil-empresa', {
            nombrePagina :  usuario.nombre,
            usuario: req.user,
            cerrarSesion: true,
            atras: true,
            sesionAtras: true,
            empresa : req.user.empresa,
            Nologo: true,
            usuario,
        })
    }
    if(imagenE){
        const imagenEstudiante = imagenE.imageURL

        const imageURL = imagenObjeto.imageURL
        const imagenEmpresa = imageURL

        res.render('revisar-perfil-empresa', {
            nombrePagina :  usuario.nombre,
            usuario: req.user,
            cerrarSesion: true,
            atras: true,
            sesionAtras: true,
            empresa : req.user.empresa,
            Silogo: true,
            logo : imagenEmpresa,
            imagenEstudiante,
            usuario,
        })
    } else {
        const imageURL = imagenObjeto.imageURL
        const imagenEmpresa = imageURL
        
        res.render('revisar-perfil-empresa', {
            nombrePagina :  usuario.nombre,
            usuario: req.user,
            cerrarSesion: true,
            atras: true,
            sesionAtras: true,
            empresa : req.user.empresa,
            logo : imagenEmpresa,
            sinFoto: true,
            usuario,
        })
    }
}
