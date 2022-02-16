const mongoose = require('mongoose')

var ItemSchema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Số lượng vật phẩm không được nhỏ hơn 1.'],
        max: [100, "Số lượng vật phẩm không được lớn hơn 100"]
    }
});

const CartSchema = new mongoose.Schema({
    userID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isPaid:{
        type:Boolean,
        default:false
    },
    items:[ItemSchema]
},{
    timestamps:true
})

CartSchema.statics = {
    isAvailable: async function(id){
        const cart = await this.findById(id).exec();
        if(!cart){
            return false;
        }
        return !cart.isPaid;
    }
}

const Cart = mongoose.model("Cart",CartSchema);
module.exports = Cart;