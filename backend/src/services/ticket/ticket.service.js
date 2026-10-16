const { validarUsuario } = require('./ticket.validator');
const { FORMAS_PAGO } = require('./formasPago.mock');
const { TIPOS_PASE } = require('./tiposPase.mock');
const { REGLAS_CALENDARIO } = require('./calendario.mock');

function comprarEntradas(usuario, datosCompra) {
  validarUsuario(usuario);

  const compra = {
    ...datosCompra,
    cliente: usuario,
    montoTotal: null
  };

  return compra;
}

function obtenerFormasPago() {
  return FORMAS_PAGO;
}

function obtenerTiposPase() {
  return TIPOS_PASE;
}

function obtenerReglasCalendario() {
  return REGLAS_CALENDARIO;
}

function confirmarCompra(datosCompra) {
  // TODO: validar la forma de pago
  // TODO: persistir mediante el Repository

  return datosCompra;
}

module.exports = {
  comprarEntradas,
  obtenerFormasPago,
  obtenerTiposPase,
  obtenerReglasCalendario,
  confirmarCompra
};


