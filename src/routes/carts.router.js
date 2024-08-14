const express = require("express");
const router = express.Router();
const CartController = require("../controllers/cart.controller.js");
const cartController = new CartController();
const { isUser } = require('../middleware/auth.middleware.js');

router.use(isUser);



router.post("/", cartController.newCart);
router.get("/:cid", cartController.getCartProducts);
router.post("/:cid/product/:pid", cartController.addProductToCart);
router.delete('/:cid/product/:pid', cartController.deleteCartProduct);
router.put('/:cid', cartController.updateProductsInCart);
router.put('/:cid/product/:pid', cartController.updateProductQuantity);
router.delete('/:cid', cartController.emptyCart);
router.post('/:cid/purchase', cartController.finalizePurchase);


module.exports = router;
