const request = require('supertest');
const app = require('../../server');
const { validarUsuario, validarFecha, validarAperturaParque, validarCantidadEntradas, validarCamposObligatorios, calcularMonto, validarFormaPago } = require('./ticket.validator');
const { comprarEntradas, confirmarCompra } = require('./ticket.service');
const { FORMAS_PAGO } = require('./formasPago.mock');
const { TIPOS_PASE } = require('./tiposPase.mock');
const { REGLAS_CALENDARIO } = require('./calendario.mock');
const { USUARIOS_MOCK } = require('./usuarios.mock');
const CompraRepository = require('../repository/compraRepository');

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
  beforeEach(() => {
    jest.spyOn(CompraRepository.prototype, 'obtenerEntradasAcumuladas')
      .mockResolvedValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('Test 04 - Comprar entradas con usuario no registrado', async () => {
    usuario = { id: 999, nombre: 'Usuario inexistente', email:'inexistente@example.com' };
    datosCompra = {
      fechaVisita: '2026-10-24',
      cantidadEntradas: 2,
      edadesVisitantes: [25, 23],
      tipoPase: ['REGULAR', 'REGULAR'],
    };

    await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow(
      'ERROR: Usuario no registrado',
    );
  });

  test('Test 05 - Comprar entradas con usuario registrado', async () => {
    usuario = { id: 2, nombre: 'Brisa', email: 'brisaabigaildiaz2000@gmail.com', };
    datosCompra = {
      fechaVisita: '2026-10-24',
      cantidadEntradas: 2,
      edadesVisitantes: [25, 23],
      tipoPase: ['REGULAR', 'REGULAR'],
    };

    const compra = await comprarEntradas(usuario, datosCompra);
    expect(compra).not.toBeNull();
    expect(compra.fechaVisita).toBe(datosCompra.fechaVisita);
    expect(compra.cantidadEntradas).toBe(datosCompra.cantidadEntradas);
    expect(compra.edadesVisitantes).toEqual(datosCompra.edadesVisitantes);
    expect(compra.tipoPase).toEqual(datosCompra.tipoPase);
  });

  test('Test 06 - Conservar datos del usuario en la compra', async () => {
    datosCompra = {
      fechaVisita: '2026-10-24',
      cantidadEntradas: 2,
      edadesVisitantes: [25, 23],
      tipoPase: ['REGULAR', 'REGULAR'],
    };

    const compra = await comprarEntradas(usuario, datosCompra);

    expect(compra.cliente).toEqual(usuario);
  });

  test("Test 32 - Probar comprar entradas con una fecha previa a la actual", async () => {
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
        await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Fecha previa a la actual");

    } finally {
        jest.useRealTimers();
    }
});

  test("Test 33 - Probar comprar entradas con una fecha actual", async () => {
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
        const resultado = await comprarEntradas(usuario, datosCompra);

        // ASSERT
        expect(resultado).toBeDefined();
        expect(resultado.fechaVisita).toEqual(fechaVisita);

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 34 - Probar comprar entradas con una fecha posterior a la actual", async () => {
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
        const resultado = await comprarEntradas(usuario, datosCompra);

        // ASSERT
        expect(resultado).toBeDefined();
        expect(resultado.fechaVisita).toEqual(fechaVisita);

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 35 - Probar comprar entradas sin fecha de visita", async () => {
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
        await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Debe seleccionar una fecha de visita");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 36 - Probar comprar entradas con más de 30 días de anticipación", async () => {
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
        await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow(
                "No se pueden comprar entradas con más de 30 días de anticipación"
            );

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 37 - Probar comprar entradas con una fecha en la que el parque está cerrado", async () => {
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
        await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Parque Cerrado");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 38 - Probar comprar entradas con una fecha en la que el parque está abierto", async () => {
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
        const resultado = await comprarEntradas(usuario, datosCompra);

        // ASSERT

        expect(resultado).toBeDefined();
        expect(resultado).not.toBeNull();
        expect(resultado.fechaVisita).toEqual(fechaVisita);

    } finally {
        jest.useRealTimers();
    }
});

test("Test 39 - Probar que una compra válida conserve la fecha de visita seleccionada", async () => {
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
        const resultado = await comprarEntradas(usuario, datosCompra);

        // ASSERT
        expect(resultado).toBeDefined();
        expect(resultado).not.toBeNull();
        expect(resultado.fechaVisita).toBe("2026-10-20");

    } finally {
        jest.useRealTimers();
    }
});

  test("Test 48 - Probar comprar entradas con una cantidad superior a 10", async () => {
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
        await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("No se pueden comprar más de 10 entradas");

    } finally {
        jest.useRealTimers();
    }
});

  test("Test 49 - Probar comprar exactamente 10 entradas", async () => {
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
        const resultado = await comprarEntradas(usuario, datosCompra);

        // ASSERT
        expect(resultado).toBeDefined();
        expect(resultado).not.toBeNull();
        expect(resultado.cantidadEntradas).toBe(10);

    } finally {
        jest.useRealTimers();
    }
});

  test("Test 50 - Probar comprar 0 entradas", async () => {
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
        await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Cantidad inválida");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 51 - Probar comprar entradas sin proporcionar una cantidad", async () => {
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
        await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Cantidad de entradas faltante");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 52 - Probar comprar entradas con una cantidad decimal", async () => {
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
        await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Cantidad inválida");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 53 - Probar comprar entradas con una cantidad no numérica", async () => {
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
        await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Cantidad inválida");

    } finally {
        jest.useRealTimers();
    }
  });

  test("Test 54 - Probar comprar entradas con una cantidad negativa", async () => {
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
        await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Cantidad inválida");

    } finally {
        jest.useRealTimers();
    }
});

  test("Test 68 - Probar comprar entradas sin edades ni tipos de pase", async () => {
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

      await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Datos faltantes");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 69 - Probar comprar entradas sin edades", async () => {
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

      await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Edades faltantes");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 70 - Probar comprar entradas sin tipos de pase", async () => {
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

      await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Tipos de pase faltantes");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 71 - Probar comprar entradas con menos edades que visitantes", async () => {
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

      await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Faltan edades de visitantes");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 72 - Probar comprar entradas con menos tipos de pase que visitantes", async () => {
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

      await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Faltan tipos de pase de visitantes");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 73 - Probar comprar entradas con una edad negativa", async () => {
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

      await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Edad ingresada inválida");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 74 - Probar comprar entradas con un tipo de pase no permitido", async () => {
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

      await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Tipo de pase inválido");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 75 - Probar comprar entradas con una edad ingresada como texto", async () => {
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

      await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Edad ingresada inválida");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 76 - Probar comprar entradas con una edad decimal", async () => {
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

      await expect(comprarEntradas(usuario, datosCompra)).rejects.toThrow("Edad ingresada inválida");
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 77 - Probar comprar entradas con todos los datos requeridos válidos", async () => {
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

      const resultado = await comprarEntradas(usuario, datosCompra);

      expect(resultado).toEqual({
        ...datosCompra,
        cliente: usuario,
        montoTotal: 40000,
      });
    } finally {
      jest.useRealTimers();
    }
  });

    test('Test 94 - Probar que una compra válida devuelva un monto total no nulo', async () => {
      jest.useFakeTimers();
  
      try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));
  
        const usuario = USUARIOS_MOCK[0];
  
        const datosCompra = {
          fechaVisita: '2026-10-20',
          cantidadEntradas: 1,
          edadesVisitantes: [25],
          tipoPase: ['REGULAR']
        };
  
        const resultado = await comprarEntradas(usuario, datosCompra);
  
        expect(resultado.montoTotal).not.toBeNull();
      } finally {
        jest.useRealTimers();
      }
    });

   test('Test 95 - Probar que una compra de una entrada Regular sin descuento devuelva el monto correcto', async () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: '2026-10-20',
        cantidadEntradas: 1,
        edadesVisitantes: [25],
        tipoPase: ['REGULAR']
      };

      const resultado = await comprarEntradas(usuario, datosCompra);

      expect(resultado.montoTotal).toBe(10000);
    } finally {
      jest.useRealTimers();
    }
  });

  test('Test 96 - Probar que una compra de una entrada VIP sin descuento devuelva el monto correcto', async () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: '2026-10-20',
        cantidadEntradas: 1,
        edadesVisitantes: [25],
        tipoPase: ['VIP']
      };

      const resultado = await comprarEntradas(usuario, datosCompra);

      expect(resultado.montoTotal).toBe(20000);
    } finally {
      jest.useRealTimers();
    }
  });

   test('Test 97 - Probar que una compra de una entrada Regular para un visitante de 0 a 3 años devuelva un monto total de $0', async () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: '2026-10-20',
        cantidadEntradas: 1,
        edadesVisitantes: [2],
        tipoPase: ['REGULAR']
      };

      const resultado = await comprarEntradas(usuario, datosCompra);

      expect(resultado.montoTotal).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  test('Test 98 - Probar que una compra de una entrada VIP para un visitante de 4 a 15 años devuelva el monto con descuento del 50 %', async () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: '2026-10-20',
        cantidadEntradas: 1,
        edadesVisitantes: [8],
        tipoPase: ['VIP']
      };

      const resultado = await comprarEntradas(usuario, datosCompra);

      expect(resultado.montoTotal).toBe(10000);
    } finally {
      jest.useRealTimers();
    }
  });

   test('Test 99 - Probar que una compra de una entrada Regular para un visitante de 60 años o más devuelva el monto con descuento del 50 %', async () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: '2026-10-20',
        cantidadEntradas: 1,
        edadesVisitantes: [70],
        tipoPase: ['REGULAR']
      };

      const resultado = await comprarEntradas(usuario, datosCompra);

      expect(resultado.montoTotal).toBe(5000);
    } finally {
      jest.useRealTimers();
    }
  });

     test('Test 100 - Probar que una compra de varias entradas Regular sin descuentos devuelva el monto total acumulado', async () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: '2026-10-20',
        cantidadEntradas: 3,
        edadesVisitantes: [25, 30, 35],
        tipoPase: ['REGULAR', 'REGULAR', 'REGULAR']
      };

      const resultado = await comprarEntradas(usuario, datosCompra);

      expect(resultado.montoTotal).toBe(30000);
    } finally {
      jest.useRealTimers();
    }
  });

  test('Test 101 - Probar que una compra con diferentes grupos etarios y tipos de pase devuelva el monto total con los descuentos correspondientes', async () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: '2026-10-20',
        cantidadEntradas: 4,
        edadesVisitantes: [8, 25, 2, 70],
        tipoPase: ['REGULAR', 'VIP', 'VIP', 'REGULAR']
      };

      const resultado = await comprarEntradas(usuario, datosCompra);

      expect(resultado.montoTotal).toBe(30000);
    } finally {
      jest.useRealTimers();
    }
  });

   test('Test 102 - Probar que una compra con el máximo de 10 entradas devuelva correctamente el monto total acumulado', async () => {
    jest.useFakeTimers();

    try {
      jest.setSystemTime(new Date(2026, 9, 16, 12));

      const usuario = USUARIOS_MOCK[0];

      const datosCompra = {
        fechaVisita: '2026-10-20',
        cantidadEntradas: 10,
        edadesVisitantes: Array(10).fill(25),
        tipoPase: Array(10).fill('REGULAR')
      };

      const resultado = await comprarEntradas(usuario, datosCompra);

      expect(resultado.montoTotal).toBe(100000);
    } finally {
      jest.useRealTimers();
    }
  });

  test("Test 125 - Rechazar una compra que supere el límite acumulado", async () => {

    const usuario = USUARIOS_MOCK[0];

    const datosCompra = {
        fechaVisita: "2026-10-20",
        cantidadEntradas: 4,
        edadesVisitantes: [25, 30, 12, 40],
        tipoPase: ["REGULAR", "REGULAR", "VIP", "VIP"]
    };

    CompraRepository.prototype.obtenerEntradasAcumuladas.mockResolvedValue(7);

    await expect(
        comprarEntradas(usuario, datosCompra)
    ).rejects.toThrow(
        "Se ha superado el límite de 10 entradas por usuario para la fecha seleccionada"
    );

});

test("Test 126 - Permitir una compra que alcance exactamente el límite acumulado", async () => {

    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: "2026-10-20",
            cantidadEntradas: 3,
            edadesVisitantes: [25, 30, 12],
            tipoPase: ["REGULAR", "VIP", "REGULAR"]
        };

        CompraRepository.prototype.obtenerEntradasAcumuladas
            .mockResolvedValue(7);

        // ACT
        const resultado = await comprarEntradas(usuario, datosCompra);

        // ASSERT
        expect(resultado).toBeDefined();
        expect(resultado).not.toBeNull();
        expect(resultado.cantidadEntradas).toBe(3);

    } finally {
        jest.useRealTimers();
    }

});

test("Test 127 - Impedir la compra cuando falla la consulta de entradas acumuladas", async () => {

    // ARRANGE
    jest.useFakeTimers();

    try {
        jest.setSystemTime(new Date(2026, 9, 16, 12));

        const usuario = USUARIOS_MOCK[0];

        const datosCompra = {
            fechaVisita: "2026-10-20",
            cantidadEntradas: 3,
            edadesVisitantes: [25, 30, 12],
            tipoPase: ["REGULAR", "VIP", "REGULAR"]
        };

        CompraRepository.prototype.obtenerEntradasAcumuladas
            .mockRejectedValue(
                new Error("Error al consultar las entradas acumuladas")
            );

        // ACT Y ASSERT
        await expect(
            comprarEntradas(usuario, datosCompra)
        ).rejects.toThrow(
            "Error al consultar las entradas acumuladas"
        );

    } finally {
        jest.useRealTimers();
    }

});

});


describe('calcularMonto', () => {
  test('Test 78 - Probar cálculo del monto de una entrada Regular', () => {
    expect(calcularMonto([25], ['REGULAR'])).toBe(10000);
  });

  test('Test 79 - Probar cálculo del monto de una entrada VIP', () => {
    expect(calcularMonto([25], ['VIP'])).toBe(20000);
  });

  test('Test 80 - Probar cálculo del monto de varias entradas Regular', () => {
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

  test('Test 82 - Probar cálculo del monto de una compra con entradas VIP y Regular', () => {
    expect(calcularMonto(
      [25, 30, 35],
      ['VIP', 'REGULAR', 'VIP']
    )).toBe(50000);
  });

  test('Test 83 - Probar cálculo del monto de una entrada Regular para un visitante de 0 a 3 años', () => {
    expect(calcularMonto([2], ['REGULAR'])).toBe(0);
  });

  test('Test 84 - Probar cálculo del monto de una entrada VIP para un visitante de 0 a 3 años', () => {
    expect(calcularMonto([2], ['VIP'])).toBe(0);
  });

  test('Test 85 - Probar cálculo del monto de una entrada Regular para un visitante de 4 a 15 años', () => {
    expect(calcularMonto([8], ['REGULAR'])).toBe(5000);
  });

  test('Test 86 - Probar cálculo del monto de una entrada VIP para un visitante de 4 a 15 años', () => {
    expect(calcularMonto([8], ['VIP'])).toBe(10000);
  });

  test('Test 87 - Probar cálculo del monto de una entrada Regular para un visitante de 16 a 59 años', () => {
    expect(calcularMonto([25], ['REGULAR'])).toBe(10000);
  });

  test('Test 88 - Probar cálculo del monto de una entrada VIP para un visitante de 16 a 59 años', () => {
    expect(calcularMonto([25], ['VIP'])).toBe(20000);
  });

  test('Test 89 - Probar cálculo del monto de una entrada Regular para un visitante de 60 años o más', () => {
    expect(calcularMonto([70], ['REGULAR'])).toBe(5000);
  });

  test('Test 90 - Probar cálculo del monto de una entrada VIP para un visitante de 60 años o más', () => {
    expect(calcularMonto([70], ['VIP'])).toBe(10000);
  });

  test('Test 91 - Probar cálculo del monto con diferentes grupos etarios y tipos de pase combinados', () => {
    expect(calcularMonto(
      [8, 25, 2, 70],
      ['REGULAR', 'VIP', 'VIP', 'REGULAR']
    )).toBe(30000);
  });

  test('Test 92 - Probar cálculo del monto de una compra con el máximo de 10 entradas', () => {
    const edades = Array(10).fill(25);
    const tiposPase = Array(10).fill('REGULAR');

    expect(calcularMonto(edades, tiposPase)).toBe(100000);
  });

  test.each([
    [3, 0],
    [4, 5000],
    [15, 5000],
    [16, 10000],
    [59, 10000],
    [60, 5000]
  ])(
    'Test 93 - Probar cálculo del monto en los valores límite de los grupos etarios - %i años',
    (edad, montoEsperado) => {
      expect(calcularMonto([edad], ['REGULAR']))
        .toBe(montoEsperado);
    }
  );

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

describe('validarFormaPago', () => {
  test('Test 103 - Probar validador de forma de pago seleccionando una opción inválida', () => {
    expect(() => {
      validarFormaPago('Transferencia');
    }).toThrow('Forma de pago inválida');
  });

  test('Test 104 - Probar validador de forma de pago sin seleccionar una opción', () => {
    expect(() => {
      validarFormaPago(null);
    }).toThrow('Forma de pago faltante');
  });

  test('Test 105 - Probar validador de forma de pago seleccionando Efectivo', () => {
    expect(validarFormaPago('Efectivo')).toBe(true);
  });

  test('Test 106 - Probar validador de forma de pago seleccionando Mercado Pago', () => {
    expect(validarFormaPago('Mercado Pago')).toBe(true);
  });

});

describe('confirmarCompra', () => {
   beforeEach(() => {
        jest.spyOn(
            CompraRepository.prototype,
            "guardarCompra"
        ).mockImplementation(async (compra) => compra);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });
  test("Test 107 - Confirmar una compra sin seleccionar una forma de pago", async () => {
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

        const compra = comprarEntradas(usuario, datosCompra);

        // ACT Y ASSERT
        await expect(
            confirmarCompra(compra, null)
        ).rejects.toThrow("Forma de pago faltante");

    } finally {
        jest.useRealTimers();
    }
});

  test("Test 108 - Confirmar una compra seleccionando una forma de pago inválida", async () => {
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

        const compra = await comprarEntradas(usuario, datosCompra);

        const compraOriginal = structuredClone(compra);

        // ACT Y ASSERT
        await expect(
            confirmarCompra(compra, "Transferencia")
        ).rejects.toThrow("Forma de pago inválida");

        expect(compra).toEqual(compraOriginal);
        expect(compra.estadoCompra).toBeUndefined();
        expect(compra.estadoPago).toBeUndefined();

    } finally {
        jest.useRealTimers();
    }
});

test("Test 109 - Confirmar una compra seleccionando Efectivo", async () => {
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

        const compra = await comprarEntradas(usuario, datosCompra);

        // ACT
        const resultado = await confirmarCompra(compra, "Efectivo");

        // ASSERT
        expect(resultado).toEqual(
            expect.objectContaining({
                formaPago: "Efectivo",
                estadoCompra: "pendiente",
                estadoPago: "pendiente"
            })
        );

    } finally {
        jest.useRealTimers();
    }
});

test("Test 110 - Confirmar una compra seleccionando Mercado Pago", async () => {
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

        const compra = await comprarEntradas(usuario, datosCompra);

        expect(compra.estadoCompra).toBeUndefined();
        expect(compra.estadoPago).toBeUndefined();

        // ACT
        const resultado = await confirmarCompra(compra, "Mercado Pago");

        // ASSERT
        expect(resultado).toEqual(
            expect.objectContaining({
                formaPago: "Mercado Pago",
                estadoCompra: "pendiente",
                estadoPago: "pending"
            })
        );

    } finally {
        jest.useRealTimers();
    }
});

test("Test 128 - Registrar una compra válida mediante efectivo", async () => {

    // ARRANGE
    const usuario = USUARIOS_MOCK[0];

    const compra = {
        cliente: usuario,
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        edadesVisitantes: [25, 30],
        tipoPase: ["REGULAR", "VIP"],
        montoTotal: 30000
    };

    const guardarCompraMock = jest.spyOn(
        CompraRepository.prototype,
        "guardarCompra"
    ).mockImplementation(async (compraRecibida) => ({
        ...compraRecibida,
        id: 1
    }));

    // ACT
    const resultado = await confirmarCompra(compra, "Efectivo");

    // ASSERT
    expect(guardarCompraMock).toHaveBeenCalledTimes(1);

    expect(guardarCompraMock).toHaveBeenCalledWith(
        expect.objectContaining({
            cliente: usuario,
            cantidadEntradas: 2,
            formaPago: "Efectivo",
            estadoCompra: "pendiente",
            estadoPago: "pendiente"
        })
    );

    expect(resultado).toEqual({
        ...compra,
        id: 1
    });

});

test("Test 129 - Registrar una compra válida mediante Mercado Pago", async () => {

    // ARRANGE
    const usuario = USUARIOS_MOCK[0];

    const compra = {
        cliente: usuario,
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        edadesVisitantes: [25, 30],
        tipoPase: ["REGULAR", "VIP"],
        montoTotal: 30000
    };

    const guardarCompraMock =
        CompraRepository.prototype.guardarCompra;

    guardarCompraMock.mockImplementation(async (compraRecibida) => ({
        ...compraRecibida,
        id: 1
    }));

    // ACT
    const resultado = await confirmarCompra(
        compra,
        "Mercado Pago"
    );

    // ASSERT
    expect(guardarCompraMock).toHaveBeenCalledTimes(1);

    expect(guardarCompraMock).toHaveBeenCalledWith(
        expect.objectContaining({
            cliente: usuario,
            fechaVisita: "2026-10-20",
            cantidadEntradas: 2,
            formaPago: "Mercado Pago",
            estadoCompra: "pendiente",
            estadoPago: "pending"
        })
    );

    expect(resultado).toEqual({
        ...compra,
        id: 1
    });

});

})





