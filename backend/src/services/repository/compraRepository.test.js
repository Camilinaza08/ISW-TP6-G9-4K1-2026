const CompraRepository = require("./CompraRepository");
const { USUARIOS_MOCK } = require("../ticket/usuarios.mock");

describe("guardarCompra", () => {

    test("Test 111 - Generar un identificador incremental para una compra", async () => {

        const repository = new CompraRepository();

        const compra1 = {
            cliente: USUARIOS_MOCK[0],
            fechaVisita: "2026-10-20",
            cantidadEntradas: 1,
            edadesVisitantes: [25],
            tipoPase: ["REGULAR"],
            montoTotal: 10000,
            formaPago: "Efectivo",
            estadoCompra: "confirmada",
            estadoPago: "no_aplica"
        };

        const compra2 = {
            cliente: USUARIOS_MOCK[0],
            fechaVisita: "2026-10-21",
            cantidadEntradas: 2,
            edadesVisitantes: [25, 30],
            tipoPase: ["REGULAR", "VIP"],
            montoTotal: 30000,
            formaPago: "Mercado Pago",
            estadoCompra: "pendiente",
            estadoPago: "pending"
        };

        const resultado1 = await repository.guardarCompra(compra1);
        const resultado2 = await repository.guardarCompra(compra2);

        expect(resultado1.id).toBe(1);
        expect(resultado2.id).toBe(2);

    });

});