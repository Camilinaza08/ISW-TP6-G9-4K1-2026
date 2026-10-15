const { validarUsuario } = require('./ticket.validator');
const { FORMAS_PAGO } = require('./formasPago.mock');

function comprarEntradas(usuario, datosCompra) {
  validarUsuario(usuario);

  const compra = {
    ...datosCompra,
    cliente: usuario,
  };

  return compra;
}

function obtenerFormasPago() {
  return FORMAS_PAGO;
}

module.exports = {
  comprarEntradas,
  obtenerFormasPago,
};

