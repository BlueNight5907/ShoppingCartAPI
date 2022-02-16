const express = require('express');
const router = express.Router();
const {isAuth,isAdmin} = require("../middleware/AuthMiddlewares");
const CartController = require("../controller/CartController");
const {validateCart, handleValidateError} = require("../middleware/ValidatorsMiddleware");

router.get("/",isAuth ,CartController.getAll)
router.post("/add",isAuth,validateCart, handleValidateError, CartController.add)
router.post("/subtract",isAuth, CartController.subtract)
router.post("/remove/:productID",isAuth ,CartController.remove)
module.exports = router;