

const path = require("path");

const {
    enviarMailConfirmacion
} = require("./mail.service");

// Cargar las variables de entorno desde backend/.env
const rutaEnv = path.resolve(__dirname, "../../../.env");

if (typeof process.loadEnvFile !== "function") {
    throw new Error(
        "La versión de Node.js no admite process.loadEnvFile()"
    );
}

process.loadEnvFile(rutaEnv);

// Verificar la configuración SMTP
const variablesSMTP = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM"
];

const variablesFaltantes = variablesSMTP.filter(
    variable => !process.env[variable]
);

console.log(
    "Variables SMTP faltantes:",
    variablesFaltantes
);

const smtpConfigurado = variablesFaltantes.length === 0;

const testSMTP = smtpConfigurado ? test : test.skip;

testSMTP(
    "Test 155 - Probar el envio de correo electronico mediante Mailtrap",
    async () => {

        // ARRANGE
        const compra = {
            cliente: {
                nombre: "Ana",
                email: "destinatario@ejemplo.com"
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
