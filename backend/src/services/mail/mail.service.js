const Handlebars = require("handlebars");

const plantilla = `
    <!DOCTYPE html>
    <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>EcoHarmony Park</title>
        </head>
        <body>
            <h1>EcoHarmony Park</h1>
            <h2>Resumen de tu compra</h2>

            <p>Hola, {{cliente.nombre}}</p>

            <p>Compra N.º {{id}}</p>

            <p>Fecha de visita: {{fechaFormateada}}</p>
        </body>
    </html>
`;

const plantillaCompilada = Handlebars.compile(plantilla);

function generarContenidoMail(compra) {

    let fechaFormateada = "";

    if (compra.fechaVisita) {
        const [anio, mes, dia] = compra.fechaVisita.split("-");
        fechaFormateada = `${dia}/${mes}/${anio}`;
    }

    return plantillaCompilada({
        ...compra,
        fechaFormateada
    });
}

module.exports = {
    generarContenidoMail
};