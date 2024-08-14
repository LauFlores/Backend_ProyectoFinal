const generateMockProducts = require("../utils/mock.js");

class MockController {
    constructor() {}

    async generateProducts(req, res) {
        try {
            const products = [];
            for (let i = 0; i < 100; i++) {
                products.push(generateMockProducts());
            }
            res.render("mockProducts", { products: products });
        } catch (error) {
            req.logger.error("Error al generar productos simulados:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}

module.exports = MockController;
