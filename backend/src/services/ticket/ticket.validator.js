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

function validarFecha(fechaVisita) {
   if (fechaVisita === null || fechaVisita === undefined) {
        throw new Error("Debe seleccionar una fecha de visita");
    }
    const fechaActual = new Date();

    const fechaVisitaNormalizada = normalizarFecha(fechaVisita);
    const fechaActualNormalizada = normalizarFecha(fechaActual);

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

module.exports = {
  validarUsuario,
  validarFecha,
};
