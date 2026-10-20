const fs = require("node:fs");
const path = require("node:path");

class CompraRepository {

    constructor(rutaArchivo) {
        this.ultimoID = 0;
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
        this.ultimoID++;

        const compraRegistrada = {
            ...compra,
            id: this.ultimoID
        };

        const comprasGuardadas = this.leerCompras();

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

}

module.exports = CompraRepository;
