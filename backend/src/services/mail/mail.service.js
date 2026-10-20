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

function formatearFecha(fecha) {

    if (!fecha) {
        return "";
    }

    const [anio, mes, dia] = fecha.split("-");

    return `${dia}/${mes}/${anio}`;
}

function generarContenidoMail(compra) {

    return plantillaCompilada({
        ...compra,
        fechaFormateada: formatearFecha(compra.fechaVisita)
    });
}

module.exports = {
    generarContenidoMail
};