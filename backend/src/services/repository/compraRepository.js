class CompraRepository {

    constructor() {
        this.ultimoID = 0;
    }

    async guardarCompra(compra) {
        this.ultimoID++;

        return {
            ...compra,
            id: this.ultimoID
        };
    }

}

module.exports = CompraRepository;
