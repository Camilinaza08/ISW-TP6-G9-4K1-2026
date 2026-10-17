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

    if (
        fechaVisita.getFullYear() === fechaActual.getFullYear() &&
        fechaVisita.getMonth() === fechaActual.getMonth() &&
        fechaVisita.getDate() === fechaActual.getDate()
    ) {
        return true;
    }
  throw new Error("Fecha previa a la actual");
}

module.exports = {
  validarUsuario,
  validarFecha,
};
