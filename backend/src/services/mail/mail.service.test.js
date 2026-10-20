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

test("Test 139 - Probar la incorporación de la fecha de visita", () => {

    // ARRANGE
    const compra = {
        id: 1,
        cliente: {
            id: 1,
            nombre: "Ana"
        },
        fechaVisita: "2026-10-20"
    };

    const compraOriginal = structuredClone(compra);

    // ACT
    const resultado = generarContenidoMail(compra);

    // ASSERT
    expect(resultado).toContain("20/10/2026");

    expect(resultado).toContain("EcoHarmony Park");

    expect(resultado).toContain("Resumen de tu compra");

    expect(resultado).toContain("Hola, Ana");

    expect(resultado).toContain("Compra N.º 1");

    expect(compra).toEqual(compraOriginal);

});

test("Test 140 - Probar la incorporación de la cantidad de entradas y los tipos de pase", () => {

    // ARRANGE
    const compra = {
        id: 1,
        cliente: {
            id: 1,
            nombre: "Ana"
        },
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        tiposPase: ["REGULAR", "VIP"]
    };

    const compraOriginal = structuredClone(compra);

    // ACT
    const resultado = generarContenidoMail(compra);

    // ASSERT
    expect(resultado).toContain("Cantidad de entradas: 2");

    expect(resultado).toContain("Regular");
    expect(resultado).toContain("VIP");

    expect(resultado).not.toContain("Precio por entrada");

    expect(resultado).toContain("EcoHarmony Park");
    expect(resultado).toContain("Resumen de tu compra");
    expect(resultado).toContain("Hola, Ana");
    expect(resultado).toContain("Compra N.º 1");
    expect(resultado).toContain("20/10/2026");

    expect(compra).toEqual(compraOriginal);

});

test("Test 141 - Probar la incorporación del monto total", () => {

    // ARRANGE
    const compra = {
        id: 1,
        cliente: {
            id: 1,
            nombre: "Ana"
        },
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        tiposPase: ["REGULAR", "VIP"],
        montoTotal: 30000
    };

    const compraOriginal = structuredClone(compra);

    // ACT
    const resultado = generarContenidoMail(compra);

    // ASSERT
    expect(resultado).toContain("Monto total: $30.000");

    expect(resultado).not.toContain("Precio por entrada");

    expect(resultado).toContain("EcoHarmony Park");
    expect(resultado).toContain("Resumen de tu compra");
    expect(resultado).toContain("Hola, Ana");
    expect(resultado).toContain("Compra N.º 1");
    expect(resultado).toContain("20/10/2026");
    expect(resultado).toContain("Cantidad de entradas: 2");
    expect(resultado).toContain("Regular");
    expect(resultado).toContain("VIP");

    expect(compra.montoTotal).toBe(30000);
    expect(compra).toEqual(compraOriginal);

});

test("Test 142 - Probar la incorporación de la forma de pago", () => {

    // ARRANGE
    const compra = {
        id: 1,
        cliente: {
            id: 1,
            nombre: "Ana"
        },
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        tiposPase: ["REGULAR", "VIP"],
        montoTotal: 30000,
        formaPago: "Mercado Pago"
    };

    const compraOriginal = structuredClone(compra);

    // ACT
    const resultado = generarContenidoMail(compra);

    // ASSERT
    expect(resultado).toContain("Forma de pago: Mercado Pago");

    expect(resultado).toContain("EcoHarmony Park");
    expect(resultado).toContain("Resumen de tu compra");
    expect(resultado).toContain("Hola, Ana");
    expect(resultado).toContain("Compra N.º 1");
    expect(resultado).toContain("20/10/2026");
    expect(resultado).toContain("Cantidad de entradas: 2");
    expect(resultado).toContain("Regular");
    expect(resultado).toContain("VIP");
    expect(resultado).toContain("Monto total: $30.000");

    expect(compra).toEqual(compraOriginal);
});

});