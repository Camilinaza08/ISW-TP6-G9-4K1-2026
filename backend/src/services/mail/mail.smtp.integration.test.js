
const fs = require("fs");
const path = require("path");
const { parseEnv } = require("util");

// Cargar las variables de entorno desde backend/.env
const rutaEnv = path.resolve(__dirname, "../../../.env");

if (fs.existsSync(rutaEnv)) {
    const contenidoEnv = fs.readFileSync(rutaEnv, "utf8");
    const variablesEnv = parseEnv(contenidoEnv);

    Object.assign(process.env, variablesEnv);
}

// Importar el servicio real de correo
const {
    enviarMailConfirmacion
} = require("./mail.service");

// Verificar que estén configuradas las variables SMTP
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
