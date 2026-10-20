const CompraRepository = require("./compraRepository");
const { USUARIOS_MOCK } = require("../ticket/usuarios.mock");

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

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

// ========================================
// GUARDAR COMPRA
// ========================================

describe("guardarCompra", () => {

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

// ========================================
// OBTENER COMPRA POR ID
// ========================================

describe("obtenerCompraPorId", () => {

    test("Test 114 - Recuperar una compra existente mediante su identificador", async () => {

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

        const compraGuardada = await repository.guardarCompra(compra);

        const compraRecuperada = await repository.obtenerCompraPorId(
            compraGuardada.id
        );

        expect(compraRecuperada).toEqual(compraGuardada);

    });

    test("Test 115 - Consultar una compra inexistente", async () => {

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

    await repository.guardarCompra(compra);

    const compraRecuperada = await repository.obtenerCompraPorId(999);

    expect(compraRecuperada).toBeNull();

});

    test("Test 118 - Recuperar una compra desde una instancia diferente del Repository", async () => {

    const compra = {
        cliente: USUARIOS_MOCK[0],
        fechaVisita: "2026-10-20",
        cantidadEntradas: 1,
        edadesVisitantes: [25],
        tipoPase: ["REGULAR"],
        montoTotal: 10000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const repository1 = new CompraRepository(rutaArchivo);

    const compraGuardada = await repository1.guardarCompra(compra);

    const repository2 = new CompraRepository(rutaArchivo);

    const compraRecuperada = await repository2.obtenerCompraPorId(
        compraGuardada.id
    );

    expect(repository2).not.toBe(repository1);

    expect(compraRecuperada).toEqual(compraGuardada);

});

});

describe("actualizarEstadosCompra", () => {

    test("Test 116 - Actualizar los estados de una compra existente", async () => {

        const compra = {
            cliente: USUARIOS_MOCK[0],
            fechaVisita: "2026-10-20",
            cantidadEntradas: 1,
            edadesVisitantes: [25],
            tipoPase: ["REGULAR"],
            montoTotal: 10000,
            formaPago: "Mercado Pago",
            estadoCompra: "pendiente",
            estadoPago: "pending"
        };

        const compraGuardada = await repository.guardarCompra(compra);

        const compraActualizada = await repository.actualizarEstadosCompra(
            compraGuardada.id,
            "confirmada",
            "approved"
        );

        expect(compraActualizada).toEqual({
            ...compraGuardada,
            estadoCompra: "confirmada",
            estadoPago: "approved"
        });

        const compraPersistida = await repository.obtenerCompraPorId(
            compraGuardada.id
        );

        expect(compraPersistida).toEqual(compraActualizada);

    });

    test("Test 117 - Intentar actualizar una compra inexistente", async () => {

    const compra = {
        cliente: USUARIOS_MOCK[0],
        fechaVisita: "2026-10-20",
        cantidadEntradas: 1,
        edadesVisitantes: [25],
        tipoPase: ["REGULAR"],
        montoTotal: 10000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const compraGuardada = await repository.guardarCompra(compra);

    await expect(
        repository.actualizarEstadosCompra(
            999,
            "confirmada",
            "approved"
        )
    ).rejects.toThrow("Compra no encontrada");

    const compraPersistida = await repository.obtenerCompraPorId(
        compraGuardada.id
    );

    expect(compraPersistida).toEqual(compraGuardada);

});

test("Test 119 - Recuperar estados actualizados desde otra instancia", async () => {

    const compra = {
        cliente: USUARIOS_MOCK[0],
        fechaVisita: "2026-10-20",
        cantidadEntradas: 1,
        edadesVisitantes: [25],
        tipoPase: ["REGULAR"],
        montoTotal: 10000,
        formaPago: "Mercado Pago",
        estadoCompra: "pendiente",
        estadoPago: "pending"
    };

    const repository1 = new CompraRepository(rutaArchivo);

    const compraGuardada = await repository1.guardarCompra(compra);

    const repository2 = new CompraRepository(rutaArchivo);

    await repository1.actualizarEstadosCompra(
        compraGuardada.id,
        "confirmada",
        "approved"
    );

    const compraRecuperada = await repository2.obtenerCompraPorId(
        compraGuardada.id
    );

    expect(repository2).not.toBe(repository1);

    expect(compraRecuperada).toEqual({
        ...compraGuardada,
        estadoCompra: "confirmada",
        estadoPago: "approved"
    });

});

});

describe("obtenerEntradasAcumuladas", () => {

    test("Test 120 - Calcular las entradas acumuladas de un usuario para una fecha", async () => {

        const compra1 = {
            cliente: USUARIOS_MOCK[0],
            fechaVisita: "2026-10-20",
            cantidadEntradas: 3,
            edadesVisitantes: [25, 30, 12],
            tipoPase: ["REGULAR", "VIP", "REGULAR"],
            montoTotal: 40000,
            formaPago: "Efectivo",
            estadoCompra: "confirmada",
            estadoPago: "no_aplica"
        };

        const compra2 = {
            cliente: USUARIOS_MOCK[0],
            fechaVisita: "2026-10-20",
            cantidadEntradas: 4,
            edadesVisitantes: [25, 30, 12, 40],
            tipoPase: ["REGULAR", "REGULAR", "VIP", "VIP"],
            montoTotal: 60000,
            formaPago: "Efectivo",
            estadoCompra: "confirmada",
            estadoPago: "no_aplica"
        };

        await repository.guardarCompra(compra1);
        await repository.guardarCompra(compra2);

        const entradasAcumuladas = await repository.obtenerEntradasAcumuladas(
            USUARIOS_MOCK[0].id,
            "2026-10-20"
        );

        expect(entradasAcumuladas).toBe(7);

    });

    test("Test 121 - Excluir las compras correspondientes a otros usuarios", async () => {

    const compra1 = {
        cliente: USUARIOS_MOCK[0],
        fechaVisita: "2026-10-20",
        cantidadEntradas: 3,
        edadesVisitantes: [25, 30, 12],
        tipoPase: ["REGULAR", "VIP", "REGULAR"],
        montoTotal: 40000,
        formaPago: "Efectivo",
        estadoCompra: "confirmada",
        estadoPago: "no_aplica"
    };

    const compra2 = {
        cliente: USUARIOS_MOCK[1],
        fechaVisita: "2026-10-20",
        cantidadEntradas: 4,
        edadesVisitantes: [25, 30, 12, 40],
        tipoPase: ["REGULAR", "REGULAR", "VIP", "VIP"],
        montoTotal: 60000,
        formaPago: "Efectivo",
        estadoCompra: "confirmada",
        estadoPago: "no_aplica"
    };

    await repository.guardarCompra(compra1);
    await repository.guardarCompra(compra2);

    const entradasAcumuladas = await repository.obtenerEntradasAcumuladas(
        USUARIOS_MOCK[0].id,
        "2026-10-20"
    );

    expect(entradasAcumuladas).toBe(3);

});

test("Test 122 - Excluir compras correspondientes a otras fechas", async () => {

    const compra1 = {
        cliente: USUARIOS_MOCK[0],
        fechaVisita: "2026-10-20",
        cantidadEntradas: 3,
        edadesVisitantes: [25, 30, 12],
        tipoPase: ["REGULAR", "VIP", "REGULAR"],
        montoTotal: 40000,
        formaPago: "Efectivo",
        estadoCompra: "confirmada",
        estadoPago: "no_aplica"
    };

    const compra2 = {
        cliente: USUARIOS_MOCK[0],
        fechaVisita: "2026-10-21",
        cantidadEntradas: 4,
        edadesVisitantes: [25, 30, 12, 40],
        tipoPase: ["REGULAR", "REGULAR", "VIP", "VIP"],
        montoTotal: 60000,
        formaPago: "Efectivo",
        estadoCompra: "confirmada",
        estadoPago: "no_aplica"
    };

    await repository.guardarCompra(compra1);
    await repository.guardarCompra(compra2);

    const entradasAcumuladas = await repository.obtenerEntradasAcumuladas(
        USUARIOS_MOCK[0].id,
        "2026-10-20"
    );

    expect(entradasAcumuladas).toBe(3);

});

});