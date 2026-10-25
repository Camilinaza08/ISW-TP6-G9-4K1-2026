
const {
    iniciarCheckoutMercadoPago
} = require("./mercadopago.integration");

describe("iniciarCheckoutMercadoPago", () => {

    test("Test 193 - Iniciar Checkout Pro desde el backend", async () => {

        // ARRANGE
        process.env.PUBLIC_URL = "https://ecoharmony.example.com";

        const compra = {
            id: 123,
            montoTotal: 50000,
            formaPago: "Mercado Pago",
            estadoCompra: "pendiente",
            estadoPago: "pending"
        };

        const clienteMP = {
            create: jest.fn().mockResolvedValue({
                id: "PREF-123",
                init_point: "https://www.mercadopago.com/checkout/v1/redirect"
            })
        };

        // ACT
        const resultado = await iniciarCheckoutMercadoPago(
            compra,
            clienteMP
        );

        // ASSERT
        expect(clienteMP.create).toHaveBeenCalledWith({
            body: expect.objectContaining({
                external_reference: String(compra.id),
                items: expect.any(Array),
                back_urls: expect.any(Object)
            })
        });

        expect(resultado).toEqual({
            idCompra: 123,
            idPreferencia: "PREF-123",
            urlRedireccion: "https://www.mercadopago.com/checkout/v1/redirect"
        });

    });

});
