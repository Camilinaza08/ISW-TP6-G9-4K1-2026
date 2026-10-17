const { USUARIOS_MOCK } = require('../ticket/usuarios.mock');

function validarUsuario(usuario) {
  const existe = USUARIOS_MOCK.some((u) => u.id === usuario?.id);

  if (!existe) {
    throw new Error('ERROR: Usuario no registrado');
  }

  return true;
}

function validarFecha(fechaVisita) {
    const fechaActual = new Date();

    const fechaVisitaNormalizada = new Date(
        fechaVisita.getFullYear(),
        fechaVisita.getMonth(),
        fechaVisita.getDate()
    );

    const fechaActualNormalizada = new Date(
        fechaActual.getFullYear(),
        fechaActual.getMonth(),
        fechaActual.getDate()
    );

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
