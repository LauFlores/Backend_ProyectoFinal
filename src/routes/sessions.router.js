const express = require("express");
const router = express.Router();
const passport = require("passport");
const SessionController = require("../controllers/session.controller.js");
const sessionController = new SessionController();
const ViewsController = require("../controllers/view.controller.js");
const viewsController = new ViewsController();

// Login
router.post("/login", sessionController.login);

// Ruta para manejar el fallo en el inicio de sesión
router.get("/faillogin", sessionController.failLogin);

// Logout
router.get("/logout", sessionController.logout);

// Profile
router.get("/profile", viewsController.profileView); // Utiliza la función profile del controlador de vistas

// Rutas relacionadas con OAuth (por ejemplo, GitHub)
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/githubcallback", sessionController.githubCallback);

module.exports = router;
