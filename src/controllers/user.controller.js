const passport = require("passport");
const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();
const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();
const { generateResetToken } = require("../utils/tokenreset.js");
const UserModel = require("../models/user.model.js");

//Tercer integradora:
const EmailManager = require("../services/email.js");
const emailManager = new EmailManager();

class UserController {
  constructor(userRepository, emailManager) {
    this.userRepository = userRepository;
    this.emailManager = emailManager;
  }

  async registerUser(req, res) {
    passport.authenticate("register", { failureRedirect: "/api/users/failedregister" })(req, res, async () => {
      if (!req.user) return res.status(400).send({ status: "error" });

      try {
        // Verificar si el correo electrónico termina en "@admin.com"
        const isAdmin = req.user.email.endsWith("@admin.com");

        // Asignar el rol correspondiente
        req.user.role = isAdmin ? "admin" : "usuario";

        // Crear un carrito solo para los usuarios que no son administradores
        let newCart;
        if (req.user.role === "usuario" || req.user.role === "premium") {
          newCart = await cartRepository.createCart();
        }

        // Crear el usuario
        console.log("Datos de usuario recibidos:", req.user);
        const newUser = await userRepository.createUser(req.user);

        // Asignar el carrito al usuario si es necesario
        if (newCart) {
          newUser.cart = newCart._id;
        }

        // Guardar el usuario con la referencia al carrito en la base de datos
        await newUser.save();

        // Guardar el usuario en la sesión
        req.logger.info('Usuario creado exitosamente:', newUser);
        req.session.user = {
          _id: newUser._id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          age: newUser.age,
          email: newUser.email,
          cart: newCart ? newCart._id : null,
          role: newUser.role // Asegúrate de incluir el rol en la sesión
        };

        // Enviar respuesta de éxito
        res.send('Usuario creado exitosamente. ¡Bienvenido! <a href="/login">Iniciar sesión</a>');
      } catch (error) {
        // Manejar errores
        req.logger.error("Error al crear usuario:", error);
        res.status(500).send({ error: error.message });
      }
    });
  }

  async failedRegister(req, res) {
    req.logger.error("Registro fallido");
    res.send({ error: "Registro fallido" });
  }

  //Tercer practica integradora

  async requestPasswordReset(req, res) {
    const { email } = req.body;

    try {
      // Buscar al usuario por su correo electrónico
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }

      // Generar un token 
      const token = generateResetToken();

      // Guardar el token en el usuario
      user.resetToken = {
        token: token,
        expire: new Date(Date.now() + 3600000) // 1 hora de duración
      };
      await user.save();

      // Enviar correo electrónico con el enlace de restablecimiento utilizando EmailService
      await emailManager.sendPasswordResetEmail(email, user.first_name, token);

      res.redirect("/send-confirmation");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async resetPassword(req, res) {
    const { email, password, token } = req.body;

    try {
      // Buscar al usuario por su correo electrónico
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.render("changepassword", { error: "Usuario no encontrado" });
      }

      // Obtener el token de restablecimiento de la contraseña del usuario
      const resetToken = user.resetToken;
      if (!resetToken || resetToken.token !== token) {
        return res.render("passwordreset", { error: "El token de restablecimiento de contraseña es inválido" });
      }

      // Verificar si el token ha expirado
      const now = new Date();
      if (now > resetToken.expire) {
        // Redirigir a la página de generación de nuevo correo de restablecimiento
        return res.render("passwordreset", { error: "El token de restablecimiento de contraseña es inválido" });
      }

      // Verificar si la nueva contraseña es igual a la anterior
      if (isValidPassword(password, user)) {
        return res.render("changepassword", { error: "La nueva contraseña no puede ser igual a la anterior" });
      }

      // Actualizar la contraseña del usuario
      user.password = createHash(password);
      user.resetToken = undefined; // Marcar el token como utilizado
      await user.save();

      // Renderizar la vista de confirmación de cambio de contraseña
      return res.redirect("/login");
    } catch (error) {
      console.error(error);
      return res.status(500).render("passwordreset", { error: "Error interno del servidor" });
    }
  }

  async changeRolePremium(req, res) {
    try {
      const { uid } = req.params;

      const user = await UserModel.findById(uid);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Verificar si el usuario ha cargado los documentos requeridos
      const requiredDocuments = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
      const userDocuments = user.documents.map(doc => doc.name);

      const hasRequiredDocuments = requiredDocuments.every(doc => userDocuments.includes(doc));

      if (!hasRequiredDocuments) {
        return res.status(400).json({ message: 'El usuario debe cargar los siguientes documentos: Identificación, Comprobante de domicilio, Comprobante de estado de cuenta' });
      }

      const newRole = user.role === 'user' ? 'premium' : 'user';

      const updated = await UserModel.findByIdAndUpdate(uid, { role: newRole }, { new: true });
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await userRepository.getAllUsers();
      const userData = users.map(user => ({
        name: user.fullname,
        email: user.email,
        role: user.role,
        last_connection: user.last_connection
      }));
      res.json(userData);
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  }



  async adminUsersView(req, res) {
    try {
      const users = await userRepository.getAllUsers();
      res.render('users', { users });
    } catch (error) {
      console.error('Error al cargar la vista de administración de usuarios:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  }

  async deleteInactiveUsers(req, res) {
    try {
      // Definir el criterio de inactividad: usuarios que no se han conectado en los últimos 2 días
      const inactivityThreshold = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 * 24 * 60 * 60 * 1000 para 2 días y 30 * 60 * 1000 para 30 minutos

      // Obtener los usuarios inactivos desde el repositorio
      const { deletedCount, deletedUsers } = await userRepository.deleteInactiveUsers(inactivityThreshold);

      // Enviar correos electrónicos de notificación a los usuarios eliminados
      for (const user of deletedUsers) {
        await emailManager.sendAccountDeletionEmail(user.email, user.name);
      }

      res.json({ message: `${deletedCount} usuarios inactivos eliminados` });
    } catch (error) {
      console.error('Error al eliminar usuarios inactivos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
  async deleteUser(req, res) {
    try {
        const userId = req.params.uid;
        const user = await userRepository.deleteUserById(userId);

        if (user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        req.logger.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error del servidor al eliminar usuario' });
    }
  }

}
module.exports = UserController;

