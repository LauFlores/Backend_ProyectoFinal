const express = require("express");
const router = express.Router();
const MockController = require("../controllers/mock.controller.js");
const mockController = new MockController();


// Ruta para generar productos simulados
router.get("/mockingproducts", mockController.generateProducts);

module.exports = router;
