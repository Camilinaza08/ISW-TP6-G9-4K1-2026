const { validarUsuario } = require('./ticket.validator');

function comprarEntradas(usuario, datosCompra) {
    validarUsuario(usuario);

    const compra = {
      ...datosCompra,
      cliente: usuario,
    };

    return compra;
}

const { FORMAS_PAGO } = require('./formasPago.mock');

function obtenerFormasPago() {
  return FORMAS_PAGO;
}

module.exports = {
  comprarEntradas,
  obtenerFormasPago,
};
