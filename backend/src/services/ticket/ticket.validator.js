const { USUARIOS_MOCK } = require('../ticket/usuarios.mock');

function validarUsuario(usuario) {
  const usuarioEncontrado = USUARIOS_MOCK.find((u) => u.id === usuario.id);
  if (!usuarioEncontrado) {
    throw new Error('ERROR: Usuario no registrado');
  }
  return true;
}

module.exports = {
  validarUsuario,
};
