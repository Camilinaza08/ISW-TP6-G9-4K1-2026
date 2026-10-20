const Handlebars = require("handlebars");

const plantilla = `
    <!DOCTYPE html>
    <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>EcoHarmony Park</title>
        </head>

        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">

            <header style="padding: 20px; background-color: #ffffff; text-align: center;">
                <h1>EcoHarmony Park</h1>
                <h2>Resumen de tu compra</h2>
            </header>

            <main style="padding: 20px; background-color: #ffffff;">

                <p>Hola, {{cliente.nombre}}</p>

                <p>Gracias por realizar tu compra en EcoHarmony Park.</p>

                <h3>Detalles de la compra</h3>

                <p>Compra N.º {{id}}</p>

                <p>Fecha de visita: {{fechaFormateada}}</p>

                <p>Cantidad de entradas: {{cantidadEntradas}}</p>

                <p>Tipos de pase: {{tiposPaseFormateados}}</p>

                {{#if montoFormateado}}
                    <p>Monto total: \${{montoFormateado}}</p>
                {{/if}}

                {{#if formaPago}}
                    <p>Forma de pago: {{formaPago}}</p>
                {{/if}}

            </main>

            <footer style="padding: 15px; background-color: #ffffff; text-align: center;">
                <p>EcoHarmony Park</p>
                <p>Gracias por elegirnos.</p>
            </footer>

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

function formatearTiposPase(tiposPase) {

    return (tiposPase ?? [])
        .map(tipo => tipo === "REGULAR" ? "Regular" : tipo)
        .join(", ");
}

function formatearMonto(monto) {

    if (monto === undefined || monto === null) {
        return undefined;
    }

    return new Intl.NumberFormat("es-AR").format(monto);
}

function generarContenidoMail(compra) {

    return plantillaCompilada({
        ...compra,
        fechaFormateada: formatearFecha(compra.fechaVisita),
        tiposPaseFormateados: formatearTiposPase(compra.tiposPase),
        montoFormateado: formatearMonto(compra.montoTotal)
    });
}
module.exports = {
    generarContenidoMail
};