const fs = require("fs");
const { generarContenidoMail } = require("./mail.service");

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

const html = generarContenidoMail(compra);

fs.writeFileSync("preview-mail.html", html, "utf8");

console.log("Vista previa generada: preview-mail.html");