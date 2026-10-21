const { validarUsuario, validarFecha, validarAperturaParque, validarCantidadEntradas, validarCamposObligatorios,
  calcularMonto, validarFormaPago, validarLimiteAcumulado} = require('./ticket.validator');
const { FORMAS_PAGO } = require('./formasPago.mock');
const { TIPOS_PASE } = require('./tiposPase.mock');
const { REGLAS_CALENDARIO } = require('./calendario.mock');
const CompraRepository = require("../repository/compraRepository");
const { enviarMailConfirmacion } = require("../mail/mail.service");
const path = require("node:path");

const rutaArchivo = path.join(__dirname, "../../data/compras.json");
const repository = new CompraRepository(rutaArchivo);

async function comprarEntradas(usuario, datosCompra) {
    validarUsuario(usuario);
    validarFecha(datosCompra.fechaVisita);
    validarAperturaParque(datosCompra.fechaVisita);
    validarCantidadEntradas(datosCompra.cantidadEntradas);

    validarCamposObligatorios(
        datosCompra.edadesVisitantes,
        datosCompra.tipoPase,
        datosCompra.cantidadEntradas
    );

    const entradasAcumuladas = await repository.obtenerEntradasAcumuladas(
        usuario.id,
        datosCompra.fechaVisita
    );

    validarLimiteAcumulado(
        entradasAcumuladas,
        datosCompra.cantidadEntradas
    );

    const montoTotal = calcularMonto(
        datosCompra.edadesVisitantes,
        datosCompra.tipoPase
    );

    const compra = {
        ...datosCompra,
        cliente: usuario,
        montoTotal: montoTotal
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

const ESTADOS_INICIALES_PAGO = {
    "Efectivo": {
        estadoCompra: "pendiente",
        estadoPago: "pendiente"
    },
    "Mercado Pago": {
        estadoCompra: "pendiente",
        estadoPago: "pending"
    }
};



async function confirmarCompra(compra, formaPago) {
    validarFormaPago(formaPago);

    const estados = ESTADOS_INICIALES_PAGO[formaPago];

    compra.estadoCompra = estados.estadoCompra;
    compra.estadoPago = estados.estadoPago;
    compra.formaPago = formaPago;

    const compraRegistrada = await repository.guardarCompra(compra);


if (formaPago === 'Efectivo') {
  try {

    await enviarMailConfirmacion(compraRegistrada);

  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
}

return compraRegistrada;
}


module.exports = {
  comprarEntradas,
  obtenerFormasPago,
  obtenerTiposPase,
  obtenerReglasCalendario,
  confirmarCompra
};


