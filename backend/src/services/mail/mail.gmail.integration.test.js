
const fs = require("fs");
const path = require("path");
const { parseEnv } = require("util");

// Cargar la configuración de Gmail
const rutaEnv = path.resolve(__dirname, "../../../.env.gmail");

if (fs.existsSync(rutaEnv)) {
    const contenidoEnv = fs.readFileSync(rutaEnv, "utf8");
    const variablesEnv = parseEnv(contenidoEnv);

    Object.assign(process.env, variablesEnv);
}

// Importar el servicio real
const {
    enviarMailConfirmacion
} = require("./mail.service");

// Verificar configuración SMTP
const variablesSMTP = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM",
    "SMTP_TEST_RECIPIENT"
];

const variablesFaltantes = variablesSMTP.filter(
    variable => !process.env[variable]
);

const smtpConfigurado = variablesFaltantes.length === 0;

const testSMTP = smtpConfigurado ? test : test.skip;

testSMTP(
    "Test 156 - Probar el envio de correo electronico mediante Gmail SMTP",
    async () => {

        // ARRANGE
        const compra = {
            cliente: {
                nombre: "Ana",
                email: process.env.SMTP_TEST_RECIPIENT
            },
            fechaVisita: "2026-10-20",
            cantidadEntradas: 2,
            tiposPase: ["REGULAR", "VIP"],
            montoTotal: 30000
        };

        // ACT
        const respuesta = await enviarMailConfirmacion(compra);

        // ASSERT
        expect(respuesta).toBeDefined();
        expect(respuesta.messageId).toBeDefined();

        expect(respuesta.accepted).toContain(
            compra.cliente.email
        );

    },
    30000
);
