const mongoose = require('mongoose');
const Vacantes = require('../models/Vacantes');
const Empresas = mongoose.model('Empresas');
const Vacante = require ('../models/Vacantes')

const getPagination = (page, size) => {
    const limit = size ? + size : 3;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
  };

exports.mostrarTrabajos = async (req, res, next) => {
    
    const empresas = await Empresas.find(req.params); //filtramos 

    const logo = empresas.map( e => { 
        const [imagenObjeto] = e.imagen

        if(imagenObjeto){
            return { 
                imagen: imagenObjeto.imageURL 
            }
        } 
    })
    logo.reverse(); // Acomodar los Logos

    const { page, size, title } = req.query;
    var condition = title
        ? { title: { $regex: new RegExp(title), $options: "i" } }
        : {};

        const { limit, offset } = getPagination(page, size);
    
    Vacantes.paginate(condition, { offset, limit })
    .then((data) => {

        const prevPage = data.prevPage - 1
        const nextPage = data.nextPage - 1

        const activarNext = data.hasNextPage
        const activarPrev = data.hasPrevPage

        const vacantes = data.docs
        vacantes.reverse()
        
        res.render('home',{
            nombrePagina : 'QuickJobs',
            tagline: 'Encuentra y Pública Trabajos para Desarrolladores',  
            barra: true,
            boton: true,
            pagina: true,
            paginacion: true,
            prevPage,
            nextPage,
            activarNext,
            activarPrev,
            vacantes,
            empresas,
            logo,
        });
       
        })
        .catch((error) => {
            req.flash('error', error);
    });
}