// Datos de ejemplo: el mismo cronograma se repite cada día que el parque abre
const ALIMENTACIONES = [
  {
    grupo: 'JIRAFAS', hora: 15, especie: 'Jirafa', nombre: 'Melman', edad: 8,
    sector: 'Terrestres', cuidador: 'Enzo Rigonatto', imagen: 'assets/img/jirafas-alimentacion.jpg',
  },
  {
    grupo: 'CEBRAS', hora: 16, especie: 'Zebra de Grevy', nombre: 'Marty', edad: 6,
    sector: 'Terrestres', cuidador: 'Camila Linaza', imagen: 'assets/img/cebra.jpg',
  },
  {
    grupo: 'PANDAS ROJOS', hora: 17, especie: 'Panda Rojo', nombre: 'Nube', edad: 4,
    sector: 'Terrestres', cuidador: 'Enzo Rigonatto', imagen: 'assets/img/panda-rojo.jpg',
  },
];

const AVISO_MINUTOS = 60; // cuánto antes se muestra "¡Apúrate que ya comienza!"

const ICONOS = {
  hora: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  especie: '<circle cx="7" cy="9" r="1.6"/><circle cx="12" cy="6.5" r="1.6"/><circle cx="17" cy="9" r="1.6"/><path d="M12 12c-3 0-5 3-5 5s2 2.5 5 2.5 5-.5 5-2.5-2-5-5-5z"/>',
  nombre: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  edad: '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M8.5 14.5a4 4 0 0 0 7 0"/>',
  sector: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
  cuidador: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
};
const icono = (nombre) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[nombre]}</svg>`;

const elTitulo = document.getElementById('titulo-fecha');
const elLista = document.getElementById('lista-alimentacion');

function estadoAlimentacion(fecha, hora) {
  if (!mismaFecha(fecha, hoy)) return null;
  const ahora = new Date();
  const inicio = new Date(fecha);
  inicio.setHours(hora, 0, 0, 0);
  const minutosFaltan = (inicio - ahora) / 60000;
  if (minutosFaltan < 0) return 'pasada';
  if (minutosFaltan <= AVISO_MINUTOS) return 'pronto';
  return null;
}

function renderAlimentaciones(fecha) {
  if (!fecha) {
    elTitulo.textContent = 'Seleccioná una fecha en el calendario';
    elLista.innerHTML = '';
    return;
  }

  const texto = fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  elTitulo.textContent = mismaFecha(fecha, hoy) ? `Hoy ${texto}` : texto.charAt(0).toUpperCase() + texto.slice(1);

  elLista.innerHTML = ALIMENTACIONES.map((a) => {
    const estado = estadoAlimentacion(fecha, a.hora);
    const cuando = mismaFecha(fecha, hoy) ? 'Hoy' : 'A las';
    const badge = estado === 'pronto'
      ? '<p class="badge">¡Apúrate que ya comienza!</p>'
      : estado === 'pasada' ? '<p class="badge badge--fin">Ya finalizó</p>' : '';

    return `
      <article class="feeding ${estado === 'pasada' ? 'feeding--pasada' : ''}">
        <img class="feeding__img" src="${a.imagen}" alt="${a.especie} ${a.nombre}">
        <div>
          <h3 class="feeding__title">Alimentación de ${a.grupo}</h3>
          <ul class="feeding__data">
            <li>${icono('hora')} ${cuando} ${a.hora}hs.</li>
            <li>${icono('especie')} Especie: ${a.especie}</li>
            <li>${icono('nombre')} Nombre: ${a.nombre}</li>
            <li>${icono('edad')} Edad: ${a.edad} años.</li>
            <li>${icono('sector')} Sector: ${a.sector}.</li>
            <li>${icono('cuidador')} Cuidador: ${a.cuidador}</li>
          </ul>
        </div>
        ${badge}
      </article>`;
  }).join('');
}

// Arranca con hoy seleccionado si el parque abre; si no, sin fecha
const fechaInicial = fechaHabilitada(hoy) ? hoy : null;

iniciarCalendario({
  fechaInicial,
  alCambiar: renderAlimentaciones,
  alAceptar: () => elTitulo.scrollIntoView({ behavior: 'smooth' }),
  alCancelar: () => { window.location.href = 'index.html'; },
});
renderAlimentaciones(fechaInicial);
