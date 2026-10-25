const express = require('express');
const cors = require('cors');
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


const {
    crearClientesMercadoPago
} = require("./services/mercadopago/mercadopago.client");

const {
    iniciarPagoMercadoPago,
    consultarEstadoCompraMP
} = require("./services/mercadopago/mercadopago.service");


const app = express();

app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'https://machinist-herbs-unbeaten.ngrok-free.dev'
    ]
}));

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

        const sesionNormalizada = sesion
            ? {
                ...sesion,
                fechaHoraInicio: new Date(sesion.fechaHoraInicio)
            }
            : null;

         validarSesion(sesionNormalizada);

        const resultadoCompra = await comprarEntradas(
            sesionNormalizada.usuario,
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
        const { sesion, compra, formaPago } = req.body;

        const sesionNormalizada = sesion
            ? {
                ...sesion,
                fechaHoraInicio: new Date(sesion.fechaHoraInicio)
            }
            : null;

        await validarSesion(sesionNormalizada);

        const compraConfirmada = await confirmarCompra(
            compra,
            formaPago
        );

        let urlRedireccion = null;
        let idPreferencia = null;

        if (formaPago === 'Efectivo') {
            urlRedireccion = 'resultado.html';
        }

        if (formaPago === 'Mercado Pago') {
            const { preferencias } = crearClientesMercadoPago(
                process.env.MP_ACCESS_TOKEN
            );

            const resultadoPago = await iniciarPagoMercadoPago(
                compraConfirmada,
                preferencias
            );

            idPreferencia = resultadoPago.idPreferencia;
            urlRedireccion = resultadoPago.urlRedireccion;
        }

        return res.status(200).json({
            ...compraConfirmada,
            ...(formaPago === 'Mercado Pago'
                ? { idPreferencia }
                : {}),
            urlRedireccion
        });

    } catch (error) {
        return res.status(error.statusCode || 400).json({
            error: error.message
        });
    }
});

app.get('/api/pagos/:id/estado', async (req, res) => {
    try {
        const idCompra = Number(req.params.id);

        if (!Number.isSafeInteger(idCompra) || idCompra <= 0) {
            return res.status(400).json({
                error: "Identificador de compra inválido"
            });
        }

        const { pagos } = crearClientesMercadoPago(
            process.env.MP_ACCESS_TOKEN
        );

        const compra = await consultarEstadoCompraMP(
            idCompra,
            pagos
        );

        return res.status(200).json({
            compra,
            urlRedireccion: null
        });

    } catch (error) {
        return res.status(error.statusCode || 400).json({
            error: error.message
        });
    }
});

module.exports = app;


