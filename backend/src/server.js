const express = require('express');
const { obtenerFormasPago } = require('./services/ticket/ticket.service');

const app = express();

app.use(express.json());

app.get('/api/formas-pago', (req, res) => {
  const formasPago = obtenerFormasPago();
  res.status(200).json(formasPago);
});

module.exports = app;
