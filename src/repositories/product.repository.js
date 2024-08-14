const ProductModel = require("../models/product.model.js");
const {EErrors} = require("../services/errors/errorsEnums.js");
const CustomError = require("../services/errors/customErrors.js");
const { noRequiredFieldsInfo } = require("../services/errors/errors.messages.js");
const { logger } = require("../utils/logger.js");



class ProductRepository {
    constructor(logger) {
        this.logger = logger;
    }

    async addProduct({ title, description, price, thumbnail, img, code, stock, category, owner}) {
        try {
            if (!title || !description || !price || !code || !stock || !category) {
                CustomError.createError({
                    name: 'Nuevo Producto',
                    cause: noRequiredFieldsInfo({title, description, price, thumbnail, code, stock, category}),
                    message: 'Se requieren todos los campos para agregar un producto.',
                    code: EErrors.INVALID_TYPES_ERROR
                });
            }

            const productExists = await ProductModel.findOne({ code: code });

            if (productExists) {
                CustomError.createError({
                    name: 'ValidationError',
                    cause: 'Código duplicado',
                    message: 'El código del producto ya existe en la base de datos.',
                    code: EErrors.DATABASE_ERROR
                });
            }

            console.log("Owner", owner);

            const newProduct = new ProductModel({
                title,
                description,
                code,
                price,
                status: true,
                stock,
                img,
                category,
                thumbnail: thumbnail || [],
                owner
            });

            await newProduct.save();
            return newProduct;
        } catch (error) {
            this.logger.error("Error al agregar un producto", error);
            throw error;
        }
    }

    async getProducts({ limit = 10, page = 1, sort, query } = {}) {
        try {
            const skip = (page - 1) * limit;

            let queryOptions = {};

            if (query) {
                queryOptions = { category: query };
            }

            const sortOptions = {};
            if (sort) {
                if (sort === 'asc' || sort === 'desc') {
                    sortOptions.price = sort === 'asc' ? 1 : -1;
                }
            }

            const products = await ProductModel
                .find(queryOptions)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);

            const totalProducts = await ProductModel.countDocuments(queryOptions);

            const totalPages = Math.ceil(totalProducts / limit);
            const hasPrevPage = page > 1;
            const hasNextPage = page < totalPages;

            return {
                docs: products,
                totalPages,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
                page,
                hasPrevPage,
                hasNextPage,
                prevLink: hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null,
                nextLink: hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}` : null,
            };
        } catch (error) {
            this.logger.error("Error al obtener los productos", error);
            throw error;
        }

    }

    async getProductById(id) {
        try {
            const product = await ProductModel.findById(id);
            if (!product) {
                this.logger.warning("Producto no encontrado");
                return null;
            }
            this.logger.info("Producto encontrado");
            return product;
        } catch (error) {
            this.logger.error("Error al obtener el producto por Id", error);
            throw error;
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            const productUpdated = await ProductModel.findByIdAndUpdate(id, updatedProduct);

            if (!productUpdated) {
                this.logger.warning("Producto no encontrado");
                return null;
            }
            this.logger.info("Producto actualizado");
            return productUpdated;
        } catch (error) {
            this.logger.error("Error al actualizar producto por id", error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const deletedProduct = await ProductModel.findByIdAndDelete(id);

            if (!deletedProduct) {
                throw new Error("Producto no encontrado");
                return null;
            }
            this.logger.info("Producto eliminado");
            return deletedProduct;

        } catch (error) {
            this.logger.error("Error al eliminar por id", error);
            throw error;
        }
    }
}

module.exports = ProductRepository;