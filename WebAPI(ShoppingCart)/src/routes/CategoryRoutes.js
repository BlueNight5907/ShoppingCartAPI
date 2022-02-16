const express = require('express');
const router = express.Router();
const {isAuth,isAdmin} = require("../middleware/AuthMiddlewares");
const CategoryController = require("../controller/CategoryController");

router.get("/", CategoryController.getAll)
router.get("/all", CategoryController.getAll)
router.put("/:id", isAuth,isAdmin, CategoryController.updateCategory)
router.post("/", isAuth,isAdmin, CategoryController.addCategory)
router.delete('/:id',isAuth, isAdmin, CategoryController.deleteCategory)
module.exports = router;