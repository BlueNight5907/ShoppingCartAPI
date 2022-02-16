const express = require('express');
const router = express.Router();
const AuthController = require("../controller/AuthController")
const {validateRegisterUser, validateLogin, handleValidateError} = require("../middleware/ValidatorsMiddleware")
const {isAuth} = require("../middleware/AuthMiddlewares")
router.post("/register",validateRegisterUser,handleValidateError,AuthController.register)

router.post("/login",validateLogin, handleValidateError, AuthController.login);

router.post("/logout",isAuth, AuthController.logout);

router.post('/refresh', AuthController.refresh);
module.exports = router;