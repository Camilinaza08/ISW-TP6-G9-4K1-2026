
const request = require("supertest");

// Simular el servicio de confirmación de compras
jest.mock("../../src/services/ticket/ticket.service", () => {
    const servicioReal = jest.requireActual(
        "../../src/services/ticket/ticket.service"
    );

    return {
        ...servicioReal,
        confirmarCompra: jest.fn()
    };
});

// Simular la validación de sesión
jest.mock("../../src/services/sesion/sesion.service", () => {
    const servicioReal = jest.requireActual(
        "../../src/services/sesion/sesion.service"
    );

    return {
        ...servicioReal,
        validarSesion: jest.fn()
    };
});

// Simular el inicio del pago con Mercado Pago
jest.mock("../../src/services/mercadopago/mercadopago.service", () => {
    const servicioReal = jest.requireActual(
        "../../src/services/mercadopago/mercadopago.service"
    );

    return {
        ...servicioReal,
        iniciarPagoMercadoPago: jest.fn()
    };
});

const app = require("../../src/server");

const {
    confirmarCompra
} = require("../../src/services/ticket/ticket.service");

const {
    validarSesion
} = require("../../src/services/sesion/sesion.service");

const {
    iniciarPagoMercadoPago
} = require("../../src/services/mercadopago/mercadopago.service");


describe("Integración de Mercado Pago - Checkout Pro", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Test 194 - Iniciar Checkout Pro desde el endpoint de confirmación", async () => {

        // ARRANGE
        const sesion = {
            usuario: "usuario@test.com",
            fechaHoraInicio: new Date().toISOString()
        };

        const compra = {
            id: 123,
            montoTotal: 50000,
            formaPago: "Mercado Pago"
        };

        const compraRegistrada = {
            ...compra,
            estadoCompra: "pendiente",
            estadoPago: "pending"
        };

        const respuestaMercadoPago = {
            idCompra: 123,
            idPreferencia: "PREF-123",
            urlRedireccion:
                "https://www.mercadopago.com/checkout/v1/redirect"
        };

        validarSesion.mockReturnValue(undefined);

        confirmarCompra.mockResolvedValue(compraRegistrada);

        iniciarPagoMercadoPago.mockResolvedValue(
            respuestaMercadoPago
        );

        // ACT
        const respuesta = await request(app)
            .post("/api/confirmacion")
            .send({
                sesion,
                compra,
                formaPago: "Mercado Pago"
            });

        // ASSERT
        expect(respuesta.status).toBe(200);

        expect(validarSesion).toHaveBeenCalled();

        expect(confirmarCompra).toHaveBeenCalledWith(
            compra,
            "Mercado Pago"
        );

        expect(iniciarPagoMercadoPago).toHaveBeenCalledWith(
            compraRegistrada,
            expect.anything()
        );

        expect(respuesta.body).toEqual(
            expect.objectContaining({
                id: 123,
                estadoCompra: "pendiente",
                estadoPago: "pending",
                idPreferencia: "PREF-123",
                urlRedireccion:
                    "https://www.mercadopago.com/checkout/v1/redirect"
            })
        );

    });

});
