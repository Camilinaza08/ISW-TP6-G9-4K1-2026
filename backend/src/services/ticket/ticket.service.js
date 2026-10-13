const { validarUsuario } = require('./ticket.validator');

function comprarEntradas(usuario, datosCompra) {
  validarUsuario(usuario);
}

module.exports = {
  comprarEntradas,
};
