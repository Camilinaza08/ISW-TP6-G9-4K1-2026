// Sesión simulada (habilitado por el PO: "pueden comenzar con la sesión y el usuario mockeados").
// Usa el usuario 2 de usuarios.mock.js del backend.
// TODO: reemplazar por la sesión real cuando se conecte el login.
function crearSesionMock() {
  const inicio = new Date();
  return {
    fechaHoraInicio: inicio.toISOString(),
    fechaHoraFin: null,
    usuario: {
      id: 3,
      nombre: 'Camila',
      email: 'camilinaza08@gmail.com',
    },
  };
}

function obtenerSesion() {
  try {
    const guardada = JSON.parse(localStorage.getItem('sesion'));
    if (guardada) return guardada;
  } catch {
    // Sin acceso a localStorage: se usa la sesión simulada
  }
  return crearSesionMock();
}
