/* ================= Resultado de compra ================= */

const API_URL = 'http://localhost:3000';

function leerCompraConfirmada() {
  try {
    return JSON.parse(
      sessionStorage.getItem('compraConfirmada')
    );
  } catch {
    return null;
  }
}

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
    detalle.hidden = true;

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

  if (formaPago === 'Efectivo') {
    configurarEstado(
      'pendiente',
      '⏳',
      'Compra registrada',
      'Tu compra fue registrada correctamente. El pago se encuentra pendiente y deberá realizarse en la boletería del parque.'
    );

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

  } else {
    configurarEstado(
      'pendiente',
      '?',
      'Estado no disponible',
      'No se pudo determinar el estado de la operación.'
    );
  }

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

function obtenerIdCompra() {
  const parametros = new URLSearchParams(window.location.search);

  const id = parametros.get('id') ||
             parametros.get('external_reference');

  if (id && /^[1-9]\d*$/.test(id)) {
    return Number(id);
  }

  const compraGuardada = leerCompraConfirmada();

  return compraGuardada?.id ?? null;
}

async function consultarEstadoCompra(idCompra) {
  const respuesta = await fetch(
    `${API_URL}/api/pagos/${idCompra}/estado`
  );

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      resultado.error || 'No se pudo consultar el estado de la compra.'
    );
  }

  return resultado.compra;
}

async function inicializarResultado() {
  const idCompra = obtenerIdCompra();

  if (!idCompra) {
    mostrarResultado(null);
    return;
  }

  configurarEstado(
    'pendiente',
    '⏳',
    'Consultando compra',
    'Estamos verificando el estado de tu compra.'
  );

  detalle.hidden = true;

  try {
    const compra = await consultarEstadoCompra(idCompra);

    sessionStorage.setItem(
      'compraConfirmada',
      JSON.stringify(compra)
    );

    mostrarResultado(compra);

  } catch (error) {
    configurarEstado(
      'pendiente',
      '!',
      'No se pudo verificar la compra',
      error.message
    );

    detalle.hidden = true;
  }
}

inicializarResultado();