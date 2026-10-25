
const {
    MercadoPagoConfig,
    Preference,
    Payment
} = require("mercadopago");

function crearClientesMercadoPago(accessToken) {

    // Configurar el SDK oficial
    const configuracion = new MercadoPagoConfig({
        accessToken: accessToken
    });

    // Inicializar los clientes
    const preferencias = new Preference(configuracion);
    const pagos = new Payment(configuracion);

    return {
        preferencias,
        pagos
    };
}

module.exports = {
    crearClientesMercadoPago
};
