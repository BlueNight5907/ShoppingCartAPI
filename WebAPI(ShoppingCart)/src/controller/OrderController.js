const Order = require("../model/Order");
const APIError = require("../helper/APIError");
const httpStatus = require("http-status");
const Cart = require("../model/Cart");
const Product = require("../model/Product");
exports.getAll = async (req,res, next) =>{
    const user = req.user;
    try{
        let orders = await Order.find({userID:user.id,isDeleted:false});
        orders = await Promise.all(orders.map(async order => {
            let result = order.toObject();
            let items = await Promise.all(result.items.map(async (item)=>{
                let product = await Product.findById(item.productID);
                item.name = product.name;
                item.productPicture = product.productPicture;
                item.productPrice = product.price;
                return item;
            }))
            result.name = user.firstName +" "+user.lastName;
            result.address = user.address;
            result.telephone = user.telephone;
            result.items = items;
            delete result.updatedAt;
            delete result.__v;
            delete result.isDeleted;
            return result;
        }))
        res.json({
            status:"success",
            orderList:orders
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

exports.placeOrder = async (req,res, next) =>{
    const user = req.user;
    const {shoppingSession} = user;
    let sessionID = shoppingSession?.at(-1);
    if(!sessionID || !(await Cart.isAvailable(sessionID))){
        let error = new APIError("Chưa có giỏ hàng!!!!",httpStatus.BAD_REQUEST,true);
        return next(error);
    }

    try{
        let cart = await Cart.findById(sessionID).exec();
        if(cart.items.length === 0){
            let error = new APIError("Chưa hàng trong giỏ hàng!!!!",httpStatus.UNPROCESSABLE_ENTITY,true);
            return next(error);
        }

        cart.isPaid = true;
        await cart.save();
        const order = new Order({
            userID:user._id,
            items:cart.items,
            total:0,
        })
        await cart.items.filter(async (item)=>{
            let product = await Product.findById(item.productID);
            order.total = order.total + product.price * item.quantity;
            return true;
        })
        console.log(order.total)
        await order.save();
        user.orderDetails.push(order._id);
        user.save();
        let result = order.toObject();
        let items = await Promise.all(result.items.map(async (item)=>{
            let product = await Product.findById(item.productID);
            item.name = product.name;
            item.productPicture = product.productPicture;
            item.productPrice = product.price;
            return item;
        }))
        result.name = user.firstName +" "+user.lastName;
        result.address = user.address;
        result.telephone = user.telephone;
        result.items = items;
        delete result.updatedAt;
        delete result.__v;
        delete result.isDeleted;
        res.json({
            status:"success",
            message:"Đặt hàng thành công",
            orderDetails:result
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

exports.find = async (req,res, next) =>{
    const user = req.user;
    const {id} = req.params;
    try{
        if(!id || !(await Order.findOne({"_id":id,"isDeleted":false,userID:user.id}))){
            let error = new APIError("Thông tin đơn đặt hàng không hợp lệ",httpStatus.BAD_REQUEST,true);
            return next(error);
        }
    }
    catch (err){
        let error = new APIError("Có lỗi xảy ra",httpStatus.BAD_REQUEST,true);
        return next(error);
    }
    try{
        let order = await Order.findOne({"_id":id,userID:user.id});
        let result = order.toObject();
        let items = await Promise.all(result.items.map(async (item)=>{
            let product = await Product.findById(item.productID);
            item.name = product.name;
            item.productPicture = product.productPicture;
            item.productPrice = product.price;
            return item;
        }))
        result.name = user.firstName +" "+user.lastName;
        result.address = user.address;
        result.telephone = user.telephone;
        result.items = items;
        delete result.updatedAt;
        delete result.__v;
        delete result.isDeleted;
        res.json({
            status:"success",
            orderDetails:result
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