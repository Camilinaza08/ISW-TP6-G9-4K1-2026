const path = require("node:path");
const CompraRepository = require("../repository/compraRepository");
const {enviarMailConfirmacion} = require("../mail/mail.service");

const repository = new CompraRepository(
    path.join(__dirname, "../../data/compras.json")
);

async function procesarResultadoMP(idCompra, estadoPago) {

    const compra = await repository.obtenerCompraPorId(idCompra);

    if (!compra) {
        throw new Error("Compra no encontrada");
    }

    if (compra.formaPago !== "Mercado Pago") {
        throw new Error(
            "La compra no corresponde a Mercado Pago"
        );
    }

    return compra;
}






function prepararPreferenciaPago(compra) {

    // Validar que exista la configuración pública
    if (!process.env.PUBLIC_URL) {
        throw new Error("PUBLIC_URL no está configurada");
    }

    // Validar que sea una URL HTTPS válida
    let urlPublica;

    try {
        urlPublica = new URL(process.env.PUBLIC_URL);

        if (
            urlPublica.protocol !== "https:" ||
            !urlPublica.hostname
        ) {
            throw new Error("URL inválida");
        }

    } catch {
        throw new Error(
            "PUBLIC_URL debe ser una URL HTTPS válida"
        );
    }

    // Construir la URL de retorno
    const urlResultado = new URL(
        "resultado.html",
        urlPublica.href.endsWith("/")
            ? urlPublica.href
            : `${urlPublica.href}/`
    );

    urlResultado.searchParams.set("id", String(compra.id));

    return {
        items: [
            {
                title: "Entradas EcoHarmony Park",
                quantity: 1,
                unit_price: compra.montoTotal,
                currency_id: "ARS"
            }
        ],
        external_reference: String(compra.id),
        back_urls: {
            success: urlResultado.href,
            failure: urlResultado.href,
            pending: urlResultado.href
        }
    };
}




async function crearPreferenciaPago(preferencia, clienteMP) {
    return await clienteMP.create({
        body: preferencia
    });
}


function obtenerIdPreferencia(respuestaMP) {
    return respuestaMP.id;
}
   
function obtenerUrlCheckout(respuestaMP) {
    return respuestaMP.init_point;
}


async function buscarPagosPorReferencia(externalReference, clienteMP) {

    const respuesta = await clienteMP.search({
        options: {
            criteria: "desc",
            sort: "date_created",
            external_reference: externalReference
        }
    });

    return respuesta.results;
}


async function iniciarPagoMercadoPago(compra, clienteMP) {

    const preferencia = prepararPreferenciaPago(compra);

    const respuestaMP = await crearPreferenciaPago(
        preferencia,
        clienteMP
    );

    const idPreferencia = obtenerIdPreferencia(respuestaMP);

    const urlRedireccion = obtenerUrlCheckout(respuestaMP);

    return {
        idCompra: compra.id,
        idPreferencia,
        urlRedireccion
    };
}


function seleccionarPagoAprobado(pagos) {
    return pagos.find(pago => pago.status === "approved");
}


function validarReferenciaPago(pago, compra) {
    return pago.external_reference === String(compra.id);
}


function validarMontoPago(pago, compra) {
    return pago.transaction_amount === compra.montoTotal;
}


function validarMonedaPago(pago) {
    return pago.currency_id === "ARS";
}



async function confirmarPagoMercadoPago(compra, clienteMP, repository) {

    if (
        compra.estadoCompra === "confirmada" &&
        compra.estadoPago === "approved"
    ) {
        return compra;
    }

    const pagos = await buscarPagosPorReferencia(
        String(compra.id),
        clienteMP
    );

    const pagoAprobado = seleccionarPagoAprobado(pagos);

    if (!pagoAprobado) {
        return compra;
    }

    const referenciaValida = validarReferenciaPago(
        pagoAprobado,
        compra
    );

    const montoValido = validarMontoPago(
        pagoAprobado,
        compra
    );

    const monedaValida = validarMonedaPago(pagoAprobado);

    if (!referenciaValida || !montoValido || !monedaValida) {
        return compra;
    }

    const compraConfirmada = await repository.actualizarEstadosCompra(
        compra.id,
        "confirmada",
        "approved"
    );

    try {
        await enviarMailConfirmacion(compraConfirmada);
    } catch (error) {
        console.error("Error al enviar el correo:", error);
    }

    return compraConfirmada;
}





module.exports = {
    procesarResultadoMP,
    prepararPreferenciaPago,
    crearPreferenciaPago,
    obtenerIdPreferencia,
    obtenerUrlCheckout,
    buscarPagosPorReferencia,
    iniciarPagoMercadoPago,
    seleccionarPagoAprobado,
    validarReferenciaPago, 
    validarMontoPago, 
    validarMonedaPago,
    confirmarPagoMercadoPago
};