
const {
    MercadoPagoConfig,
    Preference,
    Payment
} = require("mercadopago");

function crearClientesMercadoPago(accessToken) {

    // Validar que exista el Access Token
    if (!accessToken) {
        throw new Error(
            "Access Token de Mercado Pago no configurado"
        );
    }

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
