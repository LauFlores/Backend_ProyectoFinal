const { logger } = require("../utils/logger.js"); // Importa el logger
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository(logger);


class ProductController {

    async addProduct(req, res) {
        try {
            const newProduct = req.body;
            await productRepository.addProduct(newProduct);
            res.status(201).json({
                message: "Producto agregado exitosamente"
            });
        } catch (error) {
            req.logger.error("Error al agregar un producto:", { error });
            res.status(500).json({ error: "Error del servidor" });
        }
    }


    async getProducts(req, res) {
        try {
            let { limit = 10, page = 1, sort, query } = req.query;

            const products = await productRepository.getProducts(limit, page, sort, query,);

            res.json(products);

        } catch (error) {
            req.logger.error("Error al obtener productos:", { error });
            res.status(500).json({
                status: 'error',
                error: "Error del servidor"
            });
        }
    }

    async getProductById(req, res) {
        try {
            const pid = req.params.pid;
            const product = await productRepository.getProductById(pid);
    
            if (product) {
                res.json(product);
            } else {
                res.status(404).json({ error: 'Producto no encontrado' });
            }
        } catch (error) {
            req.logger.error("Error al obtener el producto por ID:", { error });
            res.status(500).json({ error: 'El producto solicitado no existe' });
        }
    }

    async updateProduct(req, res) {
        try {
            const pid = req.params.pid;
            const productUpdate = req.body;
            await productRepository.updateProduct(pid, productUpdate);
            res.json({
                message: "Producto actualizado exitosamente"
            });
        } catch (error) {
            req.logger.error("Error al actualizar el producto:", { error });
            res.status(500).json({ error: "Error del servidor" });
        }
    }

    async deleteProduct(req, res) {
        try {
            const pid = req.params.pid;
            await productRepository.deleteProduct(pid);
            res.json({ message: "Producto eliminado exitosamente" });
        } catch (error) {
            req.logger.error("Error al eliminar el producto:", { error });
            res.status(500).json({ error: "Error del servidor" });
        }
    }
}

module.exports = ProductController; 