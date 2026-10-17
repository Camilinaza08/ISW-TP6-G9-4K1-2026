function esFechaHoraValida(fecha) {
    return fecha instanceof Date &&
        !Number.isNaN(fecha.getTime());
}

function validarSesion(sesion) {
    if (
        sesion?.usuario == null ||
        !esFechaHoraValida(sesion.fechaHoraInicio) ||
        sesion.fechaHoraInicio > new Date() ||
        sesion.fechaHoraFin !== null
    ) {
        throw new Error("No hay una sesión activa");
    }

  return true;
}

module.exports = {
    validarSesion,
};