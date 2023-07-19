const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const empresasController = require('../controllers/empresasController');
const uploadsController = require('../controllers/uploadsController');
const { helpers } = require('handlebars');


// Midlewares
module.exports = () => {
    // ! Inicio App
    router.get('/', homeController.mostrarTrabajos);

    router.get('/estudiante-empresa', authController.formElegirTipoCuenta )

    // ! Crear Vacantes
    router.get('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante
    );
    router.post('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    );
    
    // Mostrar Vacante
    router.get('/vacantes/:url', 
        vacantesController.mostrarVacante,
    );
    
    // Editar Vacante 
    router.get('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.formEditarVacante
    );
    router.post('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.editarVacante
    );
    
    // Eliminar Vacante
    router.delete('/vacantes/eliminar/:id',vacantesController.eliminarVacante);
    

    // ! Empresa
    router.get('/registro-empresa', empresasController.formMostrarCuentaEmpresa);
    router.post('/registro-empresa',
        empresasController.validarRegistroEmpresa,  // Validamos el registro
        empresasController.crearEmpresa
    ); 
    
    //  Mostrar Empresas
    router.get('/perfil-empresa', empresasController.perfilEmpresa);

    // Revisar Perfiles Estudiantes
    router.get('/mostrar-estudiante', 
        authController.verificarUsuario,
        empresasController.mostrarEstudiante
    );
    
    // Revisar Perfil Estudiante
    router.get('/revisar-perfil-empresa/:id',
        authController.verificarEmpresa,
        empresasController.mostrarEstudianteEmpresa

    );

    //  Editar Perfil Empresa
    router.get('/editar-empresa', 
        authController.verificarUsuario,
        empresasController.formEditarPerfilEmpresa
    );
    // Hacer post en la DB
    router.post('/editar-empresa', 
        authController.verificarEmpresa,
        empresasController.editarPerfilEmpresa,
    );
 
    // ! Estudiante
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
        authController.validarRegistro,  // Validamos el registro
        usuariosController.crearUsuario 
    ); 
    
    // Editar Perfil
    router.get('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.formEditarPerfil,
    ); 
    // Hacer post en la DB
    router.post('/editar-perfil', 
        authController.verificarUsuario,
        usuariosController.editarPerfil,
        usuariosController.validarPerfilEstudiante,
    );

    // Revisar Perfil
    router.get('/revisar-perfil', 
        authController.verificarUsuario,
        usuariosController.formRevisarPerfil,
    ); 

    // ! Restablecer password (Emails)
    router.get('/reestablecer-password', authController.formReestablecerPassword);
    router.post('/reestablecer-password', authController.enviarToken);
    router.get('/reestablecer-password-empresa', authController.formReestablecerPasswordEmpresa);
    router.post('/reestablecer-password-empresa', authController.enviarTokenEmpresa);
    
    // Resetear Password (Almacenar en la BD)
    router.get('/reestablecer-password/:token', authController.reestablecerPassword);
    router.post('/reestablecer-password/:token', authController.guardarPassword);
    router.get('/reestablecer-password-empresa/:token', authController.reestablecerPasswordEmpresa);
    router.post('/reestablecer-password-empresa/:token', authController.guardarPasswordEmpresa);
    
    // Panel de Administracion
    router.get('/administracion',
        authController.verificarUsuario,    
        authController.mostrarPanel
    );

    // Panel de Administracion Estudiante
    router.get('/administracion-estudiante', 
        authController.verificarUsuario,    
        authController.mostrarPanel
    );
    
    // Autenticar Usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion',authController.autenticarUsuario);
    router.get('/iniciar-sesion-empresa', empresasController.formIniciarSesionEmpresa);
    router.post('/iniciar-sesion-empresa',authController.autenticarUsuarioEmpresa);


    // Cerrar Sesion
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.verificarEmpresa,
        authController.cerrarSesion
    );

    //!  Recibir Mensaje de Candidatos CV
    router.post('/vacantes/:url',
        // vacantesController.validarCamposCv,   // muestra error
        vacantesController.subirCV,
        vacantesController.contactar,
    );

    // Muestra los candidatos por vacante
    router.get('/candidatos/:id', 
        authController.verificarEmpresa,
        vacantesController.mostrarCandidatos
    );

    //  Eliminar Candidatos
    // router.delete('/candidatos/delete/:id', 
    //     vacantesController.eliminarCandidato
    // );

    // ! Muestra las Empresas 
    router.get('/empresas', 
        empresasController.mostrarEmpresas,
    );

     // Buscador de Vacantes
     router.post('/buscador', vacantesController.buscarVacantes);

    //  ! Tablas
    router.get('/datos/tablas',
        usuariosController.formMostrarCuadros,
    );

    //  ! Imagenes
    router.get('/uploads',
        authController.verificarEmpresa,
        uploadsController.formCrearLogo,
    );
    
    router.post('/uploads',
        authController.verificarEmpresa,
        uploadsController.subirImagen,
        uploadsController.uploadImagen,
    );
        
    router.get('/uploads-estudiante',
        authController.verificarUsuario,
        uploadsController.formCrearLogoEstudiante,
    );
        
    router.post('/uploads-estudiante',
        authController.verificarUsuario,
        uploadsController.subirImagen,
        uploadsController.uploadImagenEstudiante,
    );


    return router;
}