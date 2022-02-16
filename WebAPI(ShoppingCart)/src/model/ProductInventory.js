const mongoose = require('mongoose')
const ProductInventorySchema = new mongoose.Schema({
    productID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity:{
        type:Number,
        default:0,
    },
    tags:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag"
        }
    ]
},{
    timestamps:true
})

const ProductInventory = mongoose.model("ProductInventory",ProductInventorySchema);
module.exports = ProductInventory;