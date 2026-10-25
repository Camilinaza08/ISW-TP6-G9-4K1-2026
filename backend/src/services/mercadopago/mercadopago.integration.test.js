
const {
    iniciarCheckoutMercadoPago
} = require("./mercadopago.integration");

const { crearClientesMercadoPago } =
  require("./mercadopago.client");

  const { buscarPagosPorReferencia } =
  require("./mercadopago.service");
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
describe("Consulta de pagos mediante Mercado Pago", () => {
  test("Test 198 - Consulta real de pagos mediante el SDK", async () => {
    // Arrange
    const referenciaExterna = "23";

    const { pagos } = crearClientesMercadoPago(
      process.env.MP_ACCESS_TOKEN
    );

    // Act
    const resultado = await buscarPagosPorReferencia(
      referenciaExterna,
      pagos
    );

    // Assert
    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado.length).toBeGreaterThan(0);

    const pago = resultado.find(
      (pago) =>
        String(pago.external_reference) === referenciaExterna
    );

    expect(pago).toBeDefined();
    expect(pago).toHaveProperty(
      "external_reference",
      referenciaExterna
    );
    expect(pago).toHaveProperty("status");
    expect(pago).toHaveProperty("transaction_amount");
    expect(pago).toHaveProperty("currency_id");
  });
});