const express = require("express");
const router = express.Router();
const ViewsController = require('../controllers/view.controller.js');
const viewsController = new ViewsController();
const { isAdmin, isUser, isPremium, isAdminOrPremium } = require('../middleware/auth.middleware.js');


router.get("/profile", viewsController.profileView);

router.get("/products", isUser, viewsController.productsView); 
router.get("/carts/:cid", isUser, viewsController.cartsView); 
router.get("/login", viewsController.getLoginView);
router.get("/register", viewsController.getRegisterView);
router.get("/realTimeProducts", isAdminOrPremium, viewsController.realTimeProductsView);
router.get("/chat", isUser, viewsController.chatView);
router.get("/", viewsController.getHomeView);

//Tercer practica integradora

router.get("/reset-password", viewsController.passwordResetView);
router.get("/password", viewsController.passwordChangeView);
router.get("/send-confirmation", viewsController.sendConfirmationView);
router.get("/premium-panel", viewsController.premiumView);
router.get("/users", viewsController.adminUsersView); 

module.exports = router;
