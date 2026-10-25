
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

    
test("Test 195 - Mantener el comportamiento de Efectivo", async () => {

    // ARRANGE

    const sesion = {
        usuario: "usuario@test.com",
        fechaHoraInicio: new Date().toISOString()
    };

    const compra = {
        id: 124,
        montoTotal: 30000,
        formaPago: "Efectivo"
    };

    const compraRegistrada = {
        ...compra,
        estadoCompra: "pendiente",
        estadoPago: "pendiente"
    };

    validarSesion.mockReturnValue(undefined);

    confirmarCompra.mockResolvedValue(compraRegistrada);

    // ACT

    const respuesta = await request(app)
        .post("/api/confirmacion")
        .send({
            sesion,
            compra,
            formaPago: "Efectivo"
        });

    // ASSERT

    expect(respuesta.status).toBe(200);

    expect(confirmarCompra).toHaveBeenCalledWith(
        compra,
        "Efectivo"
    );

    expect(respuesta.body).toEqual({
        ...compraRegistrada,
        urlRedireccion: "resultado.html"
    });

    expect(crearClientesMercadoPago).not.toHaveBeenCalled();

    expect(iniciarPagoMercadoPago).not.toHaveBeenCalled();

});

test("Test 196 - Manejar error al iniciar Checkout Pro", async () => {

    // ARRANGE

    const sesion = {
        usuario: "usuario@test.com",
        fechaHoraInicio: new Date().toISOString()
    };

    const compra = {
        id: 125,
        montoTotal: 50000,
        formaPago: "Mercado Pago"
    };

    const compraRegistrada = {
        ...compra,
        estadoCompra: "pendiente",
        estadoPago: "pending"
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

    iniciarPagoMercadoPago.mockRejectedValue(
        new Error("Error al crear preferencia de Mercado Pago")
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

    expect(respuesta.status).toBe(400);

    expect(confirmarCompra).toHaveBeenCalledWith(
        compra,
        "Mercado Pago"
    );

    expect(iniciarPagoMercadoPago).toHaveBeenCalledWith(
        compraRegistrada,
        clientePreferencias
    );

    expect(respuesta.body).toEqual({
        error: "Error al crear preferencia de Mercado Pago"
    });

    expect(respuesta.body).not.toHaveProperty(
        "urlRedireccion"
    );

});

test("Test 197 - Manejar ausencia de Access Token desde Express", async () => {

    // ARRANGE

    const sesion = {
        usuario: "usuario@test.com",
        fechaHoraInicio: new Date().toISOString()
    };

    const compra = {
        id: 126,
        montoTotal: 50000,
        formaPago: "Mercado Pago"
    };

    const compraRegistrada = {
        ...compra,
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    validarSesion.mockReturnValue(undefined);

    confirmarCompra.mockResolvedValue(compraRegistrada);

    crearClientesMercadoPago.mockImplementation(() => {
        throw new Error(
            "Access Token de Mercado Pago no configurado"
        );
    });

    // ACT

    const respuesta = await request(app)
        .post("/api/confirmacion")
        .send({
            sesion,
            compra,
            formaPago: "Mercado Pago"
        });

    // ASSERT

    expect(respuesta.status).toBe(400);

    expect(confirmarCompra).toHaveBeenCalledWith(
        compra,
        "Mercado Pago"
    );

    expect(crearClientesMercadoPago).toHaveBeenCalledWith(
        process.env.MP_ACCESS_TOKEN
    );

    expect(iniciarPagoMercadoPago).not.toHaveBeenCalled();

    expect(respuesta.body).toEqual({
        error: "Access Token de Mercado Pago no configurado"
    });

});


});

