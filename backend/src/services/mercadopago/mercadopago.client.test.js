
const { MercadoPagoConfig, Preference, Payment } =
    require("mercadopago");

const {
    crearClientesMercadoPago
} = require("./mercadopago.client");

describe("crearClientesMercadoPago", () => {

    test("Test 191 - Inicializar clientes oficiales de Mercado Pago", () => {

        // ARRANGE
        const accessToken = "TEST-TOKEN-FICTICIO";

        // ACT
        const clientes = crearClientesMercadoPago(accessToken);

        // ASSERT
        expect(clientes.preferencias).toBeInstanceOf(Preference);
        expect(clientes.pagos).toBeInstanceOf(Payment);

        expect(clientes.preferencias.create).toEqual(
            expect.any(Function)
        );

        expect(clientes.pagos.search).toEqual(
            expect.any(Function)
        );

    });

});
