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
            <p>Cantidad de entradas: {{cantidadEntradas}}</p>
            <p>Tipos de pase: {{tiposPaseFormateados}}</p>

            {{#if montoFormateado}}
            <p>Monto total: \${{montoFormateado}}</p>
            {{/if}}
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

function generarContenidoMail(compra) {

    let montoFormateado;

    if (compra.montoTotal !== undefined && compra.montoTotal !== null) {
        montoFormateado = new Intl.NumberFormat("es-AR").format(
            compra.montoTotal
        );
    }

    return plantillaCompilada({
        ...compra,
        fechaFormateada: formatearFecha(compra.fechaVisita),
        tiposPaseFormateados: formatearTiposPase(compra.tiposPase),
        montoFormateado
    });
}
module.exports = {
    generarContenidoMail
};