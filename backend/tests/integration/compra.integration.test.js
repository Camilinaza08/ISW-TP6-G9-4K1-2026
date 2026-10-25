
const request = require("supertest");

// ========================================
// MOCKS
// ========================================

// Servicio de compras
jest.mock("../../src/services/ticket/ticket.service", () => {
    const servicioReal = jest.requireActual(
        "../../src/services/ticket/ticket.service"
    );

    return {
        ...servicioReal,
        confirmarCompra: jest.fn()
    };
});

// Servicio de sesiones
jest.mock("../../src/services/sesion/sesion.service", () => {
    const servicioReal = jest.requireActual(
        "../../src/services/sesion/sesion.service"
    );

    return {
        ...servicioReal,
        validarSesion: jest.fn()
    };
});

// Servicio de Mercado Pago
jest.mock("../../src/services/mercadopago/mercadopago.service", () => {
    const servicioReal = jest.requireActual(
        "../../src/services/mercadopago/mercadopago.service"
    );

    return {
        ...servicioReal,
        iniciarPagoMercadoPago: jest.fn()
    };
});

// Clientes oficiales de Mercado Pago
jest.mock("../../src/services/mercadopago/mercadopago.client", () => ({
    crearClientesMercadoPago: jest.fn()
}));

// ========================================
// IMPORTACIONES
// ========================================

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

const {
    crearClientesMercadoPago
} = require("../../src/services/mercadopago/mercadopago.client");

// ========================================
// TESTS DE INTEGRACIÓN
// ========================================

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

        const clientePreferencias = {
            create: jest.fn()
        };

        validarSesion.mockReturnValue(undefined);

        confirmarCompra.mockResolvedValue(compraRegistrada);

        crearClientesMercadoPago.mockReturnValue({
            preferencias: clientePreferencias,
            pagos: {}
        });

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

        // Verificar respuesta HTTP
        expect(respuesta.status).toBe(200);

        // Verificar validación de sesión
        expect(validarSesion).toHaveBeenCalledWith(
            expect.objectContaining({
                usuario: sesion.usuario,
                fechaHoraInicio: expect.any(Date)
            })
        );

        // Verificar confirmación de compra
        expect(confirmarCompra).toHaveBeenCalledWith(
            compra,
            "Mercado Pago"
        );

        // Verificar inicialización del SDK
        expect(crearClientesMercadoPago).toHaveBeenCalledWith(
            process.env.MP_ACCESS_TOKEN
        );

        // Verificar inicio del pago
        expect(iniciarPagoMercadoPago).toHaveBeenCalledWith(
            compraRegistrada,
            clientePreferencias
        );

        // Verificar datos devueltos al frontend
        expect(respuesta.body).toEqual(
            expect.objectContaining({
                id: 123,
                montoTotal: 50000,
                formaPago: "Mercado Pago",
                estadoCompra: "pendiente",
                estadoPago: "pending",
                idPreferencia: "PREF-123",
                urlRedireccion:
                    "https://www.mercadopago.com/checkout/v1/redirect"
            })
        );

    });

});
