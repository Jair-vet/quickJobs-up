const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');

let transport = nodemailer.createTransport({  // Creamos el entorno configurado para Mailtrap
    host : emailConfig.host,
    port : emailConfig.port,
    auth: {
        user : emailConfig.user,
        pass: emailConfig.pass
    }
});

// Utilizar templates de Handlebars
transport.use(
    'compile',
    hbs({
      viewEngine: {
        extName: 'handlebars',
        partialsDir: __dirname + '/../views/emails',
        layoutsDir: __dirname + '/../views/emails',
        defaultLayout: 'reset.handlebars'
      },
      viewPath: __dirname + '/../views/emails',
      extName: '.handlebars'
    })
  );

exports.enviar = async (opciones) => {

    const opcionesEmail = {
        from:'QuickJobs <noreply@quickjobs.com',
        to: opciones.usuario.email,   // Error
        subject : opciones.subject, 
        template: opciones.archivo,
        context: {
            resetUrl : opciones.resetUrl
        },
    };

    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, opcionesEmail);
}