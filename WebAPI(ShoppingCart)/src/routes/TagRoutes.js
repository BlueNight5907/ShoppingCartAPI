const express = require('express');
const router = express.Router();
const {isAuth,isAdmin} = require("../middleware/AuthMiddlewares");
const TagController = require("../controller/TagController");

router.get("/", TagController.getAll)
router.get("/all", TagController.getAll)
router.post("/", isAuth,isAdmin, TagController.addTag)
router.delete('/:id',isAuth, isAdmin, TagController.deleteTag)
module.exports = router;