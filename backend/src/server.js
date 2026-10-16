const express = require('express');
const {
  obtenerFormasPago,
  obtenerTiposPase,
  obtenerReglasCalendario,
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

app.get('/api/calendario/reglas', (req, res) => {
  const reglas = obtenerReglasCalendario();
  res.status(200).json(reglas);
});

module.exports = app;


