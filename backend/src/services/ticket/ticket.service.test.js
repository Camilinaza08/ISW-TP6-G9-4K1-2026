const request = require('supertest');
const app = require('../../server');
const { validarUsuario, validarFecha, validarAperturaParque } = require('./ticket.validator');
const { comprarEntradas } = require('./ticket.service');
const { FORMAS_PAGO } = require('./formasPago.mock');
const { TIPOS_PASE } = require('./tiposPase.mock');
const { REGLAS_CALENDARIO } = require('./calendario.mock');

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

});




