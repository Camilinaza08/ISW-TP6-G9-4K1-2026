require('dotenv').config();

const express = require('express');
const {
  obtenerFormasPago,
  obtenerTiposPase,
  obtenerReglasCalendario,
  comprarEntradas,
  confirmarCompra,
  obtenerCompraPorId,
  actualizarCompra,
} = require('./services/ticket/ticket.service');
const {
  crearPreferencia,
  consultarEstadoPago,
} = require('./services/mercadopago/mercadopago.service');
const { validarSesion } = require('./services/sesion/sesion.service');

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

    const resultadoCompra = comprarEntradas(sesion.usuario, datosCompra);

    return res.status(200).json(resultadoCompra);
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message,
    });
  }
});

app.post('/api/confirmacion', async (req, res) => {
  try {
    const { sesion, datosCompra } = req.body;

    await validarSesion(sesion);

    const compraConfirmada = await confirmarCompra(datosCompra);

    let urlRedireccion = null;
    let estadoPago = 'no_aplica';
    let estadoCompra = 'confirmada';

    // Gestionar según la forma de pago
    if (compraConfirmada.formaDePago === 'Efectivo') {
      urlRedireccion = `/compra/confirmacion/${compraConfirmada.id}`;
      estadoPago = 'no_aplica';
      estadoCompra = 'confirmada';
    } else if (compraConfirmada.formaDePago === 'Mercado Pago') {
      // Llamar al método creado en el servicio de Mercado Pago para obtener el init_point
      urlRedireccion = await crearPreferencia(compraConfirmada);
      estadoPago = 'pending';
      estadoCompra = 'pendiente';
    }

    actualizarCompra(compraConfirmada.id, { estadoCompra, estadoPago });

    return res.status(200).json({
      ...compraConfirmada,
      estadoCompra,
      estadoPago,
      urlRedireccion,
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
    let compra = obtenerCompraPorId(id);

    if (!compra) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    let urlRedireccion = `/compra/confirmacion/${compra.id}`;

    // Si la forma de pago es Mercado Pago y aún está pendiente, consultamos su estado
    if (
      compra.formaDePago === 'Mercado Pago' &&
      compra.estadoPago === 'pending'
    ) {
      const estadoMP = await consultarEstadoPago(compra.id);
      if (estadoMP) {
        compra.estadoPago = estadoMP.estadoPago; // 'approved', 'rejected', etc.

        console.log(
          `Estado del pago para la compra ${compra.id}:`,
          estadoMP.estadoPago,
        );

        if (estadoMP.estadoPago === 'approved') {
          compra.estadoCompra = 'confirmada';
          urlRedireccion = `/pago/resultado/${compra.id}`;

          actualizarCompra(compra.id, {
            estadoCompra: 'confirmada',
            estadoPago: 'approved',
          });
        }
      }
    } else if (
      compra.formaDePago === 'Mercado Pago' &&
      compra.estadoPago === 'approved'
    ) {
      urlRedireccion = `/pago/resultado/${compra.id}`;
      actualizarCompra(compra.id, {
        estadoCompra: 'confirmada',
        estadoPago: 'approved',
      });
    }

    return res.status(200).json({
      compra,
      urlRedireccion,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message,
    });
  }
});

console.log(
  'Token cargado:',
  process.env.MP_ACCESS_TOKEN ? 'Sí (OK)' : 'No (Undefined)',
  'Base URL cargada:',
  process.env.BASE_URL,
);

module.exports = app;
