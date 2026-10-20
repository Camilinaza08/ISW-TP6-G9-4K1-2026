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

test("Test 143 - Probar la generación independiente del contenido para diferentes compras", () => {

    // ARRANGE
    const compra1 = {
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

    const compra2 = {
        id: 2,
        cliente: {
            id: 2,
            nombre: "Juan"
        },
        fechaVisita: "2026-10-25",
        cantidadEntradas: 1,
        tiposPase: ["VIP"],
        montoTotal: 20000,
        formaPago: "Efectivo"
    };

    const compra1Original = structuredClone(compra1);
    const compra2Original = structuredClone(compra2);

    // ACT
    const resultado1 = generarContenidoMail(compra1);
    const resultado2 = generarContenidoMail(compra2);

    // ASSERT
    expect(resultado1).toContain("Hola, Ana");
    expect(resultado1).toContain("Compra N.º 1");
    expect(resultado1).toContain("20/10/2026");
    expect(resultado1).toContain("Cantidad de entradas: 2");
    expect(resultado1).toContain("Regular, VIP");
    expect(resultado1).toContain("Monto total: $30.000");
    expect(resultado1).toContain("Forma de pago: Mercado Pago");

    expect(resultado2).toContain("Hola, Juan");
    expect(resultado2).toContain("Compra N.º 2");
    expect(resultado2).toContain("25/10/2026");
    expect(resultado2).toContain("Cantidad de entradas: 1");
    expect(resultado2).toContain("Tipos de pase: VIP");
    expect(resultado2).toContain("Monto total: $20.000");
    expect(resultado2).toContain("Forma de pago: Efectivo");

    expect(resultado1).not.toContain("Hola, Juan");
    expect(resultado1).not.toContain("Compra N.º 2");
    expect(resultado1).not.toContain("Forma de pago: Efectivo");

    expect(resultado2).not.toContain("Hola, Ana");
    expect(resultado2).not.toContain("Compra N.º 1");
    expect(resultado2).not.toContain("Forma de pago: Mercado Pago");

    expect(resultado1).not.toBe(resultado2);

    expect(compra1).toEqual(compra1Original);
    expect(compra2).toEqual(compra2Original);

});

});