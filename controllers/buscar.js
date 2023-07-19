const { response } = require("express");
const {ObjectId} = require('mongoose').Types;

const { Usuario, Categoria, Producto } = require('../models');

const coleccionesPermitidas = [
    'usuarios',
    'categorias',
    'productos',
    'roles'
];

const buscarUsuarios = async ( termino = '', res= response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE

    if(esMongoID){
        const usuario = await Usuario.findById(termino);
        res.json({
            results: ( usuario ) ? [ usuario ] : []
        })
    }
    // Expresion regular para buscar entre todos
    const regex = new RegExp(termino, 'i');

    const usuarios = await Usuario.find({   // misma lineamiento pero para el total de resultados const usuarios = await Usuario.count()
        $or: [    // los parametros que entran en la busqueda
            {nombre : regex},
            {correo : regex} 
        ],
        $and: [{estado: true}]
    }); // ¿Que va a buscar?


    res.json({
        results: usuarios
    })

}
const buscarCategorias = async ( termino = '', res= response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE

    if(esMongoID){
        const categoria = await Categoria.findById(termino);
          return  res.json({
            results: ( categoria ) ? [ categoria ] : []
        });
    }


    const regex = new RegExp(termino, 'i');
    const categorias = await Categoria.find({nombre: regex, estado: true});

    res.json({
        results: categorias
    })

}
const buscarProductos = async ( termino = '', res= response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE

    if(esMongoID){
        const producto = await Producto.findById(termino)
                                            .populate('categoria', 'nombre');
        res.json({
            results: ( producto ) ? [ producto ] : []
        })
    }
    // Expresion regular para buscar entre todos
    const regex = new RegExp(termino, 'i');
    const productos = await Producto.find({nombre: regex, estado: true}).populate('categoria', 'nombre');
    // ({   
    //     $or: [  
    //         {nombre: regex, estado: true}.populate('categoria', 'nombre'), 
    //         {categoria : ObjectId('_id')},
    //         {correo : regex} 
    //     ],
    //     $and: [{estado: true}]
    // });
    

    res.json({
        results: productos
    })

}




const buscar = (req, res = response) =>{

    const {coleccion, termino} = req.params;

    if(!coleccionesPermitidas.includes(coleccion)){
        return res.status(404).json({
            msg: `Las conexiones permitidas son: ${coleccionesPermitidas}`
        });
    }

    switch ( coleccion ){
        case 'usuarios':
            buscarUsuarios(termino, res);

        break;
        case 'categorias':
            buscarCategorias( termino, res);

        break;
        case 'productos':
            buscarProductos( termino, res);

        break;

        default:
            res.status(500).json({
            msg: 'Se le olvido hacer esta búsqueda'
        });
    }

}




module.exports = {
    buscar
}
