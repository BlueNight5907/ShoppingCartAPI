const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        require:true,
        min:3,
        max:20,
        unique:true
    },
    email:{
        type:String,
        max:50,
    },
    password:{
        type:String,
        require:true,
        min:6
    },
    firstName:{
        type:String,
        require:true,
    },
    lastName:{
        type:String,
        require:true,
    },
    telephone:{
        type:String,
        require:true,
    },
    address:{
        type:String,
        default:""
    },
    refreshToken:{
        type:String
    },
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }
    ],
    shoppingSession:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShoppingSession"
        }
    ],
    orderDetails:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderDetails"
        }
    ],
},{
    timestamps:true
})

UserSchema.statics.getByUsername = async function(username){
    try{
        let user = await this.findOne({username:username}).exec();
        return user
    }
    catch (e) {
        return null
    }
}

UserSchema.statics.updateRefreshToken = async function(username,refreshToken){
    try{
        let user = await this.findOneAndUpdate({username:username},{refreshToken:refreshToken});
        return user
    }
    catch (e) {
        return null
    }
}

const User = mongoose.model('User',UserSchema)
module.exports = User