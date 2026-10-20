const { generarContenidoMail } = require("./mail.service");

describe("generarContenidoMail", () => {

    test("Test 136 - Probar la generación de la estructura HTML básica", () => {

        // ARRANGE
        const compra = {
            id: 1,
            cliente: {
                id: 1,
                nombre: "Ana"
            }
        };

        const compraOriginal = structuredClone(compra);

        // ACT
        const resultado = generarContenidoMail(compra);

        // ASSERT
        expect(typeof resultado).toBe("string");

        expect(resultado).toMatch(/<html\b[^>]*>/i);
        expect(resultado).toMatch(/<\/html>/i);

        expect(resultado).toContain("EcoHarmony Park");
        expect(resultado).toContain("Resumen de tu compra");

        expect(compra).toEqual(compraOriginal);

    });

    test("Test 137 - Probar la incorporación del saludo personalizado", () => {

    // ARRANGE
    const compra = {
        id: 1,
        cliente: {
            id: 1,
            nombre: "Ana"
        }
    };

    const compraOriginal = structuredClone(compra);

    // ACT
    const resultado = generarContenidoMail(compra);

    // ASSERT
    expect(resultado).toContain("Hola, Ana");

    expect(resultado).toContain("EcoHarmony Park");

    expect(resultado).toContain("Resumen de tu compra");

    expect(compra).toEqual(compraOriginal);

});

test("Test 138 - Probar la incorporación del identificador de compra", () => {

    // ARRANGE
    const compra = {
        id: 1,
        cliente: {
            id: 1,
            nombre: "Ana"
        }
    };

    const compraOriginal = structuredClone(compra);

    // ACT
    const resultado = generarContenidoMail(compra);

    // ASSERT
    expect(resultado).toContain("Compra N.º 1");

    expect(resultado).toContain("EcoHarmony Park");

    expect(resultado).toContain("Resumen de tu compra");

    expect(resultado).toContain("Hola, Ana");

    expect(compra).toEqual(compraOriginal);

});

});