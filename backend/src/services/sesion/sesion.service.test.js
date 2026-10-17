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

  test("Test 11 - Sesion activa con usuario asociado", () => {
    // ARRANGE
    const sesion = {
      usuario: { id: 1, nombre: "Usuario de prueba" },
      fechaHoraInicio: new Date("2026-10-10T10:00:00"),
      fechaHoraFin: null
    };

    // ACT
    const resultado = validarSesion(sesion);

    // ASSERT
    expect(resultado).toBe(true);
  });

  test("Test 12 - Sesión inexistente", () => {
    const sesion = null;

    expect(() => validarSesion(sesion))
      .toThrow("No hay una sesión activa");
  });

  test("Test 13 - Sesión finalizada", () => {
    const sesion = {
      usuario: { id: 1, nombre: "Usuario de prueba" },
      fechaHoraInicio: new Date("2026-10-10T10:00:00"),
      fechaHoraFin: new Date("2026-10-10T12:00:00")
    };

    expect(() => validarSesion(sesion))
      .toThrow("No hay una sesión activa");
  });

  test("Test 14 - Sesión sin fecha y hora de inicio", () => {
    // ARRANGE
    const sesion = {
        usuario: { id: 1, nombre: "Usuario de prueba" },
        fechaHoraInicio: null,
        fechaHoraFin: null
    };

    // ACT Y ASSERT
    expect(() => validarSesion(sesion))
        .toThrow("No hay una sesión activa");
});
});
