const express = require('express');
const {
  obtenerFormasPago,
  obtenerTiposPase,
  obtenerReglasCalendario,
  comprarEntradas,
  confirmarCompra
} = require('./services/ticket/ticket.service');

const {
  validarSesion,
} = require('./services/sesion/sesion.service');

const app = express();

app.use(express.json());

app.get('/api/formas-pago', (req, res) => {
  const formasPago = obtenerFormasPago();
  res.status(200).json(formasPago);
});

app.get('/api/tipos-pase', (req, res) => {
  const tiposPase = obtenerTiposPase();
  res.status(200).json(tiposPase);
});

app.get('/api/calendario/reglas', (req, res) => {
  const reglas = obtenerReglasCalendario();
  res.status(200).json(reglas);
});

app.post('/api/compra', async (req, res) => {
  try {
    const { sesion, datosCompra } = req.body;

    await validarSesion(sesion);

    const resultadoCompra = comprarEntradas(
      sesion.usuario,
      datosCompra
    );

    return res.status(200).json(resultadoCompra);

  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message
    });
  }
});

app.post('/api/confirmacion', async (req, res) => {
  try {
    const { sesion, datosCompra } = req.body;

    await validarSesion(sesion);

    const compraConfirmada = await confirmarCompra(datosCompra);

    // TODO: gestionar la URL según la forma de pago
    // Efectivo -> URL interna de confirmación
    // Mercado Pago -> crear preferencia y obtener init_point

    return res.status(200).json({
      ...compraConfirmada,
      urlRedireccion: null,
    });

  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message,
    });
  }
});

app.get('/api/pagos/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: recuperar la compra persistida mediante el Repository
    const compra = null;

    // TODO: verificar la forma de pago
    // Efectivo -> devolver los datos y la URL interna
    // Mercado Pago -> consultar el estado del pago,
    // actualizar la persistencia cuando corresponda

    return res.status(200).json({
      compra,
      urlRedireccion: null,
    });

  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message,
    });
  }
});

module.exports = app;


