const express = require('express');
const router = express.Router();
const {isAuth,isAdmin} = require("../middleware/AuthMiddlewares");
const OrderController = require("../controller/OrderController");


router.get("/",isAuth ,OrderController.getAll)
router.post("/create",isAuth, OrderController.placeOrder)
router.post("/:id",isAuth, OrderController.find)
module.exports = router;