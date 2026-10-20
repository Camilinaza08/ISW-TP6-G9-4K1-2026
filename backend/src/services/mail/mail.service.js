
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

// Leer la plantilla HTML desde un archivo externo
const rutaPlantilla = path.join(__dirname, "confirmacionCompra.hbs");

const plantilla = fs.readFileSync(rutaPlantilla, "utf8");

// Compilar la plantilla una sola vez
const plantillaCompilada = Handlebars.compile(plantilla);

function formatearFecha(fecha) {
    if (!fecha) return "";

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


function validarEmailDestinatario(email) {
    if (email === null || email === undefined) {
        throw new Error("No se ha indicado un correo electrónico");
    }

    if (!email.includes("@")) {
        throw new Error("Formato de correo electrónico inválido");
    }
}





module.exports = {
    generarContenidoMail,
    validarEmailDestinatario
};
