const { validarUsuario } = require('./ticket.validator');
const { comprarEntradas } = require('./ticket.service');

describe('validarUsuario', () => {
  test('Test 01 - Probar validar usuario con un usuario no registrado', () => {
    const usuario = {
      id: 999,
      nombre: 'Usuario inexistente',
    };

    expect(() => validarUsuario(usuario)).toThrow(
      'ERROR: Usuario no registrado',
    );
  });

  test('Test 02 - Probar validar usuario con un usuario registrado', () => {
    const usuario = {
      id: 2,
      nombre: 'Brisa',
    };
    expect(() => validarUsuario(usuario)).not.toThrow();
    expect(validarUsuario(usuario)).toBe(true);
  });

  test('Test 03: Probar validar usuario sin proporcionar un usuario', () => {
    expect(() => validarUsuario()).toThrow('ERROR: Usuario no registrado');
  });
});

describe('validarCompra', () => {
  test('Test 04 - Comprar entradas con usuario no registrado', () => {
    usuario = { id: 999, nombre: 'Usuario inexistente' };
    datosCompra = {
      fechaVisita: '2026-10-24',
      cantidadEntradas: 2,
      edadesVisitantes: [25, 23],
      tipoPase: ['General', 'General'],
      formaPago: 'Mercado Pago',
    };

    expect(() => comprarEntradas(usuario, datosCompra)).toThrow(
      'ERROR: Usuario no registrado',
    );
  });

  test('Test 05 - Comprar entradas con usuario registrado', () => {
    usuario = { id: 2, nombre: 'Brisa' };
    datosCompra = {
      fechaVisita: '2026-10-24',
      cantidadEntradas: 2,
      edadesVisitantes: [25, 23],
      tipoPase: ['General', 'General'],
      formaPago: 'Mercado Pago',
    };

    const compra = comprarEntradas(usuario, datosCompra);
    expect(compra).not.toBeNull();
    expect(compra.fechaVisita).toBe(datosCompra.fechaVisita);
    expect(compra.cantidadEntradas).toBe(datosCompra.cantidadEntradas);
    expect(compra.edadesVisitantes).toEqual(datosCompra.edadesVisitantes);
    expect(compra.tipoPase).toEqual(datosCompra.tipoPase);
    expect(compra.formaPago).toBe(datosCompra.formaPago);
  });

  test('Test 06 - Conservar datos del usuario en la compra', () => {
    datosCompra = {
      fechaVisita: '2026-10-24',
      cantidadEntradas: 2,
      edadesVisitantes: [25, 23],
      tipoPase: ['General', 'General'],
      formaPago: 'Mercado Pago',
    };

    expect(comprarEntradas(usuario, datosCompra)).toEqual({
      ...datosCompra,
      cliente: usuario,
    });
  });
});

describe('obtenerFormasPago', () => {
  test('Test 07 - Obtener formas de pago', async () => {
    const request = require('supertest');
    const app = require('../../server');
    const { FORMAS_PAGO } = require('./formasPago.mock');

    const res = await request(app).get('/api/formas-pago');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(FORMAS_PAGO);
  });
});

describe('obtenerTiposPase', () => {
  test('Test 08 - Obtener tipos de pase', async () => {
    const request = require('supertest');
    const app = require('../../server');
    const { TIPOS_PASE } = require('./tiposPase.mock');

    const res = await request(app).get('/api/tipos-pase');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(TIPOS_PASE);
  });
});


