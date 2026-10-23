const path = require("node:path");
const CompraRepository = require("../repository/compraRepository");

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
    return {
        items: [
            {
                title: "Entradas EcoHarmony Park",
                quantity: 1,
                unit_price: compra.montoTotal,
                currency_id: "ARS"
            }
        ],
        external_reference: String(compra.id)
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

}


module.exports = {
    procesarResultadoMP,
    prepararPreferenciaPago,
    crearPreferenciaPago,
    obtenerIdPreferencia,
    obtenerUrlCheckout,
    buscarPagosPorReferencia,
    iniciarPagoMercadoPago
};