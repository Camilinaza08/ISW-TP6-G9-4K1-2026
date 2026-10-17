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

    if (fechaVisitaNormalizada >= fechaActualNormalizada) {
      return true;
    }
  throw new Error("Fecha previa a la actual");
}

module.exports = {
  validarUsuario,
  validarFecha,
};
