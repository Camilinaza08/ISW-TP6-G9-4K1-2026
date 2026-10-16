const { validarSesion } = require("./sesion.service");

describe("validarSesion", () => {
  test("Test 10 - Sesión sin usuario asociado", () => {
    // ARRANGE
    const sesion = {
      usuario: null,
      fechaHoraInicio: new Date("2026-10-10T10:00:00"),
      fechaHoraFin: null
    };

    // ACT Y ASSERT
    expect(() => validarSesion(sesion))
      .toThrow("No hay una sesión activa");
  });
});
