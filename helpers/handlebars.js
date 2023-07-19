module.exports = {
    seleccionarSkills : (seleccionadas = [], opciones) => { // es necesario que venda un arreglo vacio minimo

        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 
            'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 
            'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 
            'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress', 'RxJs', 'Jest', 'Github', 'Java', 'C#',
            'Flutter', 'Bootstrap', 'Vuetify', 'Swift', 'Kotlin', 'SwiftUI', 'GO', 'PostgreSQL',
            'Selenium', 'Cypress', 'Postman', 'Docker', 'Jenkins', 'Jira', 'Kubernetes', 'DevOps',
            
        ];

        // Se va construyendo el templete
        let html = '';
        skills.forEach(skill => {
            // Seleccionamos para ver si existe en el arreglo de seleccionadas
            html += `
                <li ${seleccionadas.includes(skill) ? ' class="activo"' : ''}>${skill}</li> 
            `;
        });

        return opciones.fn().html = html; // fn es como se guarda en la BD, lo retornamos
    },

    // Helper para el Formulario de Editar
    tipoContrato: (seleccionado, opciones) => {  //Nos retorna cual esta seleccinado y que opcciones hay
        return opciones.fn(this).replace( //Hace un recorrido 
            new RegExp(` value="${seleccionado}"`), '$& selected="selected"' // Expresion regular tomamos los valores qu eya teniamos
        )
    },

    // Le mandamos los errores desde el Helper
    mostrarAlertas: (errores = {}, alertas ) => {
        const categoria = Object.keys(errores);

        let html = '';
        if(categoria.length) {
            errores[categoria].forEach(error => {
                html += `<div class="${categoria} alerta">
                    ${error}
                </div>`;
            })
        }
        return alertas.fn().html = html;
    }

}