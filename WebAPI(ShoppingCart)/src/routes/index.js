const express = require('express');
const router = express.Router();
//Goi cac route
const authRouter = require("./AuthRoutes");
const productRouter = require("./ProductRoutes");
const tagRouter = require("./TagRoutes");
const categoryRouter = require("./CategoryRoutes");
const cartRouter = require("./CartRoutes");
const orderRouter = require("./OrderRoutes");
const upload = require("../helper/upload")
/* GET home page. */
router.get('/', function (req, res, next) {
    return res.json({ message: 'Welcome to homepage' });
});

/* GET about page. */
router.get('/about', function (req, res, next) {
    return res.json({ message: 'Welcome to about us page' });
});


/*Auth route*/
router.use("/auth", upload.array(), authRouter);

/*Product route*/
router.use("/products", productRouter);

/*Tag route*/
router.use("/tag", upload.array(),tagRouter);

/*Category route*/
router.use("/category", upload.array(),categoryRouter);

/*Cart route*/
router.use("/cart", upload.array(),cartRouter);

/*Order route*/
router.use("/order", upload.array(),orderRouter);
module.exports = router;