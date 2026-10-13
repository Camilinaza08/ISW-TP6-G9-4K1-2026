const { validarUsuario } = require('./ticket.validator');

function comprarEntradas(usuario, datosCompra) {
    validarUsuario(usuario);

    const compra = {
      ...datosCompra,
      cliente: usuario,
    };

    return compra;
}

module.exports = {
  comprarEntradas,
};
