const CompraRepository = require("../repository/compraRepository");
const { prepararPreferenciaPago, crearPreferenciaPago, obtenerIdPreferencia, obtenerUrlCheckout, 
    buscarPagosPorReferencia, iniciarPagoMercadoPago, seleccionarPagoAprobado, validarReferenciaPago,
    validarMontoPago, validarMonedaPago, confirmarPagoMercadoPago} = require('./mercadopago.service');
const { enviarMailConfirmacion } = require("../mail/mail.service");

const {
    procesarResultadoMP
} = require("./mercadopago.service");

jest.mock("../mail/mail.service", () => ({
    enviarMailConfirmacion: jest.fn()
}));

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

    
test("Test 164 - Consultar una compra sin pagos registrados", async () => {

    // ARRANGE
    const externalReference = "1";

    const clienteMP = {
        search: jest.fn().mockResolvedValue({
            results: []
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

    expect(resultado).toEqual([]);

});


test("Test 165 - Consultar múltiples intentos de pago", async () => {

    // ARRANGE
    const externalReference = "1";

    const pagosMP = [
        {
            id: 1001,
            external_reference: "1",
            status: "rejected"
        },
        {
            id: 1002,
            external_reference: "1",
            status: "pending"
        },
        {
            id: 1003,
            external_reference: "1",
            status: "approved"
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


test("Test 166 - Manejar errores durante la consulta de pagos", async () => {

    // ARRANGE
    const externalReference = "1";

    const errorMP = new Error(
        "Error al consultar los pagos"
    );

    const clienteMP = {
        search: jest.fn().mockRejectedValue(errorMP)
    };

    // ACT Y ASSERT
    await expect(
        buscarPagosPorReferencia(externalReference, clienteMP)
    ).rejects.toThrow("Error al consultar los pagos");

    expect(clienteMP.search).toHaveBeenCalledTimes(1);

    expect(clienteMP.search).toHaveBeenCalledWith({
        options: {
            criteria: "desc",
            sort: "date_created",
            external_reference: externalReference
        }
    });

});

});


describe("iniciarPagoMercadoPago", () => {

    test("Test 167 - Iniciar pago mediante Mercado Pago", async () => {

        // ARRANGE
        const compra = {
            id: 1,
            cantidadEntradas: 3,
            montoTotal: 50000,
            formaPago: "Mercado Pago",
            estadoCompra: "pendiente",
            estadoPago: "pending"
        };

        const respuestaMP = {
            id: "PREF-001",
            init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=PREF-001"
        };

        const clienteMP = {
            create: jest.fn().mockResolvedValue(respuestaMP)
        };

        // ACT
        const resultado = await iniciarPagoMercadoPago(
            compra,
            clienteMP
        );

        // ASSERT
        expect(clienteMP.create).toHaveBeenCalledTimes(1);

        expect(clienteMP.create).toHaveBeenCalledWith({
            body: {
                items: [
                    {
                        title: "Entradas EcoHarmony Park",
                        quantity: 1,
                        unit_price: 50000,
                        currency_id: "ARS"
                    }
                ],
                external_reference: "1"
            }
        });

        expect(resultado).toEqual({
            idCompra: 1,
            idPreferencia: "PREF-001",
            urlRedireccion: respuestaMP.init_point
        });

        expect(compra.estadoCompra).toBe("pendiente");
        expect(compra.estadoPago).toBe("pending");

    });

    
test("Test 168 - Propagar error al iniciar pago con Mercado Pago", async () => {

    // ARRANGE
    const compra = {
        id: 1,
        cantidadEntradas: 3,
        montoTotal: 50000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const errorMP = new Error(
        "Error al crear preferencia de pago"
    );

    const clienteMP = {
        create: jest.fn().mockRejectedValue(errorMP)
    };

    // ACT Y ASSERT
    await expect(
        iniciarPagoMercadoPago(compra, clienteMP)
    ).rejects.toThrow("Error al crear preferencia de pago");

    expect(clienteMP.create).toHaveBeenCalledTimes(1);

    expect(clienteMP.create).toHaveBeenCalledWith({
        body: {
            items: [
                {
                    title: "Entradas EcoHarmony Park",
                    quantity: 1,
                    unit_price: 50000,
                    currency_id: "ARS"
                }
            ],
            external_reference: "1"
        }
    });

    expect(compra.estadoCompra).toBe("pendiente");
    expect(compra.estadoPago).toBe("pending");

});

});


describe("seleccionarPagoAprobado", () => {

    test("Test 169 - Seleccionar un pago aprobado entre múltiples intentos", () => {

        // ARRANGE
        const pagos = [
            {
                id: 101,
                status: "rejected",
                transaction_amount: 50000,
                currency_id: "ARS",
                external_reference: "1"
            },
            {
                id: 102,
                status: "pending",
                transaction_amount: 50000,
                currency_id: "ARS",
                external_reference: "1"
            },
            {
                id: 103,
                status: "approved",
                transaction_amount: 50000,
                currency_id: "ARS",
                external_reference: "1"
            }
        ];

        // ACT
        const resultado = seleccionarPagoAprobado(pagos);

        // ASSERT
        expect(resultado).toEqual({
            id: 103,
            status: "approved",
            transaction_amount: 50000,
            currency_id: "ARS",
            external_reference: "1"
        });

    });

});


describe("validarReferenciaPago", () => {

    test("Test 170 - Validar referencia externa coincidente", () => {

        // ARRANGE
        const compra = {
            id: 1,
            montoTotal: 50000
        };

        const pago = {
            id: 103,
            status: "approved",
            external_reference: "1",
            transaction_amount: 50000,
            currency_id: "ARS"
        };

        // ACT
        const resultado = validarReferenciaPago(pago, compra);

        // ASSERT
        expect(resultado).toBe(true);

    });

    
test("Test 171 - Rechazar referencia externa diferente", () => {

    // ARRANGE
    const compra = {
        id: 1,
        montoTotal: 50000
    };

    const pago = {
        id: 103,
        status: "approved",
        external_reference: "2",
        transaction_amount: 50000,
        currency_id: "ARS"
    };

    // ACT
    const resultado = validarReferenciaPago(pago, compra);

    // ASSERT
    expect(resultado).toBe(false);

});


});


describe("validarMontoPago", () => {

    test("Test 172 - Validar monto del pago coincidente", () => {

        // ARRANGE
        const compra = {
            id: 1,
            montoTotal: 50000
        };

        const pago = {
            id: 103,
            status: "approved",
            external_reference: "1",
            transaction_amount: 50000,
            currency_id: "ARS"
        };

        // ACT
        const resultado = validarMontoPago(pago, compra);

        // ASSERT
        expect(resultado).toBe(true);

    });

    
test("Test 173 - Rechazar monto de pago diferente", () => {

    // ARRANGE
    const compra = {
        id: 1,
        montoTotal: 50000
    };

    const pago = {
        id: 103,
        status: "approved",
        external_reference: "1",
        transaction_amount: 40000,
        currency_id: "ARS"
    };

    // ACT
    const resultado = validarMontoPago(pago, compra);

    // ASSERT
    expect(resultado).toBe(false);

});


});


describe("validarMonedaPago", () => {

    test("Test 174 - Validar moneda ARS", () => {

        // ARRANGE
        const pago = {
            id: 103,
            status: "approved",
            external_reference: "1",
            transaction_amount: 50000,
            currency_id: "ARS"
        };

        // ACT
        const resultado = validarMonedaPago(pago);

        // ASSERT
        expect(resultado).toBe(true);

    });

    
test("Test 175 - Rechazar pago en moneda diferente de ARS", () => {

    // ARRANGE
    const pago = {
        id: 103,
        status: "approved",
        external_reference: "1",
        transaction_amount: 50000,
        currency_id: "USD"
    };

    // ACT
    const resultado = validarMonedaPago(pago);

    // ASSERT
    expect(resultado).toBe(false);

});


});


describe("confirmarPagoMercadoPago", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        enviarMailConfirmacion.mockReset();
    });

    test("Test 176 - Confirmar compra con pago aprobado y válido", async () => {

        // ARRANGE
        const compra = {
            id: 1,
            montoTotal: 50000,
            formaPago: "Mercado Pago",
            estadoCompra: "pendiente",
            estadoPago: "pending"
        };

        const pagoAprobado = {
            id: 103,
            status: "approved",
            external_reference: "1",
            transaction_amount: 50000,
            currency_id: "ARS"
        };

        const compraConfirmada = {
            ...compra,
            estadoCompra: "confirmada",
            estadoPago: "approved"
        };

        const clienteMP = {
            search: jest.fn().mockResolvedValue({
                results: [pagoAprobado]
            })
        };

        const repository = {
            actualizarEstadosCompra: jest.fn()
                .mockResolvedValue(compraConfirmada)
        };

        enviarMailConfirmacion.mockResolvedValue(undefined);

        // ACT
        const resultado = await confirmarPagoMercadoPago(
            compra,
            clienteMP,
            repository
        );

        // ASSERT
        expect(clienteMP.search).toHaveBeenCalledTimes(1);

        expect(clienteMP.search).toHaveBeenCalledWith({
            options: {
                criteria: "desc",
                sort: "date_created",
                external_reference: "1"
            }
        });

        expect(repository.actualizarEstadosCompra)
            .toHaveBeenCalledTimes(1);

        expect(repository.actualizarEstadosCompra)
            .toHaveBeenCalledWith(
                1,
                "confirmada",
                "approved"
            );

        expect(resultado).toEqual(compraConfirmada);

        expect(enviarMailConfirmacion)
            .toHaveBeenCalledTimes(1);

        expect(enviarMailConfirmacion)
            .toHaveBeenCalledWith(compraConfirmada);

    });

    test("Test 177 - Enviar correo después de persistir el pago aprobado", async () => {

        // ARRANGE
        const compra = {
            id: 1,
            montoTotal: 50000,
            formaPago: "Mercado Pago",
            estadoCompra: "pendiente",
            estadoPago: "pending"
        };

        const pagoAprobado = {
            id: 103,
            status: "approved",
            external_reference: "1",
            transaction_amount: 50000,
            currency_id: "ARS"
        };

        const compraConfirmada = {
            ...compra,
            estadoCompra: "confirmada",
            estadoPago: "approved"
        };

        const clienteMP = {
            search: jest.fn().mockResolvedValue({
                results: [pagoAprobado]
            })
        };

        const ordenOperaciones = [];

        const repository = {
            actualizarEstadosCompra: jest.fn()
                .mockImplementation(async () => {
                    ordenOperaciones.push("persistencia");
                    return compraConfirmada;
                })
        };

        enviarMailConfirmacion.mockImplementation(async () => {
            ordenOperaciones.push("correo");
        });

        // ACT
        const resultado = await confirmarPagoMercadoPago(
            compra,
            clienteMP,
            repository
        );

        // ASSERT
        expect(repository.actualizarEstadosCompra)
            .toHaveBeenCalledTimes(1);

        expect(repository.actualizarEstadosCompra)
            .toHaveBeenCalledWith(
                1,
                "confirmada",
                "approved"
            );

        expect(enviarMailConfirmacion)
            .toHaveBeenCalledTimes(1);

        expect(enviarMailConfirmacion)
            .toHaveBeenCalledWith(compraConfirmada);

        expect(ordenOperaciones).toEqual([
            "persistencia",
            "correo"
        ]);

        expect(resultado).toEqual(compraConfirmada);

    });

    
test("Test 178 - No confirmar nuevamente una compra ya confirmada", async () => {

    // ARRANGE
    const compra = {
        id: 1,
        montoTotal: 50000,
        formaPago: "Mercado Pago",
        estadoCompra: "confirmada",
        estadoPago: "approved"
    };

    const pagoAprobado = {
        id: 103,
        status: "approved",
        external_reference: "1",
        transaction_amount: 50000,
        currency_id: "ARS"
    };

    const clienteMP = {
        search: jest.fn().mockResolvedValue({
            results: [pagoAprobado]
        })
    };

    const repository = {
        actualizarEstadosCompra: jest.fn()
    };

    // ACT
    const resultado = await confirmarPagoMercadoPago(
        compra,
        clienteMP,
        repository
    );

    // ASSERT
    expect(resultado).toEqual(compra);

    expect(repository.actualizarEstadosCompra)
        .not.toHaveBeenCalled();

    expect(enviarMailConfirmacion)
        .not.toHaveBeenCalled();

});


test("Test 179 - Mantener compra pendiente cuando no existen pagos", async () => {

    // ARRANGE
    const compra = {
        id: 1,
        montoTotal: 50000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const clienteMP = {
        search: jest.fn().mockResolvedValue({
            results: []
        })
    };

    const repository = {
        actualizarEstadosCompra: jest.fn()
    };

    // ACT
    const resultado = await confirmarPagoMercadoPago(
        compra,
        clienteMP,
        repository
    );

    // ASSERT
    expect(clienteMP.search).toHaveBeenCalledTimes(1);

    expect(clienteMP.search).toHaveBeenCalledWith({
        options: {
            criteria: "desc",
            sort: "date_created",
            external_reference: "1"
        }
    });

    expect(resultado).toEqual(compra);

    expect(resultado.estadoCompra).toBe("pendiente");
    expect(resultado.estadoPago).toBe("pending");

    expect(repository.actualizarEstadosCompra)
        .not.toHaveBeenCalled();

    expect(enviarMailConfirmacion)
        .not.toHaveBeenCalled();

});


test("Test 180 - Mantener compra pendiente cuando el pago está pending", async () => {

    // ARRANGE
    const compra = {
        id: 1,
        montoTotal: 50000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const pagoPendiente = {
        id: 103,
        status: "pending",
        external_reference: "1",
        transaction_amount: 50000,
        currency_id: "ARS"
    };

    const clienteMP = {
        search: jest.fn().mockResolvedValue({
            results: [pagoPendiente]
        })
    };

    const repository = {
        actualizarEstadosCompra: jest.fn()
    };

    // ACT
    const resultado = await confirmarPagoMercadoPago(
        compra,
        clienteMP,
        repository
    );

    // ASSERT
    expect(clienteMP.search).toHaveBeenCalledTimes(1);

    expect(clienteMP.search).toHaveBeenCalledWith({
        options: {
            criteria: "desc",
            sort: "date_created",
            external_reference: "1"
        }
    });

    expect(resultado).toEqual(compra);

    expect(resultado.estadoCompra).toBe("pendiente");
    expect(resultado.estadoPago).toBe("pending");

    expect(repository.actualizarEstadosCompra)
        .not.toHaveBeenCalled();

    expect(enviarMailConfirmacion)
        .not.toHaveBeenCalled();

});


test("Test 181 - Mantener compra pendiente cuando el pago está rejected", async () => {

    // ARRANGE
    const compra = {
        id: 1,
        montoTotal: 50000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const pagoRechazado = {
        id: 103,
        status: "rejected",
        external_reference: "1",
        transaction_amount: 50000,
        currency_id: "ARS"
    };

    const clienteMP = {
        search: jest.fn().mockResolvedValue({
            results: [pagoRechazado]
        })
    };

    const repository = {
        actualizarEstadosCompra: jest.fn()
    };

    // ACT
    const resultado = await confirmarPagoMercadoPago(
        compra,
        clienteMP,
        repository
    );

    // ASSERT
    expect(clienteMP.search).toHaveBeenCalledTimes(1);

    expect(clienteMP.search).toHaveBeenCalledWith({
        options: {
            criteria: "desc",
            sort: "date_created",
            external_reference: "1"
        }
    });

    expect(resultado).toEqual(compra);

    expect(resultado.estadoCompra).toBe("pendiente");
    expect(resultado.estadoPago).toBe("pending");

    expect(repository.actualizarEstadosCompra)
        .not.toHaveBeenCalled();

    expect(enviarMailConfirmacion)
        .not.toHaveBeenCalled();

});


test("Test 182 - Confirmar compra con múltiples intentos y un pago aprobado", async () => {

    // ARRANGE
    const compra = {
        id: 1,
        montoTotal: 50000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const pagos = [
        {
            id: 101,
            status: "rejected",
            external_reference: "1",
            transaction_amount: 50000,
            currency_id: "ARS"
        },
        {
            id: 102,
            status: "pending",
            external_reference: "1",
            transaction_amount: 50000,
            currency_id: "ARS"
        },
        {
            id: 103,
            status: "approved",
            external_reference: "1",
            transaction_amount: 50000,
            currency_id: "ARS"
        }
    ];

    const clienteMP = {
        search: jest.fn().mockResolvedValue({
            results: pagos
        })
    };

    const compraConfirmada = {
        ...compra,
        estadoCompra: "confirmada",
        estadoPago: "approved"
    };

    const repository = {
        actualizarEstadosCompra: jest.fn()
            .mockResolvedValue(compraConfirmada)
    };

    enviarMailConfirmacion.mockResolvedValue(undefined);

    // ACT
    const resultado = await confirmarPagoMercadoPago(
        compra,
        clienteMP,
        repository
    );

    // ASSERT
    expect(clienteMP.search).toHaveBeenCalledTimes(1);

    expect(clienteMP.search).toHaveBeenCalledWith({
        options: {
            criteria: "desc",
            sort: "date_created",
            external_reference: "1"
        }
    });

    expect(repository.actualizarEstadosCompra)
        .toHaveBeenCalledTimes(1);

    expect(repository.actualizarEstadosCompra)
        .toHaveBeenCalledWith(
            1,
            "confirmada",
            "approved"
        );

    expect(enviarMailConfirmacion)
        .toHaveBeenCalledTimes(1);

    expect(enviarMailConfirmacion)
        .toHaveBeenCalledWith(compraConfirmada);

    expect(resultado).toEqual(compraConfirmada);

});


test("Test 183 - No confirmar compra con pago aprobado de monto incorrecto", async () => {

    // ARRANGE
    const compra = {
        id: 1,
        montoTotal: 50000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const pagoAprobado = {
        id: 103,
        status: "approved",
        external_reference: "1",
        transaction_amount: 40000,
        currency_id: "ARS"
    };

    const clienteMP = {
        search: jest.fn().mockResolvedValue({
            results: [pagoAprobado]
        })
    };

    const repository = {
        actualizarEstadosCompra: jest.fn()
    };

    // ACT
    const resultado = await confirmarPagoMercadoPago(
        compra,
        clienteMP,
        repository
    );

    // ASSERT
    expect(clienteMP.search).toHaveBeenCalledTimes(1);

    expect(clienteMP.search).toHaveBeenCalledWith({
        options: {
            criteria: "desc",
            sort: "date_created",
            external_reference: "1"
        }
    });

    expect(resultado).toEqual(compra);

    expect(resultado.estadoCompra).toBe("pendiente");
    expect(resultado.estadoPago).toBe("pending");

    expect(repository.actualizarEstadosCompra)
        .not.toHaveBeenCalled();

    expect(enviarMailConfirmacion)
        .not.toHaveBeenCalled();

});


test("Test 184 - No confirmar compra con referencia externa incorrecta", async () => {

    // ARRANGE
    const compra = {
        id: 1,
        montoTotal: 50000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const pagoAprobado = {
        id: 103,
        status: "approved",
        external_reference: "2",
        transaction_amount: 50000,
        currency_id: "ARS"
    };

    const clienteMP = {
        search: jest.fn().mockResolvedValue({
            results: [pagoAprobado]
        })
    };

    const repository = {
        actualizarEstadosCompra: jest.fn()
    };

    // ACT
    const resultado = await confirmarPagoMercadoPago(
        compra,
        clienteMP,
        repository
    );

    // ASSERT
    expect(clienteMP.search).toHaveBeenCalledTimes(1);

    expect(clienteMP.search).toHaveBeenCalledWith({
        options: {
            criteria: "desc",
            sort: "date_created",
            external_reference: "1"
        }
    });

    expect(resultado).toEqual(compra);

    expect(resultado.estadoCompra).toBe("pendiente");
    expect(resultado.estadoPago).toBe("pending");

    expect(repository.actualizarEstadosCompra)
        .not.toHaveBeenCalled();

    expect(enviarMailConfirmacion)
        .not.toHaveBeenCalled();

});


test("Test 185 - No confirmar compra con pago aprobado en moneda incorrecta", async () => {

    // ARRANGE
    const compra = {
        id: 1,
        montoTotal: 50000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const pagoAprobado = {
        id: 103,
        status: "approved",
        external_reference: "1",
        transaction_amount: 50000,
        currency_id: "USD"
    };

    const clienteMP = {
        search: jest.fn().mockResolvedValue({
            results: [pagoAprobado]
        })
    };

    const repository = {
        actualizarEstadosCompra: jest.fn()
    };

    // ACT
    const resultado = await confirmarPagoMercadoPago(
        compra,
        clienteMP,
        repository
    );

    // ASSERT
    expect(clienteMP.search).toHaveBeenCalledTimes(1);

    expect(clienteMP.search).toHaveBeenCalledWith({
        options: {
            criteria: "desc",
            sort: "date_created",
            external_reference: "1"
        }
    });

    expect(resultado).toEqual(compra);

    expect(resultado.estadoCompra).toBe("pendiente");
    expect(resultado.estadoPago).toBe("pending");

    expect(repository.actualizarEstadosCompra)
        .not.toHaveBeenCalled();

    expect(enviarMailConfirmacion)
        .not.toHaveBeenCalled();

});


test("Test 186 - Propagar error al consultar pagos durante la confirmación", async () => {

    // ARRANGE
    const compra = {
        id: 1,
        montoTotal: 50000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const errorConsulta = new Error(
        "Error al consultar pagos en Mercado Pago"
    );

    const clienteMP = {
        search: jest.fn().mockRejectedValue(errorConsulta)
    };

    const repository = {
        actualizarEstadosCompra: jest.fn()
    };

    // ACT
    const operacion = confirmarPagoMercadoPago(
        compra,
        clienteMP,
        repository
    );

    // ASSERT
    await expect(operacion).rejects.toThrow(
        "Error al consultar pagos en Mercado Pago"
    );

    expect(clienteMP.search).toHaveBeenCalledTimes(1);

    expect(clienteMP.search).toHaveBeenCalledWith({
        options: {
            criteria: "desc",
            sort: "date_created",
            external_reference: "1"
        }
    });

    expect(compra.estadoCompra).toBe("pendiente");
    expect(compra.estadoPago).toBe("pending");

    expect(repository.actualizarEstadosCompra)
        .not.toHaveBeenCalled();

    expect(enviarMailConfirmacion)
        .not.toHaveBeenCalled();

});


});












