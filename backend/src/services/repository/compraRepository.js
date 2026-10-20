const fs = require("node:fs");
const path = require("node:path");

class CompraRepository {

    constructor(rutaArchivo) {
    this.rutaArchivo = rutaArchivo;
}

    leerCompras() {
        if (!fs.existsSync(this.rutaArchivo)) {
            return [];
        }

        const contenido = fs.readFileSync(
            this.rutaArchivo,
            "utf8"
        );

        return JSON.parse(contenido);
    }

    escribirCompras(compras) {
        const directorio = path.dirname(this.rutaArchivo);

        fs.mkdirSync(directorio, {
            recursive: true
        });

        fs.writeFileSync(
            this.rutaArchivo,
            JSON.stringify(compras, null, 2),
            "utf8"
        );
    }

   async guardarCompra(compra) {

    const comprasGuardadas = this.leerCompras();

    const ultimoID = comprasGuardadas.reduce(
        (maximo, compraGuardada) =>
            Math.max(maximo, compraGuardada.id),
        0
    );

    const nuevoID = ultimoID + 1;

    const compraRegistrada = {
        ...compra,
        id: nuevoID
    };

    comprasGuardadas.push(compraRegistrada);

    this.escribirCompras(comprasGuardadas);

    return compraRegistrada;
}

  async obtenerCompraPorId(id) {
    const comprasGuardadas = this.leerCompras();

    return comprasGuardadas.find(
        compra => compra.id === id
    ) ?? null;
}

    async actualizarEstadosCompra(id, estadoCompra, estadoPago) {

    const comprasGuardadas = this.leerCompras();

    const compra = comprasGuardadas.find(
        compra => compra.id === id
    );

    if (!compra) {
        throw new Error("Compra no encontrada");
    }

    compra.estadoCompra = estadoCompra;
    compra.estadoPago = estadoPago;

    this.escribirCompras(comprasGuardadas);

    return compra;
}

async obtenerEntradasAcumuladas(idUsuario, fechaVisita) {

    const comprasGuardadas = this.leerCompras();

    const comprasDelUsuario = comprasGuardadas.filter(
        compra => compra.cliente.id === idUsuario
    );

    const comprasDeLaFecha = comprasDelUsuario.filter(
        compra => compra.fechaVisita === fechaVisita
    );

    const entradasAcumuladas = comprasDeLaFecha.reduce(
        (total, compra) => total + compra.cantidadEntradas,
        0
    );

    return entradasAcumuladas;
}

}

module.exports = CompraRepository;
