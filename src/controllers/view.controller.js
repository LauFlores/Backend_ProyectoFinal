const ProductModel = require("../models/product.model.js");
const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();
const { logger } = require("../utils/logger.js"); // Importa el logger
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository(logger);
const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();
const UserDTO = require('../dto/user.dto.js');


class ViewsController {
    constructor() { }

    async productsView(req, res) {
        try {
            const { page = 1, limit = 3 } = req.query;
            const products = await productRepository.getProducts({
                page: parseInt(page),
                limit: parseInt(limit)
            });

            const newArray = products.docs.map(product => {
                const { _id, ...rest } = product.toObject();
                return { id: _id, ...rest };
            });


            // Verificar si el cartId está definido
            const cartId = req.session.user.cartId || null;


            // Renderizar la vista de productos con un mensaje de bienvenida diferente
            res.render("products", {
                user: req.session.user,
                //isAdmin: isAdmin,
                products: newArray,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                currentPage: products.page,
                totalPages: products.totalPages,
                cartId: cartId,
            });

        } catch (error) {
            req.logger.error("Error al obtener productos", error);
            res.status(500).json({
                status: 'error',
                error: "Error del servidor"
            });
        }
    }

    async cartsView(req, res) {
        const cartId = req.params.cid;

        req.logger.info("ID del carrito recibido:", cartId);

        try {
            const cart = await cartRepository.getCartProducts(cartId);

            if (!cart) {
                req.logger.error("No existe el cart con el ID especificado");
                return res.status(404).json({ error: "Cart no encontrado" });
            }

            let totalPurchase = 0

            const productsInCart = cart.products.map(item => {
                const product = item.product.toObject();
                const quantity = item.quantity;
                const totalPrice = product.price * quantity;

                totalPurchase += totalPrice;

                return {
                    product: { ...product, totalPrice },
                    quantity,
                    cartId
                };
            });

            // Incluye req.session.user en el contexto de datos
            res.render("carts", { cartId: cartId, products: productsInCart, user: req.session.user, totalPurchase: totalPurchase });
        } catch (error) {
            req.logger.error("Error al obtener el cart", error);
            res.status(500).json({ error: "Error del servidor" });
        }
    }


    async getLoginView(req, res) {
        res.render("login");
    }

    async getRegisterView(req, res) {
        res.render("register");
    }

    async getHomeView(req, res) {
        res.render("home");
    }

    async realTimeProductsView(req, res) {
        const user = req.session.user;
        try {
            res.render("realtimeproducts", {role: user.role, email: user.email});
        } catch (error) {
            req.logger.error("Error en la vista real time", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async chatView(req, res) {
        res.render("chat");
    }

    async profileView(req, res) {
        if (!req.session.login) {
            return res.status(403).json({ error: "Acceso no autorizado" });
        }

        // Verificar si el usuario es administrador
        const isAdmin = req.session.user.role === "admin";

        //Verificar si el usuario es premium
        const isPremium = req.session.user.role === 'premium';

        // Crear un DTO con los datos del usuario y el estado de isAdmin
        const userDTO = new UserDTO(req.session.user.first_name, req.session.user.last_name, req.session.user.role);

        // Pasar userDTO y isAdmin a la plantilla de perfil
        res.render("profile", { user: userDTO, isAdmin: isAdmin, isPremium: isPremium });
    }

    //Tercer integradora: 
    async passwordResetView(req, res) {
        res.render("passwordreset");
    }

    async passwordChangeView(req, res) {
        res.render("changepassword");
    }

    async sendConfirmationView(req, res) {
        res.render("send-confirmation");
    }

    async premiumView(req, res) {
        const user = req.session.user;
        try {
            res.render("premium-panel", {role: user.role, email: user.email});
        } catch (error) {
            req.logger.error("Error en la vista real time", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    // Nueva vista para la administración de usuarios
    async adminUsersView(req, res) {
        try {
        const users = await userRepository.getAllUsers();
        const userData = users.map(user => ({
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role,
            last_connection: user.last_connection,
            _id: user._id.toString()  // Asegúrate de convertir el ObjectId a String si es necesario
        }));
        res.render('users', { users: userData });
        } catch (error) {
        console.error('Error al obtener usuarios para vista de administración:', error);
        res.status(500).json({ error: 'Error del servidor' });
        }
    }

}

module.exports = ViewsController;