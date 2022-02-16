const mongoose = require('mongoose')
const CategorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    active:{
      type:Boolean,
      default:true
    },
    desc:{
        type:String,
    },
},{
    timestamps:true
})
const Category = mongoose.model("Category",CategorySchema);
module.exports = Category;