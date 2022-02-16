const mongoose = require('mongoose')
const ProductSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    desc:{
        type:String,
    },
    price:{
        type:Number,
    },
    productPicture:{
        type:String,
    },
    tags:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag"
        }
    ],
    active:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    categoryID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    discoundID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Discount"
    },
    inventoryID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductInventory"
    }
},{
    timestamps:true
})

const Product = mongoose.model("Product",ProductSchema);
module.exports = Product;