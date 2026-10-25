
const {
    iniciarCheckoutMercadoPago
} = require("./mercadopago.integration");

describe("iniciarCheckoutMercadoPago", () => {

    test("Test 193 - Iniciar Checkout Pro desde el backend", async () => {

        // ARRANGE
        const compra = {
            id: 123,
            montoTotal: 50000,
            formaPago: "Mercado Pago",
            estadoCompra: "pendiente",
            estadoPago: "pending"
        };

        // ACT
        const resultado = await iniciarCheckoutMercadoPago(compra);

        // ASSERT
        expect(resultado).toEqual(
            expect.objectContaining({
                idCompra: compra.id,
                idPreferencia: expect.any(String),
                urlRedireccion: expect.any(String)
            })
        );

    });

});
