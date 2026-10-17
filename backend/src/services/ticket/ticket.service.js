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

const compras = []; // Array para almacenar las compras temporalmente

function confirmarCompra(datosCompra) {
  // TODO: validar la forma de pago
  // TODO: persistir mediante el Repository

  const compra = { ...datosCompra, id: `COMPRA-${compras.length + 70}` }; // Asignar un ID secuencial temporalmente
  compras.push(compra);
  return compra;
}

// Función para obtener una compra por su ID
function obtenerCompraPorId(id) {
  return compras.find((c) => c.id === id);
}

// Función para actualizar el estado de una compra por su ID
function actualizarEstadoCompra(id, estadoCompra) {
  const compra = compras.find((c) => c.id === id);

  if (compra) {
    compra.estadoCompra = estadoCompra;
    // actualizar array de compras con el nuevo estado
    const index = compras.findIndex((c) => c.id === id);
    if (index !== -1) {
      compras[index] = compra;
    }
  }
  return compra;
}

function actualizarCompra(id, nuevosDatos) {
  const compra = compras.find((c) => c.id === id);

  if (compra) {
    // actualizar array de compras con el nuevo estado
    const index = compras.findIndex((c) => c.id === id);
    if (index !== -1) {
      compras[index] = { ...compra, ...nuevosDatos };
    }
  }
  return compra;
}

module.exports = {
  comprarEntradas,
  obtenerFormasPago,
  obtenerTiposPase,
  obtenerReglasCalendario,
  confirmarCompra,
  obtenerCompraPorId,
  actualizarCompra,
};


