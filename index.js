const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');  
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);  // le pasamos la session
const bodyParser = require('body-parser');
// const expressValidator = require('express-validator');  // Validar Campos
const createError = require('http-errors');
const passport = require('./config/passport');
const morgan = require('morgan');
const multer = require('multer');
const methodOverride = require('method-override');

require('dotenv').config({ path: 'variables.env' });

const app = express();

// habilitamos Body-Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// validación de campos
// app.use(expressValidator());


//Habilitar handlebars como view
app.engine('handlebars',
    exphbs.engine({
        handlebars: allowInsecurePrototypeAccess(handlebars),
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
    })
);
app.set('view engine', 'handlebars');

// milddlewares
app.use(morgan('dev'));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// const storage = multer.diskStorage({
//     destination: path.join(__dirname, 'pubico/uploads'),
//     filename: (req, file, cb) => {
//             cb(null, new Date().getTime() + path.extname(file.originalname));
//         }
//     })
//         
// app.use(multer({ storage }).single('image'));
// app.use(multer({ storage }).single('cv' || 'image'));
//         
 
// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

// Crear una nueva session
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: true,
    saveUninitialized: true,   // que no se guarde otra vez la session
    store: new MongoStore({ mongooseConnection : mongoose.connection })
}));


// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Alertas y Flash messages
app.use(flash());

app.use(methodOverride('_method'))

// Crear nuestro Middleware
// Para guardar los mensajes y almacenar que usuario esta autenticado
app.use((req, res, next) => {
    res.locals.mensajes = req.flash(); // llenar las variables automaticamente
    next();
});

app.use('/', router() );

// 404  pagina no Existente
app.use((req, res, next) => {
    next(createError(404, 'No Encontrado'));
})

// Administración de los errores
app.use((error, req, res, next) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});

// ? Hacer Cambios
app.listen(process.env.PUERTO);

// ? Dejar que Heroku asigne el puerto a la APP
// const host = '0.0.0.0';
// const port = process.env.PORT;
// 
// app.listen(port, host, () => {
//     console.log('El Servidor esta Funcionando');
// });