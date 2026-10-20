
/* ================= Resultado de compra ================= */

function leerCompraConfirmada() {
  try {
    return JSON.parse(
      sessionStorage.getItem('compraConfirmada')
    );
  } catch {
    return null;
  }
}

const compra = leerCompraConfirmada();

const tarjeta = document.querySelector('.resultado__tarjeta');
const icono = document.getElementById('resultado-icono');
const titulo = document.getElementById('resultado-titulo');
const descripcion = document.getElementById('resultado-descripcion');
const detalle = document.getElementById('resultado-detalle');

const formatoPrecio = (monto) =>
  `$${Number(monto).toLocaleString('es-AR')}`;

function formatoFecha(fechaISO) {
  if (!fechaISO) return '-';

  const partes = fechaISO.split('-');

  if (partes.length !== 3) return fechaISO;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Traduce los estados para mostrarlos al usuario.
// No modifica los valores originales del backend.
function formatearEstado(estado) {
  const estados = {
    pendiente: 'Pendiente',
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    confirmada: 'Confirmada',
    cancelada: 'Cancelada'
  };

  return estados[estado] || estado || '-';
}

function configurarEstado(estado, simbolo, encabezado, mensaje) {
  tarjeta.classList.remove(
    'resultado__tarjeta--aprobado',
    'resultado__tarjeta--pendiente',
    'resultado__tarjeta--rechazado'
  );

  tarjeta.classList.add(`resultado__tarjeta--${estado}`);

  icono.textContent = simbolo;
  titulo.textContent = encabezado;
  descripcion.textContent = mensaje;
}

function mostrarResultado(compra) {
  if (!compra) {
    configurarEstado(
      'rechazado',
      '!',
      'No se encontró una compra',
      'No hay información de una compra registrada para mostrar.'
    );
    return;
  }

  const formaPago = compra.formaPago;
  const estadoPago = compra.estadoPago;

  // ===== Pago en Efectivo =====
  if (formaPago === 'Efectivo') {
    configurarEstado(
      'pendiente',
      '⏳',
      'Compra registrada',
      'Tu compra fue registrada correctamente. El pago se encuentra pendiente y deberá realizarse en la boletería del parque.'
    );

  // ===== Mercado Pago: Aprobado =====
  } else if (
    formaPago === 'Mercado Pago' &&
    estadoPago === 'approved'
  ) {
    configurarEstado(
      'aprobado',
      '✓',
      'Pago aprobado',
      'Tu pago fue aprobado correctamente.'
    );

  // ===== Mercado Pago: Pendiente =====
  } else if (
    formaPago === 'Mercado Pago' &&
    estadoPago === 'pending'
  ) {
    configurarEstado(
      'pendiente',
      '⏳',
      'Pago pendiente',
      'Estamos esperando la confirmación del pago.'
    );

  // ===== Mercado Pago: Rechazado =====
  } else if (
    formaPago === 'Mercado Pago' &&
    estadoPago === 'rejected'
  ) {
    configurarEstado(
      'rechazado',
      '✕',
      'Pago rechazado',
      'El pago no pudo completarse.'
    );

  // ===== Estado desconocido =====
  } else {
    configurarEstado(
      'pendiente',
      '?',
      'Estado no disponible',
      'No se pudo determinar el estado de la operación.'
    );
  }

  // ===== Detalle de la compra =====
  document.getElementById('resultado-id').textContent =
    compra.id ?? '-';

  document.getElementById('resultado-fecha').textContent =
    formatoFecha(compra.fechaVisita);

  document.getElementById('resultado-cantidad').textContent =
    compra.cantidadEntradas ?? '-';

  document.getElementById('resultado-forma-pago').textContent =
    formaPago ?? '-';

  document.getElementById('resultado-estado-compra').textContent =
    formatearEstado(compra.estadoCompra);

  document.getElementById('resultado-estado-pago').textContent =
    formatearEstado(estadoPago);

  document.getElementById('resultado-monto').textContent =
    Number.isFinite(Number(compra.montoTotal)) &&
    compra.montoTotal != null
      ? formatoPrecio(compra.montoTotal)
      : '-';

  detalle.hidden = false;
}

mostrarResultado(compra);
