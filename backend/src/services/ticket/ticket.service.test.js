const { validarUsuario } = require('./ticket.validator');

describe('validarUsuario', () => {
  test('Test 01 - Probar validar usuario con un usuario no registrado', () => {
    const usuario = {
      id: 999,
      nombre: 'Usuario inexistente',
    };

    expect(() => validarUsuario(usuario)).toThrow(
      'ERROR: Usuario no registrado',
    );
  });

    test('Test 02 - Probar validar usuario con un usuario registrado', () => {
      const usuario = {
        id: 2,
        nombre: 'Brisa',
      };
      expect(() => validarUsuario(usuario)).not.toThrow();
      expect(validarUsuario(usuario)).toBe(true);
    });
});
