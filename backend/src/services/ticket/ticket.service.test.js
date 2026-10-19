const request = require('supertest');
const app = require('../../server');
const { validarUsuario, validarFecha, validarAperturaParque, validarCantidadEntradas, validarCamposObligatorios, calcularMonto } = require('./ticket.validator');
const { comprarEntradas } = require('./ticket.service');
const { FORMAS_PAGO } = require('./formasPago.mock');
const { TIPOS_PASE } = require('./tiposPase.mock');
const { REGLAS_CALENDARIO } = require('./calendario.mock');
const { USUARIOS_MOCK } = require('./usuarios.mock');

describe('validarUsuario', () => {
  test('Test 01 - Probar validar usuario con un usuario no registrado', () => {
    const usuario = {
      id: 999,
      nombre: 'Usuario inexistente',
      email: 'inexistente@example.com',
    };

    expect(() => validarUsuario(usuario)).toThrow(
      'ERROR: Usuario no registrado',
    );
  });

  test('Test 02 - Probar validar usuario con un usuario registrado', () => {
    const usuario = {
      id: 2,
      nombre: 'Brisa',
      email: 'brisaabigaildiaz2000@gmail.com',
    };
    expect(() => validarUsuario(usuario)).not.toThrow();
    expect(validarUsuario(usuario)).toBe(true);
  });

  test('Test 03 - Probar validar usuario sin proporcionar un usuario', () => {
    expect(() => validarUsuario()).toThrow('ERROR: Usuario no registrado');
  });
});

describe('validarCompra', () => {
  test('Test 04 - Comprar entradas con usuario no registrado', () => {
    usuario = { id: 999, nombre: 'Usuario inexistente', email:'inexistente@example.com' };
    datosCompra = {
      fechaVisita: '2026-10-24',
      cantidadEntradas: 2,
      edadesVisitantes: [25, 23],
      tipoPase: ['REGULAR', 'REGULAR'],
    };

    expect(() => comprarEntradas(usuario, datosCompra)).toThrow(
      'ERROR: Usuario no registrado',
    );
  });

  test('Test 05 - Comprar entradas con usuario registrado', () => {
    usuario = { id: 2, nombre: 'Brisa', email: 'brisaabigaildiaz2000@gmail.com', };
    datosCompra = {
      fechaVisita: '2026-10-24',
      cantidadEntradas: 2,
      edadesVisitantes: [25, 23],
      tipoPase: ['REGULAR', 'REGULAR'],
    };

    const compra = comprarEntradas(usuario, datosCompra);
    expect(compra).not.toBeNull();
    expect(compra.fechaVisita).toBe(datosCompra.fechaVisita);
    expect(compra.cantidadEntradas).toBe(datosCompra.cantidadEntradas);
    expect(compra.edadesVisitantes).toEqual(datosCompra.edadesVisitantes);
    expect(compra.tipoPase).toEqual(datosCompra.tipoPase);
  });

  test('Test 06 - Conservar datos del usuario en la compra', () => {
    datosCompra = {
      fechaVisita: '2026-10-24',
      cantidadEntradas: 2,
      edadesVisitantes: [25, 23],
      tipoPase: ['REGULAR', 'REGULAR'],
    };

    const compra = comprarEntradas(usuario, datosCompra);

    expect(compra.cliente).toEqual(usuario);
  });

  test("Test 32 - Probar comprar entradas con una fecha previa a la actual", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: new Date(2026, 9, 15, 12),
            cantidadEntradas: 1,
            edadesVisitantes: [25],
            tipoPase: ["REGULAR"]
        };

        // ACT Y ASSERT
        expect(() => comprarEntradas(usuario, datosCompra))
            .toThrow("Fecha previa a la actual");

    } finally {
        jest.useRealTimers();
    }
});

  test("Test 33 - Probar comprar entradas con una fecha actual", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        const fechaActual = new Date(2026, 9, 16, 12);
        jest.setSystemTime(fechaActual);

        const usuario = USUARIOS_MOCK[0];

        const fechaVisita = new Date(2026, 9, 16, 12);

        const datosCompra = {
            fechaVisita,
            cantidadEntradas: 1,
            edadesVisitantes: [25],
            tipoPase: ["REGULAR"]
        };

        // ACT
        const resultado = comprarEntradas(usuario, datosCompra);

        // ASSERT
        expect(resultado).toBeDefined();
        expect(resultado.fechaVisita).toEqual(fechaVisita);

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 34 - Probar comprar entradas con una fecha posterior a la actual", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        const fechaActual = new Date(2026, 9, 16, 12);
        jest.setSystemTime(fechaActual);

        const usuario = USUARIOS_MOCK[0];

        const fechaVisita = new Date(2026, 9, 20, 12);

        const datosCompra = {
            fechaVisita,
            cantidadEntradas: 1,
            edadesVisitantes: [25],
            tipoPase: ["REGULAR"]
        };

        // ACT
        const resultado = comprarEntradas(usuario, datosCompra);

        // ASSERT
        expect(resultado).toBeDefined();
        expect(resultado.fechaVisita).toEqual(fechaVisita);

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 35 - Probar comprar entradas sin fecha de visita", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: null,
            cantidadEntradas: 1,
            edadesVisitantes: [25],
            tipoPase: ["REGULAR"]
        };

        // ACT Y ASSERT
        expect(() => comprarEntradas(usuario, datosCompra))
            .toThrow("Debe seleccionar una fecha de visita");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 36 - Probar comprar entradas con más de 30 días de anticipación", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: new Date(2026, 10, 17, 12),
            cantidadEntradas: 1,
            edadesVisitantes: [25],
            tipoPase: ["REGULAR"]
        };

        // ACT Y ASSERT
        expect(() => comprarEntradas(usuario, datosCompra))
            .toThrow(
                "No se pueden comprar entradas con más de 30 días de anticipación"
            );

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 37 - Probar comprar entradas con una fecha en la que el parque está cerrado", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: new Date(2026, 9, 19, 12),
            cantidadEntradas: 1,
            edadesVisitantes: [25],
            tipoPase: ["REGULAR"]
        };

        // ACT Y ASSERT
        expect(() => comprarEntradas(usuario, datosCompra))
            .toThrow("Parque Cerrado");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 38 - Probar comprar entradas con una fecha en la que el parque está abierto", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const fechaVisita = new Date(2026, 9, 20, 12);

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita,
            cantidadEntradas: 1,
            edadesVisitantes: [25],
            tipoPase: ["REGULAR"]
        };

        // ACT
        let resultado;

        // ASSERT
        expect(() => {
            resultado = comprarEntradas(usuario, datosCompra);
        }).not.toThrow();

        expect(resultado).toBeDefined();
        expect(resultado).not.toBeNull();
        expect(resultado.fechaVisita).toEqual(fechaVisita);

    } finally {
        jest.useRealTimers();
    }
});

test("Test 39 - Probar que una compra válida conserve la fecha de visita seleccionada", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: "2026-10-20",
            cantidadEntradas: 1,
            edadesVisitantes: [25],
            tipoPase: ["REGULAR"]
        };

        // ACT
        const resultado = comprarEntradas(usuario, datosCompra);

        // ASSERT
        expect(resultado).toBeDefined();
        expect(resultado).not.toBeNull();
        expect(resultado.fechaVisita).toBe("2026-10-20");

    } finally {
        jest.useRealTimers();
    }
});

  test("Test 48 - Probar comprar entradas con una cantidad superior a 10", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: "2026-10-20",
            cantidadEntradas: 11,
            edadesVisitantes: Array(11).fill(25),
            tipoPase: Array(11).fill("REGULAR")
        };

        // ACT Y ASSERT
        expect(() => comprarEntradas(usuario, datosCompra))
            .toThrow("No se pueden comprar más de 10 entradas");

    } finally {
        jest.useRealTimers();
    }
});

  test("Test 49 - Probar comprar exactamente 10 entradas", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: "2026-10-20",
            cantidadEntradas: 10,
            edadesVisitantes: Array(10).fill(25),
            tipoPase: Array(10).fill("REGULAR")
        };

        // ACT
        const resultado = comprarEntradas(usuario, datosCompra);

        // ASSERT
        expect(resultado).toBeDefined();
        expect(resultado).not.toBeNull();
        expect(resultado.cantidadEntradas).toBe(10);

    } finally {
        jest.useRealTimers();
    }
});

  test("Test 50 - Probar comprar 0 entradas", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: "2026-10-20",
            cantidadEntradas: 0,
            edadesVisitantes: [],
            tipoPase: []
        };

        // ACT Y ASSERT
        expect(() => comprarEntradas(usuario, datosCompra))
            .toThrow("Cantidad inválida");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 51 - Probar comprar entradas sin proporcionar una cantidad", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: "2026-10-20",
            cantidadEntradas: null,
            edadesVisitantes: [],
            tipoPase: []
        };

        // ACT Y ASSERT
        expect(() => comprarEntradas(usuario, datosCompra))
            .toThrow("Cantidad de entradas faltante");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 52 - Probar comprar entradas con una cantidad decimal", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: "2026-10-20",
            cantidadEntradas: 2.5,
            edadesVisitantes: [],
            tipoPase: []
        };

        // ACT Y ASSERT
        expect(() => comprarEntradas(usuario, datosCompra))
            .toThrow("Cantidad inválida");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 53 - Probar comprar entradas con una cantidad no numérica", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: "2026-10-20",
            cantidadEntradas: "11",
            edadesVisitantes: [],
            tipoPase: []
        };

        // ACT Y ASSERT
        expect(() => comprarEntradas(usuario, datosCompra))
            .toThrow("Cantidad inválida");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 54 - Probar comprar entradas con una cantidad negativa", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: "2026-10-20",
            cantidadEntradas: -1,
            edadesVisitantes: [],
            tipoPase: []
        };

        // ACT Y ASSERT
        expect(() => comprarEntradas(usuario, datosCompra))
            .toThrow("Cantidad inválida");

    } finally {
        jest.useRealTimers();
    }
});

  test("Test 68 - Probar comprar entradas sin edades ni tipos de pase", () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        edadesVisitantes: null,
        tipoPase: null
      };

      expect(() => comprarEntradas(usuario, datosCompra))
        .toThrow("Datos faltantes");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 69 - Probar comprar entradas sin edades", () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        edadesVisitantes: null,
        tipoPase: ["VIP", "REGULAR"]
      };

      expect(() => comprarEntradas(usuario, datosCompra))
        .toThrow("Edades faltantes");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 70 - Probar comprar entradas sin tipos de pase", () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        edadesVisitantes: [25, 30],
        tipoPase: null
      };

      expect(() => comprarEntradas(usuario, datosCompra))
        .toThrow("Tipos de pase faltantes");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 71 - Probar comprar entradas con menos edades que visitantes", () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: "2026-10-20",
        cantidadEntradas: 3,
        edadesVisitantes: [25, 30],
        tipoPase: ["VIP", "REGULAR", "VIP"]
      };

      expect(() => comprarEntradas(usuario, datosCompra))
        .toThrow("Faltan edades de visitantes");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 72 - Probar comprar entradas con menos tipos de pase que visitantes", () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: "2026-10-20",
        cantidadEntradas: 3,
        edadesVisitantes: [25, 30, 12],
        tipoPase: ["VIP", "REGULAR"]
      };

      expect(() => comprarEntradas(usuario, datosCompra))
        .toThrow("Faltan tipos de pase de visitantes");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 73 - Probar comprar entradas con una edad negativa", () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        edadesVisitantes: [25, -1],
        tipoPase: ["VIP", "REGULAR"]
      };

      expect(() => comprarEntradas(usuario, datosCompra))
        .toThrow("Edad ingresada inválida");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 74 - Probar comprar entradas con un tipo de pase no permitido", () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        edadesVisitantes: [25, 30],
        tipoPase: ["VIP", "Premium"]
      };

      expect(() => comprarEntradas(usuario, datosCompra))
        .toThrow("Tipo de pase inválido");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 75 - Probar comprar entradas con una edad ingresada como texto", () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        edadesVisitantes: [25, "treinta"],
        tipoPase: ["VIP", "REGULAR"]
      };

      expect(() => comprarEntradas(usuario, datosCompra))
        .toThrow("Edad ingresada inválida");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 76 - Probar comprar entradas con una edad decimal", () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        edadesVisitantes: [25, 12.5],
        tipoPase: ["VIP", "REGULAR"]
      };

      expect(() => comprarEntradas(usuario, datosCompra))
        .toThrow("Edad ingresada inválida");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 77 - Probar comprar entradas con todos los datos requeridos válidos", () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: "2026-10-20",
        cantidadEntradas: 3,
        edadesVisitantes: [25, 30, 12],
        tipoPase: ["VIP", "REGULAR", "VIP"]
      };

      const resultado = comprarEntradas(usuario, datosCompra);

      expect(resultado).toEqual({
        ...datosCompra,
        cliente: usuario,
        montoTotal: null
      });
    } finally {
      jest.useRealTimers();
    }
  });

});

describe('calcularMonto', () => {
  test('Test 78 - Probar cálculo del monto de una entrada Común', () => {
    expect(calcularMonto([25], ['REGULAR'])).toBe(10000);
  });

  test('Test 79 - Probar cálculo del monto de una entrada VIP', () => {
    expect(calcularMonto([25], ['VIP'])).toBe(20000);
  });

  test('Test 80 - Probar cálculo del monto de varias entradas Común', () => {
    expect(calcularMonto(
      [25, 30, 35],
      ['REGULAR', 'REGULAR', 'REGULAR']
    )).toBe(30000);
  });

  test('Test 81 - Probar cálculo del monto de varias entradas VIP', () => {
    expect(calcularMonto(
      [25, 30, 35],
      ['VIP', 'VIP', 'VIP']
    )).toBe(60000);
  });

  test('Test 82 - Probar cálculo del monto de una compra con entradas VIP y Común', () => {
    expect(calcularMonto(
      [25, 30, 35],
      ['VIP', 'REGULAR', 'VIP']
    )).toBe(50000);
  });

  test('Test 83 - Probar cálculo del monto de una entrada Común para un visitante de 0 a 3 años', () => {
    expect(calcularMonto([2], ['REGULAR'])).toBe(0);
  });
});

describe('obtenerFormasPago', () => {
  test('Test 07 - Obtener formas de pago', async () => {
    const res = await request(app).get('/api/formas-pago');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(FORMAS_PAGO);
  });
});

describe('obtenerTiposPase', () => {
  test('Test 08 - Obtener tipos de pase', async () => {
    const res = await request(app).get('/api/tipos-pase');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(TIPOS_PASE);
  });
});

describe('obtenerReglasCalendario', () => {
  test('Test 09 - Obtener fechas no disponibles del calendario', async () => {
    const res = await request(app).get('/api/calendario/reglas');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(REGLAS_CALENDARIO);
  });
});

describe("validarFecha", () => {

    test("Test 19 - Probar validar fechas con una fecha previa a la actual", () => {
        // ARRANGE
        jest.useFakeTimers();

        try {
            const fechaActual = new Date("2026-10-16T12:00:00");
            jest.setSystemTime(fechaActual);

            const fechaVisita = new Date("2026-10-15T12:00:00");

            // ACT Y ASSERT
            expect(() => validarFecha(fechaVisita))
                .toThrow("Fecha previa a la actual");

        } finally {
            jest.useRealTimers();
        }
    });

    test("Test 20 - Probar validar fechas con una fecha actual", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        const fechaActual = new Date("2026-10-16T12:00:00");
        jest.setSystemTime(fechaActual);

        const fechaVisita = new Date("2026-10-16T12:00:00");

        // ACT Y ASSERT
        expect(validarFecha(fechaVisita)).toBe(true);

    } finally {
        jest.useRealTimers();
    }
});

test("Test 21 - Probar validar fechas con una fecha posterior a la actual", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        const fechaActual = new Date("2026-10-16T12:00:00");
        jest.setSystemTime(fechaActual);

        const fechaVisita = new Date("2026-10-20T12:00:00");

        // ACT Y ASSERT
        expect(validarFecha(fechaVisita)).toBe(true);

    } finally {
        jest.useRealTimers();
    }
});

test("Test 22 - Probar validar fechas con más de 30 días de anticipación", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const fechaVisita = new Date(2026, 10, 16);

        // ACT Y ASSERT
        expect(() => validarFecha(fechaVisita)).toThrow(
            "No se pueden comprar entradas con más de 30 días de anticipación"
        );

    } finally {
        jest.useRealTimers();
    }
});

test("Test 23 - Probar validar fechas con exactamente 30 días de anticipación", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        const fechaActual = new Date(2026, 9, 16, 12);
        jest.setSystemTime(fechaActual);

        const fechaVisita = new Date(2026, 10, 15);

        // ACT Y ASSERT
        expect(validarFecha(fechaVisita)).toBe(true);

    } finally {
        jest.useRealTimers();
    }
});

test("Test 24 - Probar validar fechas sin proporcionar una fecha de visita", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        const fechaActual = new Date(2026, 9, 16, 12);
        jest.setSystemTime(fechaActual);

        const fechaVisita = null;

        // ACT Y ASSERT
        expect(() => validarFecha(fechaVisita)).toThrow(
            "Debe seleccionar una fecha de visita"
        );

    } finally {
        jest.useRealTimers();
    }
});

test("Test 25 - Probar validar fechas con un formato inválido", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const fechaVisita = "16/10/2026";

        // ACT Y ASSERT
        expect(() => validarFecha(fechaVisita)).toThrow(
            "Formato de fecha inválido"
        );

    } finally {
        jest.useRealTimers();
    }
});

test("Test 26 - Probar validar fechas con una fecha calendario inexistente", () => {
    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 0, 15, 12));

        const fechaVisita = "2026-02-30";

        // ACT Y ASSERT
        expect(() => validarFecha(fechaVisita)).toThrow(
            "Fecha inválida"
        );

    } finally {
        jest.useRealTimers();
    }
});

});

describe("validarAperturaParque", () => {

  test("Test 27 - Probar validar apertura del parque con una fecha en la que está abierto", () => {
    // ARRANGE
    const fechaVisita = "2026-10-16";

    // ACT Y ASSERT
    expect(validarAperturaParque(fechaVisita)).toBe(true);
    
  });
  
  test("Test 28 - Probar validar apertura del parque un día lunes", () => {
    // ARRANGE
    const fechaVisita = "2026-10-19";

    // ACT Y ASSERT
    expect(() => validarAperturaParque(fechaVisita)).toThrow(
        "Parque Cerrado"
    );
  });

  test("Test 29 - Probar validar apertura del parque el 25 de diciembre", () => {
    // ARRANGE
    const fechaVisita = "2026-12-25";

    // ACT Y ASSERT
    expect(() => validarAperturaParque(fechaVisita)).toThrow(
        "Parque Cerrado"
    );
  });

  test("Test 30 - Probar validar apertura del parque el 1 de enero", () => {
    // ARRANGE
    const fechaVisita = "2027-01-01";

    // ACT Y ASSERT
    expect(() => validarAperturaParque(fechaVisita)).toThrow(
        "Parque Cerrado"
    );
  });

  test("Test 31 - Probar validar apertura del parque con otra fecha en la que está abierto", () => {
    // ARRANGE
    const fechaVisita = "2026-10-17";

    // ACT Y ASSERT
    expect(validarAperturaParque(fechaVisita)).toBe(true);
  });

});

describe("validarCantidadEntradas", () => {

    test("Test 40 - Probar validar cantidad de entradas con una entrada", () => {
        // ARRANGE
        const cantidadEntradas = 1;

        // ACT
        const resultado = validarCantidadEntradas(cantidadEntradas);

        // ASSERT
        expect(resultado).toBe(true);
    });

    test("Test 41 - Probar validar cantidad de entradas con más de 10 entradas", () => {
    // ARRANGE
    const cantidadEntradas = 11;

    // ACT Y ASSERT
    expect(() => validarCantidadEntradas(cantidadEntradas))
        .toThrow("No se pueden comprar más de 10 entradas");
  });

  test("Test 42 - Probar validar cantidad de entradas con exactamente 10 entradas", () => {
    // ARRANGE
    const cantidadEntradas = 10;

    // ACT
    const resultado = validarCantidadEntradas(cantidadEntradas);

    // ASSERT
    expect(resultado).toBe(true);

  });  

  test("Test 43 - Probar validar cantidad de entradas con 0 entradas", () => {
    // ARRANGE
    const cantidadEntradas = 0;
    // ACT Y ASSERT
    expect(() => validarCantidadEntradas(cantidadEntradas))
        .toThrow("Cantidad inválida");
  
  });

  test("Test 44 - Probar validar cantidad de entradas sin proporcionar una cantidad", () => {
    // ARRANGE
    const cantidadEntradas = null;
    // ACT Y ASSERT
    expect(() => validarCantidadEntradas(cantidadEntradas))
        .toThrow("Cantidad de entradas faltante");
  
  });

  test("Test 45 - Probar validar cantidad de entradas con una cantidad negativa", () => {
    // ARRANGE
    const cantidadEntradas = -1;
    // ACT Y ASSERT
    expect(() => validarCantidadEntradas(cantidadEntradas))
        .toThrow("Cantidad inválida");
  });

    test("Test 46 - Probar validar cantidad de entradas con una cantidad decimal", () => {
    // ARRANGE
    const cantidadEntradas = 2.5;
    // ACT Y ASSERT
    expect(() => validarCantidadEntradas(cantidadEntradas))
        .toThrow("Cantidad inválida");
  });

  test("Test 47 - Probar validar cantidad de entradas con un valor no numérico", () => {
    // ARRANGE
    const cantidadEntradas = "cinco";
    // ACT Y ASSERT
    expect(() => validarCantidadEntradas(cantidadEntradas))
        .toThrow("Cantidad inválida");
  });

});

describe("validarCamposObligatorios", () => {
  test("Test 55 - Probar validador de datos requeridos sin edades ni tipos de pase", () => {
    expect(() =>
      validarCamposObligatorios(null, null, 2)
    ).toThrow("Datos faltantes");
  });

  test("Test 56 - Probar validador de datos requeridos sin edades", () => {
    expect(() => validarCamposObligatorios(
      null, ["VIP", "REGULAR"], 2
    )).toThrow("Edades faltantes");
  });

  test("Test 57 - Probar validador de datos requeridos sin tipos de pase", () => {
    expect(() => validarCamposObligatorios([25, 30], null, 2))
      .toThrow("Tipos de pase faltantes");
  });

  test("Test 58 - Probar validador con menos edades que visitantes", () => {
    expect(() => validarCamposObligatorios(
      [25, 30],
      ["VIP", "REGULAR", "VIP"],
      3
    )).toThrow("Faltan edades de visitantes");
  });

  test("Test 59 - Probar validador con menos tipos de pase que visitantes", () => {
    expect(() =>
      validarCamposObligatorios(
        [25, 30, 12],
        ["VIP", "REGULAR"],
        3
      )
    ).toThrow("Faltan tipos de pase de visitantes");
  });

  test("Test 60 - Probar validador con una edad negativa", () => {
    expect(() =>
      validarCamposObligatorios(
        [25, -1],
        ["VIP", "REGULAR"],
        2
      )
    ).toThrow("Edad ingresada inválida");
  });

  test("Test 61 - Probar validador con un tipo de pase no permitido", () => {
    expect(() => validarCamposObligatorios(
      [25, 30], ["VIP", "Premium"], 2
    )).toThrow("Tipo de pase inválido");
  });

  test("Test 62 - Probar validador con todos los datos correctos", () => {
    expect(validarCamposObligatorios(
      [25, 30, 12],
      ["VIP", "REGULAR", "VIP"],
      3
    )).toBe(true);
  });

  test("Test 63 - Probar validador con edad igual a cero", () => {
    expect(
      validarCamposObligatorios(
        [0, 30], ["REGULAR", "VIP"], 2
      )
    ).toBe(true);
  });

  test("Test 64 - Probar validador con una edad ingresada como texto", () => {
    expect(() =>
      validarCamposObligatorios(
        [25, "treinta"],
        ["VIP", "REGULAR"],
        2
      )
    ).toThrow("Edad ingresada inválida");
  });

  test("Test 65 - Probar validador con una edad decimal", () => {
    expect(() =>
      validarCamposObligatorios(
        [25, 12.5],
        ["VIP", "REGULAR"],
        2
      )
    ).toThrow("Edad ingresada inválida");
  });

  test("Test 66 - Probar validador con más edades que visitantes", () => {
    expect(() =>
      validarCamposObligatorios(
        [25, 30, 12],
        ["VIP", "REGULAR"],
        2
      )
    ).toThrow("Sobran edades de visitantes");
  });

  test("Test 67 - Probar validador con más tipos de pase que visitantes", () => {
    expect(() => validarCamposObligatorios(
      [25, 30], ["VIP", "REGULAR", "VIP"], 2
    )).toThrow("Sobran tipos de pase de visitantes");
  });
});




