jest.mock("nodemailer", () => ({
    createTransport: jest.fn()
}));

const nodemailer = require("nodemailer");

const {
    generarContenidoMail,
    validarEmailDestinatario,
    enviarMailConfirmacion
} = require("./mail.service");


function obtenerTextoVisible(html) {
    return html
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

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

        // ACT
        const resultado = generarContenidoMail(compra);
        const textoVisible = obtenerTextoVisible(resultado);

        // ASSERT
        expect(resultado).toContain("<!DOCTYPE html>");
        expect(resultado).toContain('<html lang="es">');
        expect(resultado).toContain("<head>");
        expect(resultado).toContain("<body");

        expect(textoVisible).toContain("EcoHarmony Park");
        expect(textoVisible).toContain("Resumen de tu compra");
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

        // ACT
        const resultado = generarContenidoMail(compra);
        const textoVisible = obtenerTextoVisible(resultado);

        // ASSERT
        expect(textoVisible).toContain("Hola, Ana");
        expect(textoVisible).toContain("EcoHarmony Park");
        expect(textoVisible).toContain("Resumen de tu compra");
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

        // ACT
        const resultado = generarContenidoMail(compra);
        const textoVisible = obtenerTextoVisible(resultado);

        // ASSERT
        expect(textoVisible).toContain("Compra N.º 1");
        expect(textoVisible).toContain("Hola, Ana");
        expect(textoVisible).toContain("EcoHarmony Park");
        expect(textoVisible).toContain("Resumen de tu compra");
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
        const textoVisible = obtenerTextoVisible(resultado);

        // ASSERT
        expect(textoVisible).toContain("20/10/2026");
        expect(textoVisible).toContain("EcoHarmony Park");
        expect(textoVisible).toContain("Resumen de tu compra");
        expect(textoVisible).toContain("Hola, Ana");
        expect(textoVisible).toContain("Compra N.º 1");

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
        const textoVisible = obtenerTextoVisible(resultado);

        // ASSERT
        expect(textoVisible).toContain("Cantidad de entradas: 2");
        expect(textoVisible).toContain("Tipos de pase: Regular, VIP");

        expect(textoVisible).not.toContain("Precio por entrada");

        expect(textoVisible).toContain("EcoHarmony Park");
        expect(textoVisible).toContain("Resumen de tu compra");
        expect(textoVisible).toContain("Hola, Ana");
        expect(textoVisible).toContain("Compra N.º 1");
        expect(textoVisible).toContain("20/10/2026");

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
        const textoVisible = obtenerTextoVisible(resultado);

        // ASSERT
        expect(textoVisible).toContain("Monto total: $30.000");

        expect(textoVisible).not.toContain("Precio por entrada");

        expect(textoVisible).toContain("EcoHarmony Park");
        expect(textoVisible).toContain("Resumen de tu compra");
        expect(textoVisible).toContain("Hola, Ana");
        expect(textoVisible).toContain("Compra N.º 1");
        expect(textoVisible).toContain("20/10/2026");
        expect(textoVisible).toContain("Cantidad de entradas: 2");
        expect(textoVisible).toContain("Tipos de pase: Regular, VIP");

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
        const textoVisible = obtenerTextoVisible(resultado);

        // ASSERT
        expect(textoVisible).toContain("Forma de pago: Mercado Pago");

        expect(textoVisible).toContain("EcoHarmony Park");
        expect(textoVisible).toContain("Resumen de tu compra");
        expect(textoVisible).toContain("Hola, Ana");
        expect(textoVisible).toContain("Compra N.º 1");
        expect(textoVisible).toContain("20/10/2026");
        expect(textoVisible).toContain("Cantidad de entradas: 2");
        expect(textoVisible).toContain("Tipos de pase: Regular, VIP");
        expect(textoVisible).toContain("Monto total: $30.000");

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

        const texto1 = obtenerTextoVisible(resultado1);
        const texto2 = obtenerTextoVisible(resultado2);

        // ASSERT
        expect(texto1).toContain("Hola, Ana");
        expect(texto1).toContain("Compra N.º 1");
        expect(texto1).toContain("20/10/2026");
        expect(texto1).toContain("Cantidad de entradas: 2");
        expect(texto1).toContain("Tipos de pase: Regular, VIP");
        expect(texto1).toContain("Monto total: $30.000");
        expect(texto1).toContain("Forma de pago: Mercado Pago");

        expect(texto2).toContain("Hola, Juan");
        expect(texto2).toContain("Compra N.º 2");
        expect(texto2).toContain("25/10/2026");
        expect(texto2).toContain("Cantidad de entradas: 1");
        expect(texto2).toContain("Tipos de pase: VIP");
        expect(texto2).toContain("Monto total: $20.000");
        expect(texto2).toContain("Forma de pago: Efectivo");

        expect(texto1).not.toContain("Hola, Juan");
        expect(texto1).not.toContain("Compra N.º 2");
        expect(texto1).not.toContain("Forma de pago: Efectivo");

        expect(texto2).not.toContain("Hola, Ana");
        expect(texto2).not.toContain("Compra N.º 1");
        expect(texto2).not.toContain("Forma de pago: Mercado Pago");

        expect(resultado1).not.toBe(resultado2);

        expect(compra1).toEqual(compra1Original);
        expect(compra2).toEqual(compra2Original);
    });

    test("Test 144 - Probar la generación de una plantilla HTML estructurada", () => {

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
        const textoVisible = obtenerTextoVisible(resultado);

        // ASSERT

        // Estructura HTML
        expect(resultado).toContain("<!DOCTYPE html>");
        expect(resultado).toContain('<html lang="es">');
        expect(resultado).toContain('<meta charset="UTF-8">');
        expect(resultado).toContain("<body");

        // Secciones del correo
        expect(resultado).toMatch(/<header\b[^>]*>/);
        expect(resultado).toContain("</header>");

        expect(resultado).toMatch(/<main\b[^>]*>/);
        expect(resultado).toContain("</main>");

        expect(resultado).toMatch(/<footer\b[^>]*>/);
        expect(resultado).toContain("</footer>");

        // Estilos inline
        expect(resultado).toMatch(/<header\b[^>]*\bstyle="/);
        expect(resultado).toMatch(/<main\b[^>]*\bstyle="/);
        expect(resultado).toMatch(/<footer\b[^>]*\bstyle="/);

        // Identidad visual
        expect(resultado).toContain('alt="Logo EcoHarmony Park"');
        expect(resultado).toContain('src="logo.png"');

        expect(resultado).toContain("#f6f4ea");
        expect(resultado).toContain("#386641");
        expect(resultado).toContain("#6a994e");
        expect(resultado).toContain("#a7c957");

        // Información institucional
        expect(textoVisible).toContain("EcoHarmony Park");
        expect(textoVisible).toContain("Resumen de tu compra");

        // Información de la compra
        expect(textoVisible).toContain("Hola, Ana");
        expect(textoVisible).toContain("Compra N.º 1");
        expect(textoVisible).toContain("20/10/2026");
        expect(textoVisible).toContain("Cantidad de entradas: 2");
        expect(textoVisible).toContain("Tipos de pase: Regular, VIP");
        expect(textoVisible).toContain("Monto total: $30.000");
        expect(textoVisible).toContain("Forma de pago: Mercado Pago");

        // Independencia de los datos originales
        expect(compra).toEqual(compraOriginal);
    });
    
});

describe("validarEmailDestinatario", () => {

    test("Test 145 - Validar que el correo electrónico del destinatario sea obligatorio", () => {

        // ARRANGE
        const email = null;

        // ACT Y ASSERT
        expect(() => validarEmailDestinatario(email))
            .toThrow("No se ha indicado un correo electrónico");

    });

    test("Test 146 - Validar que un correo electrónico informado sea aceptado", () => {

    // ARRANGE
    const email = "ana@gmail.com";

    // ACT Y ASSERT
    expect(() => validarEmailDestinatario(email)).not.toThrow();

    })

    
    test("Test 147 - Validar que un correo electrónico con formato inválido sea rechazado", () => {

    // ARRANGE
    const email = "correo-invalido";

    // ACT Y ASSERT
    expect(() => validarEmailDestinatario(email))
        .toThrow("Formato de correo electrónico inválido");

    });

});


describe("enviarMailConfirmacion", () => {

    test("Test 148 - Verificar que se invoque el envío del correo de confirmación", async () => {

        // ARRANGE
        const sendMailMock = jest.fn().mockResolvedValue({
            messageId: "mail-test-148"
        });

        nodemailer.createTransport.mockReturnValue({
            sendMail: sendMailMock
        });

        const compra = {
            id: 1,
            cliente: {
                id: 1,
                nombre: "Ana",
                email: "ana@gmail.com"
            },
            fechaVisita: "2026-10-20",
            cantidadEntradas: 2,
            tiposPase: ["REGULAR", "VIP"],
            montoTotal: 30000,
            formaPago: "Mercado Pago"
        };

        // ACT
        await enviarMailConfirmacion(compra);

        // ASSERT
        expect(sendMailMock).toHaveBeenCalledTimes(1);

    });

    
test("Test 149 - Verificar que el correo de confirmación contenga los datos correspondientes", async () => {

    // ARRANGE
    const sendMailMock = jest.fn().mockResolvedValue({
        messageId: "mail-test-149"
    });

    nodemailer.createTransport.mockReturnValue({
        sendMail: sendMailMock
    });

    const compra = {
        id: 1,
        cliente: {
            id: 1,
            nombre: "Ana",
            email: "ana@gmail.com"
        },
        fechaVisita: "2026-10-20",
        cantidadEntradas: 2,
        tiposPase: ["REGULAR", "VIP"],
        montoTotal: 30000,
        formaPago: "Mercado Pago"
    };

    // ACT
    await enviarMailConfirmacion(compra);

    // ASSERT
    expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
            to: "ana@gmail.com",
            subject: "Confirmación de compra - EcoHarmony Park",
            html: expect.any(String)
        })
    );

    const mensajeEnviado = sendMailMock.mock.calls[0][0];

    expect(mensajeEnviado.html).toContain("EcoHarmony Park");
    expect(mensajeEnviado.html).toContain("Hola, Ana");
    expect(mensajeEnviado.html).toContain("Compra N.º 1");

});


});

