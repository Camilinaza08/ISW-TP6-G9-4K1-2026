
const {
    crearClientesMercadoPago
} = require("./src/services/mercadopago/mercadopago.client");

const {
    iniciarPagoMercadoPago
} = require("./src/services/mercadopago/mercadopago.service");

async function probarMercadoPago() {

    const compra = {
        id: `PRUEBA-${Date.now()}`,
        montoTotal: 10000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    try {

        const { preferencias } = crearClientesMercadoPago(
            process.env.MP_ACCESS_TOKEN
        );

        const resultado = await iniciarPagoMercadoPago(
            compra,
            preferencias
        );

        console.log("Preferencia creada correctamente");

        console.log("ID de compra:", resultado.idCompra);
        console.log("ID de preferencia:", resultado.idPreferencia);
        console.log("URL de Checkout:", resultado.urlRedireccion);

    } catch (error) {

        console.error(
            "Error al crear la preferencia:",
            error.message
        );

        if (error.cause) {
            console.error("Detalle:", error.cause);
        }

        process.exitCode = 1;
    }
}

probarMercadoPago();
