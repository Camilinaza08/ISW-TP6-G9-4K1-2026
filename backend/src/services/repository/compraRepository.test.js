const CompraRepository = require("./CompraRepository");
const { USUARIOS_MOCK } = require("../ticket/usuarios.mock");

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

describe("guardarCompra", () => {
    let directorioTemporal;
    let rutaArchivo;
    let repository;

    beforeEach(() => {
        directorioTemporal = fs.mkdtempSync(
            path.join(os.tmpdir(), "ecoharmony-")
        );

        rutaArchivo = path.join(
            directorioTemporal,
            "compras",
            "compras.json"
        );

        repository = new CompraRepository(rutaArchivo);
    });

    afterEach(() => {
        fs.rmSync(directorioTemporal, {
            recursive: true,
            force: true
        });
    });

   test("Test 111 - Generar un identificador incremental para una compra", async () => {

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

test("Test 112 - Almacenar una compra en un archivo JSON", async () => {

    const compra = {
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

    const resultado = await repository.guardarCompra(compra);

    const contenido = fs.readFileSync(rutaArchivo, "utf8");
    const comprasGuardadas = JSON.parse(contenido);

    expect(fs.existsSync(path.dirname(rutaArchivo))).toBe(true);
    expect(fs.existsSync(rutaArchivo)).toBe(true);

    expect(comprasGuardadas).toEqual([resultado]);

});

test("Test 113 - Registrar una segunda compra sin sobrescribir la primera", async () => {

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

    const contenido = fs.readFileSync(rutaArchivo, "utf8");
    const comprasGuardadas = JSON.parse(contenido);

    expect(comprasGuardadas).toHaveLength(2);

    expect(comprasGuardadas[0]).toEqual(resultado1);
    expect(comprasGuardadas[1]).toEqual(resultado2);

    expect(resultado1.id).toBe(1);
    expect(resultado2.id).toBe(2);

});

});