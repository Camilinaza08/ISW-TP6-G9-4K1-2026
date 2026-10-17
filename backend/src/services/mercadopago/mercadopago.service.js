const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Inicializar cliente con el Access Token de prueba
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

/**
 * 1. Crear preferencia de pago para Checkout Pro
 * @param {Object} compra - Datos de la compra ya persistida
 * @returns {Promise<string>} init_point (URL de redirección)
 */
async function crearPreferencia(compra) {
  const preference = new Preference(client);

  const body = {
    items: [
      {
        id: compra.id,
        title: `Entradas EcoHarmony Park (${compra.cantidadEntradas} pases)`,
        quantity: 1,
        unit_price: Number(compra.montoTotal),
        currency_id: 'ARS',
      },
    ],
    external_reference: compra.id,
    back_urls: {
      success: `${process.env.BASE_URL}/pago/resultado/${compra.id}`,
      failure: `${process.env.BASE_URL}/pago/resultado/${compra.id}`,
      pending: `${process.env.BASE_URL}/pago/resultado/${compra.id}`,
    },
  };

  const response = await preference.create({ body });
  return response.init_point || response.sandbox_init_point;
}

/**
 * 2. Consultar estado del pago por external_reference (ID de la compra)
 * @param {string} idCompra - ID de la compra registrada
 * @returns {Promise<Object|null>} Datos del pago encontrado
 */
async function consultarEstadoPago(idCompra) {
  const payment = new Payment(client);

  // Buscar pagos generados con este external_reference
  const resultado = await payment.search({
    options: {
      external_reference: idCompra,
    },
  });

  console.log(`Resultado de la búsqueda de pagos para ${idCompra}:`, resultado);

  if (!resultado.results || resultado.results.length === 0) {
    return null;
  }

  // Obtener el pago más reciente registrado
  const ultimoPago = resultado.results[0];

  return {
    idPago: ultimoPago.id,
    estadoPago: ultimoPago.status, // 'approved', 'pending', 'rejected', etc.
    monto: ultimoPago.transaction_amount,
    moneda: ultimoPago.currency_id,
  };
}

module.exports = {
  crearPreferencia,
  consultarEstadoPago,
};
