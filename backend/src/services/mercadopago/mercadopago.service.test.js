const CompraRepository = require("../repository/compraRepository");

const {
    procesarResultadoMP
} = require("./mercadopago.service");

describe("procesarResultadoMP", () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Test 130 - Impedir que Mercado Pago modifique una compra realizada en efectivo", async () => {

        // ARRANGE
        const compra = {
            id: 1,
            cliente: {
                id: 1,
                nombre: "Usuario Test"
            },
            fechaVisita: "2026-10-20",
            cantidadEntradas: 2,
            edadesVisitantes: [25, 30],
            tipoPase: ["REGULAR", "VIP"],
            montoTotal: 30000,
            formaPago: "Efectivo",
            estadoCompra: "confirmada",
            estadoPago: "no_aplica"
        };

        const compraOriginal = structuredClone(compra);

        const obtenerCompraMock = jest.spyOn(
            CompraRepository.prototype,
            "obtenerCompraPorId"
        ).mockResolvedValue(compra);

        const actualizarEstadosMock = jest.spyOn(
            CompraRepository.prototype,
            "actualizarEstadosCompra"
        ).mockResolvedValue(null);

        // ACT Y ASSERT
        await expect(
            procesarResultadoMP(1, "approved")
        ).rejects.toThrow(
            "La compra no corresponde a Mercado Pago"
        );

        expect(obtenerCompraMock).toHaveBeenCalledWith(1);

        expect(actualizarEstadosMock).not.toHaveBeenCalled();

        expect(compra).toEqual(compraOriginal);

    });

    test("Test 131 - Evitar actualizaciones repetidas de una compra ya confirmada", async () => {

    // ARRANGE
    const compra = {
        id: 1,
        cliente: {
            id: 1,
            nombre: "Usuario Test"
        },
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        edadesVisitantes: [25, 30],
        tipoPase: ["REGULAR", "VIP"],
        montoTotal: 30000,
        formaPago: "Mercado Pago",
        estadoCompra: "confirmada",
        estadoPago: "approved"
    };

    const compraOriginal = structuredClone(compra);

    const obtenerCompraMock = jest.spyOn(
        CompraRepository.prototype,
        "obtenerCompraPorId"
    ).mockResolvedValue(compra);

    const actualizarEstadosMock = jest.spyOn(
        CompraRepository.prototype,
        "actualizarEstadosCompra"
    ).mockResolvedValue(null);

    // ACT
    const resultado = await procesarResultadoMP(1, "approved");

    // ASSERT
    expect(obtenerCompraMock).toHaveBeenCalledWith(1);

    expect(resultado).toEqual(compraOriginal);

    expect(actualizarEstadosMock).not.toHaveBeenCalled();

    expect(compra).toEqual(compraOriginal);

});

test.each([
    {
        caso: "A - Compra pendiente",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    },
    {
        caso: "B - Compra confirmada",
        estadoCompra: "confirmada",
        estadoPago: "approved"
    }
])(
    "Test 132 - Conservar los estados ante un resultado pending ($caso)",
    async ({ estadoCompra, estadoPago }) => {

        // ARRANGE
        const compra = {
            id: 1,
            cliente: {
                id: 1,
                nombre: "Usuario Test"
            },
            fechaVisita: "2026-10-20",
            cantidadEntradas: 2,
            edadesVisitantes: [25, 30],
            tipoPase: ["REGULAR", "VIP"],
            montoTotal: 30000,
            formaPago: "Mercado Pago",
            estadoCompra,
            estadoPago
        };

        const compraOriginal = structuredClone(compra);

        const obtenerCompraMock = jest.spyOn(
            CompraRepository.prototype,
            "obtenerCompraPorId"
        ).mockResolvedValue(compra);

        const actualizarEstadosMock = jest.spyOn(
            CompraRepository.prototype,
            "actualizarEstadosCompra"
        ).mockResolvedValue(null);

        // ACT
        const resultado = await procesarResultadoMP(1, "pending");

        // ASSERT
        expect(obtenerCompraMock).toHaveBeenCalledTimes(1);
        expect(obtenerCompraMock).toHaveBeenCalledWith(1);

        expect(resultado).toEqual(compraOriginal);

        expect(actualizarEstadosMock).not.toHaveBeenCalled();

        expect(compra).toEqual(compraOriginal);
    }
);

});