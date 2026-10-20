const path = require("node:path");
const CompraRepository = require("../repository/compraRepository");

const repository = new CompraRepository(
    path.join(__dirname, "../../data/compras.json")
);

async function procesarResultadoMP(idCompra, estadoPago) {

    const compra = await repository.obtenerCompraPorId(idCompra);

    if (compra.formaPago !== "Mercado Pago") {
        throw new Error(
            "La compra no corresponde a Mercado Pago"
        );
    }

    return compra;
}

module.exports = {
    procesarResultadoMP
};