const mongoose = require('mongoose')
const TagSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

const Tag = mongoose.model("Tag",TagSchema);
module.exports = Tag;