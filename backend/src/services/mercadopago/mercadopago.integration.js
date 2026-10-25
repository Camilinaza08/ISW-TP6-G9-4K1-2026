
const {
    iniciarPagoMercadoPago
} = require("./mercadopago.service");

async function iniciarCheckoutMercadoPago(compra, clienteMP) {

    return await iniciarPagoMercadoPago(compra, clienteMP);

}

module.exports = {
    iniciarCheckoutMercadoPago
};
