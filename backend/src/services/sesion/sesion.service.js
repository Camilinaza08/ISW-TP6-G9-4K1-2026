function esFechaHoraValida(fecha) {
    return fecha instanceof Date &&
        !Number.isNaN(fecha.getTime());
}

function validarSesion(sesion) {
  if (sesion?.usuario == null) {
    throw new Error("No hay una sesión activa");
  }

   if (sesion.fechaHoraInicio == null) {
    throw new Error("No hay una sesión activa");
  }
  
  if (!esFechaHoraValida(sesion.fechaHoraInicio)) {
    throw new Error("No hay una sesión activa");
  }

  if (sesion.fechaHoraFin !== null) {
    throw new Error("No hay una sesión activa");
  }
  
  return true;
  
}

module.exports = {
    validarSesion,
};