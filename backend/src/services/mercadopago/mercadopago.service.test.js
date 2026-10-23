const CompraRepository = require("../repository/compraRepository");
const { prepararPreferenciaPago, crearPreferenciaPago, obtenerIdPreferencia, obtenerUrlCheckout, 
    buscarPagosPorReferencia } = require('./mercadopago.service');

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


test("Test 135 - Manejar una compra inexistente en Mercado Pago", async () => {

    // ARRANGE
    const idCompra = 999;
    const estadoPago = "approved";

    const obtenerCompraMock = jest.spyOn(
        CompraRepository.prototype,
        "obtenerCompraPorId"
    ).mockResolvedValue(null);

    const actualizarEstadosMock = jest.spyOn(
        CompraRepository.prototype,
        "actualizarEstadosCompra"
    ).mockResolvedValue(null);

    // ACT Y ASSERT
    await expect(
        procesarResultadoMP(idCompra, estadoPago)
    ).rejects.toThrow(
        "Compra no encontrada"
    );

    expect(obtenerCompraMock).toHaveBeenCalledTimes(1);
    expect(obtenerCompraMock).toHaveBeenCalledWith(idCompra);

    expect(actualizarEstadosMock).not.toHaveBeenCalled();

});

});

describe('prepararPreferenciaPago', () => {
  test('Test 157 - Generar los datos básicos de una preferencia', () => {
    const compra = {
      id: 'COMPRA-001',
      cantidadEntradas: 3,
      montoTotal: 50000
    };

    const preferencia = prepararPreferenciaPago(compra);

    expect(preferencia.items).toEqual([
      {
        title: 'Entradas EcoHarmony Park',
        quantity: 1,
        unit_price: 50000,
        currency_id: 'ARS'
      }
    ]);
  });

  
    test("Test 158 - Asociar la preferencia con la compra", () => {

    // ARRANGE
    const compra = {
        id: 1,
        cantidadEntradas: 3,
        montoTotal: 50000
    };

    // ACT
    const preferencia = prepararPreferenciaPago(compra);

    // ASSERT
    expect(preferencia.external_reference).toBe("1");

});
});

describe("crearPreferenciaPago", () => {
test("Test 159 - Crear una preferencia mediante un cliente simulado", async () => {

    // ARRANGE
    const preferencia = {
        items: [
            {
                title: "Entradas EcoHarmony Park",
                quantity: 1,
                unit_price: 50000,
                currency_id: "ARS"
            }
        ],
        external_reference: "1"
    };

    const respuestaMP = {
        id: "PREF-001",
        init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=PREF-001"
    };

    const clienteMP = {
        create: jest.fn().mockResolvedValue(respuestaMP)
    };

    // ACT
    const resultado = await crearPreferenciaPago(
        preferencia,
        clienteMP
    );

    // ASSERT
    expect(clienteMP.create).toHaveBeenCalledTimes(1);

    expect(clienteMP.create).toHaveBeenCalledWith({
        body: preferencia
    });

    expect(resultado).toEqual(respuestaMP);

});


test("Test 162 - Manejar errores durante la creación de preferencias", async () => {

    // ARRANGE
    const preferencia = {
        items: [
            {
                title: "Entradas EcoHarmony Park",
                quantity: 1,
                unit_price: 50000,
                currency_id: "ARS"
            }
        ],
        external_reference: "1"
    };

    const errorMP = new Error(
        "Error al crear la preferencia"
    );

    const clienteMP = {
        create: jest.fn().mockRejectedValue(errorMP)
    };

    // ACT Y ASSERT
    await expect(
        crearPreferenciaPago(preferencia, clienteMP)
    ).rejects.toThrow("Error al crear la preferencia");

    expect(clienteMP.create).toHaveBeenCalledTimes(1);

    expect(clienteMP.create).toHaveBeenCalledWith({
        body: preferencia
    });

});


});

describe("obtenerIdPreferencia", () => {

    test("Test 160 - Recuperar el identificador de preferencia", () => {

        // ARRANGE
        const respuestaMP = {
            id: "PREF-001",
            init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=PREF-001"
        };

        // ACT
        const idPreferencia = obtenerIdPreferencia(respuestaMP);

        // ASSERT
        expect(idPreferencia).toBe("PREF-001");

    });

});


describe("obtenerUrlCheckout", () => {

    test("Test 161 - Recuperar la URL de Checkout Pro", () => {

        // ARRANGE
        const respuestaMP = {
            id: "PREF-001",
            init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=PREF-001"
        };

        // ACT
        const urlCheckout = obtenerUrlCheckout(respuestaMP);

        // ASSERT
        expect(urlCheckout).toBe(
            "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=PREF-001"
        );

    });

});


describe("buscarPagosPorReferencia", () => {

    test("Test 163 - Buscar pagos mediante referencia externa", async () => {

        // ARRANGE
        const externalReference = "1";

        const pagosMP = [
            {
                id: 1001,
                external_reference: "1",
                status: "approved",
                transaction_amount: 50000,
                currency_id: "ARS"
            }
        ];

        const clienteMP = {
            search: jest.fn().mockResolvedValue({
                results: pagosMP
            })
        };

        // ACT
        const resultado = await buscarPagosPorReferencia(
            externalReference,
            clienteMP
        );

        // ASSERT
        expect(clienteMP.search).toHaveBeenCalledTimes(1);

        expect(clienteMP.search).toHaveBeenCalledWith({
            options: {
                criteria: "desc",
                sort: "date_created",
                external_reference: externalReference
            }
        });

        expect(resultado).toEqual(pagosMP);

    });

});





