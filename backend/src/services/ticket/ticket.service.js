const { validarUsuario, validarFecha, validarAperturaParque, validarCantidadEntradas, validarCamposObligatorios,
  calcularMonto, validarFormaPago} = require('./ticket.validator');
const { FORMAS_PAGO } = require('./formasPago.mock');
const { TIPOS_PASE } = require('./tiposPase.mock');
const { REGLAS_CALENDARIO } = require('./calendario.mock');

function comprarEntradas(usuario, datosCompra) {
  validarUsuario(usuario);
  validarFecha(datosCompra.fechaVisita);
  validarAperturaParque(datosCompra.fechaVisita);
  validarCantidadEntradas(datosCompra.cantidadEntradas);
  validarCamposObligatorios(
    datosCompra.edadesVisitantes,
    datosCompra.tipoPase,
    datosCompra.cantidadEntradas
  );

  const montoTotal = calcularMonto(datosCompra.edadesVisitantes, datosCompra.tipoPase);
  const compra = {
    ...datosCompra,
    cliente: usuario,
    montoTotal: montoTotal,
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

async function confirmarCompra(datosCompra, formaPago) {
  validarFormaPago(formaPago);

  const compra = { ...datosCompra };

   if (formaPago === "Efectivo") {
        compra.estadoCompra = "pendiente";
        compra.estadoPago = "pendiente";
    }else if (formaPago === "Mercado Pago") {
        compra.estadoCompra = "pendiente";
        compra.estadoPago = "pending";
    }

    compra.formaPago = formaPago;
  // TODO: persistir mediante el Repository

  return compra;
}

module.exports = {
  comprarEntradas,
  obtenerFormasPago,
  obtenerTiposPase,
  obtenerReglasCalendario,
  confirmarCompra
};


