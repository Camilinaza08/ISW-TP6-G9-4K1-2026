const { validarUsuario } = require('./ticket.validator');

function comprarEntradas(usuario, datosCompra) {
    validarUsuario(usuario);

    const compra = {
      fechaVisita: datosCompra.fechaVisita,
      cantidadEntradas: datosCompra.cantidadEntradas,
      edadesVisitantes: datosCompra.edadesVisitantes,
      tipoPase: datosCompra.tipoPase,
      formaPago: datosCompra.formaPago,
    };

    return compra;
}

module.exports = {
  comprarEntradas,
};
