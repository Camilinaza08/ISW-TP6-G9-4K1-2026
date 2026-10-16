// Calendario compartido por las páginas de compra y de alimentación.
// Requiere el marcado .calendar con los ids cal-* en la página.

// Valores por defecto (iguales al mock del backend) por si la API no responde
let reglasCalendario = {
  diasCerradosSemana: [1],
  fechasCerradasFijas: [
    { dia: 25, mes: 12, motivo: 'Navidad' },
    { dia: 1, mes: 1, motivo: 'Año Nuevo' },
  ],
};

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);
const fechaMaxima = new Date(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());

const mismaFecha = (a, b) => Boolean(a && b) && a.getTime() === b.getTime();
const aISO = (f) => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;

function fechaHabilitada(fecha) {
  if (fecha < hoy || fecha > fechaMaxima) return false;
  if (reglasCalendario.diasCerradosSemana.includes(fecha.getDay())) return false;
  return !reglasCalendario.fechasCerradasFijas.some(
    (f) => f.dia === fecha.getDate() && f.mes === fecha.getMonth() + 1
  );
}

/**
 * @param {object} opciones
 * @param {Date|null} [opciones.fechaInicial]
 * @param {(fecha: Date|null) => void} [opciones.alCambiar]  al elegir o limpiar una fecha
 * @param {() => void} [opciones.alAceptar]                  botón OK
 * @param {() => void} [opciones.alCancelar]                 botón Cancelar
 */
function iniciarCalendario({ fechaInicial = null, alCambiar, alAceptar, alCancelar } = {}) {
  const elDias = document.getElementById('cal-days');
  const elMes = document.getElementById('cal-month');
  const elSeleccion = document.getElementById('cal-selected');
  const btnPrev = document.getElementById('cal-prev');
  const btnNext = document.getElementById('cal-next');

  let seleccionada = fechaInicial;
  let mesVisible = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  function render() {
    elMes.textContent = mesVisible.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    elSeleccion.textContent = seleccionada
      ? seleccionada.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
      : 'Sin fecha';

    btnPrev.disabled = mesVisible <= new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    btnNext.disabled = mesVisible >= new Date(fechaMaxima.getFullYear(), fechaMaxima.getMonth(), 1);

    elDias.innerHTML = '';
    for (let i = 0; i < mesVisible.getDay(); i++) elDias.appendChild(document.createElement('span'));

    const diasEnMes = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= diasEnMes; d++) {
      const fecha = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), d);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day';
      btn.textContent = d;
      btn.disabled = !fechaHabilitada(fecha);
      if (mismaFecha(fecha, hoy)) btn.classList.add('day--today');
      if (mismaFecha(fecha, seleccionada)) btn.classList.add('day--selected');
      btn.addEventListener('click', () => {
        seleccionada = fecha;
        render();
        alCambiar?.(fecha);
      });
      elDias.appendChild(btn);
    }
  }

  btnPrev.addEventListener('click', () => {
    mesVisible = new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1);
    render();
  });
  btnNext.addEventListener('click', () => {
    mesVisible = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1);
    render();
  });
  document.getElementById('cal-clear').addEventListener('click', () => {
    seleccionada = null;
    render();
    alCambiar?.(null);
  });
  document.getElementById('cal-cancel').addEventListener('click', () => alCancelar?.());
  document.getElementById('cal-ok').addEventListener('click', () => alAceptar?.());

  render();
  return { render, getFecha: () => seleccionada };
}
