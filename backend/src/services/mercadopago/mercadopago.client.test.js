
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

    
test("Test 192 - Validar ausencia de Access Token de Mercado Pago", () => {

    // ARRANGE
    const accessToken = undefined;

    // ACT Y ASSERT
    expect(() => {
        crearClientesMercadoPago(accessToken);
    }).toThrow(
        "Access Token de Mercado Pago no configurado"
    );

});


});
