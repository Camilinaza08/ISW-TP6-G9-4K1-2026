const API_URL = 'http://localhost:3000';
const MAX_ENTRADAS = 10;

// Valor por defecto (igual al mock del backend) por si la API no responde
let tiposPase = [
  { id: 'COMUN', nombre: 'Común', precioBase: 10000 },
  { id: 'VIP', nombre: 'VIP', precioBase: 20000 },
];

/* ================= Calendario ================= */
// Las entradas para el mismo día se venden hasta 1 h 30 antes del cierre (19 hs)
horaLimiteHoy = { horas: 17, minutos: 30 };
let fechaConfirmada = null; // fecha que se usa para la compra

const calendario = iniciarCalendario({
  alCambiar: (fecha) => {
    fechaConfirmada = fecha;
    ocultarMensaje();
  },
  alAceptar: () => document.querySelector('.entradas').scrollIntoView({ behavior: 'smooth' }),
  alCancelar: () => { window.location.href = 'index.html'; },
});

/* ================= Entradas ================= */
const elLista = document.getElementById('lista-entradas');
const elCantidad = document.getElementById('cantidad');
const elTotal = document.getElementById('total');
const elMensaje = document.getElementById('mensaje');

let entradas = [];

// Precio estimado según las tarifas publicadas; el monto final lo calcula el backend
function precioEntrada({ edad, tipoPase }) {
  const pase = tiposPase.find((t) => t.id === tipoPase);
  if (!pase || edad === '' || edad === null) return null;
  if (edad <= 3) return 0;
  if (edad <= 15 || edad >= 60) return pase.precioBase / 2;
  return pase.precioBase;
}

const formatoPrecio = (n) => `$${n.toLocaleString('es-AR')}`;

function renderEntradas() {
  elLista.innerHTML = '';
  entradas.forEach((entrada, i) => {
    const li = document.createElement('li');
    li.className = 'entrada';

    const opciones = tiposPase
      .map((t) => `<option value="${t.id}" ${entrada.tipoPase === t.id ? 'selected' : ''}>${t.nombre.toUpperCase()}</option>`)
      .join('');

    li.innerHTML = `
      <span class="entrada__name">Entrada ${i + 1}</span>
      <input type="number" class="entrada__edad" min="0" max="120" placeholder="Edad" aria-label="Edad de la entrada ${i + 1}" value="${entrada.edad ?? ''}">
      <select class="entrada__tipo" aria-label="Tipo de entrada ${i + 1}">
        <option value="" ${entrada.tipoPase ? '' : 'selected'} disabled>tipo de entrada</option>
        ${opciones}
      </select>
      <span class="entrada__precio"></span>
    `;

    const inputEdad = li.querySelector('.entrada__edad');
    const selectTipo = li.querySelector('.entrada__tipo');
    inputEdad.addEventListener('input', () => {
      entrada.edad = inputEdad.value === '' ? '' : Number(inputEdad.value);
      inputEdad.classList.remove('is-invalid');
      actualizarPrecios();
    });
    selectTipo.addEventListener('change', () => {
      entrada.tipoPase = selectTipo.value;
      selectTipo.classList.remove('is-invalid');
      actualizarPrecios();
    });

    elLista.appendChild(li);
  });

  actualizarPrecios();
}

function actualizarPrecios() {
  let total = 0;
  let completo = entradas.length > 0;
  elLista.querySelectorAll('.entrada__precio').forEach((el, i) => {
    const precio = precioEntrada(entradas[i]);
    el.textContent = precio === null ? '$' : formatoPrecio(precio);
    if (precio === null) completo = false;
    else total += precio;
  });
  elTotal.hidden = !completo;
  elTotal.textContent = `Total estimado: ${formatoPrecio(total)}`;
}

function setCantidad(n) {
  n = Math.max(0, Math.min(MAX_ENTRADAS, n));
  while (entradas.length < n) entradas.push({ edad: '', tipoPase: '' });
  entradas = entradas.slice(0, n);
  renderEntradas();
}

elCantidad.addEventListener('input', () => {
  const n = Number(elCantidad.value) || 0;
  if (n > MAX_ENTRADAS) elCantidad.value = MAX_ENTRADAS;
  setCantidad(n);
});

/* ================= Compra ================= */
function mostrarMensaje(texto, ok = false) {
  elMensaje.textContent = texto;
  elMensaje.classList.toggle('form-msg--ok', ok);
  elMensaje.hidden = false;
  elMensaje.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function ocultarMensaje() { elMensaje.hidden = true; }

function validarFormulario() {
  if (!fechaConfirmada) return 'Seleccioná una fecha de visita en el calendario.';
  // Por si la página quedó abierta y se pasó el horario límite
  if (!fechaHabilitada(fechaConfirmada)) {
    fechaConfirmada = null;
    calendario.render();
    return 'Las entradas para hoy se venden hasta las 17:30. Elegí otra fecha.';
  }
  if (entradas.length === 0) return 'Agregá al menos una entrada.';

  let valido = true;
  elLista.querySelectorAll('.entrada').forEach((li, i) => {
    const { edad, tipoPase } = entradas[i];
    if (edad === '' || edad < 0 || edad > 120) {
      li.querySelector('.entrada__edad').classList.add('is-invalid');
      valido = false;
    }
    if (!tipoPase) {
      li.querySelector('.entrada__tipo').classList.add('is-invalid');
      valido = false;
    }
  });
  return valido ? null : 'Completá la edad y el tipo de cada entrada.';
}

// Envía la compra al backend para validarla y calcular el monto.
// Mientras el backend no esté disponible, devuelve null y se usa el monto estimado.
async function procesarCompra(datosCompra) {
  const sesion = obtenerSesion();

  if (!sesion) {
    throw new Error('No hay una sesión activa');
  }

  const res = await fetch(`${API_URL}/api/compra`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sesion, datosCompra })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'No se pudo procesar la compra.');
  }

  return data;
}

/* ----- Modal resumen ----- */
const modal = document.getElementById('modal-resumen');
const nombrePase = (id) => (id === 'COMUN' ? 'NORMAL' : (tiposPase.find((t) => t.id === id)?.nombre || id).toUpperCase());

function abrirResumen(compra) {
  document.getElementById('resumen-fecha').textContent = fechaConfirmada.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  document.getElementById('resumen-cantidad').textContent = compra.cantidadEntradas;
  document.getElementById('resumen-lista').innerHTML = compra.edadesVisitantes
    .map((edad, i) => {
      const precio = precioEntrada({ edad, tipoPase: compra.tipoPase[i] });
      const anios = edad === 1 ? 'año' : 'años';
      return `<li><span>Entrada ${i + 1} - ${edad} ${anios} - ${nombrePase(compra.tipoPase[i])}</span><span>${formatoPrecio(precio)}</span></li>`;
    })
    .join('');
  document.getElementById('resumen-total').textContent = formatoPrecio(compra.montoTotal);
  modal.showModal();
}

document.getElementById('resumen-volver').addEventListener('click', () => modal.close());
document.getElementById('resumen-continuar').addEventListener('click', () => {
  window.location.href = 'pago.html';
});

document.getElementById('btn-comprar').addEventListener('click', async (e) => {
  const error = validarFormulario();

  if (error) return mostrarMensaje(error);

  ocultarMensaje();

  const datosCompra = {
    fechaVisita: aISO(fechaConfirmada),
    cantidadEntradas: entradas.length,
    edadesVisitantes: entradas.map((en) => en.edad),
    tipoPase: entradas.map((en) => en.tipoPase),
  };

  const boton = e.currentTarget;
  boton.disabled = true;

  try {
    const compra = await procesarCompra(datosCompra);

    sessionStorage.setItem('compraEnCurso', JSON.stringify(compra));

    abrirResumen(compra);

  } catch (err) {
    mostrarMensaje(
      err.message === 'Failed to fetch'
        ? 'No se pudo conectar con el servidor. Intentá nuevamente.'
        : err.message
    );

  } finally {
    boton.disabled = false;
  }
});

/* ================= Inicio ================= */
async function cargarDatos() {
  try {
    const [resReglas, resTipos] = await Promise.all([
      fetch(`${API_URL}/api/calendario/reglas`),
      fetch(`${API_URL}/api/tipos-pase`),
    ]);
    if (resReglas.ok) reglasCalendario = await resReglas.json();
    if (resTipos.ok) tiposPase = await resTipos.json();
  } catch {
    // Sin conexión al backend: se usan los valores por defecto
  }
  calendario.render();
  renderEntradas();
}

renderEntradas();
cargarDatos();
