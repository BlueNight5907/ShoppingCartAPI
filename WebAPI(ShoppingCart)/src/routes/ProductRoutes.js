const express = require('express');
const router = express.Router();
const upload = require("../helper/upload");
const {isAuth,isAdmin} = require("../middleware/AuthMiddlewares");
const {validateProduct,handleValidateError} = require("../middleware/ValidatorsMiddleware")
const ProductController = require('../controller/ProductController');

router.post("/", isAuth, isAdmin,upload.array(),validateProduct,handleValidateError, ProductController.addProduct)
router.get("/pages", ProductController.getProducts);
router.get("/pages/:page", ProductController.getProducts);
router.post("/upload",isAuth, isAdmin, upload.single("productPicture"), isAuth, isAdmin, ProductController.upload)
router.get("/:id", ProductController.getProduct);
router.put('/:id', isAuth, isAdmin, upload.array(),validateProduct, handleValidateError, ProductController.updateProduct);
router.delete('/:id', isAuth, isAdmin, ProductController.deleteProduct);

router.get("/", ProductController.getProducts);
module.exports = router;