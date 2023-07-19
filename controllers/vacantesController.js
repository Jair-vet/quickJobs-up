const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Empresas = mongoose.model('Empresas');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs-extra');
const path = require('path');
const { body, validationResult } = require("express-validator"); 

const cloudinary = require('cloudinary');

cloudinary.config = ( process.env.CLOUDINARY_URL );
// cloudinary.config = ({
//     cloud_name : 'dcylh3bib',
//     api_key: '963934348688219',
//     api_secrete: 'rnSEmqNUnKLMJ5oSTVaJhcNoWks'
// });

exports.formularioNuevaVacante = async(req, res) => {
    // Extraemos la imagen del Estudiante para mostrarla
    const { imagen } = await Empresas.findById(req.user._id);
    const [imagenObjeto] = imagen

    // Validamos cuando no exista la imagen
    if(imagen && imagenObjeto) {
        const imageURL = imagenObjeto.imageURL
        const imagenEmpresa = imageURL
        // Aqui le pasamos los datos al controlador, para que estos puedan ser procesados
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            sesion: true,
            empresa : req.user.empresa,
            logo : imagenEmpresa,
        })
    } else {
       // Aqui le pasamos los datos al controlador, para que estos puedan ser procesados
       res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        sesion: true,
        empresa : req.user.empresa,
        Nologo : true,
    })
    }
}


// agrega las vacantes a la base de datos
exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);

    // usuario autor de la vacante
    vacante.autor = req.user._id;

    // crear arreglo de habilidades (skills)
    vacante.skills = req.body.skills.split(','); 

    // almacenarlo en la base de datos
    await vacante.save();

    // redireccionar
    res.redirect('/administracion');

}

// muestra una vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean().populate('autor'); //filtramos por url
    
    // si no hay resultados
    if(!vacante) return  next();

    const reclutador = vacante.autor  // Extraer el Autor 
    const imagenR = reclutador.imagen  // Extrael la Image del Autor
    
    // revisar el usuario este autenticado
    if( req.isAuthenticated() ){    // Cambiar el menu si esta autenticado

        // Validamos cuando no exista la imagen
        if( !imagenR ) {        
            return res.render('vacante', {
                vacante,
                nombrePagina : vacante.titulo,
                cerrarSesion: true,
                sesionCandidato: true,
                reclutador,
                Nologo: true,
            })
        } 
        else {
            const [imagenObjetoEm] = imagenR
            const imagenEmpresa = imagenObjetoEm.imageURL
            return res.render('vacante', {
                vacante,
                nombrePagina : vacante.titulo,
                cerrarSesion: true,
                sesionCandidato: true,
                reclutador,
                imagenEmpresa,
            })
        }  
      
        
    } else {
        // Validamos cuando no exista la imagen
        if( !imagenR ) {        
            return res.render('vacante', {
                vacante,
                nombrePagina : vacante.titulo,
                barra: true,
                reclutador,
                Nologo: true,
            })
        } 
        else {
            const [imagenObjeto] = imagenR
            const imagenEmpresa = imagenObjeto.imageURL
            return res.render('vacante', {
                vacante,
                nombrePagina : vacante.titulo,
                barra: true,
                reclutador,
                imagenEmpresa,
            })
        }  
        
    }
}

// Editar una Vacante
exports.formEditarVacante = async (req, res, next) => {
     // Extraemos la imagen del Estudiante para mostrarla
     const { imagen } = await Empresas.findById(req.user._id);
     const [imagenObjeto] = imagen

     const vacante = await Vacante.findOne({ url: req.params.url}); // Filtamos la vacante
     
     // Validamos cuando no exista la imagen
     if(imagen && imagenObjeto) {
         if(!vacante) return next();   // si no hay resultados
         const imageURL = imagenObjeto.imageURL
         const imagenEmpresa = imageURL
         
         res.render('editar-vacante', { //nombre de la vista
            vacante,
            nombrePagina : `Editar - ${vacante.titulo}`,
            cerrarSesion: true,
            sesion: true,
            empresa : req.user.empresa,
            Silogo: true,
            logo : imagenEmpresa,
        })
     } else {
        if(!vacante) return next();   // si no hay resultados
        res.render('editar-vacante', { //nombre de la vista
            vacante,
            nombrePagina : `Editar - ${vacante.titulo}`,
            cerrarSesion: true,
            sesion: true,
            empresa : req.user.empresa,
            Nologo : true,
        })
     } 
}

// Pasar los datos editados a la Vacante de la BD
exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body; // Actulizar los datos

    vacanteActualizada.skills = req.body.skills.split(',');  // guardmos los nuevos skills como Arreglo-> con una separacion de una coma

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, { // lo actualizamos
        new: true, // Nos retorna el nuevo Valor
        runValidators: true // Para que todo lo que esta en le modelo lo tome
    } );

    req.flash('correcto', 'Se Actualizo tu Vacante Correctamente');
    res.redirect('/administracion');  // nos redireccionamos a la Vacante actualizada
}

// Validar y Sanitizar los campos de las nuevas vacantes
exports.validarVacante = async (req, res, next) => {
    //sanitizar los campos
    const rules = [
        body('titulo').not().isEmpty().withMessage('El Titulo es obligatorio').escape(),
        // body('empresa').not().isEmpty().withMessage('La Empresa es obligatoria').escape(),
        body('ubicacion').not().isEmpty().withMessage('La Ubicación es obligatoria').escape(),
        body('ubicacion').not().isEmpty().withMessage('La Ubicación es obligatoria').escape(),
        // body('salario').not().isEmpty().withMessage('El Salario es obligatorio').escape(), En el Modelo esta el 0 por Default
        body('contrato').not().isEmpty().withMessage('El Contrato es obligatorio').escape(),
        body('skills').not().isEmpty().withMessage('Agrega al menos una Habilidad').escape()
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el Formulario y Publica tu Vacante',
            mensajes: req.flash(),
            usuario: req.user,
            cerrarSesion: true,
            sesion: true,
            nombre : req.user.nombre,
            imagen : req.user.imagen,
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
}

// Elimar la Vacante
exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;

    const vacante = await Vacante.findById(id);

    if(verificarAutor(vacante, req.user)){
        // Eliminar la vacante si es el usuario
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    } else {
        // no permitido
        res.status(403).send('Error');
    }
    
}

// Verificar si el autor es el mismo que esta logueado
const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)) {  // Comparamos el id del usuario
        return false
    } 
    return true;
}

// ! Validamos Campos del Estudiante
exports.validarCamposCv = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url : req.params.url});
    
    //sanitizar los campos
    const rules = [
        body('nombre').not().isEmpty().withMessage('El nombre es obligatorio').escape(),
        body('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
        body('cel').not().isEmpty().withMessage('El Telefono es obligatorio').escape(),
        body('cv').not().isEmpty().withMessage('El CV es obligatorio').escape(),
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));
    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.redirect(`/vacantes/${vacante.url}`);  // Mostrar por la url de la vacante
        return;
    }
    //si toda la validacion es correcta
    next();
}

// Subir archivos en PDF
exports.subirCV  =  (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back'); // hace la peticion y si detecta nada se regresa
            return;
        } else {
            return next();
        }
    });
}


// Opciones de Multer
const configuracionMulter = {
    limits : { fileSize : 1000000 }, // Tamaño de los Archivos
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'application/pdf' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('cv');

// almacenar los candidatos en la BD
exports.contactar = async (req, res, next) => {

    const vacante = await Vacante.findOne({ url : req.params.url});

    // sino existe la vacante
    if(!vacante) return next();

    if(req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path);

        // todo bien, construir el nuevo objeto
        const nuevoCandidato = {
            nombre:   req.body.nombre,
            email:    req.body.email,
            cel:      req.body.cel,
            cv :      result.url,
        }

        // almacenar la vacante
        vacante.candidatos.push(nuevoCandidato);
        await vacante.save();

        //  Eiminar imagen en nuestro servidor local
        await fs.unlink(req.file.path)
    
        // mensaje flash y redireccion
        req.flash('correcto', 'Se envió tu Curriculum Correctamente');
        res.redirect('/');
    }

}


exports.mostrarCandidatos = async (req, res, next) => {
    // Extraemos la imagen del Estudiante para mostrarla
    const { imagen } = await Empresas.findById(req.user._id);
    const [imagenObjeto] = imagen

    const vacante = await Vacante.findById(req.params.id);
    exports.vacante = await Vacante.findById(req.params.id);

    if(vacante.autor != req.user._id.toString()){
        return next();
    }  
    if(!vacante) return next();
    
    // Validamos cuando no exista la imagen
    if(imagen && imagenObjeto) {
        if(!vacante) return next();   // si no hay resultados
        const imageURL = imagenObjeto.imageURL
        const imagenEmpresa = imageURL
        
        res.render('candidatos', {
            nombrePagina : `Candidatos Vacante - ${vacante.titulo}`,
            cerrarSesion : true,
            sesion: true,
            empresa : req.user.empresa,
            logo : imagenEmpresa,
            candidatos : vacante.candidatos 
        })
    } else {
       if(!vacante) return next();   // si no hay resultados
       res.render('candidatos', {
        nombrePagina : `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion : true,
        sesion: true,
        empresa : req.user.empresa,
        Nologo : true,
        candidatos : vacante.candidatos 
    })
    } 
}

// ! Eliminar Candidato
// exports.eliminarCandidato = async (req, res, remove) => {
//     const idVacante = this.vacante  // Extraemos los Datos de la Vacante para poder eliminar
// 
//     if(idVacante === 'null' || !idVacante) return next()  // Si esta vacio no se hace nada
// 
//     const {_id} = idVacante   // Extraemos el id de la Vacante 
//     const urlID = _id.toString();  // Asignamos el valos a una variable para poder hacer el Redirect
// 
//     const {candidatos} = idVacante  // Extrae todos los Candidatos de esa Vacante
//     const {candidatoEliminar} = req.params.id   // Extrae el candidato por su id
// 
//     if( !candidatoEliminar ){   
//         // mensaje flash y redireccion
//         req.flash('correcto', 'No hay Candidatos');
//     }
//     
//     const borrarCandidato = async () => {
//         const resultado = await Vacante.candidatos.remove({
//             _id: candidatoEliminar
//         })
//         console.log(resultado);
//         // mensaje flash y redireccion
//         req.flash('correcto', 'Candidato Eliminado Correctamente');
//         res.redirect(`/candidatos/${ urlID }`);
//     }
//     borrarCandidato();
// 
// }


// Buscador de Vacantes
exports.buscarVacantes = async (req, res) => {
    const vacantes = await Vacante.find({  // Buscamos de la BD
        $text : {
            $search : req.body.q
        }
    });

    // mostrar las vacantes
    res.render('home', {
        nombrePagina : `Resultados para la búsqueda : ${req.body.q}`, 
        barra: true,
        vacantes 
    })
}