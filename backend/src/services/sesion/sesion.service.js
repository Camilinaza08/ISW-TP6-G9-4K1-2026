function validarSesion(sesion) {
  if (sesion?.usuario == null) {
    throw new Error("No hay una sesión activa");
  }
  return true;
}

module.exports = {
    validarSesion,
};