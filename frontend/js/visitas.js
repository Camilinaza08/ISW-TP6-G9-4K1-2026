// TODO: reemplazar por las compras del usuario que devuelva el backend.
// Datos de ejemplo con la misma forma que la respuesta de /api/confirmacion.
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);
const enDias = (n) => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + n);

const COMPRAS = [
  {
    id: 'COMPRA-004', fecha: enDias(8), edadesVisitantes: [25, 23], tipoPase: ['COMUN', 'COMUN'],
    montoTotal: 20000, formaDePago: 'Efectivo', estadoCompra: 'confirmada',
  },
  {
    id: 'COMPRA-005', fecha: enDias(15), edadesVisitantes: [34, 10, 2], tipoPase: ['VIP', 'VIP', 'COMUN'],
    montoTotal: 30000, formaDePago: 'Mercado Pago', estadoCompra: 'confirmada',
  },
  {
    id: 'COMPRA-002', fecha: enDias(-20), edadesVisitantes: [25, 23], tipoPase: ['COMUN', 'VIP'],
    montoTotal: 30000, formaDePago: 'Mercado Pago', estadoCompra: 'confirmada',
  },
  {
    id: 'COMPRA-001', fecha: enDias(-75), edadesVisitantes: [25], tipoPase: ['COMUN'],
    montoTotal: 10000, formaDePago: 'Efectivo', estadoCompra: 'confirmada',
  },
];

const NOMBRE_PASE = { COMUN: 'Normal', VIP: 'VIP' };
const formatoPrecio = (n) => `$${n.toLocaleString('es-AR')}`;

function tarjetaVisita(compra, pasada) {
  const { fecha } = compra;
  const cantidad = compra.edadesVisitantes.length;
  // Efectivo: se abona en boletería el día de la visita.
  // Mercado Pago: se abona online al comprar, así que solo llegan acá las ya pagadas.
  const estado = pasada
    ? { clase: 'usada', texto: 'Utilizada' }
    : compra.formaDePago === 'Efectivo'
      ? { clase: 'pendiente', texto: 'Se abona en boletería' }
      : { clase: 'confirmada', texto: 'Pagada' };

  const entradas = compra.edadesVisitantes
    .map((edad, i) => `<li>${NOMBRE_PASE[compra.tipoPase[i]]} · ${edad} ${edad === 1 ? 'año' : 'años'}</li>`)
    .join('');

  return `
    <article class="visit ${pasada ? 'visit--pasada' : ''}">
      <div class="visit__date">
        <span class="visit__day">${fecha.getDate()}</span>
        <span class="visit__month">${fecha.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')}</span>
        <span class="visit__weekday">${fecha.toLocaleDateString('es-AR', { weekday: 'long' })}</span>
      </div>
      <div>
        <h2 class="visit__title">${cantidad} ${cantidad === 1 ? 'entrada' : 'entradas'} · ${fecha.getFullYear()}</h2>
        <p class="visit__meta">
          <span>N.º ${compra.id}</span>
          <span>Pago: ${compra.formaDePago}</span>
        </p>
        <ul class="visit__tickets">${entradas}</ul>
      </div>
      <div class="visit__side">
        <span class="estado estado--${estado.clase}">${estado.texto}</span>
        <span class="visit__amount">${formatoPrecio(compra.montoTotal)}</span>
      </div>
    </article>`;
}

function vacio(texto, conBoton) {
  return `
    <div class="visit-empty">
      <p>${texto}</p>
      ${conBoton ? '<a href="compra.html" class="btn btn--primary">Comprar entradas <span class="btn__arrow">↗</span></a>' : ''}
    </div>`;
}

// Una compra con Mercado Pago cuyo pago no se aprobó no es una compra concretada
const esValida = (c) => c.formaDePago === 'Efectivo' || c.estadoCompra === 'confirmada';

function render() {
  const validas = COMPRAS.filter(esValida);
  const proximas = validas.filter((c) => c.fecha >= hoy).sort((a, b) => a.fecha - b.fecha);
  const anteriores = validas.filter((c) => c.fecha < hoy).sort((a, b) => b.fecha - a.fecha);

  document.getElementById('count-proximas').textContent = proximas.length;
  document.getElementById('count-anteriores').textContent = anteriores.length;

  document.getElementById('panel-proximas').innerHTML = proximas.length
    ? proximas.map((c) => tarjetaVisita(c, false)).join('')
    : vacio('Todavía no tenés entradas para los próximos días.', true);

  document.getElementById('panel-anteriores').innerHTML = anteriores.length
    ? anteriores.map((c) => tarjetaVisita(c, true)).join('')
    : vacio('Todavía no visitaste el parque.', false);
}

// Pestañas
const tabs = document.querySelectorAll('.tab');
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      const activa = t === tab;
      t.classList.toggle('is-active', activa);
      t.setAttribute('aria-selected', activa);
      document.getElementById(t.getAttribute('aria-controls')).hidden = !activa;
    });
  });
});

render();
