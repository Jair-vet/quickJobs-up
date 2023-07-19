const path = require('path');
const fs = require('fs-extra');
const {v4: uuidv4} = require('uuid');
const multer = require('multer');
const shortid = require('shortid');

const Image = require('../models/Image');
const Empresas = require('../models/Empresas');
const Usuarios = require('../models/Usuarios');

const cloudinary = require('cloudinary');
cloudinary.config = ( process.env.CLOUDINARY_URL );
// cloudinary.config = ({
//     cloud_name : 'dcylh3bib',
//     api_key: '963934348688219',
//     api_secrete: 'rnSEmqNUnKLMJ5oSTVaJhcNoWks'
// });

const { response } = require("express");

// const {Usuario, Producto} = require('../models');


// ! Crear Logo Empresa ->
exports.formCrearLogo = async(req, res) => {
    // Extraemos la imagen del Estudiante para mostrarla
    const { imagen } = await Empresas.findById(req.user._id);
    const [imagenObjeto] = imagen
    
    // Validamos cuando no exista la imagen
    if(imagen && imagenObjeto) {
        const imageURL = imagenObjeto.imageURL
        const imagenEmpresa = imageURL
        
        res.render('uploads', {
            nombrePagina: 'Sube tu Logo en QuickJobs',
            tagline: 'Es importante que subas un Logo para que los Candidatos puedan Reconocer tu Empresa',
            cerrarSesion: true,
            sesion: true,
            empresa : req.user.empresa,
            Silogo: true,
            logo : imagenEmpresa,
            imagenEmpresa
        })
    } else {
        res.render('uploads', {
            nombrePagina: 'Sube tu Logo en QuickJobs',
            tagline: 'Es importante que subas un Logo para que los Candidatos puedan Reconocer tu Empresa',
            cerrarSesion: true,
            sesion: true,
            empresa : req.user.empresa,
            Nologo : true,
        })
    } 
}
// ! Subir Imagen Empresa
exports.subirImagen  =  (req, res, next) => {
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
            cb(null, __dirname + '../../public/uploads/logos');
        },
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        
        } else {
            cb(new Error('Formato No es Válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('image');

// ! Subir el Logo Empresa ->
exports.uploadImagen = async (req, res, next) => {
    const empresa = await Empresas.findById(req.user._id);

    if(req.file) {
        const { titulo } = req.body
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        
        // empresa.titulo = req.body.titulo;
        const newImage = new Image({
            titulo,
            imageURL: result.url,
            public_id: result.public_id,
        });
        empresa.imagen = newImage
        await empresa.save();

        //  Eiminar imagen en nuestro servidor local
        await fs.unlink(req.file.path)
        req.flash('correcto', 'Imagen subida Correctamente');
        res.redirect('/administracion');
    }
}
  
// ! Crear Logo Estudiante ->
exports.formCrearLogoEstudiante = async(req, res) => {
     // Extraemos la imagen del Estudiante para mostrarla
     const { imagen } = await Usuarios.findById(req.user._id);
     const [imagenObjeto] = imagen
     
     // Validamos cuando no exista la imagen
     if(imagen && imagenObjeto) {
         const imageURL = imagenObjeto.imageURL
         const imagenEstudiante = imageURL
         
         res.render('uploads-estudiante', {
            nombrePagina: 'Imagen QuickJobs',
            tagline: 'Es importante que subas una Imagen para que las Empresas puedan identificarte de una mejor manera',
            cerrarSesion: true,
            sesion: true,
            empresa : req.user.nombre,
            Silogo: true,
            logo : imagenEstudiante,
            imagenEstudiante
        })
     } else {
        res.render('uploads-estudiante', {
            nombrePagina: 'Imagen QuickJobs',
            tagline: 'Es importante que subas una Imagen para que las Empresas puedan identificarte de una mejor manera',
            cerrarSesion: true,
            sesion: true,
            empresa : req.user.nombre,
            Nologo : true,
        })
     }
}

// ! Subir el Logo Estudiante ->
exports.uploadImagenEstudiante = async (req, res, next) => {
    const usuario = await Usuarios.findById(req.user._id);

    if(req.file) {
        const { titulo } = req.body
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        
        // empresa.titulo = req.body.titulo;
        const newImage = new Image({
            titulo,
            imageURL: result.url,
            public_id: result.public_id,
        });
        usuario.imagen = newImage
        await usuario.save();

        //  Eiminar imagen en nuestro servidor local
        await fs.unlink(req.file.path)
        req.flash('correcto', 'Imagen subida Correctamente');
        res.redirect('/administracion-estudiante');
    }
}


 