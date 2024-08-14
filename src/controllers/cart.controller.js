const UserModel = require("../models/user.model.js");
const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();
const { logger } = require("../utils/logger.js"); // Importa el logger
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository(logger);
const TicketModel = require("../models/ticket.model.js");
const { generateUniqueCode, calculateTotal } = require("../utils/cartUtils.js");
const EmailManager = require("../services/email.js");
const emailManager = new EmailManager();


class CartController {
    async newCart(req, res) {
        try {
            const newCart = await cartRepository.createCart();
            res.json(newCart);
        } catch (error) {
            req.logger.error("Error al crear un nuevo carrito:", { error });
            res.status(500).json({ error: "Error del servidor" });
        }
    }

    async getCartProducts(req, res) {
        const cartId = req.params.cid;
        try {
            const products = await cartRepository.getCartProducts(cartId);
            if (!products) {
                return res.status(404).json({ error: "Cart no encontrado" });
            }
            res.json(products);
        } catch (error) {
            req.logger.error("Error al obtener los productos del carrito:", { error });
            res.status(500).send("Error");
        }
    }

    async addProductToCart(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1;
    
        try {
                    // Convertir quantity a un número
            const quantityToAdd = parseInt(quantity, 10);

            if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
                return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
            }
            // Verificar si el usuario es premium
            if (req.session.user.role === 'premium') {
                // Obtener el producto
                const product = await productRepository.getProductById(productId);
                if (!product) {
                    return res.status(404).json({ error: 'Producto no encontrado' });
                }
    
                // Verificar si el producto le pertenece al usuario premium
                if (product.owner === req.session.user.email) {
                    return res.status(403).json({ error: 'No puedes agregar un producto creado por ti' });
                }
            }
    
            // Agregar el producto al carrito
            const updateCart = await cartRepository.addProductToCart(cartId, productId, quantity);
            res.redirect(`/carts/${cartId}`);
        } catch (error) {
            req.logger.error("Error al agregar el producto al carrito:", { error }); // Registro del error con el logger
            res.status(500).json({ error: "Error del servidor" });
        }
    }
    
    

    async deleteCartProduct(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;

            const updatedCart = await cartRepository.deleteCartProduct(cartId, productId);

            res.json({
                status: 'success',
                message: 'Producto eliminado correctamente del carrito',
                updatedCart,
            });
        } catch (error) {
            req.logger.error('Error al eliminar el producto del carrito:', { error });
            res.status(500).json({
                status: 'error',
                error: 'Error del servidor',
            });
        }
    }

    async updateProductsInCart(req, res) {
        const cartId = req.params.cid;
        const updatedProducts = req.body;

        try {
            const updateCart = await cartRepository.updateProductstInCart(cartId, updatedProducts);
            res.json(updateCart);
        } catch (error) {
            req.logger.error('Error al actualizar los productos del carrito:', { error });
            res.status(500).json({
                status: 'error',
                error: 'Error del servidor',
            });
        }
    }

    async updateProductQuantity(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const newQuantity = req.body.quantity;

            const updatedCart = await cartRepository.updateProductQuantity(cartId, productId, newQuantity);

            res.json({
                status: 'success',
                message: 'Cantidad actualizada correctamente del producto en el cart',
                updatedCart,
            });
        } catch (error) {
            req.logger.error('Error al actualizar la cantidad del producto en el cart:', { error });
            res.status(500).json({
                status: 'error',
                error: 'Error del servidor',
            });
        }
    }

    async emptyCart(req, res) {
        try {
            const cartId = req.params.cid;
            const updatedCart = await cartRepository.emptyCart(cartId);

            res.json({
                status: 'success',
                message: 'No quedan productos en el carrito',
                updatedCart,
            });
        } catch (error) {
            req.logger.error('Error al vaciar el carrito:', { error });
            res.status(500).json({
                status: 'error',
                error: 'Error del servidor',
            });
        }
    }

    async finalizePurchase(req, res) {
        const cartId = req.params.cid;
        try {
            // Obtener el carrito y sus productos
            const cart = await cartRepository.getCartProducts(cartId);
            const products = cart.products;

            // Inicializar un arreglo para almacenar los productos no disponibles
            const unavailableProducts = [];

            // Verificar el stock y actualizar los productos disponibles
            for (const item of products) {
                const productId = item.product;
                const product = await productRepository.getProductById(productId);
                if (product.stock >= item.quantity) {
                    // Si hay suficiente stock, restar la cantidad del producto
                    product.stock -= item.quantity;
                    await product.save();
                } else {
                    // Si no hay suficiente stock, agregar el ID del producto al arreglo de no disponibles
                    unavailableProducts.push(productId);
                }
            }

            const userWithCart = await UserModel.findOne({ cart: cartId });

            // Crear un ticket con los datos de la compra
            const ticket = new TicketModel({
                code: generateUniqueCode(),
                purchase_datetime: new Date(),
                amount: calculateTotal(cart.products),
                purchaser: req.user.email
            });
            await ticket.save();

            // Eliminar del carrito los productos que sí se compraron
            cart.products = cart.products.filter(item => unavailableProducts.some(productId => productId.equals(item.product)));

            // Guardar el carrito actualizado en la base de datos
            await cart.save();

            req.logger.info('Compra procesada correctamente:', { cartId });

            await emailManager.sendPurchaseEmail(userWithCart.email, userWithCart.first_name, ticket._id)

            res.render("checkout", {
                cliente: userWithCart.first_name,
                email: userWithCart.email,
                numTicket: ticket._id
            });

            //res.redirect(`/carts/${cartId}`);
            //res.status(200).json({ unavailableProducts });
        } catch (error) {
            req.logger.error('Error al procesar la compra:', { error });
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

}

module.exports = CartController;