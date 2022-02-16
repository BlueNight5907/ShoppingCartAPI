const mongoose = require('mongoose');
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
const OrderSchema = new mongoose.Schema({
    userID:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"pending"
    },
    total:{
        type:Number,
        default:0
    },
    items:[
        ItemSchema
    ],
    isDeleted:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const Order = mongoose.model("Order",OrderSchema);
module.exports = Order;