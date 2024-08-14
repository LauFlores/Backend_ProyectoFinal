const passport = require("passport");
const UserDTO = require("../dto/user.dto.js");
const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();


class SessionController {
    constructor() { }

    async login(req, res) {
        passport.authenticate("login", { failureRedirect: "/api/sessions/faillogin" })(req, res, async () => {
            if (!req.user) return res.status(400).send({ status: "error" });

            // Recuperar el usuario actualizado desde la base de datos
            const user = await userRepository.findUserByEmail(req.user.email);

            // Actualizar la propiedad last_connection
            user.last_connection = new Date();
            await user.save();

            // Agregar lógica para asignar el rol
            const isAdmin = user.email.endsWith("@admin.com");
            const isPremium = user.role === "premium";

            req.session.user = {
                first_name: req.user.first_name,
                last_name: req.user.last_name,
                age: req.user.age,
                email: req.user.email,
                role: isAdmin ? "admin" : (isPremium ? "premium" : "user"),
                cartId: req.user.cart ? req.user.cart._id : null
            };

            req.logger.debug("Contenido de req.session.user:", req.session.user);
            // Agregar registro para imprimir req.user.cart
            //req.logger.debug("Contenido de req.user.cart:", req.user.cart);

            req.session.login = true;

            res.redirect("/profile");
        });
    }

    async failLogin(req, res) {
        req.logger.error("Error en el inicio de sesión");
        res.send({ error: "Error en el inicio de sesión" });
    }

    async register(req, res) {
        if (req.session.login) {
            return res.redirect("/");
        }
    }

    async logout(req, res) {
        if (req.session.login) {
            // Recuperar el usuario desde la sesión
            const user = await userRepository.findUserByEmail(req.session.user.email);

            // Actualizar la propiedad last_connection
            user.last_connection = new Date();
            await user.save();

            req.session.destroy();
        }
        res.redirect("/");
    }

    async githubCallback(req, res) {
        req.session.user = req.user;
        req.session.login = true;
        res.redirect("/profile");
    }
}

module.exports = SessionController;
