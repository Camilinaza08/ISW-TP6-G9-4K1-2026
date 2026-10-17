const { USUARIOS_MOCK } = require('../ticket/usuarios.mock');

function validarUsuario(usuario) {
  const existe = USUARIOS_MOCK.some((u) => u.id === usuario?.id);

  if (!existe) {
    throw new Error('ERROR: Usuario no registrado');
  }

  return true;
}

function normalizarFecha(fecha) {
    return new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate()
    );
}

function existeFecha(anio, mes, dia) {
    const fecha = new Date(anio, mes - 1, dia);

    return (
        fecha.getFullYear() === anio &&
        fecha.getMonth() === mes - 1 &&
        fecha.getDate() === dia
    );
}

function convertirFechaVisita(fechaVisita) {
    if (fechaVisita instanceof Date) {
        return normalizarFecha(fechaVisita);
    }

    if (
        typeof fechaVisita !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fechaVisita)
    ) {
        throw new Error("Formato de fecha inválido");
    }

    const [anio, mes, dia] = fechaVisita.split("-").map(Number);

    if (!existeFecha(anio, mes, dia)) {
        throw new Error("Fecha inválida");
    }

    return new Date(anio, mes - 1, dia);
}


function validarFecha(fechaVisita) {
    if (fechaVisita === null || fechaVisita === undefined) {
        throw new Error("Debe seleccionar una fecha de visita");
    }

    const fechaVisitaNormalizada = convertirFechaVisita(fechaVisita);
    const fechaActualNormalizada = normalizarFecha(new Date());

    const fechaMaximaPermitida = new Date(fechaActualNormalizada);

    fechaMaximaPermitida.setDate(
        fechaMaximaPermitida.getDate() + 30
    );

    if (fechaVisitaNormalizada < fechaActualNormalizada) {
        throw new Error("Fecha previa a la actual");
    }

    if (fechaVisitaNormalizada > fechaMaximaPermitida) {
        throw new Error(
            "No se pueden comprar entradas con más de 30 días de anticipación"
        );
    }

    return true;
}

function validarAperturaParque(fechaVisita) {
  return true;
}

module.exports = {
  validarUsuario,
  validarFecha,
  validarAperturaParque,
};
