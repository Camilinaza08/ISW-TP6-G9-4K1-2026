const Handlebars = require("handlebars");

function generarContenidoMail(compra) {

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
            </body>
        </html>
    `;

    const compilarPlantilla = Handlebars.compile(plantilla);

    return compilarPlantilla(compra);
}

module.exports = {
    generarContenidoMail
};