const Cart = require("../model/Cart");
const APIError = require("../helper/APIError");
const httpStatus = require("http-status");
const User = require("../model/User");
const Product = require("../model/Product");
exports.getAll = async (req,res, next) =>{
    const user = req.user;

    const {shoppingSession} = user;
    let sessionID = shoppingSession?.at(-1);
    let cart;
    if(!sessionID || !(await Cart.isAvailable(sessionID))){
        let error = new APIError("Chưa có giỏ hàng!!!!",httpStatus.BAD_REQUEST,true);
        return next(error);
    }

    try{
        let cart = await Cart.findById(sessionID).exec();
        let result = cart.toObject();
        let total = 0;
        let items = await Promise.all(cart.items.map(async (e)=>{
            let item = e.toObject();
            let product = await Product.findById(item.productID);
            item.name = product.name;
            item.productPicture = product.productPicture;
            item.productPrice = product.price;

            total = total + item.productPrice * item.quantity;
            return item;
        }))

        result.items = items;
        result.total = total;

        delete result._id;
        delete result.createdAt;
        delete result.updatedAt;
        delete result.__v;
        delete result.isPaid;
        res.json({
            status:"success",
            message:"Lấy thông tin giỏ hàng thành công",
            cart:result
        })
    }
    catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            let error = new APIError(Object.values(err.errors).map(val => val.message)[0],httpStatus.CONFLICT,true);
            return next(error);
        }
        else {
            let error = new APIError("Có lỗi xảy ra",httpStatus.INTERNAL_SERVER_ERROR,true);
            return next(error);
        }
    }

}

exports.add = async (req,res, next) =>{
    const user = req.user;
    const {quantity, productID} = req.body;
    try{
        if(!productID || !(await Product.findOne({"_id":productID,"isDeleted":false}))){
            let error = new APIError("Thông tin sản phẩm không hợp lệ",httpStatus.BAD_REQUEST,true);
            return next(error);
        }
    }
    catch (err){
        console.log(err)
        let error = new APIError("Thông tin sản phẩm không hợp lệ",httpStatus.BAD_REQUEST,true);
        return next(error);
    }

    const {shoppingSession} = user;
    let sessionID = shoppingSession?.at(-1);
    let cart;
    if(!sessionID || !(await Cart.isAvailable(sessionID))){
        const cart = new Cart({
            userID:user._id
        })
        await cart.save();
        sessionID = cart._id;
        user.shoppingSession.push(sessionID);
        await user.save();
    }
    try{
        if(!cart){
            cart = await Cart.findById(sessionID).exec();
        }
        let isProductExist = false;
        //Tăng số lượng của sản phẩm trong giỏ hàng lên nếu nó có tồn tại
        cart.items.forEach((item, index) => {
            if(item.productID == productID){
                if(quantity){
                    item.quantity += parseInt(quantity);
                }
                else item.quantity += 1;
                isProductExist = true;
            }
        })
        //Nếu sản phẩm chưa có trong giỏ, thêm vào
        if(!isProductExist){
            cart.items.push({
                productID:productID,
                quantity:quantity?quantity:1
            })
        }
        await cart.save();

        let item = cart.items.filter(item => item.productID == productID)[0].toObject();

        let product = await Product.findById(productID);
        item.name = product.name;
        item.productPicture = product.productPicture;
        item.productPrice = product.price;

        delete item._id;
        res.json({
            status:"success",
            message:"Thêm sản phẩm vào giỏ hàng thành công",
            item
        })
    }
    catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            let error = new APIError(Object.values(err.errors).map(val => val.message)[0],httpStatus.CONFLICT,true);
            return next(error);
        }
        else {
            let error = new APIError("Có lỗi xảy ra",httpStatus.INTERNAL_SERVER_ERROR,true);
            return next(error);
        }
    }
}

exports.subtract = async (req,res, next) =>{
    const user = req.user;
    const {quantity, productID} = req.body;
    try{
        if(!productID || !(await Product.findOne({"_id":productID,"isDeleted":false}))){
            let error = new APIError("Thông tin sản phẩm không hợp lệ",httpStatus.BAD_REQUEST,true);
            return next(error);
        }
    }
    catch (err){
        let error = new APIError("Thông tin sản phẩm không hợp lệ",httpStatus.BAD_REQUEST,true);
        return next(error);
    }


    const {shoppingSession} = user;
    let sessionID = shoppingSession?.at(-1);
    if(!sessionID || !(await Cart.isAvailable(sessionID))){
        let error = new APIError("Chưa có giỏ hàng!!!!",httpStatus.BAD_REQUEST,true);
        return next(error);
    }
    try{
        let cart = await Cart.findById(sessionID).exec();
        let isProductExist = false;
        //Giảm số lượng của sản phẩm trong giỏ hàng lên nếu nó có tồn tại
        cart.items = cart.items.filter((item, index) => {
            if(item.productID == productID){
                if(quantity){
                    item.quantity -= parseInt(quantity);
                }
                else item.quantity -= 1;
                isProductExist = true;
            }
            if(item.quantity > 0){
                return true;
            }
            return false;
        })

        //Nếu sản phẩm chưa có trong giỏ, thêm vào
        if(!isProductExist){
            let error = new APIError("Chưa có sản phẩm này trong giỏ hàng!!!!",httpStatus.BAD_REQUEST,true);
            return next(error);
        }
        let isDelete = true;
        await cart.save();
        let item = cart.items.filter(item => item.productID == productID)[0]?.toObject();
        if(item){
            isDelete = false;
            let product = await Product.findById(productID);
            item.name = product.name;
            item.productPicture = product.productPicture;
            item.productPrice = product.price;
            delete item._id;
        }
        res.json({
            status:"success",
            message:isDelete?"Sản phẩm đã được xóa ra khỏi giỏ hàng":"Giảm số lượng sản phẩm trong giỏ hàng thành công",
            item:item?item:{}
        })
    }
    catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            let error = new APIError(Object.values(err.errors).map(val => val.message)[0],httpStatus.CONFLICT,true);
            return next(error);
        }
        else {
            let error = new APIError("Có lỗi xảy ra",httpStatus.INTERNAL_SERVER_ERROR,true);
            return next(error);
        }
    }
}

exports.remove = async (req,res, next) =>{
    const user = req.user;
    const {productID} = req.params;
    try{
        if(!productID || !(await Product.findOne({"_id":productID,"isDeleted":false}))){
            let error = new APIError("Thông tin sản phẩm không hợp lệ",httpStatus.BAD_REQUEST,true);
            return next(error);
        }
    }
    catch (err){
        let error = new APIError("Thông tin sản phẩm không hợp lệ",httpStatus.BAD_REQUEST,true);
        return next(error);
    }


    const {shoppingSession} = user;
    let sessionID = shoppingSession?.at(-1);
    if(!sessionID || !(await Cart.isAvailable(sessionID))){
        let error = new APIError("Chưa có giỏ hàng!!!!",httpStatus.BAD_REQUEST,true);
        return next(error);
    }

    try{
        let cart = await Cart.findById(sessionID).exec();
        let isProductExist = false;
        //Loại bỏ sản phẩm trong giỏ hàng lên nếu nó có tồn tại
        cart.items = cart.items.filter((item, index) => {
            if(item.productID == productID){
                isProductExist = true;
                return false;
            }
            return true;
        })
        //Nếu sản phẩm chưa có trong giỏ, trả về
        if(!isProductExist){
            let error = new APIError("Chưa có sản phẩm này trong giỏ hàng!!!!",httpStatus.BAD_REQUEST,true);
            return next(error);
        }
        await cart.save();
        let items = await Promise.all(cart.items.map(async (e)=>{
            let item = e.toObject();
            let product = await Product.findById(productID);
            item.name = product.name;
            item.productPicture = product.productPicture;
            item.productPrice = product.price;
            return item;
        }))
        res.json({
            status:"success",
            message:"Sản phẩm đã được xóa ra khỏi giỏ hàng",
            items
        })
    }
    catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            let error = new APIError(Object.values(err.errors).map(val => val.message)[0],httpStatus.CONFLICT,true);
            return next(error);
        }
        else {
            let error = new APIError("Có lỗi xảy ra",httpStatus.INTERNAL_SERVER_ERROR,true);
            return next(error);
        }
    }
}