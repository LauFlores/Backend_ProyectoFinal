const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller.js");
const productController = new ProductController(); 
//const authMiddleware = require('../middleware/auth.middleware.js');
const { isAdmin } = require('../middleware/auth.middleware.js');


router.use(isAdmin);

router.get("/", productController.getProducts);
router.get("/:pid", productController.getProductById);
router.post("/", productController.addProduct);
router.put("/:pid", productController.updateProduct);
router.delete("/:pid", productController.deleteProduct);

module.exports = router;
