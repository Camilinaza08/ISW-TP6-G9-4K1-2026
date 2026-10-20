const fs = require("node:fs");
const path = require("node:path");

class CompraRepository {

    constructor(rutaArchivo) {
        this.ultimoID = 0;
        this.rutaArchivo = rutaArchivo;
    }

    async guardarCompra(compra) {
        this.ultimoID++;

        const compraRegistrada = {
            ...compra,
            id: this.ultimoID
        };

        const directorio = path.dirname(this.rutaArchivo);

        fs.mkdirSync(directorio, {
            recursive: true
        });

        fs.writeFileSync(
            this.rutaArchivo,
            JSON.stringify([compraRegistrada], null, 2),
            "utf8"
        );

        return compraRegistrada;
    }

}

module.exports = CompraRepository;
