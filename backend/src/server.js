const express = require('express');
const {
  obtenerFormasPago,
  obtenerTiposPase,
} = require('./services/ticket/ticket.service');

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

module.exports = app;

